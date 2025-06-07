import type { System } from '../System.js';
import { AppContext } from '../context/AppContext.js';
import type { AppBase } from '../base/AppBase.js';
import type { AppIndex } from '../../types/types.js';
import { pathJoin } from 'squidlet-lib';
import {
  APP_SUB_DIRS,
  DRIVER_NAMES,
  ROOT_DIRS,
  SYSTEM_SUB_DIRS,
} from '@/types/constants.js';
import type { FilesDriverType } from '@/types/FilesDriverType.js';
import type { DriverBase } from '@/system/base/DriverBase.js';

export class AppsManager {
  private readonly system: System;
  private apps: Record<string, AppBase> = {};

  constructor(system: System) {
    this.system = system;
  }

  async init() {
    if (this.system.isProdMode) {
      // TODO: load apps manifest and register apps in production mode
    }

    for (const appName of Object.keys(this.apps)) {
      const app = this.apps[appName];

      await this._initApp(app, appName);
    }
  }

  async startAll() {
    for (const appName of Object.keys(this.apps)) {
      const app = this.apps[appName];
      await this._initApp(app, appName);
    }
  }

  async destroy() {
    for (const appName of Object.keys(this.apps)) {
      const app = this.apps[appName];

      if (app.stop) {
        this.system.log.debug(`AppManager: stopping the app "${appName}"`);

        // TODO: добавить таймаут дестроя

        try {
          await app.stop();
          await app.ctx.destroy();
        } catch (e) {
          this.system.log.error(`App "${appName} stopping with error: ${e}"`);
          // then ignore an error
        }
      }
    }
  }

  // $getApp<T extends AppBase>(appName: string): T | undefined {
  //   return this.apps[appName] as T;
  // }

  // getAppApi<T = Record<string, any>>(appName: string): T | undefined {
  //   return this.apps[appName]?.getApi?.();
  // }

  getAppNames(): string[] {
    return Object.keys(this.apps);
  }

  startApp(appName: string) {
    // TODO: add timeout
    // TODO: check status of app
    // TODO: import app code or get from this.apps
    const app = this.apps[appName];
    if (app.start) {
      app.start();
    }
  }

  stopApp(appName: string) {
    // TODO: add timeout
    // TODO: check status of app
    const app = this.apps[appName];
    if (app.stop) {
      app.stop();
    }
  }

  /**
   * Install app from package to system.
   * @param appName - app name.
   * @param packagePath - path to app package.
   */
  async installApp(appName: string, packagePath: string): Promise<void> {
    // TODO: add timeout

    const appDestDir = pathJoin(
      this.system.configs.systemCfg.rootDir,
      ROOT_DIRS.system,
      SYSTEM_SUB_DIRS.apps,
      appName
    );
    const appDataDir = pathJoin(
      this.system.configs.systemCfg.rootDir,
      ROOT_DIRS.appsData,
      appName
    );

    const filesDriver = this.system.drivers.getDriver<
      FilesDriverType & DriverBase
    >(DRIVER_NAMES.FilesDriver);

    if (await filesDriver.isExists(appDestDir)) {
      throw new Error(`App "${appName}" already installed`);
    }

    // TODO: copy from archive
    //await filesDriver?.copyDirContent(srcDir, appDestDir);

    // create app data dirs
    for (const subDir of Object.values(APP_SUB_DIRS)) {
      await filesDriver.mkDirP(pathJoin(appDataDir, subDir));
    }

    const app = this.apps[appName];
    if (app.afterInstall) {
      app.afterInstall(false);
    }
  }

  /**
   * Register app in system in development mode.
   * @param appIndex - app index function.
   */
  useApp(appIndex: AppIndex) {
    const appInstance = appIndex();
    const appName: string = appInstance.myName;

    if (this.apps[appName]) {
      throw new Error(
        `Can't register app "${appName}" because it has already registered`
      );
    }

    const appContext = new AppContext(this.system, appName);

    appInstance.$setCtx(appContext);

    this.apps[appName] = appInstance;
  }

  async _initApp(app: AppBase, appName: string) {
    if (app.requireDriver) {
      const found: string[] = this.system.drivers.getNames().filter((el) => {
        if (app.requireDriver?.includes(el)) return true;
      });

      if (found.length !== app.requireDriver.length) {
        this.system.log.warn(
          `Application "${appName}" hasn't meet a dependency drivers "${app.requireDriver.join(
            ', '
          )}"`
        );
        // do not register the app if it doesn't meet his dependencies
        delete this.apps[appName];

        return;
      }
    }

    if (app.start) {
      this.system.log.debug(`AppManager: starting app "${appName}"`);

      try {
        await app.ctx.init();
        await app.start();
      } catch (e) {
        this.system.log.error(
          `AppManager: app's "${appName}" start error: ${e}`
        );

        return;
      }
    }
  }
}
