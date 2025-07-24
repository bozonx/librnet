import type { System } from '../System.js';
import type { IoSetClientBase } from '../../ioSets/IoSetClientBase.js';
import { allSettledWithTimeout } from '../helpers/helpers.js';
import {
  GET_IO_NAMES_METHOD_NAME,
  IO_SET_SERVER_NAME,
} from '@/types/constants.js';

export function createIoProxy(ioName: string, ioSet: IoSetClientBase): any {
  return new Proxy(io, {
    get: (target, prop) => {
      return target[prop];
    },
  });
}

export class IosManager {
  private ioSets: IoSetClientBase[] = [];
  // object like {ioName: IoProxy}
  private ios: Record<string, any> = {};

  constructor(private readonly system: System) {}

  async init() {
    await allSettledWithTimeout(
      this.ioSets.map((ioSet) => ioSet.init()),
      this.system.configs.systemCfg.local.ENTITY_INIT_TIMEOUT_SEC * 1000,
      'Initialization of IoSets failed'
    );
  }

  async destroy() {
    await allSettledWithTimeout(
      this.ioSets.map((ioSet) => ioSet.destroy()),
      this.system.configs.systemCfg.local.ENTITY_DESTROY_TIMEOUT_SEC * 1000,
      'Destroying of IoSets failed'
    );

    this.ioSets = [];
    this.ios = {};
  }

  getIo<T>(ioName: string): T {
    if (!this.ios[ioName]) {
      throw new Error(`Can't find IO "${ioName}"`);
    }

    return this.ios[ioName] as T;
  }

  getNames(): string[] {
    return Object.keys(this.ios);
  }

  // Register IoSet client
  async useIoSet(ioSet: IoSetClientBase) {
    this.ioSets.push(ioSet);

    const ioNames = await ioSet.callMethod<string[]>(
      IO_SET_SERVER_NAME,
      GET_IO_NAMES_METHOD_NAME
    );

    for (const name of ioNames) {
      if (this.ios[name]) {
        throw new Error(`The IO "${name}" has already registered`);
      }

      this.ios[name] = createIoProxy(name, ioSet);
    }
  }
}
