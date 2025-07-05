import {pathJoin} from 'squidlet-lib'
import type { System } from '../System.js';
import type { AnyEntityManifest } from '@/types/types.js';
import {
  DRIVER_NAMES,
  ENTITY_MANIFEST_FILE_NAME,
  ROOT_DIRS,
  SYSTEM_ENTITY,
} from '@/types/constants.js';
import type { ArchiveDriver } from '@/packages/SystemCommonPkg/ArchiveDriver/ArchiveDriver.js';
import yaml from 'yaml';

const SYSTEM_INSTALLED_PACKAGES_CFG_NAME = 'system.installedPackages';

export class PackageManager {
  // private installedEntities: Record<string, AnyEntityManifest> = {};

  constructor(private readonly system: System) {}

  // async init() {
  //   this.installedEntities = await this.system.configs.loadEntityConfig(
  //     SYSTEM_INSTALLED_PACKAGES_CFG_NAME,
  //     true
  //   );
  // }

  /**
   * Install or update package from file.
   * @param pathToPkg - path to package.
   * @param force - force install package.
   */
  async installFromFile(pathToPkg: string, force: boolean = false) {
    const archiveDriver = this.system.drivers.getDriver<ArchiveDriver>(
      DRIVER_NAMES.ArchiveDriver
    );
    const archiveFiles = await archiveDriver.makeInstance({
      entityWhoAsk: SYSTEM_ENTITY,
      archivePath: pathToPkg,
    });
    const manifestContent = await archiveFiles.readTextFile(
      '/' + ENTITY_MANIFEST_FILE_NAME
    );
    const manifest = yaml.parse(manifestContent);

    let installedManifest;

    try {
      installedManifest = await this.getInstalledEntityManifest(manifest.name);
    } catch (e) {
      // remove installed entity
      await this.uninstall(manifest.name);
    }

    if (installedManifest) {
      // TODO: check versions
      if (force) {
        await this.uninstall(manifest.name);
      } else {
        throw new Error(`Entity "${manifest.name}" already installed`);
      }
    }

    console.log(manifest);

    // TODO: check if package is already installed
    // TODO: if force is true, then uninstall package
    // TODO: install package
  }

  async uninstall(pkgName: string) {
    // TODO: чтобы удалить пакет нужно понять что к нему относится
  }

  private async getInstalledEntityManifest(
    entytyName: string
  ): Promise<AnyEntityManifest | undefined> {
    const programFilesDirItems = await this.system.localFiles.readdir(
      ROOT_DIRS.programFiles
    );

    if (!programFilesDirItems.find((item) => item === entytyName)) {
      return;
    }

    const manifestContent = await this.system.localFiles.readTextFile(
      pathJoin(ROOT_DIRS.programFiles, entytyName, ENTITY_MANIFEST_FILE_NAME)
    );

    return yaml.parse(manifestContent);
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