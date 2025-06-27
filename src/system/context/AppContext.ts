import { IndexedEventEmitter, pathJoin } from 'squidlet-lib';
import {
  DRIVER_NAMES,
  HOME_SUB_DIRS,
  ROOT_DIRS,
} from '../../types/constants.js';
import type { System } from '../System.js';
import { EntityBaseContext } from './EntityBaseContext.js';
import type { AppManifest } from '../../types/types.js';

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
// export const CTX_SUB_ITEMS = [
//   'api',
//   'appFiles',
//   'appDataLocal',
//   'cacheLocal',
//   'cfgLocal',
//   'cfgSynced',
//   'db',
//   'filesLog',
//   'tmpLocal',
//   'appUserData',
//   'homeDownloads',
//   'home',
//   'external',
//   'log',
// ];

export class AppContext extends EntityBaseContext {
  manifest: AppManifest;

  // readonly files of package of this app
  // readonly packageFiles;
  // local data of this app. Only for local machine
  readonly appDataLocal;
  // app's syncronized data of this app between all the hosts
  readonly appDataSynced;
  // TODO: use db key-value storage for cache
  // readonly cacheLocal;
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

  constructor(system: System, manifest: AppManifest) {
    super(system);

    this.manifest = manifest;

    //this.ui = new AppUiManager(system, appName)

    const filesDriver = this.system.drivers.getDriver<FilesDriver>(
      DRIVER_NAMES.FilesDriver
    );

    // this.packageFiles = new FilesReadOnly(
    //   filesDriver,
    //   pathJoin('/', ROOT_DIRS.packages, appName)
    // );
    this.appDataLocal = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.appDataLocal, appName)
    );
    this.appDataSynced = new FilesWrapper(
      filesDriver,
      pathJoin('/', ROOT_DIRS.appDataSynced, appName)
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

  async init() {
    //
  }

  async destroy() {
    //
  }

  registerAppUi(appName: string, staticFilesPaths: string[]) {
    this.system.appsUi.registerUi(appName, staticFilesPaths);
  }
}
