import type {HttpRequest, HttpResponse} from 'squidlet-lib'


export interface HttpClientIoType {
  request(request: HttpRequest): Promise<HttpResponse>;
}
