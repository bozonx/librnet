import { IndexedEventEmitter } from 'squidlet-lib';
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
      }
    );
  }

  async destroy(destroyReason: string) {
    await super.destroy(destroyReason);
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
