import type { HttpRequest, HttpResponse } from 'squidlet-lib'

import { IoBase } from '@/system/base/IoBase.js'
import type { HttpClientIoType } from '@/types/io/HttpClientIoType.js'
import type { IoContext, IoIndex } from '@/types/types.js'

export const HttpClientIoIndex: IoIndex = (ctx: IoContext) => {
  return new HttpClientIo(ctx)
}

export class HttpClientIo extends IoBase implements HttpClientIoType {
  async request(request: HttpRequest): Promise<HttpResponse> {
    const res = await fetch(request.url, {
      method: request.method,
      body: this.prepareRequestData(request),
      headers: request.headers,
    })

    return {
      headers: res.headers as Record<string, any>,
      statusCode: res.status,
      statusMessage: res.statusText,
      // TODO: support binary body
      body: await res.text(),
      bodyUsed: res.bodyUsed,
      ok: res.ok,
      redirected: res.redirected,
      type: res.type,
    }
  }

  private prepareRequestData(request: HttpRequest): string | Uint8Array {
    // TODO: support binary body
    return JSON.stringify(request.body)
  }
}
