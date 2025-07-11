import type { System } from '../System.js';
import type { DriverIndex } from '../../types/types.js';
import { DRIVER_DESTROY_REASON } from '@/types/constants.js';
import type { DriverFactoryBase } from '../base/DriverFactoryBase.js';

export class DriversManager {
  private readonly system: System;
  private drivers: Record<string, DriverFactoryBase> = {};

  constructor(system: System) {
    this.system = system;
  }

  async init() {
    // TODO: use Promise.allSettled([
    // TODO: add timeout for each item
    for (const driverName of this.getNames()) {
      const driver = this.drivers[driverName];
      const foundRequiredIoNames: string[] = this.system.io
        .getNames()
        .filter((el) => driver.requireIo.includes(el));
      // skip driver if it doesn't meet his dependencies
      if (foundRequiredIoNames.length !== driver.requireIo.length) continue;

      this.system.log.debug(
        `DriversManager: initializing driver "${driverName}"`
      );

      await driver.init(
        this.system.configs.loadEntityConfig(driverName, false),
        await this.system.configs.loadEntityConfig(driverName, true)
      );
    }
  }

  async destroy() {
    // TODO: use Promise.allSettled([
    // TODO: add timeout for each item
    for (const driverName of this.getNames()) {
      const driver = this.drivers[driverName];

      this.system.log.debug(
        `DriversManager: destroying driver "${driverName}"`
      );
      await driver.destroy(DRIVER_DESTROY_REASON.shutdown);
    }
  }

  getDriver<T extends DriverFactoryBase>(driverName: string): T {
    return this.drivers[driverName] as T;
  }

  getNames(): string[] {
    return Object.keys(this.drivers);
  }

  // Register Driver
  useDriver(driverName: string, driverIndex: DriverIndex) {
    const driver = driverIndex(driverName, this.system);

    // TODO: здесь нужно проерять requireIo. но нужно гарантировать
    //    что все IO уже добавлены

    if (this.drivers[driverName]) {
      throw new Error(`The same driver "${driverName} is already in use"`);
    }

    this.drivers[driver.name] = driver;
  }
}
