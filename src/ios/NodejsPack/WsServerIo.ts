import WebSocket, { WebSocketServer } from 'ws'
import type {ClientRequest, IncomingMessage} from 'http'
import {
  callPromised,
  trimCharStart,
  type HttpRequest,
  type HttpResponse,
} from 'squidlet-lib';
import { WsServerEvent } from '../../types/io/WsServerIoType.js';
import type {
  WsServerIoType,
  WsServerProps,
} from '../../types/io/WsServerIoType.js';
import type { WsCloseStatus } from '../../types/io/WsClientIoType.js';
import { ServerIoBase } from '../../system/base/ServerIoBase.js';
import type { IoIndex } from '../../types/types.js';
import type { IoContext } from '../../system/context/IoContext.js';
import type { IoSetBase } from '@/system/base/IoSetBase.js';
import { makeRequestObject } from './HttpServerIo.js';

// TODO: нужно делать пинг на соединение и удалять если нет ответа

type ServerItem = [
  // server instance
  WebSocketServer,
  // connection instances
  WebSocket[],
  // is server listening.
  boolean
];

enum ITEM_POSITION {
  wsServer,
  // saved Socket instances
  connections,
  listeningState,
}

export const WsServerIoIndex: IoIndex = (ioSet: IoSetBase, ctx: IoContext) => {
  return new WsServerIo(ioSet, ctx);
};

// TODO: review
// export function makeConnectionParams(
//   request: IncomingMessage
// ): WsServerConnectionParams {
//   return {
//     url: request.url as string,
//     method: request.method as string,
//     statusCode: request.statusCode as number,
//     statusMessage: request.statusMessage as string,
//     headers: {
//       Authorization: request.headers.authorization,
//       Cookie: request.headers.cookie,
//       'User-Agent': request.headers['user-agent'],
//     },
//   };
// }

export function makeWsResponseObject(res: IncomingMessage): HttpResponse {
  return {
    headers: res.headers as Record<string, string>,
    statusMessage: res.statusMessage,
    statusCode: res.statusCode ?? 0,
  };
}

export class WsServerIo
  extends ServerIoBase<ServerItem, WsServerProps>
  implements WsServerIoType
{
  name = 'WsServerIo';

  async isServerListening(serverId: string): Promise<boolean> {
    const serverItem = this.servers[serverId];

    return serverItem?.[ITEM_POSITION.listeningState] ?? false;
  }

  async send(
    serverId: string,
    connectionId: string,
    data: string | Uint8Array
  ): Promise<void> {
    // TODO: is it need support of null or undefined, number, boolean ???
    // TODO: review как работает binary
    if (typeof data !== 'string' && !(data instanceof Uint8Array)) {
      throw new Error(`Unsupported type of data: "${JSON.stringify(data)}"`);
    }

    const serverItem = this.getServerItem(serverId);
    // TODO: handle undefined
    const socket = serverItem[ITEM_POSITION.connections][Number(connectionId)];

    // TODO: а может ли быть socket закрытый??? и быть undefined???

    await callPromised(socket.send.bind(socket), data);
  }

  async closeConnection(
    serverId: string,
    connectionId: string,
    code?: WsCloseStatus,
    reason?: string
  ): Promise<void> {
    const serverItem = this.getServerItem(serverId);
    const connectionItem =
      serverItem?.[ITEM_POSITION.connections]?.[Number(connectionId)];

    if (!connectionItem) return;

    connectionItem.close(code, reason);

    delete serverItem[ITEM_POSITION.connections][Number(connectionId)];

    // TODO: проверить не будет ли ошибки если соединение уже закрыто
  }

  async destroyConnection(
    serverId: string,
    connectionId: string
  ): Promise<void> {
    const serverItem = this.getServerItem(serverId);
    const connectionItem =
      serverItem?.[ITEM_POSITION.connections]?.[Number(connectionId)];

    if (!connectionItem) return;

    connectionItem.close();
  }

  protected startServer(serverId: string, props: WsServerProps): ServerItem {
    // server will automatically started
    const server = new WebSocketServer({
      ...props,
      autoPong: true,
    });

    server.on('error', (err) =>
      this.events.emit(WsServerEvent.serverError, serverId, String(err))
    );
    server.on('close', () =>
      this.events.emit(WsServerEvent.serverClosed, serverId)
    );
    server.on('listening', () => this.handleServerStartListening(serverId));
    server.on('connection', (socket: WebSocket, request: IncomingMessage) =>
      this.handleIncomeConnection(serverId, socket, request)
    );

    return [
      server,
      // empty connections
      [],
      // not listening at the moment
      false,
    ];
  }

  // protected async destroyServer(serverId: string) {
  //   // TODO: он не закрывает соединения

  //   if (!this.servers[serverId]) return;

  //   // call server close
  //   // TODO: если раскоментировать то будет ошибка при дестрое
  //   //await callPromised(server.close.bind(server));

  //   delete this.servers[serverId];
  // }

  protected makeServerId(props: WsServerProps): string {
    return (
      `${props.host}:${props.port}` +
      (props.path ? `/${trimCharStart(props.path, '/')}` : '')
    );
  }

  protected async destroyServer(serverItem: ServerItem): Promise<void> {
    const server = serverItem[ITEM_POSITION.wsServer];
    // TODO: проверить закроются ли соединения
    await callPromised(server.close.bind(server));
  }

  private handleServerStartListening = (serverId: string) => {
    const serverItem = this.getServerItem(serverId);

    serverItem[ITEM_POSITION.listeningState] = true;

    this.events.emit(WsServerEvent.listening, serverId);
  };

  private handleIncomeConnection(
    serverId: string,
    socket: WebSocket,
    request: IncomingMessage
  ) {
    const serverItem = this.getServerItem(serverId);
    const connections = serverItem[ITEM_POSITION.connections];
    const connectionId: string = String(connections.length);
    const requestParams: HttpRequest = makeRequestObject(request);

    connections.push(socket);

    socket.on('error', (err: Error) => {
      this.events.emit(
        WsServerEvent.connectionError,
        serverId,
        connectionId,
        String(err)
      );
    });

    socket.on('close', (code: number, reason: string) => {
      this.events.emit(
        WsServerEvent.connectionClose,
        serverId,
        connectionId,
        code,
        reason
      );
    });

    socket.on('message', (data: string | Buffer) => {
      let resolvedData: string | Uint8Array;

      if (typeof data === 'string') {
        resolvedData = data;
      } else if (Buffer.isBuffer(data)) {
        resolvedData = new Uint8Array(data);
      } else {
        this.events.emit(
          WsServerEvent.connectionError,
          serverId,
          connectionId,
          `Income data isn't a buffer or string`
        );

        return;
      }

      this.events.emit(
        WsServerEvent.connectionMessage,
        serverId,
        connectionId,
        resolvedData
      );
    });

    socket.on(
      'unexpected-response',
      (request: ClientRequest, response: IncomingMessage) => {
        this.events.emit(
          WsServerEvent.connectionUnexpectedResponse,
          serverId,
          connectionId,
          makeWsResponseObject(response)
        );
      }
    );

    // emit new connection
    this.events.emit(
      WsServerEvent.newConnection,
      serverId,
      connectionId,
      requestParams
    );
  }
}
