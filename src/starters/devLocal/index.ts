import type { EnvMode, SystemEvents } from '@/types/constants.js';
import { LOG_LEVELS } from 'squidlet-lib';
import type { LogLevel } from 'squidlet-lib';
import { System } from '../../index.js';
import { ConsoleLoggerPkg } from '../../packages/ConsoleLoggerPkg/index.js';
import { SystemCommonPkg } from '../../packages/SystemCommonPkg/index.js';
import { SystemWithUiPkg } from '../../packages/SystemWithUiPkg/index.js';
import { ioSetLocalPkg } from '../../IoSets/IoSetLocal.js';
import { FilesIoIndex } from '../../ios/NodejsLinuxPack/FilesIo.js';
import { SysInfoIoIndex } from '../../ios/NodejsLinuxPack/SysInfoIo.js';
import { HttpClientIoIndex } from '../../ios/NodejsPack/HttpClientIo.js';
import { HttpServerIoIndex } from '../../ios/NodejsPack/HttpServerIo.js';
import { WsClientIoIndex } from '../../ios/NodejsPack/WsClientIo.js';
import { WsServerIoIndex } from '../../ios/NodejsPack/WsServerIo.js';
import { SystemExtraPkg } from '../../packages/SystemExtraPkg/index.js';

const ENV_MODE = process.env.ENV_MODE as unknown as EnvMode;
const ROOT_DIR = process.env.ROOT_DIR as string;
const FILES_UID = process.env.FILES_UID as string;
const FILES_GID = process.env.FILES_GID as string;
const EXT_DIRS = process.env.EXT_DIRS as string;

const system = new System(ENV_MODE);

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
      ROOT_DIR,
      FILES_UID,
      FILES_GID,
      EXT_DIRS,
    }
  )
);
system.use(ConsoleLoggerPkg({ logLevel: LOG_LEVELS.debug as LogLevel }));
system.use(SystemCommonPkg());
system.use(SystemExtraPkg());
system.use(SystemWithUiPkg());

middleware?.(system);

// init the system
system.init();
// start the system
system.events.once(SystemEvents.systemInited, () => system.start());
system.events.once(SystemEvents.systemStarted, () => {
  // Enable graceful stop
  process.once('SIGINT', () => system.destroy());
  process.once('SIGTERM', () => system.destroy());
});
