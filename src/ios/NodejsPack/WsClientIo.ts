import WebSocket from 'ws';
import type {ClientRequest, IncomingMessage} from 'http'
import {callPromised, convertBufferToUint8Array, IndexedEvents, omitObj} from 'squidlet-lib'
import {WsCloseStatus, WsClientEvent} from '../../types/io/WsClientIoType.js'
import type {WsClientIoType, WebSocketClientProps} from '../../types/io/WsClientIoType.js'
import { IoBase } from '../../system/base/IoBase.js';
import type { IoIndex } from '../../types/types.js';
import type { IoContext } from '../../system/context/IoContext.js';
import type { IoSetBase } from '@/system/base/IoSetBase.js';
import { makeWsResponseObject } from './WsServerIo.js';

export const WsClientIoIndex: IoIndex = (ioSet: IoSetBase, ctx: IoContext) => {
  return new WsClientIo(ioSet, ctx);
};

type ConnectionItem = [WebSocket, WebSocketClientProps];

enum CONNECTION_POSITION {
  client,
  props,
}

// TODO: может сделать базовый класс для подобных клиентов

export class WsClientIo extends IoBase implements WsClientIoType {
  name = 'WsClientIo';

  private readonly events = new IndexedEvents();
  private readonly connections: ConnectionItem[] = [];

  destroy = async () => {
    for (let connectionId in this.connections) {
      await this.close(connectionId, WsCloseStatus.closeGoingAway, 'destroy');
    }

    // TODO: нужно дождаться закрытия всех соединений
    // this.events.destroy();
  };

  async on(cb: (...p: any[]) => void): Promise<number> {
    return this.events.addListener(cb);
  }

  async off(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }

  /**
   * Make new connection to server.
   * It returns a connection id to use with other methods
   */
  async newConnection(props: WebSocketClientProps): Promise<string> {
    const connectionId = String(this.connections.length);

    this.connections.push([this.connectToServer(connectionId, props), props]);

    return connectionId;
  }

  /**
   * It is used to reconnect on connections lost.
   * It closes previous connection and makes new one with the same id.
   */
  async reConnect(connectionId: string) {
    const oldConnectionProps =
      this.connections[Number(connectionId)][CONNECTION_POSITION.props];

    await this.close(connectionId, WsCloseStatus.closeNormal, 'reConnect');

    this.connections[Number(connectionId)] = [
      this.connectToServer(connectionId, oldConnectionProps),
      oldConnectionProps,
    ];
  }

  async close(connectionId: string, code?: number, reason?: string) {
    const connection = this.connections[Number(connectionId)];

    if (!connection) return;

    connection[CONNECTION_POSITION.client].close(code, reason);

    delete this.connections[Number(connectionId)];
  }

  async send(connectionId: string, data: string | Uint8Array) {
    if (typeof data !== 'string' && !(data instanceof Uint8Array)) {
      throw new Error(`Unsupported type of data: "${JSON.stringify(data)}"`);
    }

    const client =
      this.connections[Number(connectionId)][CONNECTION_POSITION.client];

    await callPromised(client.send.bind(client), data);
  }

  private connectToServer(
    connectionId: string,
    props: WebSocketClientProps
  ): WebSocket {
    const client = new WebSocket(props.url, omitObj(props, 'url'));

    client.on('open', () => this.events.emit(WsClientEvent.open, connectionId));
    client.on('close', () => {
      this.events.emit(WsClientEvent.close, connectionId);
      delete this.connections[Number(connectionId)];
    });
    client.on('error', (err: Error) =>
      this.events.emit(WsClientEvent.error, connectionId, String(err))
    );
    client.on(
      'unexpected-response',
      (req: ClientRequest, res: IncomingMessage) =>
        // TODO: а точно будет makeConnectionParams ???
        this.events.emit(
          WsClientEvent.unexpectedResponse,
          connectionId,
          makeWsResponseObject(res)
        )
    );
    client.on('message', (data: string | Buffer) => {
      let resolvedData: string | Uint8Array;

      if (typeof data === 'string') {
        resolvedData = data;
      } else if (Buffer.isBuffer(data)) {
        resolvedData = new Uint8Array(data);
      } else {
        this.events.emit(
          WsClientEvent.error,
          connectionId,
          `Income data isn't a buffer or string`
        );

        return;
      }

      this.events.emit(WsClientEvent.message, connectionId, resolvedData);
    });

    return client;
  }
}
