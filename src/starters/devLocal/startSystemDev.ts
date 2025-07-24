import {
  ConsoleLogger,
  omitUndefined,
  LogLevels,
  type Logger,
} from 'squidlet-lib';
import { System } from '../../system/System.js';
import {
  EnvModes,
  SystemEvents,
  type SystemEnv,
  type DriverIndex,
  type ServiceOnInit,
  type AppOnInit,
} from '../../types/types.js';
import { type AppManifest } from '../../types/Manifests.js';
import { type ServiceManifest } from '../../types/Manifests.js';
import { type DriverManifest } from '../../types/Manifests.js';
import { IoSetServer } from '@/ioSets/IoSetServer.js';

// const EXT_DIRS = process.env.EXT_DIRS as unknown as string[];
// const JUST_INSTALLED =
//   typeof process.env.JUST_INSTALLED === 'string'
//     ? process.env.JUST_INSTALLED === 'true'
//     : false;

// TODO: make dirs

export async function startSystemDev(
  env: Partial<SystemEnv>,
  ioSets: IoSetServer[],
  packages: [
    AppManifest | ServiceManifest | DriverManifest,
    DriverIndex | ServiceOnInit | AppOnInit
  ][],
  consoleLogger: Logger,
  beforeInit?: (system: System) => Promise<void>
) {
  const resolvedLogger =
    consoleLogger || new ConsoleLogger(env.DEFAULT_LOG_LEVEL || LogLevels.info);
  const system = new System({
    FILES_UID: 100,
    FILES_GID: 100,
    ENV_MODE: EnvModes.development,
    ...omitUndefined(env),
  } as SystemEnv);

  system.events.addListener(
    SystemEvents.logger,
    (logLevel: LogLevels, message: string) => {
      resolvedLogger[logLevel](message);
    }
  );

  for (const ioSet of ioSets) {
    system.ios.use(ioSet);
  }

  for (const [manifest, packageIndex] of packages) {
    system.use(manifest, packageIndex);
  }

  await beforeInit?.(system);

  // Enable graceful stop
  system.events.once(SystemEvents.systemStarted, () => {
    process.once('SIGINT', () => system.destroy());
    process.once('SIGTERM', () => system.destroy());
  });

  // init the system
  await system.init();
  // start services and apps
  await system.start();
}
