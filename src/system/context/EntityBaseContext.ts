import { IndexedEventEmitter, pathJoin } from 'squidlet-lib'
import type { Logger } from 'squidlet-lib'

import {
  type EntityStatus,
  LOCAL_DATA_SUB_DIRS,
  ROOT_DIRS,
  SYNCED_DATA_SUB_DIRS,
  SYSTEM_API_SERVICE_NAME,
} from '../../types/constants.js'
import type { System } from '../System'
import type DriverInstanceBase from '../base/DriverInstanceBase.js'
import { DirTrapLogic } from '../driversLogic/DirTrapLogic.js'
import { EntityConfig } from '../driversLogic/EntityConfig.js'
import { EntityLogFile } from '../driversLogic/EntityLogFile.js'
import { permissionWrapper } from '../helpers/permissionWrapper.js'
import type { EntityManifest, EntityType } from '@/types/types.js'

export abstract class EntityBaseContext {
  abstract readonly type: Extract<EntityType, 'app' | 'service'>
  // Server side context
  // save here custom runtime data eg driver instances
  readonly context: Record<string, any> = {}
  readonly _hooks = {
    onDestroy: async () => {},
    onStart: async () => {},
    onStop: async () => {},
  }

  // Events bus only for server
  readonly serverSideBus = new IndexedEventEmitter()
  // Events bus for sending events to client
  readonly toClientBus = new IndexedEventEmitter()

  // local user's config files of this app
  readonly localConfig = new EntityConfig(
    this.system,
    this.entityManifest,
    false
  )
  // synced user's config files of this app
  readonly syncedConfig = new EntityConfig(
    this.system,
    this.entityManifest,
    true
  )

  readonly consoleLog: Logger = {
    debug: (msg: string) =>
      this.system.log.debug(`[${this.entityManifest.name}]: ${msg}`),
    info: (msg: string) =>
      this.system.log.info(`[${this.entityManifest.name}]: ${msg}`),
    warn: (msg: string) =>
      this.system.log.warn(`[${this.entityManifest.name}]: ${msg}`),
    error: (msg: string) =>
      this.system.log.error(`[${this.entityManifest.name}]: ${msg}`),
    log: (msg: string) =>
      this.system.log.log(`[${this.entityManifest.name}]: ${msg}`),
  }
  // local files log of this app
  readonly localLog = new EntityLogFile(this.system, this.entityManifest, false)
  // synced files log of this app
  readonly syncedLog = new EntityLogFile(this.system, this.entityManifest, true)

  // local data of this app. Only for local machine
  readonly localData = new DirTrapLogic(
    pathJoin(
      '/',
      ROOT_DIRS.local,
      LOCAL_DATA_SUB_DIRS.data,
      this.entityManifest.name
    ),
    false,
    this.system
  )
  // syncronized data of this app between all the hosts
  readonly syncedData = new DirTrapLogic(
    pathJoin(
      '/',
      ROOT_DIRS.synced,
      SYNCED_DATA_SUB_DIRS.data,
      this.entityManifest.name
    ),
    false,
    this.system
  )
  // temporary files of this app
  readonly tmp = new DirTrapLogic(
    pathJoin(
      '/',
      ROOT_DIRS.local,
      LOCAL_DATA_SUB_DIRS.tmp,
      this.entityManifest.name
    ),
    false,
    this.system
  )
  // readonly program and assets files of this app
  readonly myFiles = new DirTrapLogic(
    pathJoin(
      '/',
      ROOT_DIRS.local,
      LOCAL_DATA_SUB_DIRS.programs,
      this.entityManifest.name
    ),
    true,
    this.system
  )

  get status(): EntityStatus {
    return this.system[this.type].getStatus(this.entityManifest.name)
  }

  // TODO: use db key-value storage for cache
  // readonly cacheLocal;
  // // data bases for this app
  // readonly db;

  constructor(
    protected readonly system: System,
    // manifest of the service or app
    readonly entityManifest: EntityManifest
  ) {}

  async init() {
    this.localConfig.init()
    this.syncedConfig.init()
  }

  async destroy() {
    //
  }

  $getHooks() {
    return this._hooks
  }

  async makeDriverInstance<T extends DriverInstanceBase<any>>(
    driverName: string,
    props: Record<string, any>
  ): Promise<T> {
    const driver = this.system.drivers.getDriver(driverName)

    return (await driver.makeInstance(props)) as T
  }

  /** Access to api of services that registered their api in the system */
  serviceApi(serviceName: string) {
    if (serviceName === SYSTEM_API_SERVICE_NAME) {
      // Emitate system api service
      return permissionWrapper(
        this.system,
        this.entityManifest.name,
        serviceName,
        this.system.systemApi
      )
    }

    const serviceApi = this.system.api.getServiceApi(serviceName)

    return permissionWrapper(
      this.system,
      this.entityManifest.name,
      serviceName,
      serviceApi
    )
  }

  /** Access to api of apps that registered their api in the system */
  appApi(appName: string) {
    const appApi = this.system.api.getAppApi(appName)

    return permissionWrapper(
      this.system,
      this.entityManifest.name,
      appName,
      appApi
    )
  }

  onDestroy(hook: () => Promise<void>) {
    this._hooks.onDestroy = hook
  }

  onStart(hook: () => Promise<void>) {
    this._hooks.onStart = hook
  }

  onStop(hook: () => Promise<void>) {
    this._hooks.onStop = hook
  }
}
