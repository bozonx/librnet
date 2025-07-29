import { EntityBaseContext } from './EntityBaseContext.js'
import type { ApiSet } from '@/system/managers/EntitiesApiManager.js'
import type { EntityStatus } from '@/types/constants.js'
import type { AppManifest } from '@/types/types.js'

export class AppContext extends EntityBaseContext {
  readonly type = 'app' as const

  get manifest(): AppManifest {
    return this.entityManifest as AppManifest
  }

  get status(): EntityStatus {
    return this.system.app.getStatus(this.manifest.name)
  }

  registerUiApi(apiSet: ApiSet) {
    this.system.api.registerAppUiApi(this.manifest.name, apiSet)
  }

  registerApi(apiSet: ApiSet) {
    this.system.api.registerAppApi(this.manifest.name, apiSet)
  }

  registerExternalApi(apiSet: ApiSet) {
    this.system.api.registerAppExternalApi(this.manifest.name, apiSet)
  }
}
