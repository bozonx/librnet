import { pathJoin } from 'squidlet-lib';
import { ROOT_DIRS } from '../../types/constants.js';
import type { Logger } from 'squidlet-lib';
import type { System } from '../System';
import { RestrictedDir } from '../driversLogic/RestrictedDir.js';
import type { EntityManifest } from '@/types/types.js';
import { RootFiles } from '../driversLogic/RootFiles.js';

export class EntityBaseContext {
  protected readonly system: System;
  readonly manifest: EntityManifest;

  // readonly files of package of this app
  readonly packageFiles;
  // local data of this app. Only for local machine
  readonly localData;
  // app's syncronized data of this app between all the hosts
  readonly syncedData;
  // for temporary files of this app
  readonly tmp;
  // access to root files of the system using permissions of this app
  readonly rootFiles;

  // TODO: Downloads - наверное все приложения имеют туда полный доступ

  // TODO: use db key-value storage for cache
  // readonly cacheLocal;
  // config files for this app. It manages them by it self
  // readonly localConfigs;
  // readonly syncedConfigs;
  // // data bases for this app
  // readonly db;
  // // log files of this app
  // readonly filesLog;

  // TODO: add logger to the context
  get log(): Logger {
    return this.system.log;
  }

  constructor(system: System, manifest: EntityManifest) {
    this.system = system;
    this.manifest = manifest;

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
    this.rootFiles = new RootFiles();

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
