import { IndexedEventEmitter, LogPublisher} from 'squidlet-lib'
import { ENV_MODES, SystemEvents, type EnvMode } from '../types/constants.js';
import { IoManager } from './managers/IoManager.js';
import { ServicesManager } from './managers/ServicesManager.js';
import { SystemConfigsManager } from './managers/SystemConfigsManager.js';
import { PermissionsManager } from './managers/PermissionsManager.js';
import type { PackageIndex } from '../types/types.js';
import { PackageManager } from './managers/PackageManager.js';
import { DriversManager } from './managers/DriversManager.js';
import { afterInstall } from './afterInstall.js';
import { AppsManager } from './managers/AppsManager.js';

export class System {
  readonly events = new IndexedEventEmitter();
  readonly envMode: EnvMode;
  readonly justInstalled: boolean;
  // this is console logger
  readonly log = new LogPublisher((...p) =>
    this.events.emit(SystemEvents.logger, ...p)
  );
  // managers
  readonly packageManager = new PackageManager(this);
  readonly configs = new SystemConfigsManager(this);
  // readonly permissions = new PermissionsManager(this);
  readonly io = new IoManager(this);
  readonly drivers = new DriversManager(this);
  readonly services = new ServicesManager(this);
  readonly apps = new AppsManager(this);

  get isDevMode() {
    return this.envMode === ENV_MODES.dev;
  }

  get isProdMode() {
    return this.envMode === ENV_MODES.prod;
  }

  get isTestMode() {
    return this.envMode === ENV_MODES.test;
  }

  constructor(
    envMode: EnvMode = ENV_MODES.prod as EnvMode,
    justInstalled: boolean = false
  ) {
    // TODO: receive  logger from outside
    this.envMode = envMode;
    this.justInstalled = justInstalled;
  }

  async init() {
    try {
      await this.io.initSystemIos();
      // system configs for IO, drivers and services
      await this.configs.init();
      await this.packageManager.loadInstalled();
      await this.io.initOtherIos();
      await this.drivers.init();

      if (this.justInstalled) {
        await afterInstall(this);
      }

      // await this.permissions.init();
      await this.services.init();
      await this.apps.init();
      // notify that system is inited
      this.events.emit(SystemEvents.systemInited);
    } catch (e) {
      this.log.error(String(e));
    }
  }

  async destroy() {
    try {
      this.events.emit(SystemEvents.systemDestroying);

      // TODO: add timeout for each item

      // it will call destroy functions step by step
      await Promise.allSettled([
        this.apps.destroy(),
        this.services.destroy(),
        this.packageManager.destroy(),
        // destroyWrapper(this.permissions.destroy.bind(this.permissions)),
        this.drivers.destroy(),
        this.io.destroy(),
      ]);

      this.events.destroy();
    } catch (e) {
      this.log.error(String(e));
    }
  }

  async start() {
    try {
      // start system's and user's services
      await this.services.startAll();
      await this.apps.startAll();
      // notify that system is started
      this.events.emit(SystemEvents.systemStarted);
    } catch (e) {
      this.log.error(String(e));
    }
  }

  use(pkg: PackageIndex) {
    this.packageManager.use(pkg);
  }
}
