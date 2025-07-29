import type { DefaultHandler, IndexedEvents } from 'squidlet-lib'

// TODO: serialize/deserialize object
// TODO: status, error, request marker

export class Channel {
  constructor(
    protected readonly events: IndexedEvents<DefaultHandler>,
    protected readonly doSend: (message: string | Uint8Array) => Promise<void>,
    protected readonly doDestroy: () => Promise<void>
  ) {}

  async destroy() {
    await this.doDestroy()
  }

  /**
   * Send message to channel
   * It waits while message is sent but do not wait for response
   * @param message - message to send
   */
  async send(...p: any[]) {
    //
  }

  /**
   * Send message to channel and wait for response
   * @param message - message to send
   * @returns response message
   */
  async request(...p: any[]): Promise<any[]> {
    // TODO: use timeout
  }

  onMessage(cb: (...p: any[]) => void): number {
    return this.events.addListener(cb)
  }

  onRequest(cb: (...p: any[]) => Promise<any[]>): number {
    return this.events.addListener(cb)
  }

  off(handlerIndex: number) {
    this.events.removeListener(handlerIndex)
  }
}
