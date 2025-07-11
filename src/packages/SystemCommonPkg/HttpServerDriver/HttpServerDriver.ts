import { IndexedEventEmitter, Promised } from 'squidlet-lib';
import type { DriverIndex, DriverManifest } from '../../../types/types.js';
import DriverInstanceBase from '../../../system/base/DriverInstanceBase.js';
import { IO_NAMES, SystemEvents } from '../../../types/constants.js';
import { HttpServerEvent } from '../../../types/io/HttpServerIoType.js';
import type {
  HttpServerIoFullType,
  HttpServerProps,
} from '../../../types/io/HttpServerIoType.js';
import type {
  HttpDriverRequest,
  HttpDriverResponse,
} from './HttpServerDriverLogic.js';
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

  // TODO: add  logToConsole
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

  // TODO: review
  onRequest(
    cb: (request: HttpDriverRequest) => Promise<HttpDriverResponse>
  ): number {
    if (!this.logic) throw new Error(`HttpServer.onMessage: ${this.onRequest}`);

    return this.logic.onRequest(cb);
  }

  onServerError(cb: (err: string) => void): number {
    return this.events.addListener(HttpServerEvent.serverError, cb);
  }

  off(handlerIndex: number) {
    this.events.removeListener(handlerIndex);
  }

  $handleServerEvent(eventName: HttpServerEvent, ...p: any[]) {
    this.events.emit(eventName, ...p);
  }
}
