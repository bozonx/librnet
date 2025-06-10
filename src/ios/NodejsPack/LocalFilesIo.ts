import fs from 'node:fs/promises';
import type { Stats } from 'node:fs';
import { DEFAULT_ENCODE, convertBufferToUint8Array } from 'squidlet-lib';
import type FilesIoType from '../../types/io/FilesIoType.js';
import type { StatsSimplified } from '../../types/io/FilesIoType.js';
import { IoBase } from '../../system/base/IoBase.js';
import type { IoIndex } from '../../types/types.js';
import type { IoContext } from '../../system/context/IoContext.js';
import { IO_NAMES } from '../../types/constants.js';
import type { IoSetBase } from '@/system/base/IoSetBase.js';

export const FilesIoIndex: IoIndex = (ioSet: IoSetBase, ctx: IoContext) => {
  return new LocalFilesIo(ioSet, ctx);
};

export class LocalFilesIo extends IoBase implements FilesIoType {
  readonly name = IO_NAMES.LocalFilesIo;

  async readTextFile(pathTo: string): Promise<string> {
    return fs.readFile(pathTo, DEFAULT_ENCODE);
  }

  async readBinFile(pathTo: string): Promise<Uint8Array> {
    const buffer: Buffer = await fs.readFile(pathTo);

    return convertBufferToUint8Array(buffer);
  }

  readlink(pathTo: string): Promise<string> {
    return fs.readlink(pathTo);
  }

  async appendFile(pathTo: string, data: string | Uint8Array): Promise<void> {
    let wasExist = true;

    try {
      await fs.lstat(pathTo);
    } catch (e) {
      wasExist = false;
    }

    if (typeof data === 'string') {
      // if file doesn't exist it will be created
      await fs.appendFile(pathTo, data, DEFAULT_ENCODE);
    } else {
      await fs.appendFile(pathTo, data);
    }

    if (!wasExist) await this.chown(pathTo);
  }

  async writeFile(pathTo: string, data: string | Uint8Array): Promise<void> {
    if (typeof data === 'string') {
      await fs.writeFile(pathTo, data, DEFAULT_ENCODE);
    } else {
      await fs.writeFile(pathTo, data);
    }

    await this.chown(pathTo);
  }

  async unlink(paths: string[]): Promise<PromiseSettledResult<void>[]> {
    return Promise.allSettled(paths.map((path) => fs.unlink(path))).then(
      (results) => {
        const errors = results
          .filter(
            (result): result is PromiseRejectedResult =>
              result.status === 'rejected'
          )
          .map((result) => ({
            path: result.reason.path || 'unknown',
            error: result.reason.message || 'Unknown error',
          }));

        if (errors.length > 0) {
          throw errors;
        }

        return results;
      }
    );
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    let stat: Stats;

    try {
      stat = await fs.stat(pathTo);
    } catch (e) {
      return undefined;
    }

    return {
      size: stat.size,
      dir: stat.isDirectory(),
      symbolicLink: stat.isSymbolicLink(),
      mtime: stat.mtime.getTime(),
      atime: stat.atime.getTime(),
      ctime: stat.ctime.getTime(),
      birthtime: stat.birthtime.getTime(),
      mode: stat.mode,
      uid: stat.uid,
      gid: stat.gid,
      dev: stat.dev,
      ino: stat.ino,
      nlink: stat.nlink,
      rdev: stat.rdev,
      blksize: stat.blksize,
      blocks: stat.blocks,
    };
  }

  // TODO: возвращать массив ошибок
  async copyFiles(files: [string, string][]): Promise<void> {
    for (const item of files) {
      await fs.copyFile(item[0], item[1]);
      await this.chown(item[1]);
    }
  }

  // TODO: возвращать массив ошибок
  async renameFiles(files: [string, string][]): Promise<void> {
    for (const item of files) {
      await fs.rename(item[0], item[1]);
    }
  }

  readdir(pathTo: string): Promise<string[]> {
    return fs.readdir(pathTo, DEFAULT_ENCODE);
  }

  async mkdir(pathTo: string): Promise<void> {
    await fs.mkdir(pathTo);

    return this.chown(pathTo);
  }

  async mkDirP(pathTo: string): Promise<void> {
    await fs.mkdir(pathTo, { recursive: true });
  }

  rmdir(pathTo: string): Promise<void> {
    return fs.rmdir(pathTo);
  }

  async rmdirRf(pathTo: string): Promise<void> {
    await fs.rm(pathTo, { force: true, recursive: true });
  }

  private async chown(pathTo: string) {
    if (!this.ioSet.env.FILES_UID && !this.ioSet.env.FILES_GID) {
      // if noting to change - just return
      return;
    } else if (this.ioSet.env.FILES_UID && this.ioSet.env.FILES_GID) {
      // uid and gid are specified - set both
      return await fs.chown(
        pathTo,
        this.ioSet.env.FILES_UID,
        this.ioSet.env.FILES_GID
      );
    }
    // else load stats to resolve lack of params
    const stat: Stats = await fs.lstat(pathTo);

    await fs.chown(
      pathTo,
      !this.ioSet.env.FILES_UID ? stat.uid : this.ioSet.env.FILES_UID,
      !this.ioSet.env.FILES_GID ? stat.gid : this.ioSet.env.FILES_GID
    );
  }
}
