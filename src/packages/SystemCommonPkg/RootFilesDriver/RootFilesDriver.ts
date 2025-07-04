import { clearRelPath, pathJoin, trimCharStart } from 'squidlet-lib';
import { DriverFactoryBase } from '../../../system/base/DriverFactoryBase.js';
import type {
  BinTypes,
  BinTypesNames,
  DriverIndex,
} from '../../../types/types.js';
import DriverInstanceBase from '../../../system/base/DriverInstanceBase.js';
import { FILE_ACTION, IO_NAMES } from '../../../types/constants.js';
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
import { DirTrap } from '../../../system/driversLogic/DirTrap.js';

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

class FilesDriver extends DirTrap {
  // Do not use path conversion here
  protected preparePath(pathTo: string): string {
    return pathTo;
  }
}

/**
 * Acces to the root files of the system
 *  - /programFiles
 *  - /localData
 *  - /syncedData
 *  - /home
 *  - /mnt - this is a virtual dir where some external virtual dirs are mounted
 */
export class RootFilesDriverInstance extends DriverInstanceBase<
  RootFilesDriverProps,
  Record<string, any>
> {
  private rootDirDriver = new FilesDriver(this.system, '/');

  ////// READ ONLY METHODS
  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.readTextFile(preparedPath, options);
  }

  async readBinFile(
    pathTo: string,
    returnType?: BinTypesNames
  ): Promise<BinTypes> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.readBinFile(preparedPath, returnType);
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.stat(preparedPath);
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.readdir(preparedPath, options);
  }

  async readlink(pathTo: string): Promise<string> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.readlink(preparedPath);
  }

  async realpath(pathTo: string): Promise<string> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.realpath(preparedPath);
  }

  async isDir(pathToDir: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.isDir(preparedPath);
  }

  async isFile(pathToFile: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToFile);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.isFile(preparedPath);
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToSymLink);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.isSymLink(preparedPath);
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToFileOrDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.isExists(preparedPath);
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    return this.rootDirDriver.isTextFileUtf8(preparedPath);
  }

  ////// WRITE METHODS
  async appendFile(
    pathTo: string,
    data: string,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);

    return this.rootDirDriver.appendFile(preparedPath, data, options);
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);

    return this.rootDirDriver.writeFile(preparedPath, data, options);
  }

  async rm(paths: string[], options?: RmOptions): Promise<void> {
    const preparedPaths = paths.map((path) => this.preparePath(path));

    await this.checkPermissions(preparedPaths, FILE_ACTION.write);

    return this.rootDirDriver.rm(preparedPaths, options);
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.preparePath(src),
      this.preparePath(dest),
    ]);

    await this.checkPermissions(preparedFiles.flat(), FILE_ACTION.write);

    return this.rootDirDriver.cp(preparedFiles, options);
  }

  async rename(files: [string, string][]): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.preparePath(src),
      this.preparePath(dest),
    ]);

    await this.checkPermissions(preparedFiles.flat(), FILE_ACTION.write);

    return this.rootDirDriver.rename(preparedFiles);
  }

  async mkdir(pathTo: string, options?: MkdirOptions): Promise<void> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);

    return this.rootDirDriver.mkdir(preparedPath, options);
  }

  async symlink(target: string, pathTo: string): Promise<void> {
    const preparedTarget = this.preparePath(target);
    const preparedPathTo = this.preparePath(pathTo);

    await this.checkPermissions(
      [preparedTarget, preparedPathTo],
      FILE_ACTION.write
    );

    return this.rootDirDriver.symlink(preparedTarget, preparedPathTo);
  }

  ////////// ADDITIONAL

  async copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const preparedSrc = Array.isArray(src)
      ? src.map((s) => this.preparePath(s))
      : [this.preparePath(src)];
    const preparedDestDir = this.preparePath(destDir);

    await this.checkPermissions(
      [...preparedSrc, preparedDestDir],
      FILE_ACTION.write
    );

    return this.rootDirDriver.copyToDest(preparedSrc, preparedDestDir, force);
  }

  async moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const preparedSrc = Array.isArray(src)
      ? src.map((s) => this.preparePath(s))
      : [this.preparePath(src)];
    const preparedDestDir = this.preparePath(destDir);

    await this.checkPermissions(
      [...preparedSrc, preparedDestDir],
      FILE_ACTION.write
    );

    return this.rootDirDriver.moveToDest(preparedSrc, preparedDestDir, force);
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const preparedFile = this.preparePath(file);
    const preparedNewName = this.preparePath(newName);

    await this.checkPermissions(
      [preparedFile, preparedNewName],
      FILE_ACTION.write
    );

    return this.rootDirDriver.renameFile(preparedFile, preparedNewName);
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    const preparedPath = this.preparePath(pathToFileOrDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);

    return this.rootDirDriver.rmRf(preparedPath);
  }

  async mkDirP(pathToDir: string): Promise<void> {
    const preparedPath = this.preparePath(pathToDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);

    return this.rootDirDriver.mkDirP(preparedPath);
  }

  protected preparePath(pathTo: string): string {
    // TODO: запретить передавать URL и другие типы путей для чтения и записи
    return pathJoin('/', trimCharStart(clearRelPath(pathTo), '/'));
  }

  private async checkPermissions(paths: string[], action: string) {
    for (const path of paths) {
      if (path.indexOf('/') !== 0) {
        throw new Error(`Path has to start with "/": ${path}`);
      }

      // TODO: check for parent dir permissions
      if (
        !(await this.system.permissions.checkPermissions(
          this.props.entityWhoAsk,
          this.driver.name,
          action + FILE_PERM_DELIMITER + path
        ))
      ) {
        throw new Error(`Path "${path}" is not allowed to be ${action}`);
      }
    }
  }
}

/**
 * Make real path on external file system
 * @param pathTo - it has to be /appFiles/..., /cfg/... etc.
 *   /external/extMountedDir/... is a virtual path to virtual dir where some
 *   external virtual dirs are mounted
 * @private
 */
// private makePath(pathTo: string): string {
//   if (pathTo.indexOf('/') !== 0) {
//     throw new Error(`Path has to start with "/": ${pathTo}`);
//   }

//   const pathMatch = pathTo.match(/^\/([^\/]+)(\/.+)?$/);

//   if (!pathMatch) throw new Error(`Wrong path "${pathTo}"`);

//   const subDir = pathMatch[1] as keyof typeof ROOT_DIRS;
//   const restPath = pathMatch[2] || '';

//   if ((subDir as string) === EXTERNAL_ROOT_DIR) {
//     const extMatch = pathTo.match(/^\/([^\/]+)(\/.+)?$/);

//     if (!extMatch) throw new Error(`Wrong external path "${pathTo}"`);

//     const extDir = extMatch[1];
//     const extRestPath = extMatch[2] || '';
//     const resolvedExtAbsDir: string | undefined = this.cfg.external[extDir];

//     if (resolvedExtAbsDir) return resolvedExtAbsDir + extRestPath;

//     throw new Error(`Can't resolve external path "${pathTo}"`);
//   }
//   // resolve root dir
//   const resolvedAbsDir: string | undefined = this.cfg.dirs[subDir];
//   // replace sub dir to system path
//   if (resolvedAbsDir) return resolvedAbsDir + restPath;

//   throw new Error(`Can't resolve path "${pathTo}"`);
// }

// export const FilesIoIndex: IoIndex = (ctx: IoContext) => {
//   // if root dir is relative then make it absolute relate to PWD
//   const rootDir = ctx.env.ROOT_DIR ? path.resolve(ctx.env.ROOT_DIR) : '';
//   const external = JSON.parse(process.env.EXT_DIRS || '{}');
//   // check if external paths are absolute
//   for (const name of Object.keys(external)) {
//     if (external[name].indexOf('/') !== 0) {
//       throw new Error(
//         `External path ${name}: ${external[name]} has to be absolute`
//       );
//     }
//   }

//   const cfg: FilesIoConfig = {
//     uid: process.env.FILES_UID ? Number(process.env.FILES_UID) : undefined,
//     gid: process.env.FILES_GID ? Number(process.env.FILES_GID) : undefined,
//     external,
//     dirs: {
//       appFiles: prepareSubPath(
//         ROOT_DIRS.appFiles,
//         rootDir,
//         process.env.APP_FILES_DIR
//       ),
//       appDataLocal: prepareSubPath(
//         ROOT_DIRS.appDataLocal,
//         rootDir,
//         process.env.APP_DATA_LOCAL_DIR
//       ),
//       appDataSynced: prepareSubPath(
//         ROOT_DIRS.appDataSynced,
//         rootDir,
//         process.env.APP_DATA_SYNCED_DIR
//       ),
//       cacheLocal: prepareSubPath(
//         ROOT_DIRS.cacheLocal,
//         rootDir,
//         process.env.CACHE_LOCAL_DIR
//       ),
//       cfgLocal: prepareSubPath(
//         ROOT_DIRS.cfgLocal,
//         rootDir,
//         process.env.CFG_LOCAL_DIR
//       ),
//       cfgSynced: prepareSubPath(
//         ROOT_DIRS.cfgSynced,
//         rootDir,
//         process.env.CFG_SYNCED_DIR
//       ),
//       db: prepareSubPath(ROOT_DIRS.db, rootDir, process.env.DB_DIR),
//       log: prepareSubPath(ROOT_DIRS.log, rootDir, process.env.LOG_DIR),
//       tmpLocal: prepareSubPath(
//         ROOT_DIRS.tmpLocal,
//         rootDir,
//         process.env.TMP_LOCAL_DIR
//       ),
//       home: prepareSubPath(ROOT_DIRS.home, rootDir, process.env.USER_HOME_DIR),
//     },
//   };
//   return new FilesIo(ctx, cfg);
// };
