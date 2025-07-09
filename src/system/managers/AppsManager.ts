import { AppContext } from '../context/AppContext.js';
import type { AppIndex, EntityItem, AppMain } from '../../types/types.js';
import { EntityManagerBase } from '../base/EntityManagerBase.js';

export interface AppItem extends EntityItem, AppMain {
  ctx: AppContext;
}

export class AppsManager extends EntityManagerBase<AppItem> {
  async initApp(appName: string) {
    await this.initEntity(appName);
  }

  async startApp(appName: string) {
    await this.startEntity(appName);
  }

  async stopApp(appName: string) {
    await this.stopEntity(appName);
  }

  /**
   * Register app in the system in development mode.
   * @param appIndex - app index function.
   */
  useApp(appIndex: AppIndex) {
    this.useEntity(appIndex);
  }
}
