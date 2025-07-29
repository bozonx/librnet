import type { HttpRequest, HttpResponse } from 'squidlet-lib'

import type { IoBase } from '../../system/base/IoBase'

export interface HttpClientIoType {
  request(request: HttpRequest): Promise<HttpResponse>
}

export type HttpClientFullIoType = HttpClientIoType & IoBase
