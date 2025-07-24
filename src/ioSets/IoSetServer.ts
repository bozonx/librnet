import type { IoBase } from '../system/base/IoBase.js';
import type { IoManifest } from '../types/Manifests.js';
import { IndexedEvents, type Logger } from 'squidlet-lib';
import type { IoIndex } from '../types/types.js';
import { IO_SET_SERVER_NAME } from '../types/constants.js';

export class IoSetServer {
  private readonly ios: { [index: string]: IoBase } = {};
  private wasInited: boolean = false;
  private readonly events = new IndexedEvents();

  constructor(private readonly logger?: Logger) {}

  async init() {
    if (this.wasInited) {
      throw new Error(`It isn't allowed to init IoSet more than once`);
    }

    this.wasInited = true;

    // TODO: init all the IOs
  }

  async destroy() {
    // Ios were destroyed before in IoManager.
    // And now just remove them
    for (let ioName of this.getNames()) delete this.ioCollection[ioName];
  }

  use(manifest: IoManifest, index: IoIndex) {
    // TODO: use default console logger
    const ctx = { log: this.logger };
    this.ios[manifest.name] = io;

    this.pkgCtx.log.info(`${this.type}: registering IO "${ioName}"`);

    if (this.ioCollection[ioName]) {
      throw new Error(`The same IO "${ioName}" is already in use`);
    }
    // only register it not init (it will be inited in IoManager)
    this.ioCollection[ioName] = io;
  }

  // TODO: add requestId

  on(cb: (ioName: string, ...args: any[]) => void): number {
    return this.events.addListener(cb);
  }

  off(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }

  callMethod(
    ioName: string | typeof IO_SET_SERVER_NAME,
    methodName: string,
    ...args: any[]
  ): Promise<any> {
    if (ioName === IO_SET_SERVER_NAME) {
      if (methodName === 'getIoNames') {
        return Promise.resolve(Object.keys(this.ios));
      }

      throw new Error(
        `Can't find method "${methodName}" in "${IO_SET_SERVER_NAME}"`
      );
    }

    if (!this.ios[ioName]) {
      throw new Error(`Can't find io instance "${ioName}"`);
    } else if (!(this.ios[ioName] as any)[methodName]) {
      throw new Error(
        `Can't find method "${methodName}" in io instance "${ioName}"`
      );
    }

    return (this.ios[ioName] as any)[methodName](...args);
  }
}
