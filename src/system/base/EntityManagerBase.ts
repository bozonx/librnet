import { arraysDifference } from 'squidlet-lib';
import type { System } from '../System';

export class EntityManagerBase<Item> {
  private entities: Record<string, Item> = {};

  constructor(private readonly system: System) {}

  getNames(): string[] {
    return Object.keys(this.entities);
  }

  getItem(appName: string): Item | undefined {
    return this.entities[appName];
  }

  async init() {
    if (this.system.isProdMode) {
      // TODO: load apps manifest and register apps in production mode
    }

    for (const entityName of Object.keys(this.entities)) {
      await this.initEntity(entityName);
    }
  }

  async destroy() {
    for (const appName of Object.keys(this.apps)) {
      const app = this.apps[appName];

      if (app.onDestroy) {
        this.system.log.debug(`AppManager: destroying the app "${appName}"`);
        app.status = 'destroying';
        // TODO: добавить таймаут дестроя
        try {
          await app.onDestroy(app.ctx);
          await app.ctx.destroy();

          delete this.apps[appName];
        } catch (e) {
          this.system.log.error(`App "${appName} stopping with error: ${e}"`);
          // then ignore an error
        }
      }
    }
  }

  async startAll() {
    for (const entityName of Object.keys(this.entities)) {
      await this.startEntity(entityName);
    }
  }

  protected async initEntity(entityName: string) {
    const entity = this.entities[entityName];

    if (app.onInit) {
      this.system.log.debug(`AppManager: initializing app "${appName}"`);

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

  protected async startEntity(entityName: string) {
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

  protected async stopEntity(entityName: string) {
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
      status: 'none',
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
}
