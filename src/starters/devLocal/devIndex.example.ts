import { ConsoleLogger, LogLevels } from 'squidlet-lib';
import { startSystemDev } from './startSystemDev';
import { EnvModes } from '../../types/types.js';
import { IoSetServer } from '../../ioSets/IoSetServer.js';
import { FilesIoIndex } from '../../ios/NodejsPack/LocalFilesIo.js';
import { IoNames } from '../../types/EntitiesNames.js';
import { HttpClientIoIndex } from '../../ios/NodejsPack/HttpClientIo.js';
import { HttpServerIoIndex } from '../../ios/NodejsPack/HttpServerIo.js';
import { WsClientIoIndex } from '../../ios/NodejsPack/WsClientIo.js';
import { WsServerIoIndex } from '../../ios/NodejsPack/WsServerIo.js';
import { IoSetClient } from '@/ioSets/IoSetClient';

(async () => {
  const logger = new ConsoleLogger(LogLevels.debug);
  const localIoSetServer = new IoSetServer(
    (msg: string) => localIoSetClient.incomeMessage(msg),
    20,
    20,
    logger
  );
  const localIoSetClient = new IoSetClient(
    (msg: string) => localIoSetServer.incomeMessage(msg),
    20
  );

  localIoSetServer.use(IoNames.LocalFilesIo, FilesIoIndex);
  localIoSetServer.use(IoNames.HttpClientIo, HttpClientIoIndex);
  localIoSetServer.use(IoNames.HttpServerIo, HttpServerIoIndex);
  localIoSetServer.use(IoNames.WsClientIo, WsClientIoIndex);
  localIoSetServer.use(IoNames.WsServerIo, WsServerIoIndex);

  await localIoSetServer.init();
  await startSystemDev(
    {
      ROOT_DIR: process.env.ROOT_DIR as string,
      ENV_MODE: EnvModes.development,
      DEFAULT_LOG_LEVEL: LogLevels.debug,
    },
    [localIoSetClient],
    [
      // TODO: add packages
    ],
    logger
  );
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
