import type {Logger} from 'squidlet-lib'
import type {System} from '../System.js'
import type { PackageContext } from './PackageContext.js';

export class IoContext {
  private readonly pkgCtx: PackageContext;

  get log(): Logger {
    return this.pkgCtx.log;
  }

  constructor(pkgCtx: PackageContext) {
    this.pkgCtx = pkgCtx;
  }

  async loadIoConfig(ioName: string): Promise<Record<string, any> | undefined> {
    return this.pkgCtx.loadIoConfig(ioName);
  }
}
