import type { FilesDriverType } from '../../types/FilesDriverType.js';
import type {
  CopyOptions,
  RmOptions,
  WriteFileOptions,
  ReadTextFileOptions,
  ReaddirOptions,
  StatsSimplified,
} from '../../types/io/FilesIoType.js';
import type { MkdirOptions } from '../../types/io/FilesIoType.js';
import {
  pathBasename,
  pathDirname,
  pathJoin,
  clearRelPath,
  trimCharStart,
} from 'squidlet-lib';
import type { FilesIoType } from '../../types/io/FilesIoType.js';
import type { IoBase } from '../base/IoBase.js';
import type {
  BinTypes,
  BinTypesNames,
  FilesEventData,
} from '../../types/types.js';
import {
  FILE_ACTION,
  IS_TEXT_FILE_UTF8_SAMPLE_SIZE,
} from '../../types/constants.js';

/**
 * Logic of the files driver which
 * - adds more methods
 * - ️️‼️❓resolves glob patterns
 * - emits events
 * - uses preparePath which you should implement in your driver
 */
export abstract class FilesDriverLogic implements FilesDriverType {
  constructor(
    protected readonly filesIo: FilesIoType & IoBase,
    protected readonly riseEvent: (event: FilesEventData) => void
  ) {}

  protected abstract preparePath(pathTo: string): string;

  // TODO: Move to helpers
  clearPath(pathTo: string): string {
    return trimCharStart(clearRelPath(pathTo), '/');
  }

  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    const result = await this.filesIo.readTextFile(
      this.preparePath(pathTo),
      options
    );

    this.riseEvent({
      path: pathTo,
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
    const result = await this.filesIo.readBinFile(
      this.preparePath(pathTo),
      returnType
    );

    this.riseEvent({
      path: pathTo,
      action: FILE_ACTION.read,
      method: 'readBinFile',
      timestamp: Date.now(),
      size: result.byteLength,
    });

    return result;
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const result = await this.filesIo.stat(this.preparePath(pathTo));

    this.riseEvent({
      path: pathTo,
      action: FILE_ACTION.read,
      method: 'stat',
      timestamp: Date.now(),
      // do not calculate size because it is very difficult to do
      // it depends on the file system, OS and cache
    });

    return result;
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    const result = await this.filesIo.readdir(
      this.preparePath(pathTo),
      options
    );

    this.riseEvent({
      path: pathTo,
      action: FILE_ACTION.read,
      method: 'readdir',
      timestamp: Date.now(),
      size: result.reduce((acc, item) => acc + item.length, 0),
      details: {
        recursive: options?.recursive ?? false,
      },
    });

    return result;
  }

  async readlink(pathTo: string): Promise<string> {
    const result = await this.filesIo.readlink(this.preparePath(pathTo));

    this.riseEvent({
      path: pathTo,
      action: FILE_ACTION.read,
      method: 'readlink',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт считывается?
    });

    return result;
  }

  // TODO: зачем это в драйере?
  // async realpath(pathTo: string): Promise<string> {
  //   const result = await this.filesIo.realpath(this.preparePath(pathTo));

  //   this.riseEvent({
  //     path: pathTo,
  //     action: FILE_ACTION.read,
  //     method: 'realpath',
  //     timestamp: Date.now(),
  //     // TODO: известно ли сколько байт считывается?
  //   });

  //   return result;
  // }

  ////////// ADDITIONAL

  async isDir(pathToDir: string): Promise<boolean> {
    const result =
      (await this.filesIo.stat(this.preparePath(pathToDir)))?.dir ?? false;

    this.riseEvent({
      path: pathToDir,
      action: FILE_ACTION.read,
      method: 'isDir',
      timestamp: Date.now(),
      // do not calculate size
    });

    return result;
  }

  async isFile(pathToFile: string): Promise<boolean> {
    const result = !(await this.isDir(this.preparePath(pathToFile)));

    this.riseEvent({
      path: pathToFile,
      action: FILE_ACTION.read,
      method: 'isFile',
      timestamp: Date.now(),
      // do not calculate size
    });

    return result;
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    const result =
      (await this.filesIo.stat(this.preparePath(pathToSymLink)))
        ?.symbolicLink ?? false;

    this.riseEvent({
      path: pathToSymLink,
      action: FILE_ACTION.read,
      method: 'isSymLink',
      timestamp: Date.now(),
      // do not calculate size
    });

    return result;
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    const result = !!(await this.stat(this.preparePath(pathToFileOrDir)));

    this.riseEvent({
      path: pathToFileOrDir,
      action: FILE_ACTION.read,
      method: 'isExists',
      timestamp: Date.now(),
      // do not calculate size
    });

    return result;
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    const result = await this.filesIo.isTextFileUtf8(this.preparePath(pathTo));

    this.riseEvent({
      path: pathTo,
      action: FILE_ACTION.read,
      method: 'isTextFileUtf8',
      timestamp: Date.now(),
      size: IS_TEXT_FILE_UTF8_SAMPLE_SIZE,
    });

    return result;
  }

  ///////// WRITE METHODS

  async appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ) {
    await this.filesIo.appendFile(this.preparePath(pathTo), data, options);

    this.riseEvent({
      path: pathTo,
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
  ) {
    await this.filesIo.writeFile(this.preparePath(pathTo), data, options);

    this.riseEvent({
      path: pathTo,
      action: FILE_ACTION.write,
      method: 'writeFile',
      timestamp: Date.now(),
      size: data instanceof Uint8Array ? data.byteLength : data.length,
    });
  }

  async rm(paths: string[], options?: RmOptions) {
    await this.filesIo.rm(
      paths.map((path) => this.preparePath(path)),
      options
    );

    for (const path of paths) {
      this.riseEvent({
        path,
        action: FILE_ACTION.write,
        method: 'rm',
        timestamp: Date.now(),
        // Do not calculate size because it is very difficult to do
        // it depends on the file system, OS journaling and cache
      });
    }
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    await this.filesIo.cp(
      files.map(([src, dest]) => [
        this.preparePath(src),
        this.preparePath(dest),
      ]),
      options
    );

    for (const [src, dest] of files) {
      // TODO: Делает 2 операциияя - считываение и запись
      this.riseEvent({
        path: dest,
        action: FILE_ACTION.write,
        method: 'cp',
        timestamp: Date.now(),
        details: {
          src,
          recursive: options?.recursive ?? false,
        },
        // TODO: calculate size
      });
    }
  }

  async rename(files: [string, string][]): Promise<void> {
    await this.filesIo.rename(
      files.map(([src, dest]) => [
        this.preparePath(src),
        this.preparePath(dest),
      ])
    );

    for (const [src, dest] of files) {
      this.riseEvent({
        path: dest,
        action: FILE_ACTION.write,
        method: 'rename',
        timestamp: Date.now(),
        details: {
          src,
        },
        // TODO: нужно определить находятся ли файлы на разных дисках
        // и если да, то нужно считать размер файлов
        // TODO: Делает 2 операциияя - считываение и запись
      });
    }
  }

  async mkdir(pathTo: string, options?: MkdirOptions) {
    await this.filesIo.mkdir(this.preparePath(pathTo), options);

    this.riseEvent({
      path: pathTo,
      action: FILE_ACTION.write,
      method: 'mkdir',
      timestamp: Date.now(),
      details: {
        recursive: options?.recursive ?? false,
      },
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async symlink(target: string, pathTo: string): Promise<void> {
    const preparedTarget = this.preparePath(target);
    const preparedPathTo = this.preparePath(pathTo);

    await this.filesIo.symlink(preparedTarget, preparedPathTo);

    this.riseEvent({
      path: pathTo,
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
    const preparedDestDir = this.preparePath(destDir);
    const srcPaths = typeof src === 'string' ? [src] : src;

    await this.filesIo.cp(
      srcPaths.map((el) => [el, pathJoin(preparedDestDir, pathBasename(el))]),
      {
        recursive: true,
        force,
      }
    );

    for (const [src, dest] of srcPaths.map((el) => [
      el,
      pathJoin(destDir, pathBasename(el)),
    ])) {
      // TODO: Делает 2 операциияя - считываение и запись
      this.riseEvent({
        // TODO: revew
        path: dest,
        action: FILE_ACTION.write,
        method: 'copyToDest',
        timestamp: Date.now(),
        details: {
          src,
        },
        // TODO: считать размер файлов
      });
    }
  }

  async moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    // TODO: suport glob
    const destPath = this.preparePath(destDir);
    const srcPaths =
      typeof src === 'string'
        ? [this.preparePath(src)]
        : src.map((el) => this.preparePath(el));
    // first copy to dest
    await this.cp(
      srcPaths.map((el) => [el, pathJoin(destPath, pathBasename(el))]),
      {
        recursive: true,
        force,
      }
    );
    // then remove src
    await this.rm(srcPaths, { recursive: true, force });

    // TODO: Делает 2 операциияя - считываение и запись

    this.riseEvent({
      // TODO: revew
      path: preparedSrc.join(','),
      action: FILE_ACTION.write,
      method: 'moveToDest',
      timestamp: Date.now(),
      // TODO: нужно определить находятся ли файлы на разных дисках
      // и если да, то нужно считать размер файлов
    });
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const oldPath = this.preparePath(file);
    const newPath = pathJoin(pathDirname(oldPath), newName);

    await this.filesIo.rename([[oldPath, newPath]]);

    this.riseEvent({
      // TODO: revew
      path: newPath,
      action: FILE_ACTION.write,
      method: 'renameFile',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    await this.filesIo.rm([this.preparePath(pathToFileOrDir)], {
      recursive: true,
      force: true,
    });

    this.riseEvent({
      // TODO: revew
      path: pathToFileOrDir,
      action: FILE_ACTION.write,
      method: 'rmRf',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async mkDirP(pathToDir: string): Promise<void> {
    await this.filesIo.mkdir(this.preparePath(pathToDir), { recursive: true });

    this.riseEvent({
      // TODO: revew
      path: pathToDir,
      action: FILE_ACTION.write,
      method: 'mkDirP',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }
}
