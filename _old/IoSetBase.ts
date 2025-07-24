import type { IoBase } from '../src/system/base/IoBase.js';
import type { PackageContext } from '../context/PackageContext.js';
import type { IoIndex, IoSetEnv } from '../src/types/types.js';
import { IoContext } from './IoContext.js';

export abstract class IoSetBase {
  abstract readonly type: string;
  readonly env: IoSetEnv;
  private readonly ioCollection: { [index: string]: IoBase } = {};
  private readonly pkgCtx: PackageContext;
  private wasInited: boolean = false;

  constructor(pkgCtx: PackageContext, env: IoSetEnv) {
    this.pkgCtx = pkgCtx;
    this.env = env;
  }

  /**
   * Use it to connect to the remote ioSet
   * It is called only once.
   */
  async init() {
    if (this.wasInited) {
      throw new Error(`It isn't allowed to init IoSet more than once`);
    }

    this.wasInited = true;
  }

  /**
   * Use it to close connection of the remote ioSet
   */
  async destroy() {
    // Ios were destroyed before in IoManager.
    // And now just remove them
    for (let ioName of this.getNames()) delete this.ioCollection[ioName];
  }

  /**
   * Register a new IO item.
   * It only registers it and not init.
   * To init use initIo()
   */
  registerIo(ioItemIndex: IoIndex) {
    const ioCtx = new IoContext(this.pkgCtx);
    const io = ioItemIndex(this, ioCtx);
    const ioName: string = io.name;

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
