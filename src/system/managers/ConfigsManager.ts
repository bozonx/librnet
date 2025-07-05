import { pathJoin, mergeDeepObjects } from 'squidlet-lib';
import type { System } from '../System.js';
import {
  type SystemLocalCfg,
  type SystemSyncedCfg,
  type SystemCfg,
} from '../../types/SystemCfg.js';
import {
  CFG_FILE_EXT,
  LOCAL_DATA_SUB_DIRS,
  ROOT_DIRS,
  SYNCED_DATA_SUB_DIRS,
} from '../../types/constants.js';

const SYSTEM_MAIN_CFG_NAME = 'system.main';

export class ConfigsManager {
  systemCfg!: SystemCfg;

  constructor(private readonly system: System) {}

  async init() {
    this.systemCfg = {
      local: await this.loadEntityConfig<SystemLocalCfg>(
        SYSTEM_MAIN_CFG_NAME,
        false
      ),
      synced: await this.loadEntityConfig<SystemSyncedCfg>(
        SYSTEM_MAIN_CFG_NAME,
        true
      ),
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
      return JSON.parse(
        await this.system.localFiles.readTextFile(cfgPath)
      ) as Config;
    }

    return {} as Config;
  }

  async saveEntityConfig(
    entityName: string,
    newConfig: Record<string, any>,
    isSynced: boolean
  ) {
    await this.system.localFiles.writeFile(
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
    await this.system.localFiles.rm([
      pathJoin(
        '/',
        isSynced ? ROOT_DIRS.syncedData : ROOT_DIRS.localData,
        isSynced ? SYNCED_DATA_SUB_DIRS.configs : LOCAL_DATA_SUB_DIRS.configs,
        `${entityName}.${CFG_FILE_EXT}`
      ),
    ]);
  }

  private async isFileExists(pathTo: string): Promise<boolean> {
    return this.system.localFiles.isExists(pathTo);
  }
}