import { EntityBaseContext } from './EntityBaseContext.js';
import type { ServiceManifest } from '../../types/types.js';
import type { ApiSet } from '../managers/EntitiesApiManager.js';
import type { EntityStatus } from '@/types/constants.js';

export class ServiceContext extends EntityBaseContext {
  get manifest(): ServiceManifest {
    return this.entityManifest as ServiceManifest;
  }

  get status(): EntityStatus {
    return this.system.services.getStatus(this.manifest.name);
  }

  registerApi(apiSet: ApiSet) {
    this.system.api.registerServiceApi(this.manifest.name, apiSet);
  }

  registerExternalApi(apiSet: ApiSet) {
    this.system.api.registerServiceExternalApi(this.manifest.name, apiSet);
  }
}
