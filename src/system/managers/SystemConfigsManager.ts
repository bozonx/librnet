import { pathJoin, mergeDeepObjects } from 'squidlet-lib';
import type { System } from '../System.js';
import { systemCfgDefaults } from '../../types/SystemCfg.js';
import type { SystemCfg } from '../../types/SystemCfg.js';
import {
  SYSTEM_SUB_DIRS,
  CFG_FILE_EXT,
  SYSTEM_LOCAL_CONFIG_FILE,
  SYSTEM_SYNCED_CONFIG_FILE,
} from '../../types/constants.js';
import type { FilesDriver } from '../../drivers/FilesDriver/FilesDriver.js';

export class SystemConfigsManager {
  systemCfg: SystemCfg = systemCfgDefaults;

  private readonly system: System;

  private get filesDriver(): FilesDriver {
    return this.system.drivers.getDriver('FilesDriver');
  }

  constructor(system: System) {
    this.system = system;
  }

  async init() {
    // Load system config
    let loadedCfg: SystemCfg = systemCfgDefaults;

    if (await this.filesDriver.isExists(SYSTEM_LOCAL_CONFIG_FILE)) {
      const fileContent = await this.filesDriver.readTextFile(
        SYSTEM_LOCAL_CONFIG_FILE
      );

      loadedCfg = JSON.parse(fileContent);
    } else {
      // if not exist then make a new file with default config
      await this.filesDriver.writeFile(
        SYSTEM_LOCAL_CONFIG_FILE,
        JSON.stringify(systemCfgDefaults, null, 2)
      );
    }

    this.systemCfg = {
      ...this.systemCfg,
      ...loadedCfg,
    };
  }

  async loadIoConfig(ioName: string): Promise<Record<string, any> | undefined> {
    const cfgFilePath = pathJoin(
      SYSTEM_CFG_DIR,
      SYSTEM_SUB_DIRS.ios,
      `${ioName}.${CFG_FILE_EXT}`
    );

    return this.loadConfig(cfgFilePath);
  }

  async loadDriverConfig(
    driverName: string
  ): Promise<Record<string, any> | undefined> {
    const cfgFilePath = pathJoin(
      SYSTEM_CFG_DIR,
      SYSTEM_SUB_DIRS.drivers,
      `${driverName}.${CFG_FILE_EXT}`
    );

    return this.loadConfig(cfgFilePath);
  }

  async loadServiceConfig(
    serviceName: string
  ): Promise<Record<string, any> | undefined> {
    const cfgFilePath = pathJoin(
      SYSTEM_CFG_DIR,
      SYSTEM_SUB_DIRS.services,
      `${serviceName}.${CFG_FILE_EXT}`
    );

    return this.loadConfig(cfgFilePath);
  }

  async saveIoConfig(ioName: string, newConfig: Record<string, any>) {
    const cfgFilePath = pathJoin(
      SYSTEM_CFG_DIR,
      SYSTEM_SUB_DIRS.ios,
      `${ioName}.${CFG_FILE_EXT}`
    );

    await this.filesDriver.writeFile(
      cfgFilePath,
      JSON.stringify(newConfig, null, 2)
    );
  }

  async saveDriverConfig(driverName: string, newConfig: Record<string, any>) {
    const cfgFilePath = pathJoin(
      SYSTEM_CFG_DIR,
      SYSTEM_SUB_DIRS.drivers,
      `${driverName}.${CFG_FILE_EXT}`
    );

    await this.filesDriver.writeFile(
      cfgFilePath,
      JSON.stringify(newConfig, null, 2)
    );
  }

  async saveServiceConfig(serviceName: string, newConfig: Record<string, any>) {
    const cfgFilePath = pathJoin(
      SYSTEM_CFG_DIR,
      SYSTEM_SUB_DIRS.services,
      `${serviceName}.${CFG_FILE_EXT}`
    );

    await this.filesDriver.writeFile(
      cfgFilePath,
      JSON.stringify(newConfig, null, 2)
    );
  }

  async removeIoConfig(ioName: string) {
    const cfgFilePath = pathJoin(
      SYSTEM_CFG_DIR,
      SYSTEM_SUB_DIRS.ios,
      `${ioName}.${CFG_FILE_EXT}`
    );

    await this.filesDriver.unlink(cfgFilePath);
  }

  async removeDriverConfig(driverName: string) {
    const cfgFilePath = pathJoin(
      SYSTEM_CFG_DIR,
      SYSTEM_SUB_DIRS.drivers,
      `${driverName}.${CFG_FILE_EXT}`
    );

    await this.filesDriver.unlink(cfgFilePath);
  }

  async removeServiceConfig(serviceName: string) {
    const cfgFilePath = pathJoin(
      SYSTEM_CFG_DIR,
      SYSTEM_SUB_DIRS.services,
      `${serviceName}.${CFG_FILE_EXT}`
    );

    await this.filesDriver.unlink(cfgFilePath);
  }

  async setSystemCfg(partial: Partial<SystemCfg>) {
    // TODO: валидировать
    // TODO: валидировать - пути в versionsCount должны начинаться со слеша

    this.systemCfg = mergeDeepObjects(partial, this.systemCfg);

    await this.filesDriver.writeFile(
      SYSTEM_CONFIG_FILE,
      JSON.stringify(this.systemCfg, null, 2)
    );
  }

  private async loadConfig(cfgFilePath: string) {
    if (await this.filesDriver.isExists(cfgFilePath)) {
      const fileContent = await this.filesDriver.readTextFile(cfgFilePath);

      return JSON.parse(fileContent);
    }
  }
}
