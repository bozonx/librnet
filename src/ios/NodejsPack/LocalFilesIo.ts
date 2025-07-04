import fs from 'node:fs/promises';
import { open } from 'node:fs/promises';
import type { Stats } from 'node:fs';
import type { FilesIoType } from '../../types/io/FilesIoType.js';
import type {
  CopyOptions,
  MkdirOptions,
  ReaddirOptions,
  ReadTextFileOptions,
  RmOptions,
  StatsSimplified,
  WriteFileOptions,
} from '../../types/io/FilesIoType.js';
import { IoBase } from '../../system/base/IoBase.js';
import type { BinTypes, BinTypesNames, IoIndex } from '../../types/types.js';
import type { IoContext } from '../../system/context/IoContext.js';
import {
  DEFAULT_ENCODE,
  IO_NAMES,
  IS_TEXT_FILE_UTF8_SAMPLE_SIZE,
} from '../../types/constants.js';
import type { IoSetBase } from '@/system/base/IoSetBase.js';

export const FilesIoIndex: IoIndex = (ioSet: IoSetBase, ctx: IoContext) => {
  return new LocalFilesIo(ioSet, ctx);
};

export class LocalFilesIo extends IoBase implements FilesIoType {
  readonly name = IO_NAMES.LocalFilesIo;

  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    return fs.readFile(pathTo, {
      encoding: options?.encoding || DEFAULT_ENCODE,
    });
  }

  async readBinFile(
    pathTo: string,
    returnType: BinTypesNames = 'Uint8Array'
  ): Promise<BinTypes> {
    const buffer: Buffer = await fs.readFile(pathTo);

    switch (returnType) {
      case 'Int8Array':
        return new Int8Array(buffer);
      case 'Uint8Array':
        return new Uint8Array(buffer);
      case 'Uint8ClampedArray':
        return new Uint8ClampedArray(buffer);
      case 'Int16Array':
        return new Int16Array(buffer);
      case 'Uint16Array':
        return new Uint16Array(buffer);
      case 'Int32Array':
        return new Int32Array(buffer);
      case 'Uint32Array':
        return new Uint32Array(buffer);
      case 'Float32Array':
        return new Float32Array(buffer);
      case 'Float64Array':
        return new Float64Array(buffer);
      case 'BigInt64Array':
        return new BigInt64Array(buffer);
      case 'BigUint64Array':
        return new BigUint64Array(buffer);
      default:
        throw new Error(`Unknown return type: ${returnType}`);
    }
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    try {
      // Получаем размер файла
      const stats = await fs.stat(pathTo);

      // Если файл пустой, считаем его валидным UTF-8
      if (stats.size === 0) {
        return true;
      }

      // Читаем только первые 8KB для проверки UTF-8
      // Этого достаточно для определения кодировки большинства текстовых файлов
      const sampleSize = Math.min(IS_TEXT_FILE_UTF8_SAMPLE_SIZE, stats.size);

      // Открываем файл и читаем только нужную часть
      const fileHandle = await open(pathTo, 'r');
      try {
        const buffer = Buffer.alloc(sampleSize);
        const { bytesRead } = await fileHandle.read(buffer, 0, sampleSize, 0);

        // Используем нативную функцию Buffer.toString() для проверки UTF-8
        // Если файл не является валидным UTF-8, toString() выбросит ошибку
        buffer.subarray(0, bytesRead).toString('utf8');
      } finally {
        await fileHandle.close();
      }
      return true;
    } catch (error) {
      // Если файл не существует или произошла ошибка чтения/декодирования, возвращаем false
      return false;
    }
  }

  async appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void> {
    let wasExist = true;

    try {
      await fs.lstat(pathTo);
    } catch (e) {
      wasExist = false;
    }

    if (typeof data === 'string') {
      // if file doesn't exist it will be created
      await fs.appendFile(pathTo, data, {
        encoding: options?.encoding || DEFAULT_ENCODE,
      });
    } else {
      await fs.appendFile(pathTo, data, options);
    }

    if (!wasExist) await this.chown(pathTo);
  }

  async writeFile(
    pathTo: string,
    data: string | BinTypes,
    options?: WriteFileOptions
  ): Promise<void> {
    if (typeof data === 'string') {
      await fs.writeFile(pathTo, data, {
        encoding: options?.encoding || DEFAULT_ENCODE,
      });
    } else {
      await fs.writeFile(pathTo, data, options);
    }

    await this.chown(pathTo);
  }

  async rm(paths: string[], options?: RmOptions): Promise<void> {
    return Promise.allSettled(paths.map((path) => fs.rm(path, options))).then(
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

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    return Promise.allSettled(
      files.map((item) => fs.cp(item[0], item[1], options))
    ).then((results) => {
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
    });
  }

  async rename(files: [string, string][]): Promise<void> {
    return Promise.allSettled(
      files.map((item) => fs.rename(item[0], item[1]))
    ).then((results) => {
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
    });
  }

  readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    return fs.readdir(pathTo, {
      ...options,
      encoding: options?.encoding || DEFAULT_ENCODE,
    });
  }

  async mkdir(pathTo: string, options?: MkdirOptions): Promise<void> {
    await fs.mkdir(pathTo, options);

    return this.chown(pathTo);
  }

  readlink(pathTo: string): Promise<string> {
    return fs.readlink(pathTo);
  }

  async realpath(pathTo: string): Promise<string> {
    return fs.realpath(pathTo);
  }

  async symlink(target: string, pathTo: string): Promise<void> {
    await fs.symlink(target, pathTo);
    await this.chown(pathTo);
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
    const stat: Stats = await fs.stat(pathTo);

    await fs.chown(
      pathTo,
      this.ioSet.env.FILES_UID || stat.uid,
      this.ioSet.env.FILES_GID || stat.gid
    );
  }
}
