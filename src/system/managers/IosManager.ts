import type { System } from '../System.js';
import type { IoSetClientBase } from '../../ioSets/IoSetClientBase.js';
import { allSettledWithTimeout } from '../helpers/helpers.js';
import {
  GET_IO_NAMES_METHOD_NAME,
  IO_SET_SERVER_NAME,
} from '@/types/constants.js';

export function createIoProxy(ioName: string, ioSet: IoSetClientBase): any {
  // Создаем пустой объект для прокси
  const target: Record<string | symbol, any> = {};

  // Навешиваем обработчик на ioSet.on при создании прокси
  const handlerIndex = ioSet.on((eventIoName: string, ...args: any[]) => {
    // Обрабатываем события только для данного IO
    if (eventIoName === ioName) {
      // Здесь можно добавить логику обработки событий
      // Пока оставляем пустым
    }
  });

  return new Proxy(target, {
    get: (target, prop) => {
      const propName = String(prop);

      // Специальная обработка для методов on и off
      if (propName === 'on') {
        return (...args: any[]) => {
          // Заглушка для метода on
          console.log(`IO "${ioName}": on method called with args:`, args);
          // Возвращаем индекс обработчика (заглушка)
          return 0;
        };
      }

      if (propName === 'off') {
        return (handlerIndex: number) => {
          // Заглушка для метода off
          console.log(
            `IO "${ioName}": off method called with handlerIndex:`,
            handlerIndex
          );
        };
      }

      // Для всех остальных методов перенаправляем в ioSet.callMethod
      return async (...args: any[]) => {
        try {
          return await ioSet.callMethod(ioName, propName, ...args);
        } catch (error) {
          console.error(
            `Error calling method "${propName}" on IO "${ioName}":`,
            error
          );
          throw error;
        }
      };
    },

    // Обработка установки свойств (если потребуется)
    set: (target, prop, value) => {
      const propName = String(prop);
      console.log(`IO "${ioName}": Setting property "${propName}" to:`, value);
      target[prop] = value;
      return true;
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
