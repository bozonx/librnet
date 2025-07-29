import { IndexedEventEmitter, LogPublisher } from 'squidlet-lib'

import {
  type AppManifest,
  type DriverManifest,
  type ServiceManifest,
} from '../types/Manifests.js'
import {
  type AppOnInit,
  type DriverIndex,
  EntityTypes,
  EnvModes,
  type ServiceOnInit,
  type SystemEnv,
  SystemEvents,
} from '../types/types.js'
import { AppsManager } from './managers/AppsManager.js'
import { ConfigsManager } from './managers/ConfigsManager.js'
import { DriversManager } from './managers/DriversManager.js'
import { EntitiesApiManager } from './managers/EntitiesApiManager.js'
import { FileLogsManager } from './managers/FileLogsManager.js'
import { IosManager } from './managers/IosManager.js'
import { MountPointsManager } from './managers/MountPointsManager.js'
import { PackagesManager } from './managers/PackagesManager.js'
import { PermissionsManager } from './managers/PermissionsManager.js'
import { PortsManager } from './managers/PortsManager.js'
import { RootDirAccess } from './managers/RootDirAccess.js'
import { ServicesManager } from './managers/ServicesManager.js'
import { SystemApiManager } from './managers/SystemApiManager.js'

export class System {
  readonly events = new IndexedEventEmitter()
  readonly log = new LogPublisher((...p: any[]) =>
    this.events.emit(SystemEvents.logger, ...p)
  )

  // this is access to local files only for system purposes
  // It doesn't check permissions but rises events
  readonly localFiles = new RootDirAccess(this, this.env.ROOT_DIR)
  // managers
  readonly mountPoints = new MountPointsManager(this, this.env.ROOT_DIR)
  readonly fileLogs = new FileLogsManager(this)
  readonly ports = new PortsManager(this)
  readonly packagesManager = new PackagesManager(this)
  readonly systemApi = new SystemApiManager(this)
  // TODO: зачем этот менеджер? если есть systemApi
  readonly api = new EntitiesApiManager()

  readonly configs = new ConfigsManager(this)
  readonly permissions = new PermissionsManager(this)
  readonly ios = new IosManager(this)
  readonly drivers = new DriversManager(this)
  readonly services = new ServicesManager(this)
  readonly apps = new AppsManager(this)

  get isDevMode() {
    return this.env.ENV_MODE === EnvModes.development
  }

  get isProdMode() {
    return this.env.ENV_MODE === EnvModes.production
  }

  get isTestMode() {
    return this.env.ENV_MODE === EnvModes.test
  }

  get env() {
    return structuredClone(this._env)
  }

  constructor(private readonly _env: SystemEnv) {}

  async init() {
    try {
      await this.configs.init()
      await this.permissions.init()

      await this.drivers.init()
      this.events.emit(SystemEvents.driversInitialized)

      await this.services.init()
      this.events.emit(SystemEvents.servicesInitialized)

      await this.apps.init()

      this.events.emit(SystemEvents.systemInited)
    } catch (e) {
      this.log.error(String(e))
    }
  }

  async destroy() {
    try {
      this.events.emit(SystemEvents.systemDestroying)

      await this.apps.destroy()
      await this.services.destroy()
      await this.drivers.destroy()
      await this.ios.destroy()

      this.events.destroy()
    } catch (e) {
      this.log.error(String(e))
    }
  }

  async start() {
    try {
      // start system's and user's services
      await this.services.startAll()
      await this.apps.startAll()
      // notify that system is started
      this.events.emit(SystemEvents.systemStarted)
    } catch (e) {
      this.log.error(String(e))
    }
  }

  /**
   * Register a package in development mode
   *
   * @param manifest - Manifest of the package
   * @param index - Index of the package
   */
  use(
    manifest: AppManifest | ServiceManifest | DriverManifest,
    index: DriverIndex | ServiceOnInit | AppOnInit
  ) {
    if (!this.isDevMode)
      throw new Error(
        `You try to register a package "${manifest.name}" not in development mode`
      )

    if (manifest.type === EntityTypes.app) {
      this.apps.use(manifest, index as AppOnInit)
    } else if (manifest.type === EntityTypes.service) {
      this.services.use(manifest, index as ServiceOnInit)
    } else if (manifest.type === EntityTypes.driver) {
      this.drivers.use(manifest, index as DriverIndex)
    }
  }
}
