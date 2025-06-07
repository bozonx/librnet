import type { IoBase } from './IoBase.js';
import type { PackageContext } from '../context/PackageContext.js';
import type { IoIndex, SystemEnv } from '../../types/types.js';
import { IoContext } from '../context/IoContext.js';

export class IoSetBase {
  readonly name: string;
  readonly env: SystemEnv;
  private readonly ioCollection: { [index: string]: IoBase } = {};
  private readonly pkgCtx: PackageContext;
  private wasInited: boolean = false;

  constructor(name: string, pkgCtx: PackageContext, env: SystemEnv) {
    this.name = name;
    this.pkgCtx = pkgCtx;
    this.env = env;
  }

  /**
   * It is used to connect to the remote ioSet
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
    // destroy of ios
    const ioNames: string[] = this.getNames();

    for (let ioName of ioNames) {
      await this.destroyIo(ioName);
    }
  }

  /**
   * Register a new IO item.
   * It only registers it and not init.
   * To init use initIo()
   */
  registerIo(ioItemIndex: IoIndex) {
    const ioCtx = new IoContext(this.pkgCtx);
    const io = ioItemIndex(ioCtx);
    const ioName: string = io.name || io.constructor.name;

    this.pkgCtx.log.info(`${this.name}: registering IO "${ioName}"`);

    if (this.ioCollection[ioName]) {
      throw new Error(`The same IO "${ioName}" is already in use`);
    }

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

  /**
   * Destroy an IO item.
   */
  private async destroyIo(ioName: string) {
    // TODO: таймаут ожидания
    const ioItem = this.ioCollection[ioName];
    if (ioItem.destroy) {
      this.pkgCtx.log.info(`${this.name}: destroying IO "${ioName}"`);
      await ioItem.destroy();
    }

    delete this.ioCollection[ioName];
  }
}

// /**
//  * Init Io
//  * Call it if you register an Io after system initialization
//  * @param ioName
//  */
// async initIo(ioName: string) {
//   const ioItem = this.ioCollection[ioName];

//   if (!ioItem.init) return;

//   this.pkgCtx.log.info(`${this.name}: initializing IO "${ioName}"`);

//   const ioCfg: Record<string, any> | undefined =
//     await this.pkgCtx.loadIoConfig(ioName);

//   // TODO: таймаут ожидания

//   await ioItem.init(ioCfg);
// }
