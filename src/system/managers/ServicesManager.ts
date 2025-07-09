import type { ServiceIndex } from '../../types/types.js';
import { EntityManagerBase } from '../base/EntityManagerBase.js';
import type { ServiceContext } from '../context/ServiceContext.js';

export class ServicesManager extends EntityManagerBase<ServiceContext> {
  /**
   * Register service in the system in development mode.
   * @param serviceIndex - service index function.
   */
  use(serviceIndex: ServiceIndex) {
    this.useEntity(serviceIndex);
  }
}
