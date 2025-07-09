import { EntityBaseContext } from './EntityBaseContext.js';
import type { AppManifest } from '../../types/types.js';
import type { ApiSet } from '../managers/EntitiesApiManager.js';
import type { EntityStatus } from '@/types/constants.js';

export class AppContext extends EntityBaseContext {
  get manifest(): AppManifest {
    return this.entityManifest as AppManifest;
  }

  get status(): EntityStatus {
    return this.system.apps.getStatus(this.manifest.name);
  }

  registerUiApi(apiSet: ApiSet) {
    this.system.api.registerAppUiApi(this.manifest.name, apiSet);
  }

  registerApi(apiSet: ApiSet) {
    this.system.api.registerAppApi(this.manifest.name, apiSet);
  }

  registerExternalApi(apiSet: ApiSet) {
    this.system.api.registerAppExternalApi(this.manifest.name, apiSet);
  }
}
