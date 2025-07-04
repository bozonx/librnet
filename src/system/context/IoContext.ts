import type { Logger } from 'squidlet-lib';
import type { PackageContext } from './PackageContext.js';

export class IoContext {
  private readonly pkgCtx: PackageContext;

  get log(): Logger {
    return this.pkgCtx.log;
  }

  constructor(pkgCtx: PackageContext) {
    this.pkgCtx = pkgCtx;
  }
}
