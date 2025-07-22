import { type LogLevels } from 'squidlet-lib';
import { System } from '../../system/System.js';
import { SystemCommonPkg } from '../../packages/SystemCommonPkg/index.js';
import { ioSetLocalPkg } from '../../packages/IoSetLocalPkg/index.js';
import { FilesIoIndex } from '../../ios/NodejsPack/LocalFilesIo.js';
import { HttpClientIoIndex } from '../../ios/NodejsPack/HttpClientIo.js';
import { HttpServerIoIndex } from '../../ios/NodejsPack/HttpServerIo.js';
import { WsClientIoIndex } from '../../ios/NodejsPack/WsClientIo.js';
import { WsServerIoIndex } from '../../ios/NodejsPack/WsServerIo.js';
import { EnvModes, SystemEvents } from '../../types/types.js';

// const EXT_DIRS = process.env.EXT_DIRS as unknown as string[];
// const JUST_INSTALLED =
//   typeof process.env.JUST_INSTALLED === 'string'
//     ? process.env.JUST_INSTALLED === 'true'
//     : false;

// TODO: make dirs

export function ConsoleLoggerPkg(options: {
  logLevel: LogLevel;
}): PackageIndex {
  const consoleLogger = new ConsoleLogger(options.logLevel);

  return (ctx: PackageContext) => {
    // add console logger
    ctx.events.addListener(SystemEvents.logger, handleLogEvent(consoleLogger));
  };
}

export async function startSystem(
  ROOT_DIR: string,
  FILES_UID: number = 100,
  FILES_GID: number = 100,
  ENV_MODE: EnvModes = EnvModes.development,
  beforeInit?: (system: System) => Promise<void>
) {
  const system = new System({
    ROOT_DIR,
    FILES_UID,
    FILES_GID,
    ENV_MODE,
  });

  system.events.addListener(SystemEvents.logger, (...p) => {
    console.log(...p);
  });

  // system.use(ConsoleLoggerPkg({ logLevel: LOG_LEVELS.debug as LogLevel }));
  // use packages
  system.use(
    ioSetLocalPkg(
      [
        FilesIoIndex,
        // SysInfoIoIndex,
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
