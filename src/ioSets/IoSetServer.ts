import type { IoBase } from '../system/base/IoBase.js';
import { ConsoleLogger, LogLevels, type Logger } from 'squidlet-lib';
import type { IoIndex } from '../types/types.js';
import {
  GET_IO_NAMES_METHOD_NAME,
  IO_SET_SERVER_NAME,
} from '../types/constants.js';
import { allSettledWithTimeout } from '../system/helpers/helpers.js';

export class IoSetServer {
  private readonly ios: { [index: string]: IoBase } = {};
  private wasInited: boolean = false;
  private readonly logger: Logger;
  private send: (msg: string) => void = () => {};

  constructor(
    readonly entityInitTimeoutSec: number,
    readonly entityDestroyTimeoutSec: number,
    logger?: Logger
  ) {
    if (logger) {
      this.logger = logger;
    } else {
      this.logger = new ConsoleLogger(LogLevels.error);
    }
  }

  async init(send: (msg: string) => void) {
    if (this.wasInited) {
      throw new Error(
        `IoSetServer: It isn't allowed to init IoSet more than once`
      );
    }

    this.wasInited = true;

    this.send = send;

    await allSettledWithTimeout(
      Object.values(this.ios)
        .filter((io) => io.init)
        .map((io) => io.init!()),
      this.entityInitTimeoutSec * 1000,
      'Initialization of Ios failed'
    );
  }

  async destroy() {
    await allSettledWithTimeout(
      Object.values(this.ios)
        .filter((io) => io.destroy)
        .map((io) => io.destroy!()),
      this.entityDestroyTimeoutSec * 1000,
      'Destroying of Ios failed'
    );
  }

  use(ioName: string, index: IoIndex) {
    if (this.ios[ioName]) {
      throw new Error(`IoSetServer: The same IO "${ioName}" is already in use`);
    }

    this.logger.info(`IoSetServer: registering IO "${ioName}"`);

    const ctx = { log: this.logger };
    const io = index(ctx);

    this.ios[ioName] = io;
  }

  incomeMessage(msg: string) {
    const [requestId, ioName, methodName, ...args] = JSON.parse(msg);

    if (!requestId) {
      return this.logger.error(
        `IoSetServer: Invalid message, it doesn't have requestId: ${msg}`
      );
    }

    if (ioName === IO_SET_SERVER_NAME) {
      if (methodName === GET_IO_NAMES_METHOD_NAME) {
        return this.send(
          JSON.stringify([requestId, ioName, methodName, Object.keys(this.ios)])
        );
      }

      return this.logger.error(
        `IoSetServer: Can't find method "${methodName}" in "${IO_SET_SERVER_NAME}"`
      );
    }

    if (!this.ios[ioName]) {
      return this.logger.error(
        `IoSetServer: Can't find io instance "${ioName}"`
      );
    } else if (!(this.ios[ioName] as any)[methodName]) {
      return this.logger.error(
        `IoSetServer: Can't find method "${methodName}" in io instance "${ioName}"`
      );
    } else if (methodName === 'init' || methodName === 'destroy') {
      return this.logger.error(
        `IoSetServer: Can't call method "${ioName}.${methodName}"`
      );
    }

    let result: any;

    try {
      result = (this.ios[ioName] as any)[methodName](...args);
    } catch (error) {
      // TODO: нужно возвращать ошибку в клиент
      return this.logger.error(
        `IoSetServer: Error in method "${ioName}.${methodName}": ${error}`
      );
    }

    this.send(JSON.stringify([requestId, ioName, methodName, result]));
  }
}
