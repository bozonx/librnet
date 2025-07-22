import type { IoBase } from '../system/base/IoBase.js';
import type { ServiceContext } from '../system/context/ServiceContext.js';
import type { IoContext } from '../system/context/IoContext.js';
import type { IoSetBase } from '../system/base/IoSetBase.js';
import type { AppContext } from '../system/context/AppContext.js';
import type { System } from '../system/System.js';
import type { DriverFactoryBase } from '../system/base/DriverFactoryBase.js';
import type { DriverManifest } from './Manifests.js';
import type { MountPointTypes } from './constants.js';

export type IoIndex = (ioSet: IoSetBase, ctx: IoContext) => IoBase;
export type DriverIndex = (
  manifest: DriverManifest,
  system: System
) => DriverFactoryBase;
export type ServiceOnInit = (ctx: ServiceContext) => Promise<void>;
export type AppOnInit = (ctx: AppContext) => Promise<void>;

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

export interface MountPointDefinition {
  type: MountPointTypes;
  path: string;
}

export interface MountPoint {
  src: MountPointDefinition;
  dest: MountPointDefinition;
}


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