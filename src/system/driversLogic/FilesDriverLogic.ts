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
import { FILE_ACTION } from '../../types/constants.js';

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

  clearPath(pathTo: string): string {
    return trimCharStart(clearRelPath(pathTo), '/');
  }

  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    const preparedPath = this.preparePath(pathTo);

    const result = await this.filesIo.readTextFile(preparedPath, options);

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

    const result = await this.filesIo.readBinFile(preparedPath, returnType);

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

    const result = await this.filesIo.stat(preparedPath);

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

    const result = await this.filesIo.readdir(preparedPath, options);

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
    const result = await this.filesIo.readlink(preparedPath);

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
    const result = await this.filesIo.realpath(preparedPath);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.read,
      method: 'realpath',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт считывается?
    });

    return result;
  }

  ////////// ADDITIONAL

  async isDir(pathToDir: string): Promise<boolean> {
    const preparedPath = this.preparePath(pathToDir);
    const result = (await this.filesIo.stat(preparedPath))?.dir ?? false;

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
    const result = !(await this.isDir(preparedPath));

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
    const result =
      (await this.filesIo.stat(preparedPath))?.symbolicLink ?? false;

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
    const result = !!(await this.stat(preparedPath));

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
    const result = await this.filesIo.isTextFileUtf8(preparedPath);

    this.riseEvent({
      path: preparedPath,
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
    const preparedPath = this.preparePath(pathTo);
    const result = await this.filesIo.appendFile(preparedPath, data, options);

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
  ) {
    const preparedPath = this.preparePath(pathTo);
    const result = await this.filesIo.writeFile(preparedPath, data, options);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.write,
      method: 'writeFile',
      timestamp: Date.now(),
      size: data instanceof Uint8Array ? data.byteLength : data.length,
    });
  }

  async rm(paths: string[], options?: RmOptions) {
    const preparedPaths = paths.map((path) => this.preparePath(path));
    const result = await this.filesIo.rm(preparedPaths, options);

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
    const preparedFiles = files.map(([src, dest]) => {
      return [this.preparePath(src), this.preparePath(dest)];
    });
    const result = await this.filesIo.cp(preparedFiles, options);

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
    const preparedFiles = files.map(([src, dest]) => {
      return [this.preparePath(src), this.preparePath(dest)];
    });
    const result = await this.filesIo.rename(preparedFiles);

    this.riseEvent({
      // TODO: revew
      path: preparedFiles.map(([src]) => src).join(','),
      action: FILE_ACTION.write,
      method: 'rename',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async mkdir(pathTo: string, options?: MkdirOptions) {
    const preparedPath = this.preparePath(pathTo);
    const result = await this.filesIo.mkdir(preparedPath, options);

    this.riseEvent({
      path: preparedPath,
      action: FILE_ACTION.write,
      method: 'mkdir',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }

  async symlink(target: string, pathTo: string): Promise<void> {
    const preparedTarget = this.preparePath(target);
    const preparedPathTo = this.preparePath(pathTo);
    const result = await this.filesIo.symlink(preparedTarget, preparedPathTo);

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
    // TODO: suport glob
    const destPath = this.preparePath(destDir);
    const srcPaths =
      typeof src === 'string'
        ? [this.preparePath(src)]
        : src.map((el) => this.preparePath(el));

    const preparedFiles = srcPaths.map((el) => [
      el,
      pathJoin(destPath, pathBasename(el)),
    ]);
    const result = await this.filesIo.cp(preparedFiles, {
      recursive: true,
      force,
    });

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
    const oldPath = this.preparePath(file);
    const newPath = pathJoin(pathDirname(oldPath), newName);

    const result = await this.filesIo.rename([[oldPath, newPath]]);

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
    const result = await this.filesIo.rm([preparedPath], {
      recursive: true,
      force: true,
    });

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
    const result = await this.filesIo.mkdir(preparedPath, { recursive: true });

    this.riseEvent({
      // TODO: revew
      path: preparedPath,
      action: FILE_ACTION.write,
      method: 'mkDirP',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    });
  }
}
