import type {IndexedEventEmitter, Logger} from 'squidlet-lib'
import type {System} from '../System.js'
import type { DriverIndex, ServiceIndex } from '../../types/types.js';
import type { IoSetBase } from '../base/IoSetBase.js';
import type { SystemConfigsManager } from '../managers/SystemConfigsManager.js';

export class PackageContext {
  private readonly system;

  get events(): IndexedEventEmitter {
    return this.system.events;
  }

  get log(): Logger {
    return this.system.log;
  }

  get configs(): SystemConfigsManager {
    return this.system.configs;
  }

  constructor(system: System) {
    this.system = system;
  }

  useIoSet(ioSet: IoSetBase) {
    this.system.io.useIoSet(ioSet);
  }

  useDriver(driverIndex: DriverIndex) {
    this.system.drivers.useDriver(driverIndex);
  }

  useService(serviceIndex: ServiceIndex) {
    this.system.services.useService(serviceIndex);
  }

  useApp(appIndex: AppIndex) {
    this.system.apps.useApp(appIndex);
  }

  // useApi() {
  //   // TODO: add
  // }
  //
  // useUiApp() {
  //   // TODO: add
  // }
  //
  // useDestroyFunc() {
  //   // TODO: add
  // }

  // async loadIoConfig(ioName: string): Promise<Record<string, any> | undefined> {
  //   return this.configs.loadIoConfig(ioName);
  // }

  // async loadDriverConfig(
  //   driverName: string
  // ): Promise<Record<string, any> | undefined> {
  //   return this.configs.loadDriverConfig(driverName);
  // }

  // async loadServiceConfig(
  //   serviceName: string
  // ): Promise<Record<string, any> | undefined> {
  //   return this.configs.loadServiceConfig(serviceName);
  // }
}
