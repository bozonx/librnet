import type { System } from '../System.js';

export type ApiSet = Record<string, (...args: any[]) => any | Promise<any>>;

export class ApiManager {
  private readonly system: System;
  private uiApiSet: Record<string, ApiSet> = {};
  private appNetworkApiSet: Record<string, ApiSet> = {};
  private serviceNetworkApiSet: Record<string, ApiSet> = {};
  private appExposedApiSet: Record<string, ApiSet> = {};
  private serviceExposedApiSet: Record<string, ApiSet> = {};

  constructor(system: System) {
    this.system = system;
  }

  async init() {
    //
  }

  async destroy() {
    //
  }

  registerUiApi(appName: string, apiSet: ApiSet) {
    this.uiApiSet[appName] = apiSet;
  }

  registerAppNetworkApi(appName: string, apiSet: ApiSet) {
    this.appNetworkApiSet[appName] = apiSet;
  }

  registerServiceNetworkApi(serviceName: string, apiSet: ApiSet) {
    this.serviceNetworkApiSet[serviceName] = apiSet;
  }

  registerAppExposedApi(appName: string, apiSet: ApiSet) {
    this.appExposedApiSet[appName] = apiSet;
  }

  registerServiceExposedApi(serviceName: string, apiSet: ApiSet) {
    this.serviceExposedApiSet[serviceName] = apiSet;
  }
}
