import type { Logger } from 'squidlet-lib';

export class IoContext {
  private readonly pkgCtx: PackageContext;

  get log(): Logger {
    return this.pkgCtx.log;
  }

  constructor(pkgCtx: PackageContext) {
    this.pkgCtx = pkgCtx;
  }
}
