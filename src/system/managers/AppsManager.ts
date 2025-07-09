import type { AppIndex } from '../../types/types.js';
import type { AppContext } from '../context/AppContext.js';
import { EntityManagerBase } from '../base/EntityManagerBase.js';

export class AppsManager extends EntityManagerBase<AppContext> {
  /**
   * Register app in the system in development mode.
   * @param appIndex - app index function.
   */
  use(appIndex: AppIndex) {
    this.useEntity(appIndex);
  }
}
