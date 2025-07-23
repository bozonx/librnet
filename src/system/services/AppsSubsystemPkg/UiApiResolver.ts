import type { AppsService } from './AppsService';

// function channnelRouterMiddleware(channelName: string) {
//   return async (ctx: RequestCatcherContext) => {
//     const router = new ChannelRouter(ctx);
//   };
// }

export class UiApiResolver {
  private appsService: AppsService;

  constructor(appsService: AppsService) {
    this.appsService = appsService;
  }

  async callFunction(path: string, args: any[]) {
    const app = this.appsService.ctx.getApp(path);
    if (!app) {
      throw new Error(`App ${path} not found`);
    }
    return app.callFunction(path, args);
  }
}
