import { pathJoin } from 'squidlet-lib';
import { ROOT_DIRS } from '../../types/constants.js';
import type { Logger } from 'squidlet-lib';
import type { System } from '../System';
import { RestrictedDir } from '../driversLogic/RestrictedDir.js';
import type { EntityManifest } from '@/types/types.js';
import { EntityConfig } from '../driversLogic/EntityConfig.js';
import { EntityLogFile } from '../driversLogic/EntityLogFile.js';

// TODO: add register api and crud api

export class EntityBaseContext {
  // readonly files of package relative to the app
  readonly packageFiles;
  // local data of this app. Only for local machine
  readonly localData;
  // syncronized data of this app between all the hosts
  readonly syncedData;
  // temporary files of this app
  readonly tmp;
  // local config files of this app
  readonly localConfig = new EntityConfig(this.system, this.manifest, false);
  // synced config files of this app
  readonly syncedConfig = new EntityConfig(this.system, this.manifest, true);
  // local files log of this app
  readonly localLog = new EntityLogFile(this.system, this.manifest, false);
  // synced files log of this app
  readonly syncedLog = new EntityLogFile(this.system, this.manifest, true);

  get consoleLog(): Logger {
    return {
      debug: (msg: string) => `[${this.manifest.name}]: ${msg}`,
      info: (msg: string) => `[${this.manifest.name}]: ${msg}`,
      warn: (msg: string) => `[${this.manifest.name}]: ${msg}`,
      error: (msg: string) => `[${this.manifest.name}]: ${msg}`,
      log: (msg: string) => `[${this.manifest.name}]: ${msg}`,
    };
  }

  // TODO: Downloads - наверное все приложения имеют туда полный доступ

  // TODO: use db key-value storage for cache
  // readonly cacheLocal;
  // // data bases for this app
  // readonly db;

  // TODO: manifent of packager or app?
  constructor(
    protected readonly system: System,
    readonly manifest: EntityManifest
  ) {
    // const filesDriver = this.system.drivers.getDriver<FilesDriver>(
    //   DRIVER_NAMES.FilesDriver
    // );

    this.packageFiles = new FilesReadOnly(
      filesDriver,
      pathJoin('/', ROOT_DIRS.packages, this.manifest.name),
      true
    );
    this.localData = new RestrictedDir(
      filesDriver,
      pathJoin('/', ROOT_DIRS.localData, this.manifest.name)
    );
    this.syncedData = new RestrictedDir(
      filesDriver,
      pathJoin('/', ROOT_DIRS.syncedData, this.manifest.name)
    );
    this.tmp = new RestrictedDir(
      filesDriver,
      pathJoin('/', ROOT_DIRS.tmp, this.manifest.name)
    );

    // TODO: только 1 файл конфига

    // this.cfgLocal = new FilesWrapper(
    //   filesDriver,
    //   pathJoin('/', ROOT_DIRS.cfgLocal, this.manifest.name)
    // );
    // this.cfgSynced = new FilesWrapper(
    //   filesDriver,
    //   pathJoin('/', ROOT_DIRS.cfgSynced, this.manifest.name)
    // );
    // this.db = new FilesDb(
    //   this.system.drivers,
    //   pathJoin('/', ROOT_DIRS.db, appName)
    // );
    // this.filesLog = new FilesLog(
    //   filesDriver,
    //   pathJoin('/', ROOT_DIRS.log, appName)
    // );
  }

  async init() {
    //
  }

  async destroy() {
    //
  }
}
