import { trimChar, splitFirstElement } from 'squidlet-lib';

export interface RequestCatcherContext {
  // This is path to function of channel, not the full path of request
  path: string;
  fullPath: string;
  args?: any[];
  meta?: Record<string, string>;
  data?: any | Uint8Array;
  response: {
    status: number;
    statusMessage?: string;
    meta?: Record<string, string>;
    errors?: string[];
    // success result
    result?: any | Uint8Array;
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
