import type { AppManifest, AppOnInit } from '../../types/types.js';
import { AppContext } from '../context/AppContext.js';
import { EntityManagerBase } from '../base/EntityManagerBase.js';

export class AppsManager extends EntityManagerBase<AppContext> {
  readonly type = 'app' as const;

  /**
   * Register app in the system in development mode.
   * @param appOnInit - app on init function.
   */
  use(manifest: AppManifest, appOnInit: AppOnInit) {
    const context = new AppContext(this.system, manifest);

    this.useEntity(manifest, appOnInit, context);
  }
}
