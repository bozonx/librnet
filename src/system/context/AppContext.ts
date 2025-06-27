import type { System } from '../System.js';
import { EntityBaseContext } from './EntityBaseContext.js';
import type { AppManifest } from '../../types/types.js';
import type { ApiSet } from '../managers/ApiManager.js';

export class AppContext extends EntityBaseContext {
  get appManifest(): AppManifest {
    return this.manifest as AppManifest;
  }

  constructor(system: System, manifest: AppManifest) {
    super(system, manifest);
  }

  async init() {
    //
  }

  async destroy() {
    //
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

// export const NOT_ALLOWED_CTX_PROPS: string[] = [
//   'appName',
//   'drivers',
//   'events',
//   'getServiceApi',
//   'getAppApi',
//   'constructor',
//   'init',
//   'destroy',
//   'registerAppUi',
// ]
// export const CTX_SUB_ITEMS = [
//   'api',
//   'appFiles',
//   'appDataLocal',
//   'cacheLocal',
//   'cfgLocal',
//   'cfgSynced',
//   'db',
//   'filesLog',
//   'tmpLocal',
//   'appUserData',
//   'homeDownloads',
//   'home',
//   'external',
//   'log',
// ];
