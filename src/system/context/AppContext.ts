import { IndexedEventEmitter, pathJoin } from 'squidlet-lib';
import type { Logger } from 'squidlet-lib';
import {
  DRIVER_NAMES,
  HOME_SUB_DIRS,
  ROOT_DIRS,
} from '../../types/constants.js';
import { FilesLog } from '../../helpers/wrappers/FilesLog.js';
import { FilesWrapper } from '../../helpers/wrappers/FilesWrapper.js';
import { FilesReadOnly } from '../../helpers/wrappers/FilesReadOnly.js';
import type { DriversManager } from '../managers/DriversManager.js';
import type { System } from '../System.js';
import { FilesHome } from '../../helpers/wrappers/FilesHome.js';
import type { FilesDriver } from '../../packages/SystemCommonPkg/FilesDriver/FilesDriver.js';
import { FilesCache } from '../../helpers/wrappers/FilesCache.js';
import { FilesDb } from '../../helpers/wrappers/FilesDb.js';

// export const NOT_ALLOWED_CTX_PROPS: string[] = [
//   'appName',
//   'drivers',
//   'events',
//   'getServiceApi',
//   'getAppApi',
//   'constructor',
//   'init',
//   'destroy',
//   'registerAppUi',
// ]
export const CTX_SUB_ITEMS = [
  'api',
  'appFiles',
  'appDataLocal',
  'cacheLocal',
  'cfgLocal',
  'cfgSynced',
  'db',
  'filesLog',
  'tmpLocal',
  'appUserData',
  'homeDownloads',
  'home',
  'external',
  'log',
];

export class AppContext {
  appName: string;

  api: Record<string, any> = {};

  // readonly files of this app
  readonly appFiles;
  // local data of this app. Only for local machine
  readonly appDataLocal;
  // app's syncronized data of this app between all the hosts
  readonly appDataSynced;
  // file cache of this app
  readonly cacheLocal;
  // config files for this app. It manages them by it self
  readonly cfgLocal;
  readonly cfgSynced;
  // data bases for this app
  readonly db;
  // log files of this app
  readonly filesLog;
  // for temporary files of this app
  readonly tmpLocal;
  readonly appUserData;
  readonly homeDownloads;
  readonly home;
  // access to external dir
  readonly external;

  // TODO: add !!!!
  // memStorage only for this app
  //readonly memStorage

  private system: System;

  get log(): Logger {
    return this.system.log;
  }

  get drivers(): DriversManager {
    return this.system.drivers;
  }

  get events(): IndexedEventEmitter {
    return this.system.events;
  }

  getServiceApi<T = Record<string, any>>(serviceName: string): T | undefined {
    return this.system.services.getServiceApi<T>(serviceName);
  }

  getAppApi<T = Record<string, any>>(appName: string): T | undefined {
    return this.system.apps.getAppApi<T>(appName);
  }

  constructor(system: System, appName: string) {
    this.appName = appName;
    this.system = system;

    //this.ui = new AppUiManager(system, appName)

    const filesDriver = this.system.drivers.getDriver<FilesDriver>(
      DRIVER_NAMES.FilesDriver
    );

    this.appFiles = new FilesReadOnly(
      filesDriver,
      pathJoin('/', ROOT_DIRS.appFiles, appName)
    );
    this.appDataLocal = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.appDataLocal, appName)
    );
    this.appDataSynced = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.appDataSynced, appName)
    );
    this.cacheLocal = new FilesCache(
      this.system.drivers,
      pathJoin('/', ROOT_DIRS.cacheLocal, appName)
    );
    this.cfgLocal = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.cfgLocal, appName)
    );
    this.cfgSynced = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.cfgSynced, appName)
    );
    this.db = new FilesDb(
      this.system.drivers,
      pathJoin('/', ROOT_DIRS.db, appName)
    );
    this.filesLog = new FilesLog(
      filesDriver,
      pathJoin('/', ROOT_DIRS.log, appName)
    );
    this.tmpLocal = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.tmpLocal, appName)
    );
    this.appUserData = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.home, HOME_SUB_DIRS._Apps, appName)
    );
    this.homeDownloads = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.home, HOME_SUB_DIRS._Downloads)
    );
    this.home = new FilesHome(filesDriver, pathJoin('/', ROOT_DIRS.home));
    this.external = new FilesWrapper(
      filesDriver,
      pathJoin('/', EXTERNAL_ROOT_DIR)
    );

    //this.memStorage = new RestrictedMemStorage(this.system, appName)
  }

  async init() {}

  async destroy() {}

  registerAppUi(appName: string, staticFilesPaths: string[]) {
    this.system.appsUi.registerUi(appName, staticFilesPaths);
  }
}
