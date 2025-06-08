import type {System} from '../System.js'
import type { IoBase } from '../base/IoBase.js';
import type { IoSetBase } from '../base/IoSetBase.js';
import {IO_NAMES} from '../../types/constants.js


export class IoManager {
  private readonly system: System;
  private readonly ioSets: Record<string, IoSetBase> = {};
  // object like {ioName: IoBase}
  private ios: Record<string, IoBase> = {};

  constructor(system: System) {
    this.system = system;
  }

  async initIoSetsAndFilesIo() {
    // Init all the ioSets
    for (const ioSet of Object.values(this.ioSets)) await ioSet.init();

    // init only FileIo
    await this.initIo(IO_NAMES.LocalFilesIo);
  }

  /**
   * It initializes all the IOs except FilesIo
   */
  async initIos() {
    // TODO: skip files io
    for (const io of this.ios) {
      if (io.myName === IO_NAMES.LocalFilesIo) {
        continue;
      }

      // TODO: add timeout
      await io.init?.();
    }
  }

  async destroy() {
    for (const ioName of Object.keys(this.ios)) {
      delete this.ios[ioName];
    }

    for (const index in this.ioSets) {
      const ioSet = this.ioSets[index];

      await ioSet.destroy();

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
  useIoSet(ioSet: IoSetBase) {
    // TODO: получается что это только IoSet context?
    //ioSet.$giveIoContext(this.ctx);

    // TODO: init ioSet

    this.ioSets.push(ioSet);

    const ioNames = ioSet.getNames();

    for (const name of ioNames) {
      if (this.ios[name]) {
        throw new Error(`The IO "${name}" has already registered`);
      }

      const io = ioSet.getIo(name);
      // io.$giveIoContext(ioCtx);
      this.ios[name] = io;
    }
  }

  private async initIo(ioName: string) {
    const io = this.ios[ioName];
    if (!io) {
      throw new Error(`Can't find IO "${ioName}"`);
    }

    await io.init?.();
  }
}
