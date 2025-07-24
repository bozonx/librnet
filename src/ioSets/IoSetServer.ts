import type { IoBase } from '../system/base/IoBase.js';
import type { IoManifest } from '../types/Manifests.js';
import type { Logger } from 'squidlet-lib';
import type { IoIndex } from '../types/types.js';

export class IoSetServer {
  private readonly ios: { [index: string]: IoBase } = {};
  private wasInited: boolean = false;

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

  /**
   * It returns the instance of IO which was created on initialization
   * @param ioName
   */
  getIo<T extends IoBase>(ioName: string): T {
    if (!this.ioCollection[ioName]) {
      throw new Error(`Can't find io instance "${ioName}"`);
    }

    return this.ioCollection[ioName] as T;
  }

  /**
   * Get all the names of platforms items
   */
  getNames(): string[] {
    return Object.keys(this.ioCollection);
  }
}
