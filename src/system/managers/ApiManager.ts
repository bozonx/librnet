import type { System } from '../System.js';

export type ApiSet = Record<string, (...args: any[]) => any | Promise<any>>;

export class ApiManager {
  private readonly system: System;
  private appUiApiSet: Record<string, ApiSet> = {};
  private appApiSet: Record<string, ApiSet> = {};
  private serviceApiSet: Record<string, ApiSet> = {};
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

  getAppUiApi(appName: string) {
    return this.appUiApiSet[appName];
  }

  getServiceApi(serviceName: string) {
    return this.serviceApiSet[serviceName];
  }

  getAppApi(appName: string) {
    return this.appApiSet[appName];
  }

  getServiceExternalApi(serviceName: string) {
    return this.serviceExternalApiSet[serviceName];
  }

  getAppExternalApi(appName: string) {
    return this.appExternalApiSet[appName];
  }

  registerAppUiApi(appName: string, apiSet: ApiSet) {
    this.appUiApiSet[appName] = { ...this.appUiApiSet[appName], ...apiSet };
  }

  registerAppApi(appName: string, apiSet: ApiSet) {
    this.appApiSet[appName] = {
      ...this.appApiSet[appName],
      ...apiSet,
    };
  }

  registerServiceApi(serviceName: string, apiSet: ApiSet) {
    this.serviceApiSet[serviceName] = {
      ...this.serviceApiSet[serviceName],
      ...apiSet,
    };
  }

  registerAppExternalApi(appName: string, apiSet: ApiSet) {
    this.appExternalApiSet[appName] = {
      ...this.appExternalApiSet[appName],
      ...apiSet,
    };
  }

  registerServiceExternalApi(serviceName: string, apiSet: ApiSet) {
    this.serviceExternalApiSet[serviceName] = {
      ...this.serviceExternalApiSet[serviceName],
      ...apiSet,
    };
  }
}
