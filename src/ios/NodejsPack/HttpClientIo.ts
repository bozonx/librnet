import http, { IncomingMessage, type RequestOptions } from 'http';
import type { HttpClientIoType } from '../../types/io/HttpClientIoType.js';
import type { HttpRequest, HttpResponse } from 'squidlet-lib';
import { parseUrl } from 'squidlet-lib';
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
    return new Promise((resolve, reject) => {
      const req = http.request(
        this.prepareRequestOptions(request),
        (res: IncomingMessage) => {
          let data = '';

          console.log(`Статус: ${res.statusCode}`);

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            console.log('Ответ сервера:');
            console.log(data);
          });

          const result: HttpResponse = {
            // TODO: проверить чтобы были в kebab формате
            headers: res.headers as Record<string, any>,
            status: res.statusCode || 0,
            statusMessage: res.statusMessage || '',
            // TODO: что с body - наверное надо конвертнуть Buffer в Uint если строка то оставить
            // TODO: если стоит бинарный content-type то получать бинарно
            body: data,
          };

          resolve(result);
        }
      );

      req.write(this.prepareRequestData(request));

      req.on('error', (err) => {
        reject(new Error(err.message));
      });

      req.end();
    });
  }

  private prepareRequestOptions(request: HttpRequest): RequestOptions {
    const parsedUrl = parseUrl(request.url);

    // TODO:  suport https
    return {
      ...request,
      method: request.method.toUpperCase(),
      hostname: parsedUrl.host,
      port: parsedUrl.port,
      // TODO: проверить начинается ли с /
      path: parsedUrl.pathname,
      protocol: parsedUrl.scheme,
      auth: parsedUrl.user && `${parsedUrl.user}:${parsedUrl.password}`,
    };
  }

  private prepareRequestData(request: HttpRequest): string | Uint8Array {
    // TODO: support binary body
    return JSON.stringify(request.body);
  }
}
