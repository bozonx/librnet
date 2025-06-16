import type { ServiceContext } from '../../system/context/ServiceContext.js';
import { ServiceBase } from '../../system/base/ServiceBase.js';
import type { ServiceIndex } from '../../types/types.js';
import { UiApiResolver } from './UiApiResolver.js';

export const AppsServiceIndex: ServiceIndex = (
  ctx: ServiceContext
): ServiceBase => {
  return new AppsService(ctx);
};

export class AppsService extends ServiceBase {
  private uiApiResolver: UiApiResolver;

  constructor(ctx: ServiceContext) {
    super(ctx);
    this.uiApiResolver = new UiApiResolver(this);
  }

  async start() {
    // TODO: нужно для ws сервера зарегистрировать свой канал
    // TODO: слушать события из канала и отправлять в UiApiService

    this.ctx.system.services
      .getServiceApi('UiApiService')
      ?.callAppFunction('testAppBackend', 'testApi', ['test1', 'test2']);
  }

  async stop() {}
}
