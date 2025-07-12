import {
  IndexedEventEmitter,
  Promised,
  type HttpResponse,
  type HttpRequest,
} from 'squidlet-lib';
import type { DriverIndex, DriverManifest } from '../../../types/types.js';
import DriverInstanceBase from '../../../system/base/DriverInstanceBase.js';
import { IO_NAMES, SystemEvents } from '../../../types/constants.js';
import { HttpServerEvent } from '../../../types/io/HttpServerIoType.js';
import type {
  HttpServerIoFullType,
  HttpServerProps,
} from '../../../types/io/HttpServerIoType.js';
import type { System } from '@/system/System.js';
import { DriverFactoryBase } from '@/system/base/DriverFactoryBase.js';

export interface HttpServerDriverProps extends HttpServerProps {
  entityWhoAsk: string;
}

export interface HttpServerDriverInstanceProps extends HttpServerDriverProps {
  serverId: string;
}

export const HttpServerDriverIndex: DriverIndex = (
  manifest: DriverManifest,
  system: System
) => {
  return new HttpServerDriver(system, manifest) as unknown as DriverFactoryBase<
    HttpServerInstance,
    Record<string, any>
  >;
};

export class HttpServerDriver extends DriverFactoryBase<
  HttpServerInstance,
  HttpServerProps
> {
  readonly requireIo = [IO_NAMES.HttpServerIo];
  protected SubDriverClass = HttpServerInstance;

  protected common = {
    io: this.system.io.getIo<HttpServerIoFullType>(IO_NAMES.HttpServerIo),
  };

  private serverHandlerIndex: number = -1;

  async init(...p: any[]) {
    await super.init(...p);

    this.serverHandlerIndex = await this.common.io.on(
      (eventName: HttpServerEvent, serverId: string, ...p: any[]) => {
        // rise system event
        this.system.events.emit(
          SystemEvents.httpServer,
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
          eventName === HttpServerEvent.listening ||
          eventName === HttpServerEvent.serverClosed
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

  protected makeMatchString(instanceProps: HttpServerDriverProps): string {
    return `${instanceProps.host}:${instanceProps.port}`;
  }

  protected async makeInstanceProps(
    instanceProps: HttpServerDriverProps
  ): Promise<HttpServerDriverInstanceProps> {
    const { entityWhoAsk, ...rest } = instanceProps;
    const serverId = await this.common.io.newServer(rest);
    const startedPromised = new Promised<void>();

    // TODO: use timeout

    const handlerIndex = await this.common.io.on(
      (eventName: HttpServerEvent, serverId: string, ...p: any[]) => {
        if (eventName === HttpServerEvent.listening) {
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
    instanceProps: HttpServerDriverProps
  ): Promise<void> {
    await super.validateInstanceProps(instanceProps);

    if (
      instanceProps.host === 'localhost' ||
      instanceProps.host === '127.0.0.1'
    ) {
      const isPermitted = await this.system.permissions.checkPermissions(
        instanceProps.entityWhoAsk,
        this.name,
        'localhost'
      );

      if (!isPermitted) {
        throw new Error('Permission for localhost denied');
      }
    } else {
      const isPermitted = await this.system.permissions.checkPermissions(
        instanceProps.entityWhoAsk,
        this.name,
        '0.0.0.0'
      );

      if (!isPermitted) {
        throw new Error('Permission for 0.0.0.0 denied');
      }
    }

    if (await this.system.ports.isTcpPortFree(instanceProps.port)) {
      throw new Error(`TCP port ${instanceProps.port} is already in use`);
    }
  }

  protected logToConsole(
    instance: HttpServerInstance,
    eventName: HttpServerEvent,
    ...p: any[]
  ) {
    switch (eventName) {
      case HttpServerEvent.listening:
        this.system.log.info(
          `HttpServerDriver: Starting http server: ${instance.props.host}:${instance.props.port}`
        );
        break;
      case HttpServerEvent.serverClosed:
        this.system.log.info(
          `HttpServerDriver: destroying http server: ${instance.props.host}:${instance.props.port}`
        );
        break;
      case HttpServerEvent.serverError:
        this.system.log.error(
          `HttpServerDriver: error on http server ${instance.props.host}:${instance.props.port}. ${p[0]}`
        );
        break;
      case HttpServerEvent.request:
        this.system.log.debug(
          `HttpServerDriver: new request id ${p[0]} on http server ${
            instance.props.host
          }:${instance.props.port}. ${JSON.stringify(p[1])}`
        );
        break;
    }
  }
}

export class HttpServerInstance extends DriverInstanceBase<HttpServerDriverInstanceProps> {
  readonly events = new IndexedEventEmitter<(...args: any[]) => void>();

  get serverId(): string {
    return this.props.serverId;
  }

  async destroy() {
    await super.destroy();
    this.events.destroy();
  }

  /**
   * Send response to client after you have handled a request.
   * @param requestId - request id
   * @param response - response
   */
  async sendResponse(requestId: number, response: HttpResponse) {
    await this.common.io.sendResponse(this.serverId, requestId, response);
  }

  /**
   * Listen new request.
   * You have to call sendResponse after you have handled a request.
   * @param cb - callback
   * @returns handler index
   */
  onRequest(
    cb: (requestId: number, request: HttpRequest) => void | Promise<void>
  ): number {
    return this.events.addListener(HttpServerEvent.request, cb);
  }

  onServerError(cb: (err: string) => void | Promise<void>): number {
    return this.events.addListener(HttpServerEvent.serverError, cb);
  }

  off(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }

  $handleServerEvent(eventName: HttpServerEvent, ...p: any[]) {
    this.events.emit(eventName, ...p);
  }
}
