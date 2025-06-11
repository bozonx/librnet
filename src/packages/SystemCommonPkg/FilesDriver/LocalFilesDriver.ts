// TODO: не импортировать
import { isUtf8 } from 'buffer';
import { pathBasename, pathDirname, pathJoin } from 'squidlet-lib';
import { DriverBase } from '../../../system/base/DriverBase.js';
import type { DriverContext } from '../../../system/context/DriverContext.js';
import type { DriverIndex, PermissionFileType } from '../../../types/types.js';
import type FilesIoType from '../../../types/io/FilesIoType.js';
import type { StatsSimplified } from '../../../types/io/FilesIoType.js';
import { IO_NAMES } from '../../../types/constants.js';
import type { IoBase } from '../../../system/base/IoBase.js';
import type { FilesDriverType } from '../../../types/FilesDriverType.js';


// TODO:  add tmpdir https://nodejs.org/api/fs.html#fspromisesmkdtempprefix-options
// TODO: запретить передавать URL и другие типы путей для чтения и записи

export const FilesDriverIndex: DriverIndex = (ctx: DriverContext) => {
  return new FilesDriver(ctx);
};

function prepareSubPath(
  subDirOfRoot: string,
  rootDir?: string,
  envPath?: string
): string {
  // specified env var is preferred
  if (envPath) {
    // it env variable set then use it as absolute or relative to PWD
    return path.resolve(envPath);
  } else if (rootDir) {
    // if ROOT_DIR env set then just join sub path with it
    return pathJoin(rootDir, subDirOfRoot);
  }

  throw new Error(
    `FilesIo: can't resolve path for "${subDirOfRoot}". There are no ROOT_DIR and specified env variable`
  );
}

export const FilesIoIndex: IoIndex = (ctx: IoContext) => {
  // if root dir is relative then make it absolute relate to PWD
  const rootDir = ctx.env.ROOT_DIR ? path.resolve(ctx.env.ROOT_DIR) : '';
  const external = JSON.parse(process.env.EXT_DIRS || '{}');
  // check if external paths are absolute
  for (const name of Object.keys(external)) {
    if (external[name].indexOf('/') !== 0) {
      throw new Error(
        `External path ${name}: ${external[name]} has to be absolute`
      );
    }
  }

  const cfg: FilesIoConfig = {
    uid: process.env.FILES_UID ? Number(process.env.FILES_UID) : undefined,
    gid: process.env.FILES_GID ? Number(process.env.FILES_GID) : undefined,
    external,
    dirs: {
      appFiles: prepareSubPath(
        ROOT_DIRS.appFiles,
        rootDir,
        process.env.APP_FILES_DIR
      ),
      appDataLocal: prepareSubPath(
        ROOT_DIRS.appDataLocal,
        rootDir,
        process.env.APP_DATA_LOCAL_DIR
      ),
      appDataSynced: prepareSubPath(
        ROOT_DIRS.appDataSynced,
        rootDir,
        process.env.APP_DATA_SYNCED_DIR
      ),
      cacheLocal: prepareSubPath(
        ROOT_DIRS.cacheLocal,
        rootDir,
        process.env.CACHE_LOCAL_DIR
      ),
      cfgLocal: prepareSubPath(
        ROOT_DIRS.cfgLocal,
        rootDir,
        process.env.CFG_LOCAL_DIR
      ),
      cfgSynced: prepareSubPath(
        ROOT_DIRS.cfgSynced,
        rootDir,
        process.env.CFG_SYNCED_DIR
      ),
      db: prepareSubPath(ROOT_DIRS.db, rootDir, process.env.DB_DIR),
      log: prepareSubPath(ROOT_DIRS.log, rootDir, process.env.LOG_DIR),
      tmpLocal: prepareSubPath(
        ROOT_DIRS.tmpLocal,
        rootDir,
        process.env.TMP_LOCAL_DIR
      ),
      home: prepareSubPath(ROOT_DIRS.home, rootDir, process.env.USER_HOME_DIR),
    },
  };

  return new FilesIo(ctx, cfg);
};

/**
 * Files driver
 * Use relative paths
 */
export class FilesDriver extends DriverBase implements FilesDriverType {
  requireIo = [IO_NAMES.FilesIo];

  private get io(): IoBase & FilesIoType {
    return this.ctx.io.getIo(IO_NAMES.FilesIo);
  }

  //////// AS IN FILES IO
  async appendFile(pathTo: string, data: string | Uint8Array) {
    this.checkPermissions(pathTo, 'w');

    return this.io.appendFile(pathTo, data);
  }

  async mkdir(pathTo: string) {
    this.checkPermissions(pathTo, 'w');

    return this.io.mkdir(pathTo);
  }

  async readDir(pathTo: string): Promise<string[]> {
    this.checkPermissions(pathTo, 'r');

    return this.io.readdir(pathTo);
  }

  async readTextFile(pathTo: string): Promise<string> {
    this.checkPermissions(pathTo, 'r');

    return this.io.readTextFile(pathTo);
  }

  async readBinFile(pathTo: string): Promise<Uint8Array> {
    this.checkPermissions(pathTo, 'r');

    return this.io.readBinFile(pathTo);
  }

  async readlink(pathTo: string): Promise<string> {
    this.checkPermissions(pathTo, 'r');

    return this.io.readlink(pathTo);
  }

  async rmdir(pathTo: string) {
    this.checkPermissions(pathTo, 'w');

    return this.io.rmdir(pathTo);
  }

  async unlink(pathTo: string) {
    this.checkPermissions(pathTo, 'w');

    return this.io.unlink(pathTo);
  }

  async writeFile(pathTo: string, data: string | Uint8Array) {
    this.checkPermissions(pathTo, 'w');

    return this.io.writeFile(pathTo, data);
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    this.checkPermissions(pathTo, 'r');

    return this.io.stat(pathTo);
  }

  async copyFiles(files: [string, string][]) {
    for (const item of files) {
      this.checkPermissions(item[0], 'r');
      this.checkPermissions(item[1], 'w');
    }

    return this.io.copyFiles(files);
  }

  async renameFiles(files: [string, string][]) {
    for (const item of files) {
      this.checkPermissions(item[0], 'r');
      this.checkPermissions(item[1], 'w');
    }

    return this.io.renameFiles(files);
  }

  /**
   * Remove dir recursively
   */
  async rmdirR(pathToDir: string): Promise<void> {
    this.checkPermissions(pathToDir, 'w');

    return this.io.rmdirR(pathToDir);
  }

  /**
   * Make dir even parent dir doesn't exist
   */
  async mkDirP(pathToDir: string): Promise<void> {
    this.checkPermissions(pathToDir, 'w');

    await this.io.mkDirP(pathToDir);
  }

  ////////// ADDITIONAL

  /**
   * Remove one file or an empty dir.
   * It doesn't rise an error if file doesn't exists
   */
  async rm(pathToFileOrDir: string) {
    this.checkPermissions(pathToFileOrDir, 'w');

    const stats: StatsSimplified | undefined = await this.io.stat(
      pathToFileOrDir
    );

    if (!stats) return;
    else if (stats.dir) {
      return this.io.rmdir(pathToFileOrDir);
    } else {
      return this.io.unlink(pathToFileOrDir);
    }
  }

  /**
   * Copy some file, several files or dir recursively to specified dest dir
   */
  async cp(src: string | string[], destDir: string): Promise<void> {
    const prepared = await this.prepareBatchFileNames(src, destDir);

    return this.io.copyFiles(prepared);
  }

  /**
   * Copy only dir content (not the dir itself) recursively
   * to inside of the specified dest dir
   */
  async copyDirContent(src: string, dest: string): Promise<void> {
    const dirContent = (await this.readDir(src)).map((el) => pathJoin(src, el));
    const prepared = await this.prepareBatchFileNames(dirContent, dest);

    return this.io.copyFiles(prepared);
  }

  /**
   * Move some file, several files or dir recursively to specified dest dir
   */
  async mv(src: string | string[], destDir: string): Promise<void> {
    const prepared = await this.prepareBatchFileNames(src, destDir);

    return this.io.renameFiles(prepared);
  }

  /**
   * Change name of file or dir
   */
  async rename(pathToFileOrDir: string, newName: string): Promise<void> {
    // TODO: проверить сработает ли с полной папкой

    this.checkPermissions(pathToFileOrDir, 'r');

    const fileDir: string = pathDirname(pathToFileOrDir);
    const newPath: string = pathJoin(fileDir, newName);

    this.checkPermissions(newPath, 'w');

    return this.io.renameFiles([[pathToFileOrDir, newPath]]);
  }

  /**
   * Check if it is a dir.
   * It will return false if dir doesn't exist
   * @param pathToDir
   */
  async isDir(pathToDir: string): Promise<boolean> {
    this.checkPermissions(pathToDir, 'r');

    const stats: StatsSimplified | undefined = await this.io.stat(pathToDir);

    return stats?.dir || false;
  }

  /**
   * Check if it is a file and not symlink.
   * It will return false if dir doesn't exist
   * @param pathToFile
   */
  async isFile(pathToFile: string): Promise<boolean> {
    this.checkPermissions(pathToFile, 'r');

    const stats: StatsSimplified | undefined = await this.io.stat(pathToFile);

    return (!stats?.dir && !stats?.symbolicLink) || false;
  }

  /**
   * Is file exists.
   * Do it only for simple checks not before read or write.
   *   because the file can be removed between promises
   * @param pathToFileOrDir
   */
  async isExists(pathToFileOrDir: string): Promise<boolean> {
    this.checkPermissions(pathToFileOrDir, 'r');

    // TODO: проверить что stat вернет ошибку если файла нет
    // TODO: и какую именно ошибку

    return Boolean(await this.io.stat(pathToFileOrDir));
  }

  async isFileUtf8(pathTo: string): Promise<boolean> {
    this.checkPermissions(pathTo, 'r');

    // ещё есть пакет - isutf8
    // TODO: лучше считывать не весь файл, 1000 байт но кратно utf8 стандарту бит
    const data: Uint8Array = await this.io.readBinFile(pathTo);

    // TODO: поидее буфера может не быть - наверное лучше использвать в io
    //       или написать свой хэлпер
    return isUtf8(data);
  }

  private checkPermissions(pathTo: string, perm: PermissionFileType) {
    // TODO: throw an error if path is not allowed
  }

  private async prepareBatchFileNames(
    src: string | string[],
    destDir: string
  ): Promise<[string, string][]> {
    let resolvedSrc: string[];
    const prepared: [string, string][] = [];

    if (typeof src === 'string') {
      this.checkPermissions(src, 'r');
      resolvedSrc = [src];
    } else {
      for (const item of src) this.checkPermissions(item, 'r');
      resolvedSrc = src;
    }

    this.checkPermissions(destDir, 'w');

    for (const item of resolvedSrc) {
      const fileStats: StatsSimplified | undefined = await this.io.stat(item);

      if (!fileStats) throw new Error(`File "${item}" doesn't exist`);
      // the same for dir and file
      prepared.push([item, pathJoin(destDir, pathBasename(item))]);
    }

    return prepared;
  }

  /**
   * Make real path on external file system
   * @param pathTo - it has to be /appFiles/..., /cfg/... etc.
   *   /external/extMountedDir/... is a virtual path to virtual dir where some
   *   external virtual dirs are mounted
   * @private
   */
  private makePath(pathTo: string): string {
    if (pathTo.indexOf('/') !== 0) {
      throw new Error(`Path has to start with "/": ${pathTo}`);
    }

    const pathMatch = pathTo.match(/^\/([^\/]+)(\/.+)?$/);

    if (!pathMatch) throw new Error(`Wrong path "${pathTo}"`);

    const subDir = pathMatch[1] as keyof typeof ROOT_DIRS;
    const restPath = pathMatch[2] || '';

    if ((subDir as string) === EXTERNAL_ROOT_DIR) {
      const extMatch = pathTo.match(/^\/([^\/]+)(\/.+)?$/);

      if (!extMatch) throw new Error(`Wrong external path "${pathTo}"`);

      const extDir = extMatch[1];
      const extRestPath = extMatch[2] || '';
      const resolvedExtAbsDir: string | undefined = this.cfg.external[extDir];

      if (resolvedExtAbsDir) return resolvedExtAbsDir + extRestPath;

      throw new Error(`Can't resolve external path "${pathTo}"`);
    }
    // resolve root dir
    const resolvedAbsDir: string | undefined = this.cfg.dirs[subDir];
    // replace sub dir to system path
    if (resolvedAbsDir) return resolvedAbsDir + restPath;

    throw new Error(`Can't resolve path "${pathTo}"`);
  }
}
