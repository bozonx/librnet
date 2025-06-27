import { pathJoin } from 'squidlet-lib';
import { ROOT_DIRS } from '../../types/constants.js';
import type { Logger } from 'squidlet-lib';
import type { System } from '../System';

export class EntityBaseContext {
  protected readonly system: System;

  // readonly files of package of this app
  // readonly packageFiles;
  // local data of this app. Only for local machine
  readonly localData;
  // app's syncronized data of this app between all the hosts
  readonly syncedData;
  // TODO: use db key-value storage for cache
  // readonly cacheLocal;
  // config files for this app. It manages them by it self
  // readonly localConfigs;
  // readonly syncedConfigs;
  // for temporary files of this app
  readonly tmp;
  // // data bases for this app
  // readonly db;
  // // log files of this app
  // readonly filesLog;

  // TODO: add logger to the context
  get log(): Logger {
    return this.system.log;
  }

  constructor(system: System) {
    this.system = system;

    // const filesDriver = this.system.drivers.getDriver<FilesDriver>(
    //   DRIVER_NAMES.FilesDriver
    // );

    // this.packageFiles = new FilesReadOnly(
    //   filesDriver,
    //   pathJoin('/', ROOT_DIRS.packages, appName)
    // );
    this.localData = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.localData, this.manifest.name)
    );
    this.syncedData = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.syncedData, this.manifest.name)
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
    // this.tmpLocal = new FilesWrapper(
    //   filesDriver,
    //   pathJoin('/', ROOT_DIRS.tmpLocal, appName)
    // );
  }

  async init() {
    //
  }

  async destroy() {
    //
  }
}
