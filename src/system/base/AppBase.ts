export const NOT_ALLOWED_APP_PROPS = [
  'myName',
  'requireDriver',
  'constructor',
  '$setCtx',
  'init',
  'destroy',
  'getApi',
];

import type { AppContext } from '../context/AppContext.js';

export abstract class AppBase {
  abstract myName: string;
  readonly requireDriver?: string[];
  ctx!: AppContext;
  private uiApi: Record<string, any> = {};
  private systemApi: Record<string, any> = {};
  private sharedApi: Record<string, any> = {};

  constructor() {}

  $setCtx(ctx: AppContext) {
    this.ctx = ctx;
  }

  /**
   * This method is called after app is installed or updated.
   */
  afterInstall?(isUpdate: boolean): Promise<void>;

  start?(cfg?: Record<string, any>): Promise<void>;
  stop?(): Promise<void>;

  getUiApi(): Record<string, any> {
    return this.uiApi;
  }

  getSystemApi(): Record<string, any> {
    return this.systemApi;
  }

  getSharedApi(): Record<string, any> {
    return this.sharedApi;
  }

  /**
   * Api which is accessible on the UI
   */
  registerUiApi(partialApi: Record<string, any>): void {
    this.uiApi = { ...this.uiApi, ...partialApi };
  }

  /**
   * Api which is accessible on the local machine and private user's network
   */
  registerSystemApi(partialApi: Record<string, any>): void {
    this.systemApi = { ...this.systemApi, ...partialApi };
  }

  /**
   * Api which is accessible on the internet
   */
  registerSharedApi(partialApi: Record<string, any>): void {
    this.sharedApi = { ...this.sharedApi, ...partialApi };
  }
}
