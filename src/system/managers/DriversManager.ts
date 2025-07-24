import type { System } from '../System.js';
import { DriverDestroyReasons, type DriverIndex } from '../../types/types.js';
import type { DriverFactoryBase } from '../base/DriverFactoryBase.js';
import type { DriverManifest } from '../../types/Manifests.js';

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
      await driver.destroy(DriverDestroyReasons.shutdown);
    }
  }

  getDriver<T extends DriverFactoryBase>(driverName: string): T {
    return this.drivers[driverName] as T;
  }

  getNames(): string[] {
    return Object.keys(this.drivers);
  }

  // Register Driver
  use(manifest: DriverManifest, driverIndex: DriverIndex) {
    if (!this.system.isDevMode)
      throw new Error(
        `You try to register a driver "${manifest.name}" not in development mode`
      );

    const driver = driverIndex(manifest, this.system);

    // TODO: здесь нужно проерять requireIo. но нужно гарантировать
    //    что все IO уже добавлены

    if (this.drivers[manifest.name]) {
      throw new Error(`The same driver "${manifest.name}" is already in use"`);
    }

    this.drivers[driver.name] = driver;
  }
}
