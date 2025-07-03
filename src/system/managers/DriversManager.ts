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
    for (const driverName of this.getNames()) {
      const driver = this.drivers[driverName];

      // if (driver.requireIo) {
      //   const found: string[] = this.ctx.io.getNames().filter((el) => {
      //     if (driver.requireIo?.includes(el)) return true;
      //   });

      //   if (found.length !== driver.requireIo.length) {
      //     this.ctx.log.warn(
      //       `Driver "${driverName}" hasn't meet a dependency IO "${driver.requireIo.join(
      //         ', '
      //       )}"`
      //     );
      //     await driver.destroy?.();
      //     // do not register the driver if ot doesn't meet his dependencies
      //     delete this.drivers[driverName];

      //     continue;
      //   }
      // }

      if (driver.init) {
        const localDriverCfg: Record<string, any> | undefined =
          await this.system.configs.loadEntityConfig(driverName, false);

        const syncedDriverCfg: Record<string, any> | undefined =
          await this.system.configs.loadEntityConfig(driverName, true);

        // TODO:  revew
        const driverCfg = {
          ...localDriverCfg,
          ...syncedDriverCfg,
        };

        this.system.log.debug(
          `DriversManager: initializing driver "${driverName}"`
        );
        await driver.init(driverCfg);
      }
    }
  }

  async destroy() {
    for (const driverName of this.getNames()) {
      const driver = this.drivers[driverName];

      if (driver.destroy) {
        this.system.log.debug(
          `DriversManager: destroying driver "${driverName}"`
        );
        await driver.destroy(DRIVER_DESTROY_REASON.shutdown);
      }
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

    if (this.drivers[driverName]) {
      throw new Error(`The same driver "${driverName} is already in use"`);
    }

    this.drivers[driver.name] = driver;
  }
}
