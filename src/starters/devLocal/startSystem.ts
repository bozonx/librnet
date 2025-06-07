import { System } from '@/system/System.js';
import { LOG_LEVELS } from 'squidlet-lib';
import type { LogLevel } from 'squidlet-lib';
import { ConsoleLoggerPkg } from '@/packages/ConsoleLoggerPkg/index.js';
import { SystemCommonPkg } from '@/packages/SystemCommonPkg/index.js';
import { SystemWithUiPkg } from '@/packages/SystemWithUiPkg/index.js';
import { ioSetLocalPkg } from '@/IoSets/IoSetLocal.js';
import { FilesIoIndex } from '@/ios/NodejsLinuxPack/FilesIo.js';
import { SysInfoIoIndex } from '@/ios/NodejsLinuxPack/SysInfoIo.js';
import { HttpClientIoIndex } from '@/ios/NodejsPack/HttpClientIo.js';
import { HttpServerIoIndex } from '@/ios/NodejsPack/HttpServerIo.js';
import { WsClientIoIndex } from '@/ios/NodejsPack/WsClientIo.js';
import { WsServerIoIndex } from '@/ios/NodejsPack/WsServerIo.js';
import { SystemExtraPkg } from '@/packages/SystemExtraPkg/index.js';
import { SystemEvents, type EnvMode } from '@/types/constants.js';

export async function startSystem(
  ROOT_DIR: string,
  ENV_MODE?: EnvMode,
  FILES_UID?: string,
  FILES_GID?: string,
  EXT_DIRS?: string,
  justInstalled?: boolean,
  middleware?: (system: System) => Promise<void>
) {
  const system = new System(ENV_MODE, justInstalled);
  
  system.use(ConsoleLoggerPkg({ logLevel: LOG_LEVELS.debug as LogLevel }));
  // use packages
  system.use(
    ioSetLocalPkg(
      [
        FilesIoIndex,
        SysInfoIoIndex,
        HttpClientIoIndex,
        HttpServerIoIndex,
        // WsClientIoIndex,
        // WsServerIoIndex,
      ],
      {
        ROOT_DIR,
        FILES_UID,
        FILES_GID,
        EXT_DIRS,
      }
    )
  );
  system.use(SystemCommonPkg());
  // system.use(SystemExtraPkg());
  // system.use(SystemWithUiPkg());

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
