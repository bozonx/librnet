import { IO_NAMES } from '../../../types/constants.js';
import { DriverFactoryBase } from '../../base/DriverFactoryBase.js';
import { System } from '../../System.js';
import { parseUrl, type HttpRequest, type HttpResponse } from 'squidlet-lib';
import type { HttpClientFullIoType } from '../../../types/io/HttpClientIoType.js';
import type { DriverIndex, DriverManifest } from '../../../types/types.js';
import DriverInstanceBase from '../../base/DriverInstanceBase.js';

export interface HttpClientDriverProps {
  entityWhoAsk: string;
}

// TODO: rise system events httpClient

export const WsClientDriverIndex: DriverIndex = (
  manifest: DriverManifest,
  system: System
) => {
  return new HttpClientDriver(system, manifest);
};

export class HttpClientDriver extends DriverFactoryBase<
  HttpClientInstance,
  HttpClientDriverProps
> {
  readonly requireIo = [IO_NAMES.HttpClientIo];
  protected SubDriverClass = HttpClientInstance;

  protected common = {
    io: this.system.io.getIo<HttpClientFullIoType>(IO_NAMES.HttpClientIo),
  };

  protected makeMatchString(instanceProps: HttpClientDriverProps): string {
    return `${instanceProps.entityWhoAsk}`;
  }
}

export class HttpClientInstance extends DriverInstanceBase<HttpClientDriverProps> {
  async request(request: HttpRequest): Promise<HttpResponse> {
    const host = parseUrl(request.url).host;

    if (!host) {
      throw new Error(`Invalid url ${request.url}`);
    }

    const isPermitted = await this.system.permissions.checkPermissions(
      this.props.entityWhoAsk,
      this.driverFactory.name,
      host
    );

    if (!isPermitted) {
      throw new Error(
        `HttpClientDriver: Permission for host ${host} denied for ${this.props.entityWhoAsk}`
      );
    }

    return this.common.io.request(request);
  }
}
