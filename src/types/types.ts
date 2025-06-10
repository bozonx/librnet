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
import type { AppBase } from '@/system/base/AppBase.js';
import type { IoSetBase } from '@/system/base/IoSetBase.js';

// It is called right after it is set to system via use()
// That means very early, before system.init()
export type PackageIndex = (ctx: PackageContext) => void;
export type IoIndex = (ioSet: IoSetBase, ctx: IoContext) => IoBase;
export type DriverIndex = (ctx: DriverContext) => DriverBase;
export type ServiceIndex = (ctx: ServiceContext) => ServiceBase;
export type AppIndex = () => AppBase;
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
  | Float64Array;
export type BinTypesNames =
  | 'Int8Array'
  | 'Uint8Array'
  | 'Uint8ClampedArray'
  | 'Int16Array'
  | 'Uint16Array'
  | 'Int32Array'
  | 'Uint32Array'
  | 'Float32Array'
  | 'Float64Array';

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

export interface EntityCfg {
  local?: Record<string, any>;
  synced?: Record<string, any>;
}
