import type { LogLevels, Logger } from 'squidlet-lib'

import type { System } from '../system/System.js'
import type { DriverFactoryBase } from '../system/base/DriverFactoryBase.js'
import type { IoBase } from '../system/base/IoBase.js'
import type { AppContext } from '../system/context/AppContext.js'
import type { ServiceContext } from '../system/context/ServiceContext.js'
import type { DriverManifest } from './Manifests.js'

export interface IoContext {
  log: Logger
}

export type IoIndex = (ctx: IoContext) => IoBase
export type DriverIndex = (
  manifest: DriverManifest,
  system: System
) => DriverFactoryBase
export type ServiceOnInit = (ctx: ServiceContext) => Promise<void>
export type AppOnInit = (ctx: AppContext) => Promise<void>

export type BinTypes =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array

export type BinTypesNames =
  | 'Int8Array'
  | 'Uint8Array'
  | 'Uint8ClampedArray'
  | 'Int16Array'
  | 'Uint16Array'
  | 'Int32Array'
  | 'Uint32Array'
  | 'Float32Array'
  | 'Float64Array'
  | 'BigInt64Array'
  | 'BigUint64Array'

export interface MountPointDefinition {
  type: MountPointTypes
  path: string
}

export interface MountPoint {
  src: MountPointDefinition
  dest: MountPointDefinition
}

export interface SystemEnv {
  ROOT_DIR: string
  FILES_UID: number
  FILES_GID: number
  ENV_MODE: EnvModes
  DEFAULT_LOG_LEVEL?: LogLevels
}

export enum EnvModes {
  development = 'development',
  production = 'production',
  test = 'test',
}

export enum SystemEvents {
  driversInitialized = 'driversInitialized',
  servicesInitialized = 'servicesInitialized',
  systemInited = 'systemInited',
  systemStarted = 'systemStarted',
  systemDestroying = 'systemDestroying',
  logger = 'logger',
  // any actions with local files
  localFiles = 'localFiles',
  // any actions with ws server
  wsServer = 'wsServer',
  // any actions with ws client
  wsClient = 'wsClient',
  // any actions with http server
  httpServer = 'httpServer',
  // any actions with http client
  httpClient = 'httpClient',
  // when service or app status changed.
  //  ('app'|'service', entityName, EntityStatus, details?)
  entityStatus = 'entityStatus',
}

export enum EntityTypes {
  app = 'app',
  service = 'service',
  driver = 'driver',
  io = 'io',
}

export enum EntityStatuses {
  loaded = 'loaded',
  initializing = 'initializing',
  initError = 'initError',
  initialized = 'initialized',
  destroying = 'destroying',
  starting = 'starting',
  startError = 'startError',
  running = 'running',
  // fallen on error from running state
  fallen = 'fallen',
  stopping = 'stopping',
  stopError = 'stopError',
  stopped = 'stopped',
}

export enum DriverDestroyReasons {
  shutdown = 'shutdown',
}

export enum FileActions {
  read = 'r',
  write = 'w',
}

export enum MountPointTypes {
  // TODO: WTF?
  root = 'root',
  // path to external directory
  external = 'external',
  // path to archive
  archive = 'archive',
}

//export const SERVER_STARTING_TIMEOUT_SEC = 60

// TODO: review, move to network service
// export enum NETWORK_CODES {
//   success,
//   badRequest,
//   // error of remote method
//   payloadHandlerError,
//   // error while request or response process
//   fatalError,
//   noCategory,
// }

// export interface SubprogramError {
//   code: number;
//   codeText: string;
//   errorText: string;
// }

// TODO: for what?
// export type AnyEntityManifest =
//   | AppManifest
//   | ServiceManifest
//   | DriverManifest
//   | IoManifest;

// export interface IoSetEnv {
//   ENV_MODE?: EnvModes;
//   FILES_UID?: number;
//   FILES_GID?: number;
// }
