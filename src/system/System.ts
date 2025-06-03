import {callSafely, IndexedEventEmitter, LogPublisher} from 'squidlet-lib'
import {SystemEvents} from '../types/constants.js'
import {IoManager} from './managers/IoManager.js'
import { ServicesManager } from './managers/ServicesManager.js';
import {SystemConfigsManager} from './managers/SystemConfigsManager.js'
import {PermissionsManager} from './managers/PermissionsManager.js'
import type {PackageIndex} from '../types/types.js'
import {PackageManager} from './managers/PackageManager.js'
import { DriversManager } from './managers/DriversManager.js';
import {
  SYSTEM_SUB_DIRS,
  ROOT_DIRS,
  HOME_SUB_DIRS,
} from '../types/constants.js';
import type { FilesDriver } from '@/drivers/FilesDriver/FilesDriver.js';

export class System {
  readonly events = new IndexedEventEmitter();
  // this is console logger
  readonly log = new LogPublisher((...p) =>
    this.events.emit(SystemEvents.logger, ...p)
  );
  // managers
  readonly packageManager = new PackageManager(this);
  readonly io = new IoManager(this);
  readonly drivers = new DriversManager(this);
  // It is wrapper for DB which is works with configs
  readonly configs = new SystemConfigsManager(this);
  readonly permissions = new PermissionsManager(this);
  readonly services = new ServicesManager(this);

  constructor() {}

  init() {
    (async () => {
      await this.io.init();
      await this.drivers.init();
      await this._initDirectories();
      await this.configs.init();
      await this.permissions.init();
      await this.services.init();
      // load all the installed packages
      await this.packageManager.loadInstalled();
      // notify that system is inited
      this.events.emit(SystemEvents.systemInited);
    })().catch((e) => {
      this.log.error(String(e));
    });
  }

  destroy() {
    this.events.emit(SystemEvents.systemDestroying);

    // TODO: add timeout for each item

    const destroyWrapper = (fn: () => Promise<void>): Promise<void> => {
      return callSafely(fn).catch((e) => this.log.error(String(e)));
    };
    // it will call destroy functions step by step
    Promise.allSettled([
      destroyWrapper(this.services.destroy.bind(this.services)),
      destroyWrapper(this.permissions.destroy.bind(this.permissions)),
      destroyWrapper(this.drivers.destroy.bind(this.drivers)),
      destroyWrapper(this.io.destroy.bind(this.io)),
      destroyWrapper(this.packageManager.destroy.bind(this.packageManager)),
    ]).then(() => {
      this.events.destroy();
    });
  }

  start() {
    (async () => {
      // start system's and user's services
      await this.services.startAll();
      // notify that system is started
      this.events.emit(SystemEvents.systemStarted);
    })().catch((e) => {
      this.log.error(String(e));
    });
  }

  use(pkg: PackageIndex) {
    pkg(this.packageManager.ctx);
  }

  async _initDirectories() {
    const driver = this.drivers.getDriver<FilesDriver>('FilesDriver');

    // create root dirs
    for (const dir of Object.keys(ROOT_DIRS)) {
      await driver.mkDirP('/' + dir);
    }

    // /system/...
    for (const dir of Object.keys(SYSTEM_SUB_DIRS)) {
      await driver.mkDirP(`/${ROOT_DIRS.system}/${dir}`);
    }
    // /home/...
    for (const dir of Object.keys(HOME_SUB_DIRS)) {
      await driver.mkDirP(`/${ROOT_DIRS.home}/${dir}`);
    }
  }
}
