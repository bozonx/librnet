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
import type { IoSetClient } from '@/ioSets/IoSetClient.js';
import { setupFileStructure } from '@/installer/setupFileStructure.js';

export async function startSystemDev(
  env: Partial<SystemEnv>,
  ioSets: IoSetClient[],
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
    // TODO: лучше считать текущего юзера и группу
    FILES_UID: 1000,
    FILES_GID: 1000,
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
    await system.ios.useIoSet(ioSet);
  }

  for (const [manifest, packageIndex] of packages) {
    system.use(manifest, packageIndex);
  }

  await beforeInit?.(system);

  await setupFileStructure(system);

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
