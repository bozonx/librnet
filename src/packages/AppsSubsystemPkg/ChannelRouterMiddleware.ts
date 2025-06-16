import type { RequestCatcherContext } from './RequestCatcher';

function channnelRouterMiddleware(channelName: string) {
  return async (ctx: RequestCatcherContext) => {
    const router = new ChannelRouter(ctx);
  };
}

export class ChannelRouter {
  constructor(ctx: RequestCatcherContext) {}

  async run() {}
}
