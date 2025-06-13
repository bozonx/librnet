import type { HttpClientIoType } from '../../types/io/HttpClientIoType.js';
import type { HttpRequest, HttpResponse } from 'squidlet-lib';
import { IoBase } from '../../system/base/IoBase.js';
import type { IoIndex } from '../../types/types.js';
import type { IoContext } from '../../system/context/IoContext.js';
import type { IoSetBase } from '@/system/base/IoSetBase.js';

export const HttpClientIoIndex: IoIndex = (
  ioSet: IoSetBase,
  ctx: IoContext
) => {
  return new HttpClientIo(ioSet, ctx);
};

export class HttpClientIo extends IoBase implements HttpClientIoType {
  name = 'HttpClientIo';

  async request(request: HttpRequest): Promise<HttpResponse> {
    const res = await fetch(request.url, {
      method: request.method,
      body: this.prepareRequestData(request),
      headers: request.headers,
    });

    return {
      headers: res.headers as Record<string, any>,
      status: res.status,
      statusMessage: res.statusText,
      // TODO: support binary body
      body: await res.text(),
      bodyUsed: res.bodyUsed,
      ok: res.ok,
      redirected: res.redirected,
      type: res.type,
    };
  }

  private prepareRequestData(request: HttpRequest): string | Uint8Array {
    // TODO: support binary body
    return JSON.stringify(request.body);
  }
}
