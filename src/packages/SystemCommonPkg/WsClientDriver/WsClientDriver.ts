import { IndexedEventEmitter, parseUrl } from 'squidlet-lib';
import { DriverFactoryBase } from '../../../system/base/DriverFactoryBase.js';
import { IO_NAMES, SystemEvents } from '../../../types/constants.js';
import type { DriverIndex, DriverManifest } from '../../../types/types.js';
import type { System } from '../../../system/System.js';
import DriverInstanceBase from '../../../system/base/DriverInstanceBase.js';
import {
  type WsClientIoFullType,
  type WsClientProps,
  WsClientEvent,
} from '../../../types/io/WsClientIoType.js';

export enum WsClientStatus {
  disconnected = 'disconnected',
  connected = 'connected',
  connecting = 'connecting',
  waitingForReconnect = 'waitingForReconnect',
}

export const STATUS_CHANGE_EVENT = 'statusChange';

export interface WsClientDriverProps extends WsClientProps {
  entityWhoAsk: string;
  reconnectTimeoutSec?: number; // 0 - unlimited
  reconnectMaxAttempts?: number; // 0 - unlimited
}

export interface WsClientDriverInstanceProps extends WsClientDriverProps {
  connectionId: string;
}

export const WsClientDriverIndex: DriverIndex = (
  manifest: DriverManifest,
  system: System
) => {
  return new WsClientDriver(system, manifest);
};

export class WsClientDriver extends DriverFactoryBase<
  WsClientInstance,
  WsClientDriverProps
> {
  readonly requireIo = [IO_NAMES.WsClientIo];
  protected SubDriverClass = WsClientInstance;

  protected common = {
    io: this.system.io.getIo<WsClientIoFullType>(IO_NAMES.WsClientIo),
  };

  private handlerIndex: number = -1;

  async init(...p: any[]) {
    await super.init(...p);

    this.handlerIndex = await this.common.io.on(
      (eventName: WsClientEvent, connectionId: string, ...p: any[]) => {
        // TODO: подсчитать количество байтов в сообщении// TODO: подсчитать количество байтов в сообщении
        // rise system event
        this.system.events.emit(
          SystemEvents.wsClient,
          eventName,
          // this.props.entityWhoAsk,
          // this.props.url,
          connectionId,
          ...p
        );

        const instance = this.instances.find(
          (instance) => instance.connectionId === connectionId
        );

        if (instance) {
          this.logToConsole(instance, eventName, ...p);
        }

        if (instance) {
          instance.$handleDriverEvent(eventName, ...p);
        } else {
          this.system.log.warn(
            `WsClientDriver: Can't find instance of Ws client "${connectionId}"`
          );
        }
      }
    );
  }

  async destroy(destroyReason: string) {
    await super.destroy(destroyReason);
    await this.common.io.off(this.handlerIndex);
  }

  protected makeMatchString(instanceProps: WsClientDriverProps): string {
    return `${instanceProps.url}`;
  }

  protected async makeInstanceProps(
    instanceProps: WsClientDriverProps
  ): Promise<WsClientDriverInstanceProps> {
    const { entityWhoAsk, ...rest } = instanceProps;
    const connectionId = await this.common.io.newConnection(rest);

    return {
      ...instanceProps,
      connectionId,
    };
  }

  protected async destroyCb(instanceId: number): Promise<void> {
    await super.destroyCb(instanceId);
    await this.common.io.close(this.instances[instanceId].connectionId);
    // TODO: ожидать событие закрытия соединения
  }

  protected async validateInstanceProps(
    instanceProps: WsClientDriverProps
  ): Promise<void> {
    await super.validateInstanceProps(instanceProps);

    const host = parseUrl(instanceProps.url).host;

    if (!host) {
      throw new Error(`Invalid url ${instanceProps.url}`);
    }

    const isPermitted = await this.system.permissions.checkPermissions(
      instanceProps.entityWhoAsk,
      this.name,
      host
    );

    if (!isPermitted) {
      // TODO: в сообщения об ошибках добавить entityWhoAsk
      throw new Error(
        `WsClientDriver: Permission for host ${host} denied for ${instanceProps.entityWhoAsk}`
      );
    }
  }

  protected logToConsole(
    instance: WsClientInstance,
    eventName: WsClientEvent,
    ...p: any[]
  ) {
    switch (eventName) {
      case WsClientEvent.open:
        this.system.log.info(`WsClientDriver: ${instance.connectionId} open`);
        break;
      case WsClientEvent.close:
        this.system.log.info(`WsClientDriver: ${instance.connectionId} close`);
        break;
      case WsClientEvent.message:
        this.system.log.info(
          `WsClientDriver: ${instance.connectionId} message ${p[0]} bytes`
        );
        break;
      case WsClientEvent.error:
        this.system.log.error(
          `WsClientDriver: ${instance.connectionId} error ${p[0]}`
        );
        break;
      case WsClientEvent.unexpectedResponse:
        this.system.log.error(
          `WsClientDriver: ${instance.connectionId} unexpected response ${p[0]}`
        );
        break;
      default:
        this.system.log.warn(
          `WsClientDriver: Unrecognized event ${eventName} on connection ${instance.connectionId}`
        );
        break;
    }
  }
}

export class WsClientInstance extends DriverInstanceBase<WsClientDriverInstanceProps> {
  readonly events = new IndexedEventEmitter<(...args: any[]) => void>();
  private _status: WsClientStatus = WsClientStatus.disconnected;

  get status(): WsClientStatus {
    return this._status;
  }

  get connectionId(): string {
    return this.props.connectionId;
  }

  /**
   * Send data to server
   * @param data - data to send
   */
  send(data: string | Uint8Array) {
    this.system.log.debug(
      `WsClientInstance.send from ${this.props.url} to connection ${this.connectionId}, data length ${data.length}`
    );

    this.common.io.send(this.connectionId, data);
  }

  /**
   * Listen income messages from server
   * @param cb - callback
   * @returns handler index
   */
  onMessage(cb: (data: string | Uint8Array) => void | Promise<void>): number {
    return this.events.addListener(WsClientEvent.message, cb);
  }

  onStatusChange(cb: (status: WsClientStatus) => void | Promise<void>): number {
    return this.events.addListener(STATUS_CHANGE_EVENT, cb);
  }

  onError(cb: (err: string) => void | Promise<void>): number {
    return this.events.addListener(WsClientEvent.error, cb);
  }

  off(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }

  $handleDriverEvent(eventName: WsClientEvent, ...p: any[]) {
    if (eventName === WsClientEvent.open) {
      this._status = WsClientStatus.connected;
      this.events.emit(STATUS_CHANGE_EVENT, this._status);
    } else if (eventName === WsClientEvent.close) {
      this.reconnect();
      this.events.emit(STATUS_CHANGE_EVENT, this._status);
      // } else if (eventName === WsClientEvent.error) {
      //   // TODO: разве на ошибку обрывается соединение?
    } else if (eventName === WsClientEvent.unexpectedResponse) {
      this.events.emit(WsClientEvent.error, 'Unexpected response', ...p);
    } else {
      // all other events
      this.events.emit(eventName, ...p);
    }
  }

  private async reconnect() {
    // TODO: add reconnect logic
    this._status = WsClientStatus.connecting;
    this.events.emit(STATUS_CHANGE_EVENT, this._status);
    await this.common.io.reconnect(this.props.url);
    // TODO: если попыток не осталось то статус должен быть disconnected
  }
}
