import type { System } from '../System.js';

export type ApiSet = Record<string, (...args: any[]) => any | Promise<any>>;

export class ApiManager {
  private readonly system: System;
  private uiApiSet: Record<string, ApiSet> = {};
  private appIntranetApiSet: Record<string, ApiSet> = {};
  private serviceIntranetApiSet: Record<string, ApiSet> = {};
  private appExternalApiSet: Record<string, ApiSet> = {};
  private serviceExternalApiSet: Record<string, ApiSet> = {};

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

  registerAppIntranetApi(appName: string, apiSet: ApiSet) {
    this.appIntranetApiSet[appName] = apiSet;
  }

  registerServiceIntranetApi(serviceName: string, apiSet: ApiSet) {
    this.serviceIntranetApiSet[serviceName] = apiSet;
  }

  registerAppExternalApi(appName: string, apiSet: ApiSet) {
    this.appExternalApiSet[appName] = apiSet;
  }

  registerServiceExternalApi(serviceName: string, apiSet: ApiSet) {
    this.serviceExternalApiSet[serviceName] = apiSet;
  }
}
