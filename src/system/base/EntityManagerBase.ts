import { arraysDifference } from 'squidlet-lib';
import type { System } from '../System';
import type { EntityStatus } from '../../types/constants.js';
import type { EntityMain } from '../../types/types.js';
import type { EntityBaseContext } from '../context/EntityBaseContext.js';

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

export class EntityManagerBase<Context extends EntityBaseContext> {
  private entities: Record<string, EntityMain<Context>> = {};
  private statuses: Record<string, EntityStatus> = {};

  constructor(private readonly system: System) {}

  getNames(): string[] {
    return Object.keys(this.entities);
  }

  getItem(entityName: string): EntityMain<Context> | undefined {
    return this.entities[entityName];
  }

  getStatus(entityName: string): EntityStatus {
    return this.statuses[entityName];
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
    if (this.statuses[entityName] !== 'loaded') {
      this.system.log.warn(
        `EntityManager: entity "${entityName}" has been already initialized`
      );
      return;
    }

    const entity = this.entities[entityName];

    if (app.onInit) {
      this.system.log.debug(`AppManager: initializing app "${appName}"`);

      // TODO: статус навеное надо хранить отдльно
      app.status = 'initializing';

      try {
        await app.ctx.init();
        await app.onInit(app.ctx);
      } catch (e) {
        this.system.log.error(
          `AppManager: app's "${appName}" start error: ${e}`
        );

        app.status = 'initError';

        return;
      }

      app.status = 'initialized';
    }
  }

  /**
   * Destroy entity on system destroy or uninstall
   */
  async destroyEntity(entityName: string) {
    const entity = this.entities[entityName];

    if (entity.onDestroy) {
      this.system.log.debug(`EntityManager: destroying "${entityName}"`);
      this.changeStatus(entityName, 'destroying');
      // TODO: добавить таймаут дестроя
      try {
        await entity.onDestroy(entity.ctx);
        await entity.ctx.destroy();

        delete this.entities[entityName];
        delete this.statuses[entityName];
      } catch (e) {
        this.system.log.error(`${entityName} destroyed with error: ${e}`);
        // then ignore an error
      }
    }
  }

  async startEntity(entityName: string) {
    // TODO: пропустить если уже запущен
    this.system.log.debug(`AppManager: starting app "${entityName}"`);

    // TODO: add timeout
    // TODO: import app code or get from this.apps
    const app = this.apps[appName];

    app.status = 'starting';

    if (app.onStart) {
      try {
        await app.onStart(app.ctx);
      } catch (e) {
        this.system.log.error(
          `AppManager: app's "${appName}" start error: ${e}`
        );

        app.status = 'initError';

        return;
      }
    }

    app.status = 'started';
  }

  async stopEntity(entityName: string) {
    // TODO: пропустить если уже остановлен
    this.system.log.debug(`AppManager: stopping app "${entityName}"`);

    // TODO: add timeout
    const app = this.apps[appName];

    app.status = 'stopping';

    if (app.onStop) {
      try {
        await app.onStop(app.ctx);
      } catch (e) {
        this.system.log.error(
          `AppManager: app's "${appName}" stop error: ${e}`
        );

        app.status = 'stopError';

        return;
      }
    }

    app.status = 'stopped';
  }

  /**
   * Register app in the system in development mode.
   * @param appIndex - app index function.
   */
  useEntity(appIndex: AppIndex) {
    // TODO: пропустить если уже зарегистрирован
    const appMain = appIndex();
    const appName: string = appMain.manifest.name;

    if (this.apps[appName]) {
      this.system.log.warn(
        `Can't register app "${appName}" because it has been already registered`
      );

      return;
    }

    this.apps[appName] = {
      ...appMain,
      ctx: new AppContext(this.system, appName),
      status: 'loaded',
    };
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

  protected changeStatus(entityName: string, newStatus: EntityStatus) {
    this.statuses[entityName] = newStatus;
    // TODO: может разделять по типу всетаки
    this.system.events.emit(entityName, newStatus);
  }
}
