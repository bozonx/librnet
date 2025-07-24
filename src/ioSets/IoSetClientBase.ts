import { IndexedEvents } from 'squidlet-lib';

export class IoSetClientBase {
  private readonly events = new IndexedEvents();

  async init() {}

  async destroy() {
    this.events.destroy();
  }

  on(cb: (ioName: string, ...args: any[]) => void): number {
    return this.events.addListener(cb);
  }

  off(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }

  async callMethod<T = any>(
    ioName: string,
    methodName: string,
    ...args: any[]
  ): Promise<T> {
    // return this.ioSetServer.callMethod(ioName, methodName, ...args);
  }
}
