import {
  Promised,
  IndexedEventEmitter,
  type HttpRequest,
  type HttpResponse,
} from 'squidlet-lib';
import type { DriverIndex } from '../../../types/types.js';
import { IO_NAMES } from '../../../types/constants.js';
import { WsServerEvent } from '../../../types/io/WsServerIoType.js';
import type {
  WsServerIoFullType,
  WsServerProps,
} from '../../../types/io/WsServerIoType.js';
import DriverInstanceBase from '../../../system/base/DriverInstanceBase.js';
import type { System } from '@/system/System.js';
import { DriverFactoryBase } from '@/system/base/DriverFactoryBase.js';
import type { DriverInstanceClass } from '@/system/base/DriverInstanceBase.js';

// TODO: а оно надо??? может лучше сессию использовать?
// export const SETCOOKIE_LABEL = '__SET_COOKIE__';

export interface WsServerDriverProps extends WsServerProps {
  serverId: string;
}

export const WsServerDriverIndex: DriverIndex = (
  name: string,
  system: System
) => {
  return new WsServerDriver(system, name) as unknown as DriverFactoryBase<
    WsServerInstance,
    Record<string, any>
  >;
};

export class WsServerDriver extends DriverFactoryBase<
  WsServerInstance,
  WsServerDriverProps
> {
  readonly requireIo = [IO_NAMES.WsServerIo];
  protected SubDriverClass = WsServerInstance as unknown as DriverInstanceClass<
    WsServerDriverProps,
    Record<string, any>,
    WsServerDriver<any, any>
  >;

  protected common = {
    io: this.system.io.getIo<WsServerIoFullType>(IO_NAMES.WsServerIo),
  };

  private serverHandlerIndex: number = -1;

  async init(...p: any[]) {
    await super.init(...p);

    this.serverHandlerIndex = await this.common.io.on(
      (eventName: WsServerEvent, serverId: string, ...p: any[]) => {
        const instance = this.instances.find(
          (instance) => instance.serverId === serverId
        );

        if (!instance) {
          this.system.log.warn(
            `WsServerDriver: Can't find instance of Ws server "${serverId}"`
          );
        } else {
          if (eventName === WsServerEvent.listening) {
            startedPromised.resolve();

            return;
          }
          // TODO: что если сервер сам неожиданно отвалился

          instance.$handleServerEvent(eventName, ...p);
        }
      }
    );
  }

  async destroy(destroyReason: string) {
    await super.destroy(destroyReason);
    await this.common.io.off(this.serverHandlerIndex);
  }

  protected makeMatchString(instanceProps: WsServerProps): string {
    if (instanceProps.path) {
      return `${instanceProps.host}:${instanceProps.port}${instanceProps.path}`;
    }

    return `${instanceProps.host}:${instanceProps.port}`;
  }

  protected async makeInstanceProps(
    instanceProps: WsServerProps
  ): Promise<WsServerDriverProps> {
    const serverId = await this.common.io.newServer(instanceProps);
    const startedPromised = new Promised<void>();

    // TODO: use timeout
    await startedPromised;

    return {
      ...instanceProps,
      serverId,
    };
  }

  protected async destroyCb(instanceId: number): Promise<void> {
    await super.destroyCb(instanceId);
    await this.common.io.stopServer(this.instances[instanceId].serverId);
  }
}

// export class WsServerDriver2 extends DriverFactoryBase<
//   WsServerInstance,
//   WsServerProps
// > {
//   protected SubDriverClass = WsServerInstance;

//   async init(cfg?: Record<string, any>) {
//     await super.init(cfg);

//     const wsServerIo = this.ctx.io.getIo<WsServerIoFullType>(
//       IO_NAMES.WsServerIo
//     );

//     // TODO: лучше чтобы драйвер слушал один раз и раздовал по серверам
//     // TODO: отслеживать статус соединения с io
//     // TODO: отслеживать таймаут для поднятия сервера - если не получилось то повторить

//     await wsServerIo.on(
//       (eventName: WsServerEvent, serverId: string, ...p: any[]) => {
//         const instance = this.instances[serverId];

//         if (!instance) {
//           this.ctx.log.warn(`Can't find instance of Ws server "${serverId}"`);

//           return;
//         }

//         if (eventName === WsServerEvent.serverClosed) {
//           //clearTimeout(listeningTimeout)
//           instance.handleServerClose();
//         } else if (eventName === WsServerEvent.serverStarted) {
//           //clearTimeout(listeningTimeout)
//           instance.handleServerListening();
//         } else if (eventName === WsServerEvent.serverError) {
//           instance.handleServerError(p[0]);
//         } else if (eventName === WsServerEvent.newConnection) {
//           instance.handleNewConnection(p[0], p[1]);
//         }
//         // Connection
//         else if (eventName === WsServerEvent.connectionClose) {
//           instance.handleConnectionClose(p[0], p[1], p[2]);
//         } else if (eventName === WsServerEvent.connectionMessage) {
//           instance.handleIncomeMessage(p[0], p[1]);
//         } else if (eventName === WsServerEvent.connectionError) {
//           instance.handleConnectionError(p[0], p[1]);
//         } else if (eventName === WsServerEvent.connectionUnexpectedResponse) {
//           instance.handleConnectionUnexpectedResponse(p[0], p[1]);
//         }
//       }
//     );
//   }

//   protected makeInstanceId(
//     props: WsServerProps,
//     cfg?: Record<string, any>
//   ): string {
//     return `${props.host}:${props.port}`;
//   }
// }

function debugLog(system: System, ...p: any[]) {
  this.system.log.info(
    `... Starting ws server: ${this.props.host}:${this.props.port}`
  );
  this.system.log.debug(
    `... destroying websocket server: ${this.props.host}:${this.props.port}`
  );
  this.system.log.debug(
    `WsServerLogic.send from ${this.props.host}:${this.props.port} to connection ${connectionId}, data length ${data.length}`
  );
  this.system.log.debug(
    `WsServerLogic server ${this.props.host}:${this.props.port} manually closes connection ${connectionId}`
  );
  this.system.log.debug(
    `WsServerLogic server ${this.props.host}:${this.props.port} destroys connection ${connectionId}`
  );
  this.system.log.debug(
    `WsServerLogic: server ${this.props.host}:${this.props.port} started listening`
  );
  this.ctx.log.log(
    `Ws server "${this.props.host}:${this.props.port}" has been already closed, you can't manipulate it any more!`
  );
  this.ctx.log.error(
    `Error on ws server ${this.props.host}:${this.props.port}. ${err}`
  );
  this.ctx.log.debug(
    `WsServerLogic: server ${this.props.host}:${
      this.props.port
    } received a new connection ${connectionId}, ${JSON.stringify(params)}`
  );
  this.ctx.log.debug(
    `WsServerLogic connection ${connectionId} has been closed on server ${
      this.props.host
    }:${this.props.port} has been closed. Code ${code}. Reason: ${reason || ''}`
  );
  this.ctx.log.debug(
    `WsServerLogic income message on server ${this.props.host}:${this.props.port}, connection id ${connectionId}, data length ${data.length}`
  );
  this.ctx.log.error(
    `Unexpected response on ws server ${this.props.host}:${
      this.props.port
    } connection ${connectionId}. ${JSON.stringify(params)}`
  );
  this.ctx.log.error(
    `Error on ws server ${this.props.host}:${this.props.port} connection ${connectionId}. ${err}`
  );
}

// TODO: наверное прикрутить сессию чтобы считать что клиент ещё подключен
// TODO: отслежитьвать статус соединения - connected, wait, reconnect ...

// TODO: rise events
// TODO: поднимать события вместо дебаг сообщений, а их делать в отдельном менеджере
// TODO: check permissions
// TODO: можно ли установить cookie? стандартным способом?

export class WsServerInstance extends DriverInstanceBase<
  WsServerDriverProps,
  Record<string, any>
> {
  readonly events = new IndexedEventEmitter<(...args: any[]) => void>();

  get serverId(): string {
    return this.props.serverId;
  }

  async destroy() {
    await super.destroy();
    this.events.destroy();
  }

  /**
   * Send message to client
   */
  send = (connectionId: string, data: string | Uint8Array): Promise<void> => {
    return this.common.io.send(this.serverId, connectionId, data);
  };

  /**
   * Explicitly closing a connection.
   * Close event will be risen
   */
  closeConnection(
    connectionId: string,
    code: number,
    reason: string
  ): Promise<void> {
    return this.common.io.closeConnection(
      this.serverId,
      connectionId,
      code,
      reason
    );
  }

  /**
   * Listen income messages
   */
  onMessage(cb: (connectionId: string, data: Uint8Array) => void): number {
    return this.events.addListener(WsServerEvent.connectionMessage, cb);
  }

  /**
   * It rises when new connection is come.
   */
  onConnection(
    cb: (connectionId: string, request: HttpRequest) => void
  ): number {
    return this.events.addListener(WsServerEvent.newConnection, cb);
  }

  /**
   * Listen any connection close
   */
  onConnectionClose(
    cb: (connectionId: string, code?: number, reason?: string) => void
  ): number {
    return this.events.addListener(WsServerEvent.connectionClose, cb);
  }

  onConnectionError(
    cb: (connectionId: string, err: string, response?: HttpResponse) => void
  ): number {
    return this.events.addListener(WsServerEvent.connectionError, cb);
  }

  onServerError(cb: (err: string) => void): number {
    return this.events.addListener(WsServerEvent.serverError, cb);
  }

  removeListener(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }

  $handleServerEvent(eventName: WsServerEvent, ...p: any[]) {
    if (eventName === WsServerEvent.connectionUnexpectedResponse) {
      this.events.emit(
        WsServerEvent.connectionError,
        'Unexpected response',
        ...p
      );
    } else {
      // all other events
      this.events.emit(eventName, ...p);
    }
  }
}

// TODO: оно нужно ???
// async setCookie(connectionId: string, cookie: string) {
//   const data = `${SETCOOKIE_LABEL}${cookie}`;
//
//   this.ctx.log.debug(`WsServerLogic.setCookie from ${this.props.host}:${this.props.port} to connection ${connectionId}, ${data}`);
//
//   return this.wsServerIo.send(this.serverId, connectionId, data);
// }
