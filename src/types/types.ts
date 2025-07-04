import type {PackageContext} from '../system/context/PackageContext.js'
import type {DriverContext} from '../system/context/DriverContext.js'
import type { DriverBase } from '../system/base/DriverBase.js';
import type { IoBase } from '../system/base/IoBase.js';
import type { ServiceBase } from '../system/base/ServiceBase.js';
import type {ServiceContext} from '../system/context/ServiceContext.js'
import type {IoContext} from '../system/context/IoContext.js'
import type {
  EnvMode,
  SERVICE_DESTROY_REASON,
  SERVICE_STATUS,
} from './constants.js';
import type { IoSetBase } from '@/system/base/IoSetBase.js';
import type { AppContext } from '@/system/context/AppContext.js';

// It is called right after it is set to system via use()
// That means very early, before system.init()
export type PackageIndex = (ctx: PackageContext) => void;
export type IoIndex = (ioSet: IoSetBase, ctx: IoContext) => IoBase;
export type DriverIndex = (name: string, ctx: DriverContext) => DriverBase;
export type ServiceIndex = (ctx: ServiceContext) => ServiceBase;
export type AppIndex = () => AppMain;
export type ServiceStatus = keyof typeof SERVICE_STATUS;
export type ServiceDestroyReason = keyof typeof SERVICE_DESTROY_REASON;
export type PermissionFileType = 'r' | 'w';
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
  | BigUint64Array;
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
  | 'BigUint64Array';

export interface SubprogramError {
  code: number;
  codeText: string;
  errorText: string;
}

export interface IoSetEnv {
  // ROOT_DIR: string;
  ENV_MODE?: EnvMode;
  FILES_UID?: number;
  FILES_GID?: number;
  // EXT_DIRS?: string;
}

// for Io and Driver
export interface EntityCfg {
  local?: Record<string, any>;
  synced?: Record<string, any>;
}

export interface PackageManifest {
  // Unique name
  name: string;
  // it can be a main version of all the entities in the package
  version: string;
  // description in different languages
  description: Record<string, string>;
  author?: string;
  license?: string;
  // homepage of the package
  homepage?: string;
  repository?: string;
  bugs?: string;
  // list of paths to Io dirs relative to package
  ios?: string[];
  // list of paths to Driver dirs relative to package
  drivers?: string[];
  // list of paths to Service dirs relative to package
  services?: string[];
  // list of App names that are required by the package
  apps?: string[];
}

// Manifest of a service or app
export interface EntityManifest {
  // Unique name
  name: string;
  // If not set, it will be the same as the package version
  version?: string;
  // name in different languages
  nameLocale: Record<string, string>;
  // description in different languages
  description: Record<string, string>;
  // If not set, it will be the same as the package author
  author?: string;
  // If not set, it will be the same as the package license
  license?: string;
  // homepage of the entity
  homepage?: string;
  // repository of the entity
  repository?: string;
  // bugs of the entity
  bugs?: string;
  // requireDriver?: string[];
  // requireService?: string[];
  // requireApp?: string[];
}

export interface AppManifest extends EntityManifest {
  type: 'app';
}

export interface ServiceManifest extends EntityManifest {
  type: 'service';
}

export type EntityStatus =
  | 'none'
  | 'initializing'
  | 'initError'
  | 'initialized'
  | 'destroying'
  | 'starting'
  | 'startError'
  | 'started'
  | 'stopping'
  | 'stopError'
  | 'stopped';

export interface EntityItem {
  // requireDriver?: string[];
  status: EntityStatus;
}

export interface AppMain {
  manifest: AppManifest;
  onInit?: (ctx: AppContext) => Promise<void>;
  onDestroy?: (ctx: AppContext) => Promise<void>;
  onStart?: (ctx: AppContext) => Promise<void>;
  onStop?: (ctx: AppContext) => Promise<void>;
}

export interface FilesEventData {
  // Timestamp of the operation in milliseconds
  timestamp: number;
  path: string;
  action: string;
  // Method of FilesDriverType
  method: string;
  // Size of the operation in bytes
  size?: number;
}

export interface MountPointDefinition {
  type: 'root' | 'external';
  path: string;
}

export interface MountPoint {
  src: MountPointDefinition;
  dest: MountPointDefinition;
}