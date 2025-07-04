import { clearRelPath, pathJoin, trimCharStart } from 'squidlet-lib';
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
  IS_TEXT_FILE_UTF8_SAMPLE_SIZE,
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
import { DirTrap } from '../../../system/driversLogic/DirTrap.js';
import { checkPermissions } from '../../../system/helpers/CheckPathPermission.js';

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

    const result = await this.rootDirDriver.readTextFile(preparedPath, options);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'readTextFile',
      timestamp: Date.now(),
      size: result.length,
    });

    return result;
  }

  async readBinFile(
    pathTo: string,
    returnType?: BinTypesNames
  ): Promise<BinTypes> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.readBinFile(
      preparedPath,
      returnType
    );

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'readBinFile',
      timestamp: Date.now(),
      size: result.byteLength,
    });

    return result;
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.stat(preparedPath);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'stat',
      timestamp: Date.now(),
      // do not calculate size because it is very difficult to do
      // it depends on the file system, OS and cache
    });

    return result;
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.readdir(preparedPath, options);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'readdir',
      timestamp: Date.now(),
      size: result.reduce((acc, item) => acc + item.length, 0),
    });

    return result;
  }

  async readlink(pathTo: string): Promise<string> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.readlink(preparedPath);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'readlink',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт считывается?
    });

    return result;
  }

  async realpath(pathTo: string): Promise<string> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.realpath(preparedPath);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'realpath',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт считывается?
    });

    return result;
  }

  async isDir(pathToDir: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.isDir(preparedPath);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'isDir',
      timestamp: Date.now(),
      // do not calculate size
    });

    return result;
  }

  async isFile(pathToFile: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToFile);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.isFile(preparedPath);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'isFile',
      timestamp: Date.now(),
      // do not calculate size
    });

    return result;
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToSymLink);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.isSymLink(preparedPath);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'isSymLink',
      timestamp: Date.now(),
      // do not calculate size
    });

    return result;
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToFileOrDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.isExists(preparedPath);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'isExists',
      timestamp: Date.now(),
      // do not calculate size
    });

    return result;
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.read);

    const result = await this.rootDirDriver.isTextFileUtf8(preparedPath);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'isTextFileUtf8',
      timestamp: Date.now(),
      size: IS_TEXT_FILE_UTF8_SAMPLE_SIZE,
    });

    return result;
  }

  ////// WRITE METHODS
  async appendFile(
    pathTo: string,
    data: string,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);
    await this.rootDirDriver.appendFile(preparedPath, data, options);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.write,
      method: 'appendFile',
      timestamp: Date.now(),
      size: data.length,
    });
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);
    await this.rootDirDriver.writeFile(preparedPath, data, options);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.write,
      method: 'writeFile',
      timestamp: Date.now(),
      size: data instanceof Uint8Array ? data.byteLength : data.length,
    });
  }

  async rm(paths: string[], options?: RmOptions): Promise<void> {
    const preparedPaths = paths.map((path) => this.preparePath(path));

    await this.checkPermissions(preparedPaths, FILE_ACTION.write);

    await this.rootDirDriver.rm(preparedPaths, options);

    this.riseEvent({
      // TODO: revew
      path: preparedPaths.join(','),
      action: FILE_ACTION.write,
      method: 'rm',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.preparePath(src),
      this.preparePath(dest),
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

    this.riseEvent({
      // TODO: revew
      path: preparedFiles.map(([src]) => src).join(','),
      action: FILE_ACTION.write,
      method: 'cp',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async rename(files: [string, string][]): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.preparePath(src),
      this.preparePath(dest),
    ]);

    await this.checkPermissions(preparedFiles.flat(), FILE_ACTION.write);

    await this.rootDirDriver.rename(preparedFiles);

    this.riseEvent({
      // TODO: revew
      path: preparedFiles.map(([src]) => src).join(','),
      action: FILE_ACTION.write,
      method: 'rename',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async mkdir(pathTo: string, options?: MkdirOptions): Promise<void> {
    const preparedPath = this.preparePath(pathTo);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);

    await this.rootDirDriver.mkdir(preparedPath, options);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.write,
      method: 'mkdir',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  /**
   * Target and dest have to have write permissions
   * @param target
   * @param pathTo
   * @returns
   */
  async symlink(target: string, pathTo: string): Promise<void> {
    const preparedTarget = this.preparePath(target);
    const preparedPathTo = this.preparePath(pathTo);

    await this.checkPermissions(
      [preparedTarget, preparedPathTo],
      FILE_ACTION.write
    );

    await this.rootDirDriver.symlink(preparedTarget, preparedPathTo);

    this.riseEvent({
      // TODO: revew
      path: preparedTarget,
      action: FILE_ACTION.write,
      method: 'symlink',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
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

    await this.checkPermissions(preparedSrc, FILE_ACTION.read);
    await this.checkPermissions([preparedDestDir], FILE_ACTION.write);

    await this.rootDirDriver.copyToDest(preparedSrc, preparedDestDir, force);

    this.riseEvent({
      // TODO: revew
      path: preparedSrc.join(','),
      action: FILE_ACTION.write,
      method: 'copyToDest',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
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

    await this.rootDirDriver.moveToDest(preparedSrc, preparedDestDir, force);

    this.riseEvent({
      // TODO: revew
      path: preparedSrc.join(','),
      action: FILE_ACTION.write,
      method: 'moveToDest',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const preparedFile = this.preparePath(file);
    const preparedNewName = this.preparePath(newName);

    await this.checkPermissions(
      [preparedFile, preparedNewName],
      FILE_ACTION.write
    );

    await this.rootDirDriver.renameFile(preparedFile, preparedNewName);

    this.riseEvent({
      // TODO: revew
      path: preparedFile,
      action: FILE_ACTION.write,
      method: 'renameFile',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    const preparedPath = this.preparePath(pathToFileOrDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);

    await this.rootDirDriver.rmRf(preparedPath);

    this.riseEvent({
      // TODO: revew
      path: preparedPath,
      action: FILE_ACTION.write,
      method: 'rmRf',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async mkDirP(pathToDir: string): Promise<void> {
    const preparedPath = this.preparePath(pathToDir);

    await this.checkPermissions([preparedPath], FILE_ACTION.write);

    await this.rootDirDriver.mkDirP(preparedPath);

    this.riseEvent({
      // TODO: revew
      path: preparedPath,
      action: FILE_ACTION.write,
      method: 'mkDirP',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  protected riseEvent = (data: FilesEventData) => {
    this.system.events.emit(SystemEvents.localFiles, data);
  };

  protected preparePath(pathTo: string): string {
    // TODO: делать настоящие пути
    // TODO: запретить передавать URL и другие типы путей для чтения и записи
    return pathJoin('/', trimCharStart(clearRelPath(pathTo), '/'));
  }

  protected async checkPermissions(paths: string[], action: string) {
    await checkPermissions(
      this.system,
      this.props.entityWhoAsk,
      this.driver.name,
      paths,
      action
    );
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
