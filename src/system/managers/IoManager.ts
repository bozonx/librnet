import type {System} from '../System.js'
import type {IoBase} from '../../base/IoBase.js'
import {IoContext} from '../context/IoContext.js'
import type {IoSetBase} from '../../base/IoSetBase.js'
import {IO_NAMES} from '../../types/constants.js'


export class IoManager {
  private readonly system: System;
  private readonly ioSets: Record<string, IoSetBase> = {};
  // object like {ioName: IoBase}
  private ios: Record<string, IoBase> = {};
  private readonly ctx;

  constructor(system: System) {
    this.system = system;
    this.ctx = new IoContext(this.system);
  }

  async initSystemIos() {
    // init only FileIo
    if (!this.ios[IO_NAMES.LocalFilesIo]) {
      throw new Error(`Can't find LocalFilesIo`);
    }

    this.ios[IO_NAMES.LocalFilesIo].init?.();
  }

  async initOtherIos() {
    // TODO: skip files io
    for (const io of this.ios) {
      if (io.myName === IO_NAMES.LocalFilesIo) {
        continue;
      }

      await io.init?.();
    }
  }

  async destroy() {
    for (const ioName of Object.keys(this.ios)) {
      delete this.ios[ioName];
    }

    for (const index in this.ioSets) {
      await this.ioSets[index].destroy();

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

      const ioCtx = new IoContext(this.system);
      const io = ioSet.getIo(name);
      io.$giveIoContext(ioCtx);
      this.ios[name] = io;
    }
  }
}
