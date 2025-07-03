import { IndexedEventEmitter, pathJoin } from 'squidlet-lib';
import {
  LOCAL_DATA_SUB_DIRS,
  ROOT_DIRS,
  SYNCED_DATA_SUB_DIRS,
} from '../../types/constants.js';
import type { Logger } from 'squidlet-lib';
import type { System } from '../System';
import { DirTrap } from '../driversLogic/DirTrap.js';
import type { EntityManifest } from '@/types/types.js';
import { EntityConfig } from '../driversLogic/EntityConfig.js';
import { EntityLogFile } from '../driversLogic/EntityLogFile.js';
import { DirTrapReadOnly } from '../driversLogic/DirTrapReadOnly.js';
import { permissionWrapper } from '../helpers/permissionWrapper.js';
import type DriverInstanceBase from '../base/DriverInstanceBase.js';

export class EntityBaseContext {
  // Server side context
  // save here custom runtime data eg driver instances
  readonly context: Record<string, any> = {};

  // Events bus only for server
  readonly serverSideBus = new IndexedEventEmitter();
  // Events bus for sending events to client
  readonly toClientBus = new IndexedEventEmitter();

  // local user's config files of this app
  readonly localConfig = new EntityConfig(this.system, this.manifest, false);
  // synced user's config files of this app
  readonly syncedConfig = new EntityConfig(this.system, this.manifest, true);

  readonly consoleLog: Logger = {
    debug: (msg: string) =>
      this.system.log.debug(`[${this.manifest.name}]: ${msg}`),
    info: (msg: string) =>
      this.system.log.info(`[${this.manifest.name}]: ${msg}`),
    warn: (msg: string) =>
      this.system.log.warn(`[${this.manifest.name}]: ${msg}`),
    error: (msg: string) =>
      this.system.log.error(`[${this.manifest.name}]: ${msg}`),
    log: (msg: string) =>
      this.system.log.log(`[${this.manifest.name}]: ${msg}`),
  };
  // local files log of this app
  readonly localLog = new EntityLogFile(this.system, this.manifest, false);
  // synced files log of this app
  readonly syncedLog = new EntityLogFile(this.system, this.manifest, true);

  // local data of this app. Only for local machine
  readonly localData = new DirTrap(
    this.system,
    pathJoin(
      '/',
      ROOT_DIRS.localData,
      LOCAL_DATA_SUB_DIRS.data,
      this.manifest.name
    )
  );
  // syncronized data of this app between all the hosts
  readonly syncedData = new DirTrap(
    this.system,
    pathJoin(
      '/',
      ROOT_DIRS.syncedData,
      SYNCED_DATA_SUB_DIRS.data,
      this.manifest.name
    )
  );
  // temporary files of this app
  readonly tmp = new DirTrap(
    this.system,
    pathJoin(
      '/',
      ROOT_DIRS.localData,
      LOCAL_DATA_SUB_DIRS.tmp,
      this.manifest.name
    )
  );
  // readonly program and assets files of this app
  readonly myFiles = new DirTrapReadOnly(
    this.system,
    pathJoin('/', ROOT_DIRS.programFiles, this.manifest.name)
  );

  // TODO: use db key-value storage for cache
  // readonly cacheLocal;
  // // data bases for this app
  // readonly db;

  constructor(
    protected readonly system: System,
    // manifest of the service or app
    readonly manifest: EntityManifest,
    protected readonly accessToken: string
  ) {}

  async init() {
    this.localConfig.init();
    this.syncedConfig.init();
  }

  async destroy() {
    //
  }

  async makeDriverInstance<T extends DriverInstanceBase>(
    driverName: string,
    params: Record<string, any>
  ): Promise<T> {
    // TODO: use accessToken to make driver instance
    // return this.system.drivers.getDriver<T>(driverName);
  }

  /**
   * Access to api of services that registered their api in the system
   */
  serviceApi(serviceName: string) {
    const serviceApi = this.system.api.getServiceApi(serviceName);

    return permissionWrapper(this.system, serviceName, serviceApi);
  }

  /**
   * Access to api of apps that registered their api in the system
   */
  appApi(appName: string) {
    const appApi = this.system.api.getAppApi(appName);

    return permissionWrapper(this.system, appName, appApi);
  }
}
