import { trimChar, splitFirstElement } from 'squidlet-lib';

export interface RequestCatcherContext {
  // This is path to function of channel, not the full path of request
  path: string;
  fullPath: string;
  query: Record<string, string>;
  meta: Record<string, string>;
  // TODO: supoort binary body
  body?: string | Uint8Array | undefined;
  response: {
    status: number;
    statusMessage: string;
    meta: Record<string, string>;
    errors?: string[];
    // TODO: supoort binary body
    body?: string | Uint8Array | undefined;
  };
}

export class RequestCatcher {
  private middlewares: Record<
    string,
    ((ctx: RequestCatcherContext) => Promise<void>)[]
  > = {};

  async run(context: Omit<RequestCatcherContext, 'path'>) {
    const preparedFullPath = trimChar(context.fullPath, '/');
    const [pathChannel, restPath] = splitFirstElement(preparedFullPath, '/');

    const channelContext: RequestCatcherContext = {
      ...context,
      path: restPath || '',
    };

    for (const middleware of this.middlewares[pathChannel] || []) {
      await middleware(channelContext);
    }
  }

  useChannel(
    channelName: string,
    middleware: (ctx: RequestCatcherContext) => Promise<void>
  ) {
    this.middlewares[channelName] = [
      ...(this.middlewares[channelName] || []),
      middleware,
    ];
  }
}
