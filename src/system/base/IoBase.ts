import type { IoContext } from '../../../_old/IoContext.js';
import type { IoSetBase } from '../../../_old/IoSetBase.js';

export abstract class IoBase {
  // put name of the IO here it it not the same as class name
  // abstract readonly name: string;
  protected ctx!: IoContext;
  protected ioSet!: IoSetBase;

  constructor(ioSet: IoSetBase, ctx: IoContext) {
    this.ctx = ctx;
    this.ioSet = ioSet;
  }

  init?(cfg?: Record<string, any>): Promise<void>;
  destroy?(): Promise<void>;

  // /**
  //  * Setup props before init.
  //  * It allowed to call it more than once.
  //  */
  // configure?(definition?: any): Promise<void>
}
