import { pathJoin, mergeDeepObjects } from 'squidlet-lib';
import type { System } from '../System.js';
import {
  type SystemLocalCfg,
  type SystemSyncedCfg,
  type SystemCfg,
} from '../../types/SystemCfg.js';
import {
  CFG_FILE_EXT,
  IO_NAMES,
  LOCAL_DATA_SUB_DIRS,
  ROOT_DIRS,
  SYNCED_DATA_SUB_DIRS,
} from '../../types/constants.js';
import type { FilesIoType } from '@/types/io/FilesIoType.js';
import type { IoBase } from '../base/IoBase.js';

export class ConfigsManager {
  systemCfg!: SystemCfg;

  private get filesIo(): FilesIoType & IoBase {
    return this.system.io.getIo<FilesIoType & IoBase>(IO_NAMES.LocalFilesIo);
  }

  constructor(private readonly system: System) {}

  async init() {
    this.systemCfg = {
      local: await this.loadEntityConfig<SystemLocalCfg>('system', false),
      synced: await this.loadEntityConfig<SystemSyncedCfg>('system', true),
    } as SystemCfg;
  }

  async loadEntityConfig<Config extends Record<string, any>>(
    entityName: string,
    isSynced: boolean
  ): Promise<Config> {
    const cfgPath = pathJoin(
      '/',
      isSynced ? ROOT_DIRS.syncedData : ROOT_DIRS.localData,
      isSynced ? SYNCED_DATA_SUB_DIRS.configs : LOCAL_DATA_SUB_DIRS.configs,
      `${entityName}.${CFG_FILE_EXT}`
    );

    if (await this.isFileExists(cfgPath)) {
      return JSON.parse(await this.filesIo.readTextFile(cfgPath)) as Config;
    }

    return {} as Config;
  }

  async saveEntityConfig(
    entityName: string,
    newConfig: Record<string, any>,
    isSynced: boolean
  ) {
    await this.filesIo.writeFile(
      pathJoin(
        '/',
        isSynced ? ROOT_DIRS.syncedData : ROOT_DIRS.localData,
        isSynced ? SYNCED_DATA_SUB_DIRS.configs : LOCAL_DATA_SUB_DIRS.configs,
        `${entityName}.${CFG_FILE_EXT}`
      ),
      JSON.stringify(newConfig.local, null, 2)
    );
  }

  async savePartialSystemCfg(
    partialLocal?: Partial<SystemLocalCfg>,
    partialSynced?: Partial<SystemSyncedCfg>
  ) {
    // TODO: валидировать
    // TODO: валидировать - пути в versionsCount должны начинаться со слеша

    this.systemCfg = mergeDeepObjects(
      {
        local: partialLocal,
        synced: partialSynced,
      },
      this.systemCfg
    );

    await this.saveEntityConfig('system', this.systemCfg, false);
    await this.saveEntityConfig('system', this.systemCfg, true);
  }

  async deleteEntityConfig(entityName: string, isSynced: boolean) {
    await this.filesIo.rm([
      pathJoin(
        '/',
        isSynced ? ROOT_DIRS.syncedData : ROOT_DIRS.localData,
        isSynced ? SYNCED_DATA_SUB_DIRS.configs : LOCAL_DATA_SUB_DIRS.configs,
        `${entityName}.${CFG_FILE_EXT}`
      ),
    ]);
  }

  private async isFileExists(pathTo: string): Promise<boolean> {
    return Boolean(await this.filesIo.stat(pathTo));
  }
}