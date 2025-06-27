import type { System } from '../System.js';
import { AppContext } from '../context/AppContext.js';
import type { AppIndex, EntityItem, AppMain } from '../../types/types.js';

export interface AppItem extends EntityItem, AppMain {
  ctx: AppContext;
}

export class AppsManager {
  private readonly system: System;
  private apps: Record<string, AppItem> = {};

  constructor(system: System) {
    this.system = system;
  }

  async init() {
    if (this.system.isProdMode) {
      // TODO: load apps manifest and register apps in production mode
    }

    for (const appName of Object.keys(this.apps)) {
      await this.initApp(appName);
    }
  }

  async startAll() {
    for (const appName of Object.keys(this.apps)) {
      await this.startApp(appName);
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

  getAppNames(): string[] {
    return Object.keys(this.apps);
  }

  getAppItem(appName: string): AppItem | undefined {
    return this.apps[appName];
  }

  async initApp(appName: string) {
    const app = this.apps[appName];

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

  async startApp(appName: string) {
    this.system.log.debug(`AppManager: starting app "${appName}"`);

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

  async stopApp(appName: string) {
    this.system.log.debug(`AppManager: stopping app "${appName}"`);

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
  useApp(appIndex: AppIndex) {
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
}
