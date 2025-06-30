import { System } from '@/system/System.js';
import { LOG_LEVELS } from 'squidlet-lib';
import type { LogLevel } from 'squidlet-lib';
import { ConsoleLoggerPkg } from '@/packages/ConsoleLoggerPkg/index.js';
import { SystemCommonPkg } from '@/packages/SystemCommonPkg/index.js';
import { ioSetLocalPkg } from '@/packages/IoSetLocalPkg/index.js';
import { FilesIoIndex } from '@/ios/NodejsPack/LocalFilesIo.js';
import { SysInfoIoIndex } from '@/_not_used/ios/NodejsLinuxPack/SysInfoIo.js';
import { HttpClientIoIndex } from '@/ios/NodejsPack/HttpClientIo.js';
import { HttpServerIoIndex } from '@/ios/NodejsPack/HttpServerIo.js';
import { WsClientIoIndex } from '@/ios/NodejsPack/WsClientIo.js';
import { WsServerIoIndex } from '@/ios/NodejsPack/WsServerIo.js';
import { SystemEvents, type EnvMode } from '@/types/constants.js';

export async function startSystem(
  ROOT_DIR: string,
  ENV_MODE?: EnvMode,
  FILES_UID?: number,
  FILES_GID?: number,
  EXT_DIRS?: string[],
  JUST_INSTALLED?: boolean,
  middleware?: (system: System) => Promise<void>
) {
  const system = new System(ENV_MODE, ROOT_DIR, EXT_DIRS, JUST_INSTALLED);

  system.use(ConsoleLoggerPkg({ logLevel: LOG_LEVELS.debug as LogLevel }));
  // use packages
  system.use(
    ioSetLocalPkg(
      [
        FilesIoIndex,
        SysInfoIoIndex,
        HttpClientIoIndex,
        HttpServerIoIndex,
        WsClientIoIndex,
        WsServerIoIndex,
      ],
      {
        ENV_MODE,
        FILES_UID,
        FILES_GID,
      }
    )
  );
  system.use(SystemCommonPkg());

  await middleware?.(system);

  // init the system
  await system.init();
  // start services and apps
  await system.start();

  // Enable graceful stop
  system.events.once(SystemEvents.systemStarted, () => {
    process.once('SIGINT', () => system.destroy());
    process.once('SIGTERM', () => system.destroy());
  });
}
