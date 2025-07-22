import { IndexedEventEmitter, LogPublisher } from 'squidlet-lib';
import { IoManager } from './managers/IoManager.js';
import { ServicesManager } from './managers/ServicesManager.js';
import { ConfigsManager } from './managers/ConfigsManager.js';
import { PermissionsManager } from './managers/PermissionsManager.js';
import { PackageManager } from './managers/PackageManager.js';
import { DriversManager } from './managers/DriversManager.js';
import { AppsManager } from './managers/AppsManager.js';
import { EntitiesApiManager } from './managers/EntitiesApiManager.js';
import { FileLogsManager } from './managers/FileLogsManager.js';
import { MountPointsManager } from './managers/MountPointsManager.js';
import { RootDirDriverLogic } from './driversLogic/RootDirDriverLogic.js';
import { SystemApiManager } from './managers/SystemApiManager.js';
import { PortsManager } from './managers/PortsManager.js';
import { EnvModes, SystemEvents, type SystemEnv } from '../types/types.js';

export class System {
  readonly events = new IndexedEventEmitter();
  readonly log = new LogPublisher((...p: any[]) =>
    this.events.emit(SystemEvents.logger, ...p)
  );

  // this is access to local files only for system purposes
  // It doesn't check permissions but rises events
  readonly localFiles = new RootDirDriverLogic(this, this.env.ROOT_DIR);
  // managers
  readonly mountPoints = new MountPointsManager(this, this.env.ROOT_DIR);
  readonly ports = new PortsManager(this);
  readonly packageManager = new PackageManager(this);
  readonly configs = new ConfigsManager(this);
  readonly permissions = new PermissionsManager(this);
  readonly fileLogs = new FileLogsManager(this);
  readonly io = new IoManager(this);
  readonly api = new EntitiesApiManager();
  readonly systemApi = new SystemApiManager(this);
  readonly drivers = new DriversManager(this);
  readonly service = new ServicesManager(this);
  readonly app = new AppsManager(this);

  get isDevMode() {
    return this.env.ENV_MODE === EnvModes.development;
  }

  get isProdMode() {
    return this.env.ENV_MODE === EnvModes.production;
  }

  get isTestMode() {
    return this.env.ENV_MODE === EnvModes.test;
  }

  get env() {
    return structuredClone(this._env);
  }

  constructor(private readonly _env: SystemEnv) {}

  async init() {
    try {
      await this.io.initIoSetsAndFilesIo();
      // system configs for IO, drivers and services
      await this.configs.init();
      await this.permissions.init();
      await this.io.initIos();
      await this.drivers.init();
      this.events.emit(SystemEvents.driversInitialized);
      await this.service.init();
      this.events.emit(SystemEvents.servicesInitialized);
      await this.app.init();
      // notify that system is inited
      this.events.emit(SystemEvents.systemInited);
    } catch (e) {
      this.log.error(String(e));
    }
  }

  async destroy() {
    try {
      this.events.emit(SystemEvents.systemDestroying);

      await this.app.destroy();
      await this.service.destroy();
      await this.drivers.destroy();
      await this.io.destroy();

      this.events.destroy();
    } catch (e) {
      this.log.error(String(e));
    }
  }

  async start() {
    try {
      // start system's and user's services
      await this.service.startAll();
      await this.app.startAll();
      // notify that system is started
      this.events.emit(SystemEvents.systemStarted);
    } catch (e) {
      this.log.error(String(e));
    }
  }
}
