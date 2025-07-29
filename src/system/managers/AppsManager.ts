import { EntityManagerBase } from '@/system/base/EntityManagerBase.js'
import { AppContext } from '@/system/context/AppContext.js'
import type { AppManifest, AppOnInit } from '@/types/types.js'

export class AppsManager extends EntityManagerBase<AppContext> {
  readonly type = 'app' as const

  /**
   * Register app in the system in development mode.
   * @param appOnInit - app on init function.
   */
  use(manifest: AppManifest, appOnInit: AppOnInit) {
    if (!this.system.isDevMode)
      throw new Error(
        `You try to register an app "${manifest.name}" not in development mode`
      )

    const context = new AppContext(this.system, manifest)

    this.useEntity(manifest, appOnInit, context)
  }
}
