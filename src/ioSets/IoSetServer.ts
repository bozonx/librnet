import { ConsoleLogger, LogLevels, type Logger } from 'squidlet-lib'

import type { IoBase } from '../system/base/IoBase.js'
import { allSettledWithTimeout } from '../system/helpers/helpers.js'
import {
  GET_IO_NAMES_METHOD_NAME,
  IO_SET_SERVER_NAME,
} from '../types/constants.js'
import type { IoContext, IoIndex } from '../types/types.js'

export class IoSetServer {
  private readonly ios: { [index: string]: IoBase } = {}
  private wasInited: boolean = false
  private readonly logger: Logger

  constructor(
    readonly send: (msg: string) => Promise<void> | void,
    readonly entityInitTimeoutSec: number = 60,
    readonly entityDestroyTimeoutSec: number = 60,
    logger?: Logger
  ) {
    if (logger) {
      this.logger = logger
    } else {
      this.logger = new ConsoleLogger(LogLevels.error)
    }
  }

  async init() {
    if (this.wasInited) {
      throw new Error(
        `IoSetServer: It isn't allowed to init IoSet more than once`
      )
    }

    this.wasInited = true

    for (const [ioName, io] of Object.entries(this.ios)) {
      if (io.on) {
        const handlerIndex = await io.on((...args) => {
          this.sendEvent(ioName, ...args)
        })
      }
    }

    await allSettledWithTimeout(
      Object.values(this.ios)
        .filter((io) => io.init)
        .map((io) => io.init!()),
      this.entityInitTimeoutSec * 1000,
      'Initialization of Ios failed'
    )
  }

  async destroy() {
    await allSettledWithTimeout(
      Object.values(this.ios)
        .filter((io) => io.destroy)
        .map((io) => io.destroy!()),
      this.entityDestroyTimeoutSec * 1000,
      'Destroying of Ios failed'
    )
  }

  use(ioName: string, index: IoIndex) {
    if (this.ios[ioName]) {
      throw new Error(`IoSetServer: The same IO "${ioName}" is already in use`)
    }

    this.logger.info(`IoSetServer: registering IO "${ioName}"`)

    const ctx: IoContext = { log: this.logger }
    const io = index(ctx)

    this.ios[ioName] = io
  }

  async incomeMessage(msg: string) {
    try {
      const [requestId, ioName, methodName, ...args] = JSON.parse(msg)

      if (!requestId) {
        return this.logger.error(
          `IoSetServer: Invalid message, it doesn't have requestId: ${msg}`
        )
      }

      if (ioName === IO_SET_SERVER_NAME) {
        if (methodName === GET_IO_NAMES_METHOD_NAME) {
          return this.sendResponse(requestId, null, Object.keys(this.ios))
        }

        return this.sendResponse(
          requestId,
          `Can't find method "${methodName}" in "${IO_SET_SERVER_NAME}"`
        )
      }

      if (!this.ios[ioName]) {
        return this.sendResponse(
          requestId,
          `Can't find io instance "${ioName}"`
        )
      } else if (!(this.ios[ioName] as any)[methodName]) {
        return this.sendResponse(
          requestId,
          `Can't find method "${methodName}" in io instance "${ioName}"`
        )
      } else if (methodName === 'init' || methodName === 'destroy') {
        return this.sendResponse(
          requestId,
          `Not allowed to call method "${ioName}.${methodName}"`
        )
      }

      let result: any

      try {
        result = await (this.ios[ioName] as any)[methodName](...args)
      } catch (error) {
        return this.sendResponse(requestId, String(error))
      }

      this.sendResponse(requestId, null, result)
    } catch (error) {
      this.logger.error(`IoSetServer: Error of incomeMessage ${msg}: ${error}`)
    }
  }

  private sendResponse(requestId: number, error: string | null, result?: any) {
    try {
      const res: Promise<void> | void = this.send(
        JSON.stringify([requestId, error, result])
      )
      res?.catch((error) => {
        this.logger.error(
          `IoSetServer: Error of response ${requestId} ${JSON.stringify(
            result
          )}: ${error}`
        )
      })
    } catch (error) {
      this.logger.error(
        `IoSetServer: Error of response ${requestId} ${JSON.stringify(
          result
        )}: ${error}`
      )
    }
  }

  private sendEvent(...args: any[]) {
    const msg = JSON.stringify([null, ...args])
    try {
      const res: Promise<void> | void = this.send(msg)

      res?.catch((error) => {
        this.logger.error(`IoSetServer: Error of event ${msg}: ${error}`)
      })
    } catch (error) {
      this.logger.error(`IoSetServer: Error of event ${msg}: ${error}`)
    }
  }
}
