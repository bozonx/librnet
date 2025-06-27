import { pathJoin } from 'squidlet-lib';
import { DRIVER_NAMES, ROOT_DIRS } from '../../types/constants.js';
import type { System } from '../System.js';
import { EntityBaseContext } from './EntityBaseContext.js';
import type { AppManifest } from '../../types/types.js';
import type { ApiSet } from '../managers/ApiManager.js';

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

  // readonly appUserData;
  // readonly homeDownloads;
  // readonly home;
  // // access to external dir
  // readonly external;

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
    // this.appUserData = new FilesWrapper(
    //   filesDriver,
    //   pathJoin('/', ROOT_DIRS.home, HOME_SUB_DIRS._Apps, appName)
    // );
    // this.homeDownloads = new FilesWrapper(
    //   filesDriver,
    //   pathJoin('/', ROOT_DIRS.home, HOME_SUB_DIRS._Downloads)
    // );
    // this.home = new FilesHome(filesDriver, pathJoin('/', ROOT_DIRS.home));
    // this.external = new FilesWrapper(
    //   filesDriver,
    //   pathJoin('/', EXTERNAL_ROOT_DIR)
    // );

    //this.memStorage = new RestrictedMemStorage(this.system, appName)
  }

  async init() {
    //
  }

  async destroy() {
    //
  }

  registerUiApi(apiSet: ApiSet) {
    this.system.api.registerAppUiApi(this.manifest.name, apiSet);
  }

  registerIntranetApi(apiSet: ApiSet) {
    this.system.api.registerAppIntranetApi(this.manifest.name, apiSet);
  }

  registerExternalApi(apiSet: ApiSet) {
    this.system.api.registerServiceIntranetApi(this.manifest.name, apiSet);
  }
}
