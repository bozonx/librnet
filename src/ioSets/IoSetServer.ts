import type { IoBase } from '../system/base/IoBase.js';
import type { IoManifest } from '../types/Manifests.js';
import { ConsoleLogger, IndexedEvents, type Logger } from 'squidlet-lib';
import type { IoIndex } from '../types/types.js';
import {
  GET_IO_NAMES_METHOD_NAME,
  IO_SET_SERVER_NAME,
} from '../types/constants.js';

export class IoSetServer {
  private readonly ios: { [index: string]: IoBase } = {};
  private wasInited: boolean = false;
  private readonly logger: Logger;

  // private readonly events = new IndexedEvents();

  constructor(readonly send: (msg: string) => void, logger?: Logger) {
    if (logger) {
      this.logger = logger;
    } else {
      this.logger = new ConsoleLogger();
    }
  }

  async init() {
    if (this.wasInited) {
      throw new Error(
        `IoSetServer: It isn't allowed to init IoSet more than once`
      );
    }

    this.wasInited = true;

    // TODO: use Promise.allSettled([
    // TODO: init all the IOs
    // for (const io of Object.values(this.ios)) {
    //   if (io.name === IO_NAMES.LocalFilesIo) continue;

    //   await this.initIo(io.name);
    // }
  }

  async destroy() {
    // Ios were destroyed before in IoManager.
    // And now just remove them
    // TODO: use Promise.allSettled([
    // TODO: add timeout for each item
    for (let ioName of this.getNames()) delete this.ioCollection[ioName];
    // for (const ioName of Object.keys(this.ios)) {
    //   await this.destroyIo(ioName);
    //   delete this.ios[ioName];
    // }
    this.events.destroy();
  }

  incomeMessage(msg: string) {
    if (ioName === IO_SET_SERVER_NAME) {
      if (methodName === GET_IO_NAMES_METHOD_NAME) {
        return Promise.resolve(Object.keys(this.ios));
      }

      throw new Error(
        `IoSetServer: Can't find method "${methodName}" in "${IO_SET_SERVER_NAME}"`
      );
    }

    if (!this.ios[ioName]) {
      throw new Error(`Can't find io instance "${ioName}"`);
    } else if (!(this.ios[ioName] as any)[methodName]) {
      throw new Error(
        `IoSetServer: Can't find method "${methodName}" in io instance "${ioName}"`
      );
    } else if (methodName === 'init' || methodName === 'destroy') {
      throw new Error(
        `IoSetServer: Can't call method "${ioName}.${methodName}"`
      );
    }

    return (this.ios[ioName] as any)[methodName](...args);
  }

  use(manifest: IoManifest, index: IoIndex) {
    if (this.ios[manifest.name]) {
      throw new Error(
        `IoSetServer: The same IO "${manifest.name}" is already in use`
      );
    }

    this.logger.info(`IoSetServer: registering IO "${manifest.name}"`);

    const ctx = { log: this.logger };
    const io = index(ctx);

    this.ios[manifest.name] = io;
  }

  // on(cb: (ioName: string, ...args: any[]) => void): number {
  //   return this.events.addListener(cb);
  // }

  // off(handlerIndex: number) {
  //   this.events.removeListener(handlerIndex);
  // }
}
