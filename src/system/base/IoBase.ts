import type { IoContext } from '../../types/types.js';

export abstract class IoBase {
  // put name of the IO here it it not the same as class name
  // abstract readonly name: string;
  protected ctx!: IoContext;

  constructor(ctx: IoContext) {
    this.ctx = ctx;
  }

  init?(): Promise<void>;
  destroy?(): Promise<void>;

  on?(cb: (...args: any[]) => void): Promise<number>;
  off?(handlerIndex: number): Promise<void>;

  // /**
  //  * Setup props before init.
  //  * It allowed to call it more than once.
  //  */
  // configure?(definition?: any): Promise<void>
}
