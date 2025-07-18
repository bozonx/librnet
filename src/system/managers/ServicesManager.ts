import type { ServiceManifest, ServiceOnInit } from '../../types/types.js';
import { EntityManagerBase } from '../base/EntityManagerBase.js';
import { ServiceContext } from '../context/ServiceContext.js';

export class ServicesManager extends EntityManagerBase<ServiceContext> {
  readonly type = 'service' as const;

  /**
   * Register service in the system in development mode.
   * @param serviceOnInit - service on init function.
   */
  use(manifest: ServiceManifest, serviceOnInit: ServiceOnInit) {
    const context = new ServiceContext(this.system, manifest);

    this.useEntity(manifest, serviceOnInit, context);
  }
}
