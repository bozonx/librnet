import {
  Promised,
  IndexedEventEmitter,
  type HttpRequest,
  type HttpResponse,
} from 'squidlet-lib';
import type { DriverIndex, DriverManifest } from '../../../types/types.js';
import { IO_NAMES, SystemEvents } from '../../../types/constants.js';
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
// TODO: наверное прикрутить сессию чтобы считать что клиент ещё подключен
// TODO: отслежитьвать статус соединения - connected, wait, reconnect ...
// TODO: check permissions
// TODO: можно ли установить cookie? стандартным способом?
// TODO: отслеживать статус соединения с io
// TODO: а если сервер сам неожиданно отвалился?

export interface WsServerDriverProps extends WsServerProps {
  serverId: string;
}

export const WsServerDriverIndex: DriverIndex = (
  manifest: DriverManifest,
  system: System
) => {
  return new WsServerDriver(system, manifest) as unknown as DriverFactoryBase<
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
        // rise system event
        this.system.events.emit(
          SystemEvents.wsServer,
          eventName,
          serverId,
          ...p
        );

        const instance = this.instances.find(
          (instance) => instance.serverId === serverId
        );

        if (instance) {
          this.logToConsole(instance, eventName, ...p);
        }

        // skip listening and serverClosed events because
        //   they will be hanled on server start and destroy
        if (
          eventName === WsServerEvent.listening ||
          eventName === WsServerEvent.serverClosed
        )
          return;

        if (instance) {
          instance.$handleServerEvent(eventName, ...p);
        } else {
          this.system.log.warn(
            `WsServerDriver: Can't find instance of Ws server "${serverId}"`
          );
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

    const handlerIndex = await this.common.io.on(
      (eventName: WsServerEvent, serverId: string, ...p: any[]) => {
        if (eventName === WsServerEvent.listening) {
          startedPromised.resolve();

          this.common.io.off(handlerIndex);
        }
      }
    );

    await startedPromised;

    return {
      ...instanceProps,
      serverId,
    };
  }

  protected async destroyCb(instanceId: number): Promise<void> {
    await super.destroyCb(instanceId);
    await this.common.io.stopServer(this.instances[instanceId].serverId);
    // TODO: ожидать событие останоки сервера
  }

  protected async validateInstanceProps(
    instanceProps: WsServerProps
  ): Promise<void> {
    // TODO: проверить права на localhost и внешний сервер
    // TODO: проверить в менеджере портов что порт не занят
  }

  protected logToConsole(
    instance: WsServerInstance,
    eventName: WsServerEvent,
    ...p: any[]
  ) {
    switch (eventName) {
      case WsServerEvent.listening:
        this.system.log.info(
          `WsServerDriver: Starting ws server: ${instance.props.host}:${instance.props.port}`
        );
        break;
      case WsServerEvent.serverClosed:
        this.system.log.debug(
          `WsServerDriver: destroying websocket server: ${instance.props.host}:${instance.props.port}`
        );
        break;
      case WsServerEvent.newConnection:
        this.system.log.debug(
          `WsServerDriver: new connection on ws server ${instance.props.host}:${
            instance.props.port
          }, connection id ${p[0]}, ${JSON.stringify(p[1])}`
        );
        break;
      case WsServerEvent.connectionClose:
        this.system.log.debug(
          `WsServerDriver: connection ${p[0]} has been closed on server ${
            instance.props.host
          }:${instance.props.port} has been closed. Code ${p[1]}. Reason: ${
            p[2] || ''
          }`
        );
        break;
      case WsServerEvent.connectionMessage:
        this.system.log.debug(
          `WsServerDriver: income message on connection ${p[0]} on server ${instance.props.host}:${instance.props.port}, data length ${p[1].length}`
        );
        break;
      case WsServerEvent.connectionUnexpectedResponse:
        this.system.log.error(
          `WsServerDriver: unexpected response on connection ${
            p[0]
          } on ws server ${instance.props.host}:${
            instance.props.port
          }. ${JSON.stringify(p[1])}`
        );
        break;
      case WsServerEvent.connectionError:
        this.system.log.error(
          `WsServerDriver: error of connection ${p[0]} on ws server ${instance.props.host}:${instance.props.port}. ${p[1]}`
        );
        break;
      case WsServerEvent.serverError:
        this.system.log.error(
          `WsServerDriver: error on ws server ${instance.props.host}:${instance.props.port}. ${p[0]}`
        );
        break;
    }
  }
}

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
    this.system.log.debug(
      `WsServerInstance.send from ${this.props.host}:${this.props.port} to connection ${connectionId}, data length ${data.length}`
    );

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

  off(handlerIndex: number) {
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
