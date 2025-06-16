import type { ServiceIndex } from '@/types/types.js';
import type { ServiceContext } from '@/system/context/ServiceContext.js';
import { ServiceBase } from '@/system/base/ServiceBase.js';

export const SystemApiServiceIndex: ServiceIndex = (
  ctx: ServiceContext
): ServiceBase => {
  return new SystemApiService(ctx);
};

export class SystemApiService extends ServiceBase {
  constructor(ctx: ServiceContext) {
    super(ctx);
  }

  async start() {}

  async stop() {}
}
