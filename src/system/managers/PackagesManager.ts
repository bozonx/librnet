import { pathJoin, trimChar } from 'squidlet-lib';
import type { System } from '../System.js';
import type { AnyEntityManifest } from '@/types/types.js';
import {
  DRIVER_NAMES,
  ENTITY_MANIFEST_FILE_NAME,
  LOCAL_DATA_SUB_DIRS,
  ROOT_DIRS,
  SYSTEM_ENTITY,
} from '@/types/constants.js';
import type { ArchiveDriver } from '@/system/drivers/ArchiveDriver/ArchiveDriver.js';
import yaml from 'yaml';
import semver from 'semver';

export class PackagesManager {
  constructor(private readonly system: System) {}

  /**
   * Install or update package from file.
   * @param pathToPkg - path to package.
   * @param force - force install package.
   */
  async installFromFile(pathToPkg: string, force: boolean = false) {
    // TODO: check required, see EntityManger base

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
      if (force) {
        await this.uninstall(manifest.name);
      } else {
        if (semver.gt(manifest.version, installedManifest.version)) {
          await this.uninstall(manifest.name);
        } else if (semver.eq(manifest.version, installedManifest.version)) {
          throw new Error(`Entity "${manifest.name}" already installed`);
        } else {
          throw new Error(
            `Entity "${manifest.name}" version is older than installed`
          );
        }
      }
    }

    await this.system.localFiles.mkdir(
      pathJoin(
        '/',
        ROOT_DIRS.local,
        LOCAL_DATA_SUB_DIRS.programs,
        manifest.name
      )
    );

    await archiveFiles.extractToDest(
      '/' + trimChar(manifest.distDir, '/'),
      pathJoin(
        '/',
        ROOT_DIRS.local,
        LOCAL_DATA_SUB_DIRS.programs,
        manifest.name
      ),
      pathToPkg
    );
  }

  async uninstall(entityName: string) {
    await this.system.localFiles.rmRf(
      pathJoin('/', ROOT_DIRS.local, LOCAL_DATA_SUB_DIRS.programs, entityName)
    );
  }

  private async getInstalledEntityManifest(
    entytyName: string
  ): Promise<AnyEntityManifest | undefined> {
    const programFilesDirItems = await this.system.localFiles.readdir(
      pathJoin('/', ROOT_DIRS.local, LOCAL_DATA_SUB_DIRS.programs)
    );

    if (!programFilesDirItems.find((item) => item === entytyName)) {
      return;
    }

    const manifestContent = await this.system.localFiles.readTextFile(
      pathJoin(
        ROOT_DIRS.local,
        LOCAL_DATA_SUB_DIRS.programs,
        entytyName,
        ENTITY_MANIFEST_FILE_NAME
      )
    );

    return yaml.parse(manifestContent);
  }
}
