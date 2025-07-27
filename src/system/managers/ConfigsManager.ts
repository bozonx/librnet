import { pathJoin, mergeDeepObjects } from 'squidlet-lib';
import type { System } from '../System.js';
import {
  type SystemLocalCfg,
  type SystemSyncedCfg,
  type SystemCfg,
} from '../../types/SystemCfg.js';
import { CFG_FILE_EXT } from '../../types/constants.js';
import {
  LocalDataSubDirs,
  RootDirs,
  SyncedDataSubDirs,
} from '../../types/Dirs.js';

const SYSTEM_MAIN_CFG_NAME = 'system.main';

export class ConfigsManager {
  private _systemCfg!: SystemCfg;

  get systemCfg(): SystemCfg {
    return structuredClone(this._systemCfg);
  }

  constructor(private readonly system: System) {}

  async init() {
    this._systemCfg = {
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
      isSynced ? RootDirs.synced : RootDirs.local,
      isSynced ? SyncedDataSubDirs.configs : LocalDataSubDirs.configs,
      `${entityName}.${CFG_FILE_EXT}`
    );

    if (await this.system.localFiles.exists(cfgPath)) {
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
    // TODO: валидировать

    await this.system.localFiles.writeFile(
      pathJoin(
        '/',
        isSynced ? RootDirs.synced : RootDirs.local,
        isSynced ? SyncedDataSubDirs.configs : LocalDataSubDirs.configs,
        `${entityName}.${CFG_FILE_EXT}`
      ),
      JSON.stringify(newConfig, null, 2)
    );
  }

  // async deleteEntityConfig(entityName: string, isSynced: boolean) {
  //   await this.system.localFiles.rm([
  //     pathJoin(
  //       '/',
  //       isSynced ? RootDirs.synced : RootDirs.local,
  //       isSynced ? SyncedDataSubDirs.configs : LocalDataSubDirs.configs,
  //       `${entityName}.${CFG_FILE_EXT}`
  //     ),
  //   ]);
  // }
}