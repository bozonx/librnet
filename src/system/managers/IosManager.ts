import type { System } from '../System.js';
import type { IoBase } from '../base/IoBase.js';
import type { IoSetBase } from '../../ioSets/IoSetBase.js';
import {
  EntityInitTimeoutSec,
  EntityDestroyTimeoutSec,
  IoNames,
} from '../../types/constants.js';
import { Promised } from 'squidlet-lib';

// TODO: разве не нужно передавать в конструктор манифесты?

export class IosManager {
  private readonly system: System;
  private readonly ioSets: IoSetBase[] = [];
  // object like {ioName: IoBase}
  private ios: Record<string, IoBase> = {};

  constructor(system: System) {
    this.system = system;
  }

  async initIoSetsAndFilesIo() {
    // TODO: use Promise.allSettled([
    // TODO: add timeout for each item
    // Init all the ioSets
    for (const ioSet of Object.values(this.ioSets)) {
      const promised = new Promised();

      try {
        await promised.start(ioSet.init(), ENTITY_INIT_TIMEOUT_SEC * 1000);
      } catch (e) {
        throw new Error(`Initialization of IoSet "${ioSet.type}" failed: ${e}`);
      }
    }

    // TODO: WTF?
    // init only FileIo
    await this.initIo(IO_NAMES.LocalFilesIo);
  }

  /**
   * It initializes all the IOs except FilesIo
   */
  async initIos() {
    // TODO: use Promise.allSettled([
    // TODO: add timeout for each item
    for (const io of Object.values(this.ios)) {
      if (io.name === IO_NAMES.LocalFilesIo) continue;

      await this.initIo(io.name);
    }
  }

  async destroy() {
    // TODO: use Promise.allSettled([
    // TODO: add timeout for each item
    for (const ioName of Object.keys(this.ios)) {
      await this.destroyIo(ioName);
      delete this.ios[ioName];
    }

    for (const index in this.ioSets) {
      const ioSet = this.ioSets[index];
      const promised = new Promised();

      try {
        await promised.start(
          ioSet.destroy(),
          ENTITY_DESTROY_TIMEOUT_SEC * 1000
        );
      } catch (e) {
        throw new Error(`Destroying of "${ioSet.type}" failed: ${e}`);
      }

      delete this.ioSets[index];
    }
  }

  getIo<T extends IoBase>(ioName: string): T {
    return this.ios[ioName] as T;
  }

  getNames(): string[] {
    return Object.keys(this.ios);
  }

  // Register IoSet
  use(ioSet: IoSetBase) {
    if (!this.system.isDevMode)
      throw new Error(
        `You try to register an ioSet "${ioSet.type}" not in development mode`
      );

    this.ioSets.push(ioSet);

    const ioNames = ioSet.getNames();

    for (const name of ioNames) {
      if (this.ios[name]) {
        throw new Error(`The IO "${name}" has already registered`);
      }

      const io = ioSet.getIo(name);

      this.ios[name] = io;
    }
  }

  private async initIo(ioName: string) {
    const io = this.ios[ioName];

    if (!io) throw new Error(`Can't find IO "${ioName}"`);
    if (!io.init) return;

    const cfg = {
      local: await this.system.configs.loadEntityConfig(ioName, false),
      synced: await this.system.configs.loadEntityConfig(ioName, true),
    };

    const promised = new Promised();

    try {
      await promised.start(io.init(cfg), ENTITY_INIT_TIMEOUT_SEC * 1000);
    } catch (e) {
      throw new Error(`Initialization of "${ioName}" failed: ${e}`);
    }
  }

  private async destroyIo(ioName: string) {
    const io = this.ios[ioName];

    if (!io) throw new Error(`Can't find IO "${ioName}"`);
    if (!io.destroy) return;

    const promised = new Promised();

    try {
      await promised.start(io.destroy(), ENTITY_DESTROY_TIMEOUT_SEC * 1000);
    } catch (e) {
      throw new Error(`Destroying of "${ioName}" failed: ${e}`);
    }
  }
}
