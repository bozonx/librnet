import type { HttpRequest, HttpResponse } from 'squidlet-lib'

import type { IoBase } from '@/system/base/IoBase.js'

export enum HttpServerEvent {
  request,
  listening,
  serverClosed,
  serverError,
}

export type HttpRequestHandler = (
  requestId: number,
  request: HttpRequest
) => void

export interface HttpServerProps {
  host: string
  port: number
}

export interface HttpServerIoType {
  /** When server starts listening */
  on(
    cb: (eventName: HttpServerEvent.listening, serverId: string) => void
  ): Promise<number>

  /** On server close. Depend on http server close */
  on(
    cb: (eventName: HttpServerEvent.serverClosed, serverId: string) => void
  ): Promise<number>

  /** Emits on server error */
  on(
    cb: (
      eventName: HttpServerEvent.serverError,
      serverId: string,
      err: string
    ) => void
  ): Promise<number>

  /**
   * Handle new request. Please call the sendResponse with a received
   * `requestId` to make a response to client.
   */
  on(
    cb: (
      eventName: HttpServerEvent.request,
      serverId: string,
      requestId: number,
      request: HttpRequest
    ) => void
  ): Promise<number>

  /** Remove one of server listeners */
  off(handlerIndex: number): Promise<void>

  /** Make new server and return serverId */
  newServer(props: HttpServerProps): Promise<string>

  /** Shut down a server which has been previously created */
  stopServer(serverId: string): Promise<void>

  /** Send a response to client. Call it only when you are handled a request. */
  sendResponse(requestId: number, response: HttpResponse): Promise<void>
}

export type HttpServerIoFullType = HttpServerIoType & IoBase
