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

export const RootFilesDriverIndex: DriverIndex = (system: System) => {
  return new RootFilesDriver(system);
};

export class RootFilesDriver extends DriverFactoryBase<
  any,
  RootFilesDriverInstance
> {
  readonly name = 'RootFilesDriver';
  protected SubDriverClass = RootFilesDriverInstance;
}

class FilesDriver extends DirTrap {
  protected preparePath(pathTo: string): string {
    // TODO: review
    return pathJoin(this.rootDir, trimCharStart(clearRelPath(pathTo), '/'));
  }
}

/**
 * Acces to the root files of the system
 */
export class RootFilesDriverInstance extends DriverInstanceBase<any> {
  private filesDriver = new FilesDriver(this.system, '/');

  ////// READ ONLY METHODS
  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.read);

    return this.filesDriver.readTextFile(pathTo, options);
  }

  async readBinFile(
    pathTo: string,
    returnType?: BinTypesNames
  ): Promise<BinTypes> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.read);

    return this.filesDriver.readBinFile(pathTo, returnType);
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.read);

    return this.filesDriver.stat(pathTo);
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.read);

    return this.filesDriver.readdir(pathTo, options);
  }

  async readlink(pathTo: string): Promise<string> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.read);

    return this.filesDriver.readlink(pathTo);
  }

  async realpath(pathTo: string): Promise<string> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.read);

    return this.filesDriver.realpath(pathTo);
  }

  async isDir(pathToDir: string): Promise<boolean> {
    this.checkPermissions([pathToDir], FILES_PERMISSIONS.read);

    return this.filesDriver.isDir(pathToDir);
  }

  async isFile(pathToFile: string): Promise<boolean> {
    this.checkPermissions([pathToFile], FILES_PERMISSIONS.read);

    return this.filesDriver.isFile(pathToFile);
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    this.checkPermissions([pathToSymLink], FILES_PERMISSIONS.read);

    return this.filesDriver.isSymLink(pathToSymLink);
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    this.checkPermissions([pathToFileOrDir], FILES_PERMISSIONS.read);

    return this.filesDriver.isExists(pathToFileOrDir);
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.read);

    return this.filesDriver.isTextFileUtf8(pathTo);
  }

  ////// WRITE METHODS
  async appendFile(
    pathTo: string,
    data: string,
    options?: WriteFileOptions
  ): Promise<void> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.write);

    return this.filesDriver.appendFile(pathTo, data, options);
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.write);

    return this.filesDriver.writeFile(pathTo, data, options);
  }

  async rm(paths: string[], options?: RmOptions): Promise<void> {
    this.checkPermissions(paths, FILES_PERMISSIONS.write);

    return this.filesDriver.rm(paths, options);
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    this.checkPermissions(files.flat(), FILES_PERMISSIONS.write);

    return this.filesDriver.cp(files, options);
  }

  async rename(files: [string, string][]): Promise<void> {
    this.checkPermissions(files.flat(), FILES_PERMISSIONS.write);

    return this.filesDriver.rename(files);
  }

  async mkdir(pathTo: string, options?: MkdirOptions): Promise<void> {
    this.checkPermissions([pathTo], FILES_PERMISSIONS.write);

    return this.filesDriver.mkdir(pathTo, options);
  }

  async symlink(target: string, pathTo: string): Promise<void> {
    this.checkPermissions([target, pathTo], FILES_PERMISSIONS.write);

    return this.filesDriver.symlink(target, pathTo);
  }

  ////////// ADDITIONAL

  async copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    this.checkPermissions(
      [...(Array.isArray(src) ? src : [src]), destDir],
      FILES_PERMISSIONS.write
    );

    return this.filesDriver.copyToDest(src, destDir, force);
  }

  async moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    this.checkPermissions(
      [...(Array.isArray(src) ? src : [src]), destDir],
      FILES_PERMISSIONS.write
    );

    return this.filesDriver.moveToDest(src, destDir, force);
  }

  async renameFile(file: string, newName: string): Promise<void> {
    this.checkPermissions([file], FILES_PERMISSIONS.write);

    return this.filesDriver.renameFile(file, newName);
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    this.checkPermissions([pathToFileOrDir], FILES_PERMISSIONS.write);

    return this.filesDriver.rmRf(pathToFileOrDir);
  }

  async mkDirP(pathToDir: string): Promise<void> {
    this.checkPermissions([pathToDir], FILES_PERMISSIONS.write);

    return this.filesDriver.mkDirP(pathToDir);
  }

  private checkPermissions(paths: string[], perm: string) {
    // TODO: throw an error if path is not allowed
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
