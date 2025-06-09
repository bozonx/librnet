// import path from 'node:path'
import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { Stats } from 'node:fs';
import {
  pathJoin,
  DEFAULT_ENCODE,
  convertBufferToUint8Array,
} from 'squidlet-lib';
import type FilesIoType from '../../types/io/FilesIoType.js';
import type {
  FilesIoConfig,
  StatsSimplified,
} from '../../types/io/FilesIoType.js';
import { IoBase } from '../../system/base/IoBase.js';
import type { IoIndex } from '../../types/types.js';
import type { IoContext } from '../../system/context/IoContext.js';
import { IO_NAMES, ROOT_DIRS } from '../../types/constants.js';

export const execPromise = promisify(exec);

export const FilesIoIndex: IoIndex = (ctx: IoContext) => {
  return new LocalFilesIo(ctx);
};

export class LocalFilesIo extends IoBase implements FilesIoType {
  readonly name = IO_NAMES.LocalFilesIo;
  private readonly cfg: FilesIoConfig;

  constructor(ctx: IoContext) {
    super(ctx);
  }

  async appendFile(pathTo: string, data: string | Uint8Array): Promise<void> {
    const fullPath = this.makePath(pathTo);
    let wasExist = true;

    try {
      await fs.lstat(pathTo);
    } catch (e) {
      wasExist = false;
    }

    if (typeof data === 'string') {
      await fs.appendFile(fullPath, data, DEFAULT_ENCODE);
    } else {
      await fs.appendFile(fullPath, data);
    }

    if (!wasExist) await this.chown(fullPath);
  }

  async mkdir(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo);

    await fs.mkdir(fullPath);

    return this.chown(fullPath);
  }

  readdir(pathTo: string): Promise<string[]> {
    const fullPath = this.makePath(pathTo);

    return fs.readdir(fullPath, DEFAULT_ENCODE);
  }

  async readTextFile(pathTo: string): Promise<string> {
    const fullPath = this.makePath(pathTo);

    return fs.readFile(fullPath, DEFAULT_ENCODE);
  }

  async readBinFile(pathTo: string): Promise<Uint8Array> {
    const fullPath = this.makePath(pathTo);

    const buffer: Buffer = await fs.readFile(fullPath);

    return convertBufferToUint8Array(buffer);
  }

  readlink(pathTo: string): Promise<string> {
    const fullPath = this.makePath(pathTo);

    return fs.readlink(fullPath);
  }

  rmdir(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo);

    return fs.rmdir(fullPath);
  }

  unlink(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo);

    return fs.unlink(fullPath);
  }

  async writeFile(pathTo: string, data: string | Uint8Array): Promise<void> {
    const fullPath = this.makePath(pathTo);

    if (typeof data === 'string') {
      await fs.writeFile(fullPath, data, DEFAULT_ENCODE);
    } else {
      await fs.writeFile(fullPath, data);
    }

    await this.chown(fullPath);
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const fullPath = this.makePath(pathTo);
    let stat: Stats;

    try {
      stat = await fs.lstat(fullPath);
    } catch (e) {
      return undefined;
    }

    return {
      size: stat.size,
      dir: stat.isDirectory(),
      symbolicLink: stat.isSymbolicLink(),
      mtime: stat.mtime.getTime(),
    };
  }

  async copyFiles(files: [string, string][]): Promise<void> {
    for (const item of files) {
      const dest = this.makePath(item[1]);
      const src = this.makePath(item[0]);

      await fs.copyFile(src, dest);
      await this.chown(dest);
    }
  }

  async renameFiles(files: [string, string][]): Promise<void> {
    for (const item of files) {
      const oldPath = this.makePath(item[0]);
      const newPath = this.makePath(item[1]);

      await fs.rename(oldPath, newPath);
    }
  }

  async rmdirR(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo);

    const res = await execPromise(`rm -R "${fullPath}"`);

    // TODO: а резве ошибка не произойдёт?
    if (res.stderr) {
      throw new Error(`Can't remove a directory recursively: ${res.stderr}`);
    }

    return;
  }

  async mkDirP(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo);
    const res = await execPromise(`mkdir -p "${fullPath}"`);

    // TODO: а резве ошибка не произойдёт?
    if (res.stderr) {
      throw new Error(`Can't mkDirP: ${res.stderr}`);
    }

    return;
  }

  private async chown(pathTo: string) {
    if (!this.cfg.uid && !this.cfg.gid) {
      // if noting to change - just return
      return;
    } else if (this.cfg.uid && this.cfg.gid) {
      // uid and gid are specified - set both
      return await fs.chown(pathTo, this.cfg.uid, this.cfg.gid);
    }
    // else load stats to resolve lack of params
    const stat: Stats = await fs.lstat(pathTo);

    await fs.chown(
      pathTo,
      !this.cfg.uid ? stat.uid : this.cfg.uid,
      !this.cfg.gid ? stat.gid : this.cfg.gid
    );
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
