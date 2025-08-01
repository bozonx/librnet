import type { HttpResponse } from 'squidlet-lib'

import type { IoBase } from '@/system/base/IoBase'

export enum WsClientEvent {
  open,
  close,
  message,
  error,
  unexpectedResponse,
}

// see https://github.com/Luka967/websocket-close-codes
export enum WsCloseStatus {
  // Successful operation / regular socket shutdown
  closeNormal = 1000,
  // Client is leaving (browser tab closing)
  closeGoingAway,
  // Internal server error while operating
  serverError = 1011,
}

export type OnMessageHandler = (data: string | Uint8Array) => void

export interface WsClientProps {
  url: string
  headers?: { [index: string]: string }
}

export interface WsClientIoType {
  on(
    cb: (eventName: WsClientEvent.open, connectionId: string) => void
  ): Promise<number>
  on(
    cb: (eventName: WsClientEvent.close, connectionId: string) => void
  ): Promise<number>
  on(
    cb: (
      eventName: WsClientEvent.error,
      connectionId: string,
      err: string
    ) => void
  ): Promise<number>
  on(
    cb: (
      eventName: WsClientEvent.unexpectedResponse,
      connectionId: string,
      res: HttpResponse
    ) => void
  ): Promise<number>
  on(
    cb: (
      eventName: WsClientEvent.message,
      connectionId: string,
      data: string | Uint8Array
    ) => void
  ): Promise<number>
  off(handlerIndex: number): Promise<void>

  newConnection(props: WsClientProps): Promise<string>
  // TODO: зачем это в Io? это же должно к драйверу относиться
  reConnect(connectionId: string, props: WsClientProps): Promise<void>
  send(connectionId: string, data: string | Uint8Array): Promise<void>
  close(connectionId: string, code?: number, reason?: string): Promise<void>
  // destroyConnection   (connectionId: string): Promise<void>;
}

export type WsClientIoFullType = WsClientIoType & IoBase
