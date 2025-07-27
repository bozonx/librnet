import type { System } from '../System.js';
import { DriverDestroyReasons, type DriverIndex } from '../../types/types.js';
import type { DriverFactoryBase } from '../base/DriverFactoryBase.js';
import type { DriverManifest } from '../../types/Manifests.js';
import { allSettledWithTimeout } from '../helpers/helpers.js';

export class DriversManager {
  private readonly system: System;
  private drivers: Record<string, [DriverFactoryBase, DriverManifest]> = {};

  constructor(system: System) {
    this.system = system;
  }

  async init() {
    await allSettledWithTimeout(
      this.getNames().map(async (driverName) => {
        this.system.log.debug(
          `DriversManager: initializing driver "${driverName}"`
        );

        await this.drivers[driverName][0].init(
          await this.system.configs.loadEntityConfig(driverName, false),
          await this.system.configs.loadEntityConfig(driverName, true)
        );
      }),
      this.system.configs.systemCfg.local.ENTITY_DESTROY_TIMEOUT_SEC * 1000,
      'Destroying of IoSets failed'
    );
  }

  async destroy() {
    await allSettledWithTimeout(
      this.getNames().map(async (driverName) => {
        this.system.log.debug(
          `DriversManager: destroying driver "${driverName}"`
        );

        await this.drivers[driverName][0].destroy(
          DriverDestroyReasons.shutdown
        );

        delete this.drivers[driverName];
      }),
      this.system.configs.systemCfg.local.ENTITY_DESTROY_TIMEOUT_SEC * 1000,
      'Destroying of Drivers failed'
    );
  }

  getDriver<T extends DriverFactoryBase>(driverName: string): T {
    return this.drivers[driverName][0] as T;
  }

  getManifest(driverName: string): DriverManifest {
    return this.drivers[driverName][1];
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

    const foundRequiredIoNames: string[] = this.system.ios
      .getNames()
      .filter((el) => driver.requireIo.includes(el));
    // skip driver if it doesn't meet his dependencies
    if (foundRequiredIoNames.length !== driver.requireIo.length)
      throw new Error(
        `Driver "${driverName}" doesn't meet his IO dependencies. His required IOs: "${driver.requireIo.join(
          ', '
        )}", but all available IOs: "${this.system.ios.getNames().join(', ')}"`
      );

    // TODO: здесь нужно проерять requireIo. но нужно гарантировать
    //    что все IO уже добавлены

    if (this.drivers[manifest.name]) {
      throw new Error(`The same driver "${manifest.name}" is already in use"`);
    }

    this.drivers[driver.name] = driver;
  }
}
