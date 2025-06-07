import type {IoContext} from '../system/context/IoContext.js'
import type { IoSetBase } from './IoSetBase.js';

export class IoBase {
  // put name of the IO here it it not the same as class name
  readonly name?: string;
  readonly ioSet: IoSetBase;
  protected ctx!: IoContext;

  constructor(ioSet: IoSetBase) {
    this.ioSet = ioSet;
  }

  // $giveIoContext(ctx: IoContext) {
  //   this.ctx = ctx;
  // }

  init?(cfg?: any): Promise<void>;
  destroy?(): Promise<void>;

  // /**
  //  * Setup props before init.
  //  * It allowed to call it more than once.
  //  */
  // configure?(definition?: any): Promise<void>
}
