import { EntityBaseContext } from './EntityBaseContext.js';
import type { AppManifest } from '../../types/types.js';
import type { ApiSet } from '../managers/EntitiesApiManager.js';

export class AppContext extends EntityBaseContext {
  get appManifest(): AppManifest {
    return this.manifest as AppManifest;
  }

  registerUiApi(apiSet: ApiSet) {
    this.system.api.registerAppUiApi(this.manifest.name, apiSet);
  }

  registerIntranetApi(apiSet: ApiSet) {
    this.system.api.registerAppIntranetApi(this.manifest.name, apiSet);
  }

  registerExternalApi(apiSet: ApiSet) {
    this.system.api.registerServiceIntranetApi(this.manifest.name, apiSet);
  }
}
