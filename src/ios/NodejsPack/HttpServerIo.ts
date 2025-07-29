import { IncomingMessage, Server, ServerResponse, createServer } from 'http'
import { IndexedEvents, callPromised, makeUniqNumber } from 'squidlet-lib'
import type { HttpMethods, HttpRequest, HttpResponse } from 'squidlet-lib'

import { ServerIoBase } from '@/system/base/ServerIoBase.js'
import { DEFAULT_ENCODE } from '@/types/constants.js'
import { HttpServerEvent } from '@/types/io/HttpServerIoType.js'
import type {
  HttpServerIoType,
  HttpServerProps,
} from '@/types/io/HttpServerIoType.js'
import type { IoContext, IoIndex } from '@/types/types.js'

type ServerItem = [
  // Http server instance
  Server,
  // is server listening.
  boolean,
]

enum ITEM_POSITION {
  server,
  listeningState,
}

export interface HttpServerIoConfig {
  requestTimeoutSec: number
}
// TODO: это можно передавать в параметрах а не в конфиге
// const HTTP_SERVER_IO_CONFIG_DEFAULTS = {
//   requestTimeoutSec: 60,
// };

export const HttpServerIoIndex: IoIndex = (ctx: IoContext) => {
  return new HttpServerIo(ctx)
}

export function makeRequestObject(req: IncomingMessage): HttpRequest {
  const bodyBuff: Buffer | null = req.read()
  const body: string | undefined = bodyBuff?.toString(DEFAULT_ENCODE)

  // TODO: если content type бинарный то преобразовать body в Uint8

  return {
    body,
    headers: req.headers as any,
    httpVersion: req.httpVersion,
    httpVersionMajor: req.httpVersionMajor,
    httpVersionMinor: req.httpVersionMinor,
    complete: req.complete,
    rawHeaders: req.rawHeaders,
    // method of http request is in upper case format
    method: (req.method || 'GET').toUpperCase() as HttpMethods,
    url: req.url || '',

    destroyed: req.destroyed,
    closed: req.closed,
    errored: req.errored,
  }
}

/**
 * HttpServerIo is a server that listens for incoming HTTP requests and sends
 * responses back to the client. ‼️ to handle errors in handlers you have to
 * make them async
 */
export class HttpServerIo
  extends ServerIoBase<ServerItem, HttpServerProps>
  implements HttpServerIoType
{
  private responseEvent = new IndexedEvents<
    (requestId: number, response: HttpResponse) => void
  >()

  async isServerListening(serverId: string): Promise<boolean> {
    const serverItem = this.servers[serverId]

    return serverItem?.[ITEM_POSITION.listeningState] ?? false
  }

  /**
   * Receive response to request and after that send response back to client of
   * it request and close request.
   */
  async sendResponse(requestId: number, response: HttpResponse): Promise<void> {
    return this.responseEvent.emit(requestId, response)
  }

  protected startServer(serverId: string, props: HttpServerProps): ServerItem {
    const server: Server = createServer({
      // timeout of entire request in ms
      requestTimeout: this.cfg.requestTimeoutSec * 1000,
    })

    server.on('error', (err: Error) =>
      this.events.emit(HttpServerEvent.serverError, serverId, String(err))
    )
    server.on('close', () =>
      this.events.emit(HttpServerEvent.serverClosed, serverId)
    )
    server.on('listening', () => this.handleServerStartListening(serverId))
    server.on('request', (req: IncomingMessage, res: ServerResponse) =>
      this.handleIncomeRequest(serverId, req, res)
    )
    // start server
    server.listen(props.port, props.host)

    return [
      server,
      // not listening at the moment. Wait listen event
      false,
    ]
  }

  protected async destroyServer(serverItem: ServerItem) {
    // it will emit serverClose event
    await callPromised(
      serverItem[ITEM_POSITION.server].close.bind(
        serverItem[ITEM_POSITION.server]
      )
    )
  }

  protected makeServerId(props: HttpServerProps): string {
    return `${props.host}:${props.port}`
  }

  private handleServerStartListening = (serverId: string) => {
    const serverItem = this.getServerItem(serverId)

    serverItem[ITEM_POSITION.listeningState] = true

    this.events.emit(HttpServerEvent.listening, serverId)
  }

  /**
   * When income request is came then it wait for a response from driver while
   * it call sendResponse(). And after that it return the response.
   *
   * @private
   * @param serverId
   * @param req
   * @param res
   */
  private async handleIncomeRequest(
    serverId: string,
    req: IncomingMessage,
    res: ServerResponse
  ) {
    if (!this.servers[serverId]) return

    const requestId: number = makeUniqNumber()
    const httpRequest: HttpRequest = makeRequestObject(req)

    const responsePromised = this.responseEvent
      .wait(([reqId]) => reqId === requestId, this.cfg.requestTimeoutSec * 1000)
      .then(([, response]) => {
        this.setupResponse(response, res)
      })
      .rejected((e) => {
        this.setupErrorResponse(
          500,
          `HttpServerIo: Error while waiting for response: ${String(e)}`,
          res
        )
      })
      .onExceeded(() => {
        this.setupErrorResponse(
          408,
          'HttpServerIo: Timeout has been exceeded, ' +
            `Server ${serverId}. ${req.method} ${req.url}`,
          res
        )
      })

    // emit request event which driver has to responce
    try {
      await this.events.emitSync(
        HttpServerEvent.request,
        serverId,
        requestId,
        httpRequest
      )
    } catch (e) {
      responsePromised.reject(e as Error)
    }
  }

  private setupResponse(response: HttpResponse, httpRes: ServerResponse) {
    httpRes.writeHead(
      response.statusCode,
      response.statusMessage,
      response.headers as Record<string, any>
    )

    if (typeof response.body === 'string') {
      httpRes.end(response.body)
    } else {
      // TODO: support of Buffer - convert from Uint8Arr to Buffer
    }
  }

  private async setupErrorResponse(
    statusCode: number,
    errorMsg: string,
    res: ServerResponse
  ) {
    let statusMessage

    switch (statusCode) {
      case 408:
        statusMessage = 'Request Timeout'
        break
      case 500:
        statusMessage = 'Internal Server Error'
        break
    }

    res.writeHead(statusCode, statusMessage, { 'Content-Type': 'text/json' })

    res.end(JSON.stringify({ errorMsg }))
  }
}
