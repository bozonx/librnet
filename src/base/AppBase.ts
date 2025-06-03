
export const NOT_ALLOWED_APP_PROPS = [
  'myName',
  'requireDriver',
  'constructor',
  '$setCtx',
  'init',
  'destroy',
  'getApi',
]

import type { AppContext } from '../system/context/AppContext.js';

export abstract class AppBase {
  abstract myName: string;
  readonly requireDriver?: string[];
  ctx!: AppContext;

  constructor() {}

  $setCtx(ctx: AppContext) {
    this.ctx = ctx;
  }

  /**
   * This method is called after app is installed or updated.
   */
  abstract afterInstall(isUpdate: boolean): Promise<void>;

  start?(cfg?: Record<string, any>): Promise<void>;
  stop?(): Promise<void>;

  // /**
  //  * Public local api of app.
  //  * Put here only api which is accessible on local machine.
  //  * For api which is accessible on network use PublicApiService
  //  */
  // getApi?(): any;
}
