import { DriverFactoryBase } from '../../../system/base/DriverFactoryBase.js';
import type {
  BinTypes,
  BinTypesNames,
  DriverIndex,
  FilesEventData,
} from '../../../types/types.js';
import DriverInstanceBase from '../../../system/base/DriverInstanceBase.js';
import {
  FILE_ACTION,
  IO_NAMES,
  SystemEvents,
} from '../../../types/constants.js';
import type {
  CopyOptions,
  MkdirOptions,
  RmOptions,
  ReaddirOptions,
  ReadTextFileOptions,
  StatsSimplified,
  WriteFileOptions,
} from '../../../types/io/FilesIoType.js';
import type { System } from '../../../system/System.js';
import { checkPermissions } from '../../../system/helpers/CheckPathPermission.js';
import { resolveRealPath } from '@/system/helpers/helpers.js';
import { FilesDriverLogic } from '@/system/driversLogic/FilesDriverLogic.js';
import type { FilesIoType } from '@/types/io/FilesIoType.js';
import type { IoBase } from '@/system/base/IoBase.js';

export const FILE_PERM_DELIMITER = '|';

export const RootFilesDriverIndex: DriverIndex = (
  name: string,
  system: System
) => {
  return new RootFilesDriver(system, name);
};

export class RootFilesDriver extends DriverFactoryBase<
  RootFilesDriverInstance,
  RootFilesDriverProps
> {
  readonly requireIo = [IO_NAMES.LocalFilesIo];
  protected SubDriverClass = RootFilesDriverInstance;
}

export interface RootFilesDriverProps {
  entityWhoAsk: string;
}

class RootDirDriver extends FilesDriverLogic {
  constructor(
    protected readonly system: System,
    protected readonly rootDir: string
  ) {
    super(
      system.io.getIo<FilesIoType & IoBase>(IO_NAMES.LocalFilesIo),
      (data: FilesEventData) => {
        this.system.events.emit(SystemEvents.localFiles, data);
      }
    );
  }

  // Make real path on external file system
  protected preparePath(pathTo: string): string {
    return resolveRealPath(
      pathTo,
      this.system.mountPoints.rootDir,
      this.system.mountPoints.getMountPoints()
    );
  }
}

/**
 * Acces to the root files of the system
 *  - /programFiles
 *  - /localData
 *  - /syncedData
 *  - /home
 *  - /mnt - this is a virtual dir where some external virtual dirs are mounted
 * It does:
 * - Add more methods
 * - Check permissions
 * - Emits events
 * - Resolve real path
 * - And finaly do requests to the external file system via FilesIo
 */
export class RootFilesDriverInstance extends DriverInstanceBase<
  RootFilesDriverProps,
  Record<string, any>
> {
  private rootDirDriver = new RootDirDriver(this.system, '/');

  ////// READ ONLY METHODS
  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.readTextFile(preparedPath, options);
  }

  async readBinFile(
    pathTo: string,
    returnType?: BinTypesNames
  ): Promise<BinTypes> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.readBinFile(preparedPath, returnType);
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.stat(preparedPath);
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.readdir(preparedPath, options);
  }

  async readlink(pathTo: string): Promise<string> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.readlink(preparedPath);
  }

  async realpath(pathTo: string): Promise<string> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.realpath(preparedPath);
  }

  async isDir(pathToDir: string): Promise<boolean> {
    const preparedPath = this.rootDirDriver.clearPath(pathToDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.isDir(preparedPath);
  }

  async isFile(pathToFile: string): Promise<boolean> {
    const preparedPath = this.rootDirDriver.clearPath(pathToFile);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.isFile(preparedPath);
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    const preparedPath = this.rootDirDriver.clearPath(pathToSymLink);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.isSymLink(preparedPath);
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    const preparedPath = this.rootDirDriver.clearPath(pathToFileOrDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.isExists(preparedPath);
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return await this.rootDirDriver.isTextFileUtf8(preparedPath);
  }

  ////// WRITE METHODS
  async appendFile(
    pathTo: string,
    data: string,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);
    await this.rootDirDriver.appendFile(preparedPath, data, options);
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);
    await this.rootDirDriver.writeFile(preparedPath, data, options);
  }

  async rm(paths: string[], options?: RmOptions): Promise<void> {
    const preparedPaths = paths.map((path) =>
      this.rootDirDriver.clearPath(path)
    );

    await this.checkPermissions(preparedPaths, FILE_ACTION.write);
    await this.rootDirDriver.rm(preparedPaths, options);
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.rootDirDriver.clearPath(src),
      this.rootDirDriver.clearPath(dest),
    ]);

    await this.checkPermissions(
      preparedFiles.map(([src]) => src),
      FILE_ACTION.read
    );
    await this.checkPermissions(
      preparedFiles.map(([, dest]) => dest),
      FILE_ACTION.write
    );

    await this.rootDirDriver.cp(preparedFiles, options);
  }

  async rename(files: [string, string][]): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.rootDirDriver.clearPath(src),
      this.rootDirDriver.clearPath(dest),
    ]);

    await this.checkPermissions(preparedFiles.flat(), FILE_ACTION.write);
    await this.rootDirDriver.rename(preparedFiles);
  }

  async mkdir(pathTo: string, options?: MkdirOptions): Promise<void> {
    const preparedPath = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);
    await this.rootDirDriver.mkdir(preparedPath, options);
  }

  /**
   * Target and dest have to have write permissions
   * @param target
   * @param pathTo
   * @returns
   */
  async symlink(target: string, pathTo: string): Promise<void> {
    const preparedTarget = this.rootDirDriver.clearPath(target);
    const preparedPathTo = this.rootDirDriver.clearPath(pathTo);

    await this.checkPermissions(
      [preparedTarget, preparedPathTo],
      FILE_ACTION.write
    );
    await this.rootDirDriver.symlink(preparedTarget, preparedPathTo);
  }

  ////////// ADDITIONAL

  async copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const preparedSrc = Array.isArray(src)
      ? src.map((s) => this.rootDirDriver.clearPath(s))
      : [this.rootDirDriver.clearPath(src)];
    const preparedDestDir = this.rootDirDriver.clearPath(destDir);

    await this.checkPermissions(preparedSrc, FILE_ACTION.read);
    await this.checkPermissions([preparedDestDir], FILE_ACTION.write);
    await this.rootDirDriver.copyToDest(preparedSrc, preparedDestDir, force);
  }

  async moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const preparedSrc = Array.isArray(src)
      ? src.map((s) => this.rootDirDriver.clearPath(s))
      : [this.rootDirDriver.clearPath(src)];
    const preparedDestDir = this.rootDirDriver.clearPath(destDir);

    await this.checkPermissions(
      [...preparedSrc, preparedDestDir],
      FILE_ACTION.write
    );

    await this.rootDirDriver.moveToDest(preparedSrc, preparedDestDir, force);
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const preparedFile = this.rootDirDriver.clearPath(file);

    if (newName.includes('/') || newName.includes('\\')) {
      throw new Error('New name cannot contain slashes');
    }

    const preparedNewName = newName.trim();

    await this.checkPermissions([preparedFile], FILE_ACTION.write);
    await this.rootDirDriver.renameFile(preparedFile, preparedNewName);
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    const preparedPath = this.rootDirDriver.clearPath(pathToFileOrDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);
    await this.rootDirDriver.rmRf(preparedPath);
  }

  async mkDirP(pathToDir: string): Promise<void> {
    const preparedPath = this.rootDirDriver.clearPath(pathToDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);
    await this.rootDirDriver.mkDirP(preparedPath);
  }

  protected async checkPermissions(paths: string[], action: string) {
    await checkPermissions(
      this.system.permissions.checkPermissions.bind(this.system.permissions),
      this.props.entityWhoAsk,
      this.driver.name,
      paths,
      action
    );
  }
}
