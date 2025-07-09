import { arraysDifference } from 'squidlet-lib';
import type { System } from '../System';
import type { EntityStatus } from '../../types/constants.js';
import type { EntityManifest } from '../../types/types.js';
import type { EntityBaseContext } from '../context/EntityBaseContext.js';

// TODO: use status fallen
// TODO: rise events on status change
// TODO: в required может быть зацикленная зависимость - тогда
//       переводить в ошибочный сетйт и не запускать

// export const SERVICE_DESTROY_REASON = {
//   noDependencies: 'noDependencies',
//   systemDestroying: 'systemDestroying',
// };

// export const SERVICE_TYPES = {
//   service: 'service',
//   target: 'target',
//   oneshot: 'oneshot', // может быть таймаут запуска
//   interval: 'interval', // переодично запускается типа cron
// };

// export const SERVICE_TARGETS = {
//   // only for system low level services
//   root: 'root',
//   // for not system services
//   systemInitialized: 'systemInitialized',
// };

enum ENTITY_POSITIONS {
  manifest,
  onInit,
  context,
  status,
}

export class EntityManagerBase<Context extends EntityBaseContext> {
  private entities: Record<
    string,
    [EntityManifest, (ctx: Context) => Promise<void>, Context, EntityStatus]
  > = {};

  constructor(protected readonly system: System) {}

  getNames(): string[] {
    return Object.keys(this.entities);
  }

  getContext(entityName: string): Context | undefined {
    return this.entities[entityName][ENTITY_POSITIONS.context];
  }

  getStatus(entityName: string): EntityStatus {
    return this.entities[entityName][ENTITY_POSITIONS.status];
  }

  /**
   * On system init
   */
  async init() {
    if (this.system.isProdMode) {
      // TODO: load apps manifest and register apps in production mode
    }

    for (const entityName of Object.keys(this.entities)) {
      await this.initEntity(entityName);
    }
  }

  /**
   * On system destroy
   */
  async destroy() {
    for (const entityName of Object.keys(this.entities)) {
      await this.destroyEntity(entityName);
    }
  }

  async startAll() {
    for (const entityName of Object.keys(this.entities)) {
      await this.startEntity(entityName);
    }
  }

  /**
   * On system init or install
   */
  async initEntity(entityName: string) {
    if (this.getStatus(entityName) !== 'loaded') {
      this.system.log.warn(
        `EntityManager: entity "${entityName}" has been already initialized`
      );
      return;
    } else if (!this.entities[entityName]) {
      this.system.log.warn(
        `EntityManager: entity "${entityName}" has not been registered`
      );
      return;
    }

    const [, entityIndex, context] = this.entities[entityName];

    this.system.log.debug(`EntityManager: initializing entity "${entityName}"`);
    this.setStatus(entityName, 'initializing');

    try {
      await context.init();
      await entityIndex(context);
    } catch (e) {
      this.system.log.error(
        `EntityManager: entity "${entityName}" initialization error: ${e}`
      );
      this.setStatus(entityName, 'initError', String(e));
      return;
    }

    this.setStatus(entityName, 'initialized');
  }

  /**
   * Destroy entity on system destroy or uninstall
   */
  async destroyEntity(entityName: string) {
    const [, , context] = this.entities[entityName];

    this.system.log.debug(`EntityManager: destroying "${entityName}"`);
    this.setStatus(entityName, 'destroying');
    // TODO: добавить таймаут дестроя
    try {
      await context.$getHooks().onDestroy();
      await context.destroy();

      delete this.entities[entityName];
    } catch (e) {
      this.system.log.error(`${entityName} destroyed with error: ${e}`);
    }
  }

  async startEntity(entityName: string) {
    if (this.getStatus(entityName) === 'starting') {
      return this.system.log.warn(
        `EntityManager: entity "${entityName}" is already starting`
      );
    } else if (this.getStatus(entityName) === 'running') {
      return this.system.log.warn(
        `EntityManager: entity "${entityName}" has been already started`
      );
    }

    this.system.log.debug(`EntityManager: starting entity "${entityName}"`);
    this.setStatus(entityName, 'starting');

    // TODO: add timeout

    const [, , context] = this.entities[entityName];
    try {
      await context.$getHooks().onStart();
    } catch (e) {
      this.system.log.error(
        `EntityManager: entity "${entityName}" start error: ${e}`
      );
      this.setStatus(entityName, 'startError', String(e));

      return;
    }

    this.setStatus(entityName, 'running');
  }

  async stopEntity(entityName: string) {
    if (this.getStatus(entityName) === 'stopping') {
      return this.system.log.warn(
        `EntityManager: entity "${entityName}" is already stopping`
      );
    } else if (this.getStatus(entityName) === 'stopped') {
      return this.system.log.warn(
        `EntityManager: entity "${entityName}" has been already stopped`
      );
    }

    this.system.log.debug(`EntityManager: stopping entity "${entityName}"`);
    this.setStatus(entityName, 'stopping');

    // TODO: add timeout

    const [, , context] = this.entities[entityName];

    try {
      await context.$getHooks().onStop();
    } catch (e) {
      this.system.log.error(
        `EntityManager: entity "${entityName}" stop error: ${e}`
      );

      this.setStatus(entityName, 'stopError', String(e));

      return;
    }

    this.setStatus(entityName, 'stopped');
  }

  /**
   * Register entity in the system in development mode.
   * @param manifest - entity manifest.
   * @param entityIndex - entity index function.
   */
  useEntity(
    manifest: EntityManifest,
    entityIndex: (ctx: Context) => Promise<void>,
    context: Context
  ) {
    if (this.entities[manifest.name]) {
      return this.system.log.warn(
        `EntityManager: entity "${manifest.name}" has been already loaded`
      );
    }

    this.entities[manifest.name] = [manifest, entityIndex, context, 'loaded'];
  }

  protected async checkDriverDependencies(serviceName: string, reason: string) {
    // if (app.requireDriver) {
    //   const found: string[] = this.system.drivers.getNames().filter((el) => {
    //     if (app.requireDriver?.includes(el)) return true;
    //   });

    //   if (found.length !== app.requireDriver.length) {
    //     this.system.log.warn(
    //       `Application "${appName}" hasn't meet a dependency drivers "${app.requireDriver.join(
    //         ', '
    //       )}"`
    //     );
    //     // do not register the app if it doesn't meet his dependencies
    //     delete this.apps[appName];

    //     return;
    //   }
    // }

    if (service.props.requireDriver) {
      const found: string[] = this.ctx.drivers.getNames().filter((el) => {
        if (service.props.requireDriver?.includes(el)) return true;
      });

      if (found.length !== service.props.requireDriver.length) {
        await this.refuseInitService(
          serviceName,
          `No drivers: ${arraysDifference(
            found,
            service.props.requireDriver
          ).join()}`
        );

        continue;
      }
    }
  }

  protected checkServiceDependencies() {
    if (service.props.required) {
      const found: string[] = this.getNames().filter((el) => {
        if (service.props.required?.includes(el)) return true;
      });

      if (found.length !== service.props.required.length) {
        await this.refuseInitService(
          serviceName,
          `No services: ${arraysDifference(
            found,
            service.props.required
          ).join()}`
        );

        continue;
      }
    }
  }

  private async refuseInitService(serviceName: string, reason: string) {
    await this.services[serviceName].destroy?.(
      SERVICE_DESTROY_REASON.noDependencies as ServiceDestroyReason
    );
    // do not register the driver if ot doesn't meet his dependencies
    delete this.services[serviceName];
    // service will be deleted but status was saved
    this.changeStatus(
      serviceName,
      SERVICE_STATUS.noDependencies as ServiceStatus
    );
    this.ctx.log.error(
      `Failed initializing service "${serviceName}": ${reason}`
    );
  }

  protected setStatus(
    entityName: string,
    newStatus: EntityStatus,
    details?: any
  ) {
    this.statuses[entityName] = newStatus;
    // TODO: может разделять по типу всетаки
    this.system.events.emit(entityName, newStatus, details);
  }
}
