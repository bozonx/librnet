import { IndexedEvents, Promised, makeUniqId } from 'squidlet-lib'

import { REQUEST_ID_LENGTH } from '../types/constants.js'

export class IoSetClient {
  readonly events = new IndexedEvents()
  // current requests
  readonly requests = new Map<string, (error: string, result: any) => void>()

  /** @param send - The function to send a message to the server */
  constructor(
    readonly send: (msg: string) => void,
    readonly requestTimeoutSec: number = 60
  ) {}

  async destroy() {
    this.events.destroy()
  }

  /**
   * Call this method when you receive a message from the server
   *
   * @param msg - The message to handle
   */
  incomeMessage(msg: string) {
    const [requestId, ...p] = JSON.parse(msg)

    if (requestId) {
      // it is response by request
      const [error, result] = p

      if (!this.requests.has(requestId)) {
        throw new Error(`Request ${requestId} not found`)
      }
      // call callback of request
      this.requests.get(requestId)!(error, result)
      this.requests.delete(requestId)
    } else {
      // just event from server like: ioName, eventName, ...args
      this.events.emit(...p)
    }
  }

  on(cb: (ioName: string, ...args: any[]) => void): number {
    return this.events.addListener(cb)
  }

  off(handlerIndex: number) {
    this.events.removeListener(handlerIndex)
  }

  async callMethod<T = any>(
    ioName: string,
    methodName: string,
    ...args: any[]
  ): Promise<T> {
    const requestId = makeUniqId(REQUEST_ID_LENGTH)
    const promised = new Promised<T>()
    const timeout = setTimeout(() => {
      promised.reject(new Error(`Response for request ${requestId} timed out`))
      this.requests.delete(requestId)
    }, this.requestTimeoutSec * 1000)

    this.requests.set(requestId, (error, result) => {
      if (error) {
        promised.reject(new Error(error))
      } else {
        promised.resolve(result)
      }

      clearTimeout(timeout)
    })

    this.send(JSON.stringify([requestId, ioName, methodName, ...args]))

    return await promised
  }
}
