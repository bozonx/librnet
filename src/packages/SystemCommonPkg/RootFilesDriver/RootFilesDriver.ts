import { clearRelPath, pathJoin, trimCharStart } from 'squidlet-lib';
import { DriverFactoryBase } from '../../../system/base/DriverFactoryBase.js';
import type {
  BinTypes,
  BinTypesNames,
  DriverIndex,
} from '../../../types/types.js';
import DriverInstanceBase from '../../../system/base/DriverInstanceBase.js';
import { FILES_PERMISSIONS } from '@/types/constants.js';
import type {
  CopyOptions,
  MkdirOptions,
  RmOptions,
  ReaddirOptions,
  ReadTextFileOptions,
  StatsSimplified,
  WriteFileOptions,
} from '@/types/io/FilesIoType.js';
import type { System } from '../../../system/System.js';
import { DirTrap } from '@/system/driversLogic/DirTrap.js';

// TODO:  add tmpdir https://nodejs.org/api/fs.html#fspromisesmkdtempprefix-options
// TODO: запретить передавать URL и другие типы путей для чтения и записи

export const FILES_PERM_DELIMITER = '|';

export const RootFilesDriverIndex: DriverIndex = (system: System) => {
  return new RootFilesDriver(system);
};

export class RootFilesDriver extends DriverFactoryBase<
  DriverInstanceBase<RootFilesDriverProps>,
  RootFilesDriverProps
> {
  readonly name = 'RootFilesDriver';
  protected SubDriverClass: new (
    ...args: ConstructorParameters<typeof DriverInstanceBase>
  ) => DriverInstanceBase<RootFilesDriverProps> = RootFilesDriverInstance;
}

export interface RootFilesDriverProps {
  entityWhoAsk: string;
}

class FilesDriver extends DirTrap {
  protected preparePath(pathTo: string): string {
    return pathTo;
  }
}

/**
 * Acces to the root files of the system
 */
export class RootFilesDriverInstance extends DriverInstanceBase<RootFilesDriverProps> {
  private filesDriver = new FilesDriver(this.system, '/');

  ////// READ ONLY METHODS
  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.readTextFile(preparedPath, options);
  }

  async readBinFile(
    pathTo: string,
    returnType?: BinTypesNames
  ): Promise<BinTypes> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.readBinFile(preparedPath, returnType);
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.stat(preparedPath);
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.readdir(preparedPath, options);
  }

  async readlink(pathTo: string): Promise<string> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.readlink(preparedPath);
  }

  async realpath(pathTo: string): Promise<string> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.realpath(preparedPath);
  }

  async isDir(pathToDir: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToDir);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.isDir(preparedPath);
  }

  async isFile(pathToFile: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToFile);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.isFile(preparedPath);
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToSymLink);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.isSymLink(preparedPath);
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToFileOrDir);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.isExists(preparedPath);
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.read);

    return this.filesDriver.isTextFileUtf8(preparedPath);
  }

  ////// WRITE METHODS
  async appendFile(
    pathTo: string,
    data: string,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.write);

    return this.filesDriver.appendFile(preparedPath, data, options);
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.write);

    return this.filesDriver.writeFile(preparedPath, data, options);
  }

  async rm(paths: string[], options?: RmOptions): Promise<void> {
    const preparedPaths = paths.map((path) => this.preparePath(path));

    await this.checkPermissions(preparedPaths, FILES_PERMISSIONS.write);

    return this.filesDriver.rm(preparedPaths, options);
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.preparePath(src),
      this.preparePath(dest),
    ]);

    await this.checkPermissions(preparedFiles.flat(), FILES_PERMISSIONS.write);

    return this.filesDriver.cp(preparedFiles, options);
  }

  async rename(files: [string, string][]): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.preparePath(src),
      this.preparePath(dest),
    ]);

    await this.checkPermissions(preparedFiles.flat(), FILES_PERMISSIONS.write);

    return this.filesDriver.rename(preparedFiles);
  }

  async mkdir(pathTo: string, options?: MkdirOptions): Promise<void> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.write);

    return this.filesDriver.mkdir(preparedPath, options);
  }

  async symlink(target: string, pathTo: string): Promise<void> {
    const preparedTarget = this.preparePath(target);
    const preparedPathTo = this.preparePath(pathTo);

    await this.checkPermissions(
      [preparedTarget, preparedPathTo],
      FILES_PERMISSIONS.write
    );

    return this.filesDriver.symlink(preparedTarget, preparedPathTo);
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
      FILES_PERMISSIONS.write
    );

    return this.filesDriver.copyToDest(preparedSrc, preparedDestDir, force);
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
      FILES_PERMISSIONS.write
    );

    return this.filesDriver.moveToDest(preparedSrc, preparedDestDir, force);
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const preparedFile = this.preparePath(file);
    const preparedNewName = this.preparePath(newName);

    await this.checkPermissions(
      [preparedFile, preparedNewName],
      FILES_PERMISSIONS.write
    );

    return this.filesDriver.renameFile(preparedFile, preparedNewName);
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    const preparedPath = this.preparePath(pathToFileOrDir);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.write);

    return this.filesDriver.rmRf(preparedPath);
  }

  async mkDirP(pathToDir: string): Promise<void> {
    const preparedPath = this.preparePath(pathToDir);

    await this.checkPermissions([preparedPath], FILES_PERMISSIONS.write);

    return this.filesDriver.mkDirP(preparedPath);
  }

  protected preparePath(pathTo: string): string {
    return pathJoin('/', trimCharStart(clearRelPath(pathTo), '/'));
  }

  private async checkPermissions(paths: string[], perm: string) {
    for (const path of paths) {
      if (path.indexOf('/') !== 0) {
        throw new Error(`Path has to start with "/": ${path}`);
      }

      // TODO: check for parent dir permissions
      if (
        !(await this.system.permissions.checkPermissions(
          this.props.entityWhoAsk,
          this.driver.name,
          perm + FILES_PERM_DELIMITER + path
        ))
      ) {
        throw new Error(`Path "${path}" is not allowed to be ${perm}`);
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
