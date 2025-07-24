import { IndexedEvents } from 'squidlet-lib';
import type { System } from '../System.js';
import type { IoSetClient } from '../../ioSets/IoSetClient.js';
import { allSettledWithTimeout } from '../helpers/helpers.js';
import {
  GET_IO_NAMES_METHOD_NAME,
  IO_SET_SERVER_NAME,
} from '@/types/constants.js';

export function createIoProxy(ioName: string, ioSet: IoSetClient): any {
  // Создаем пустой объект для прокси
  const target: Record<string | symbol, any> = {};
  const events = new IndexedEvents();

  // Навешиваем обработчик на ioSet.on при создании прокси
  const handlerIndex = ioSet.on((eventIoName: string, ...args: any[]) => {
    if (eventIoName === ioName) events.emit(...args);
  });

  return new Proxy(target, {
    get: (target, prop) => {
      const propName = String(prop);

      // Специальная обработка для методов on и off
      if (propName === 'on') {
        return (cb: (...args: any[]) => void) => {
          return events.addListener(cb);
        };
      }

      if (propName === 'off') {
        return (handlerIndex: number) => {
          events.removeListener(handlerIndex);
        };
      }

      // Для всех остальных методов перенаправляем в ioSet.callMethod
      return async (...args: any[]) => {
        return ioSet.callMethod(ioName, propName, ...args);
      };
    },
  });
}

export class IosManager {
  private ioSets: IoSetClient[] = [];
  // object like {ioName: IoProxy}
  private ios: Record<string, any> = {};

  constructor(private readonly system: System) {}

  // async init() {
  //   await allSettledWithTimeout(
  //     this.ioSets.map((ioSet) => ioSet.init()),
  //     this.system.configs.systemCfg.local.ENTITY_INIT_TIMEOUT_SEC * 1000,
  //     'Initialization of IoSets failed'
  //   );
  // }

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
  async useIoSet(ioSet: IoSetClient) {
    this.ioSets.push(ioSet);

    const ioNames = await ioSet.callMethod<string[]>(
      IO_SET_SERVER_NAME,
      GET_IO_NAMES_METHOD_NAME
    );

    for (const ioName of ioNames) {
      if (this.ios[ioName]) {
        throw new Error(`The IO "${ioName}" has already registered`);
      }

      this.ios[ioName] = createIoProxy(ioName, ioSet);
    }
  }
}
