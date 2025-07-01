import {pathJoin} from 'squidlet-lib'
import type {System} from '../System.js'
import { PackageContext } from '../context/PackageContext.js';
import type { PackageIndex } from '@/types/types.js';
import { IO_NAMES } from '@/types/constants.js';
import type { FilesIoType } from '@/types/io/FilesIoType.js';
import type { IoBase } from '../base/IoBase.js';

export class PackageManager {
  private readonly system;
  readonly ctx;

  private get filesIo(): FilesIoType & IoBase {
    return this.system.io.getIo<FilesIoType & IoBase>(IO_NAMES.LocalFilesIo);
  }

  constructor(system: System) {
    this.system = system;
    this.ctx = new PackageContext(this.system);
  }

  // async init() {
  //   // TODO: what to do here?
  // }

  async destroy() {
    // TODO: дестроить то на что пакеты навешались дестроить
  }

  // TODO: наверное сделать отдельный дестрой для системных пакетов и пользовательских

  async loadInstalled() {
    // TODO: должно быть установлено всё пакетами
    // TODO: и нужно пройтись по всем пакетам и сделать use(pkg)
    // TODO: загружать нужно файл через import
    // TODO: и нужно использовать sandbox
  }

  async install(pkgPath: string) {
    // TODO: add
  }

  async update(pkgName: string) {
    // TODO: чтобы обновить пакет нужно понять что к нему относится
  }

  async uninstall(pkgName: string) {
    // TODO: чтобы удалить пакет нужно понять что к нему относится
  }

  // это работает без инициализации пакета
  use(pkg: PackageIndex) {
    pkg(this.ctx);
  }
}


  // /**
  //  * Install app from package to system.
  //  * @param appName - app name.
  //  * @param packagePath - path to app package.
  //  */
  // async installApp(appName: string, packagePath: string): Promise<void> {
  //   // TODO: add timeout

  //   const appDestDir = pathJoin(
  //     this.system.configs.systemCfg.rootDir,
  //     ROOT_DIRS.system,
  //     SYSTEM_SUB_DIRS.apps,
  //     appName
  //   );
  //   const appDataDir = pathJoin(
  //     this.system.configs.systemCfg.rootDir,
  //     ROOT_DIRS.appsData,
  //     appName
  //   );

  //   const filesDriver = this.system.drivers.getDriver<
  //     FilesDriverType & DriverBase
  //   >(DRIVER_NAMES.FilesDriver);

  //   if (await filesDriver.isExists(appDestDir)) {
  //     throw new Error(`App "${appName}" already installed`);
  //   }

  //   // TODO: copy from archive
  //   //await filesDriver?.copyDirContent(srcDir, appDestDir);

  //   // create app data dirs
  //   for (const subDir of Object.values(APP_SUB_DIRS)) {
  //     await filesDriver.mkDirP(pathJoin(appDataDir, subDir));
  //   }

  //   const app = this.apps[appName];
  //   if (app.afterInstall) {
  //     app.afterInstall(false);
  //   }
  // }