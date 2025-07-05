import { IndexedEventEmitter, pathJoin } from 'squidlet-lib';
import {
  LOCAL_DATA_SUB_DIRS,
  ROOT_DIRS,
  SYNCED_DATA_SUB_DIRS,
  SYSTEM_API_SERVICE_NAME,
} from '../../types/constants.js';
import type { Logger } from 'squidlet-lib';
import type { System } from '../System';
import type { EntityManifest } from '@/types/types.js';
import { EntityConfig } from '../driversLogic/EntityConfig.js';
import { EntityLogFile } from '../driversLogic/EntityLogFile.js';
import { permissionWrapper } from '../helpers/permissionWrapper.js';
import type DriverInstanceBase from '../base/DriverInstanceBase.js';
import { DirTrapLogic } from '../driversLogic/DirTrapLogic.js';

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
  readonly localData = new DirTrapLogic(
    pathJoin(
      '/',
      ROOT_DIRS.localData,
      LOCAL_DATA_SUB_DIRS.data,
      this.manifest.name
    ),
    false,
    this.system
  );
  // syncronized data of this app between all the hosts
  readonly syncedData = new DirTrapLogic(
    pathJoin(
      '/',
      ROOT_DIRS.syncedData,
      SYNCED_DATA_SUB_DIRS.data,
      this.manifest.name
    ),
    false,
    this.system
  );
  // temporary files of this app
  readonly tmp = new DirTrapLogic(
    pathJoin(
      '/',
      ROOT_DIRS.localData,
      LOCAL_DATA_SUB_DIRS.tmp,
      this.manifest.name
    ),
    false,
    this.system
  );
  // readonly program and assets files of this app
  readonly myFiles = new DirTrapLogic(
    pathJoin('/', ROOT_DIRS.programFiles, this.manifest.name),
    true,
    this.system
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

  async makeDriverInstance<T extends DriverInstanceBase<any>>(
    driverName: string,
    props: Record<string, any>
  ): Promise<T> {
    const driver = this.system.drivers.getDriver(driverName);

    return (await driver.makeInstance(props)) as T;
  }

  /**
   * Access to api of services that registered their api in the system
   */
  serviceApi(serviceName: string) {
    if (serviceName === SYSTEM_API_SERVICE_NAME) {
      // Emitate system api service
      return permissionWrapper(
        this.system,
        this.manifest.name,
        serviceName,
        this.system.systemApi
      );
    }

    const serviceApi = this.system.api.getServiceApi(serviceName);

    return permissionWrapper(
      this.system,
      this.manifest.name,
      serviceName,
      serviceApi
    );
  }

  /**
   * Access to api of apps that registered their api in the system
   */
  appApi(appName: string) {
    const appApi = this.system.api.getAppApi(appName);

    return permissionWrapper(this.system, this.manifest.name, appName, appApi);
  }
}
