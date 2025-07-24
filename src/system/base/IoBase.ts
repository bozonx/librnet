export abstract class IoBase {
  // put name of the IO here it it not the same as class name
  // abstract readonly name: string;
  protected ctx!: IoContext;

  constructor(ctx: IoContext) {
    this.ctx = ctx;
  }

  init?(): Promise<void>;
  destroy?(): Promise<void>;

  // /**
  //  * Setup props before init.
  //  * It allowed to call it more than once.
  //  */
  // configure?(definition?: any): Promise<void>
}
