import { pathJoin, mergeDeepObjects } from 'squidlet-lib';
import type { System } from '../System.js';
import { type SystemCfg } from '../../types/SystemCfg.js';
import {
  SYSTEM_SUB_DIRS,
  CFG_FILE_EXT,
  IO_NAMES,
  ROOT_DIRS,
} from '../../types/constants.js';
import type { FilesIo } from '@/ios/NodejsLinuxPack/FilesIo.js';

export class SystemConfigsManager {
  systemCfg!: SystemCfg;

  private readonly system: System;

  private get filesIo(): FilesIo {
    return this.system.io.getIo(IO_NAMES.FilesIo);
  }

  constructor(system: System) {
    this.system = system;
  }

  async init() {
    return this.loadEntityConfig('system');
  }

  async loadIoConfig(ioName: string): Promise<Record<string, any>> {
    return this.loadEntityConfig(ioName);
  }

  async loadDriverConfig(driverName: string): Promise<Record<string, any>> {
    return this.loadEntityConfig(driverName);
  }

  async loadServiceConfig(serviceName: string): Promise<Record<string, any>> {
    return this.loadEntityConfig(serviceName);
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

  private async isFileExists(pathTo: string): Promise<boolean> {
    return Boolean(await this.filesIo.stat(pathTo));
  }

  private async loadEntityConfig(
    entityName: string
  ): Promise<Record<string, any>> {
    const localCfgPath = pathJoin(
      ROOT_DIRS.system,
      SYSTEM_SUB_DIRS.cfgLocal,
      `${entityName}.${CFG_FILE_EXT}`
    );
    const syncedCfgPath = pathJoin(
      ROOT_DIRS.system,
      SYSTEM_SUB_DIRS.cfgSynced,
      `${entityName}.${CFG_FILE_EXT}`
    );
    let localCfg: Record<string, any> = {};
    let syncedCfg: Record<string, any> = {};

    if (await this.isFileExists(localCfgPath)) {
      localCfg = JSON.parse(await this.filesIo.readTextFile(localCfgPath));
    }
    if (await this.isFileExists(syncedCfgPath)) {
      syncedCfg = JSON.parse(await this.filesIo.readTextFile(syncedCfgPath));
    }

    return {
      ...localCfg,
      ...syncedCfg,
    };
  }

  private async saveEntityLocalConfig(
    entityName: string,
    newConfig: Record<string, any>
  ) {
    const cfgPath = pathJoin(
      ROOT_DIRS.system,
      SYSTEM_SUB_DIRS.cfgLocal,
      `${entityName}.${CFG_FILE_EXT}`
    );

    await this.filesIo.writeFile(
      cfgFilePathSynced,
      JSON.stringify(newConfig, null, 2)
    );

    return {
      ...localCfg,
      ...syncedCfg,
    };
  }
}
