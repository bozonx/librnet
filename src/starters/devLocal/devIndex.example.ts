import { ConsoleLogger, LogLevels } from 'squidlet-lib';
import { startSystemDev } from './startSystemDev';
import { EnvModes } from '../../types/types.js';

(async () => {
  const localIoSet = new IoSetBase(this.system, {
    ENV_MODE: EnvModes.development,
    FILES_UID: 100,
    FILES_GID: 100,
  });

  await startSystemDev(
    {
      ROOT_DIR: process.env.ROOT_DIR as string,
      ENV_MODE: EnvModes.development,
      DEFAULT_LOG_LEVEL: LogLevels.debug,
    },
    [localIoSet],
    [],
    new ConsoleLogger(LogLevels.debug)
  );
})().catch((e) => {
  console.error(e);
  process.exit(2);
});

// system.use(ConsoleLoggerPkg({ logLevel: LOG_LEVELS.debug as LogLevel }));
// use packages
// system.use(
//   ioSetLocalPkg(
//     [
//       FilesIoIndex,
//       // SysInfoIoIndex,
//       HttpClientIoIndex,
//       HttpServerIoIndex,
//       WsClientIoIndex,
//       WsServerIoIndex,
//     ],
//     {
//       ENV_MODE,
//       FILES_UID,
//       FILES_GID,
//     }
//   )
// );
// system.use(SystemCommonPkg());
