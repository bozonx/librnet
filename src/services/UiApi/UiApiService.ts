import { ServiceBase } from '@/system/base/ServiceBase.js'
import type { ServiceContext } from '@/system/context/ServiceContext.js'
import type { ServiceIndex } from '@/types/types.js'

// TODO: может это драйвер потому что он имеет доступ к системе

export const UiApiServiceIndex: ServiceIndex = (
  ctx: ServiceContext
): ServiceBase => {
  return new UiApiService(ctx)
}

export class UiApiService extends ServiceBase {
  constructor(ctx: ServiceContext) {
    super(ctx)
  }

  async start() {}

  async stop() {}

  async callServiceFunction(
    serviceName: string,
    funcPath: string,
    args: any[]
  ) {
    const service = this.ctx.getServiceApi(serviceName)
    if (!service) {
      throw new Error(`Service ${serviceName} not found`)
    }
    return service.callFunction(funcPath, args)
  }

  async callAppFunction(appName: string, funcPath: string, args: any[]) {
    const app = this.ctx.system.apps.getApp(appName)
    if (!app) {
      throw new Error(`App ${appName} not found`)
    }
    return app.callFunction(funcPath, args)
  }
}
