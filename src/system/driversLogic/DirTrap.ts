import type { FilesDriverType } from '../../types/FilesDriverType.js';
import type {
  CopyOptions,
  ReaddirOptions,
  ReadTextFileOptions,
  RmOptions,
  StatsSimplified,
  WriteFileOptions,
} from '../../types/io/FilesIoType.js';
import type { MkdirOptions } from '../../types/io/FilesIoType.js';
import {
  clearRelPath,
  pathDirname,
  pathJoin,
  trimCharStart,
} from 'squidlet-lib';
import { IO_NAMES } from '../../types/constants.js';
import { System } from '../System.js';
import type { FilesIoType } from '../../types/io/FilesIoType.js';
import type { IoBase } from '../base/IoBase.js';
import type { BinTypes, BinTypesNames } from '@/types/types.js';

/**
 * This is implementation of files driver which is
 *  restricting access to the files ony in the dir
 */
export class DirTrap implements FilesDriverType {
  private get filesIo(): FilesIoType & IoBase {
    return this.system.io.getIo<FilesIoType & IoBase>(IO_NAMES.LocalFilesIo);
  }

  constructor(
    private readonly system: System,
    private readonly rootDir: string
  ) {}

  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    return this.filesIo.readTextFile(this.preparePath(pathTo), options);
  }

  async readBinFile(
    pathTo: string,
    returnType?: BinTypesNames
  ): Promise<BinTypes> {
    return this.filesIo.readBinFile(this.preparePath(pathTo), returnType);
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    return this.filesIo.stat(this.preparePath(pathTo));
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    return this.filesIo.readdir(this.preparePath(pathTo), options);
  }

  async readlink(pathTo: string): Promise<string> {
    return this.filesIo.readlink(this.preparePath(pathTo));
  }

  async realpath(pathTo: string): Promise<string> {
    return this.filesIo.realpath(this.preparePath(pathTo));
  }

  async isDir(pathToDir: string): Promise<boolean> {
    return (await this.filesIo.stat(this.preparePath(pathToDir)))?.dir ?? false;
  }

  async isFile(pathToFile: string): Promise<boolean> {
    return !(await this.isDir(pathToFile));
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    return (
      (await this.filesIo.stat(this.preparePath(pathToSymLink)))
        ?.symbolicLink ?? false
    );
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    return !!(await this.stat(this.preparePath(pathToFileOrDir)));
  }

  async isFileUtf8(pathTo: string): Promise<boolean> {
    // TODO: implement this
    // return this.filesIo.isFileUtf8(this.preparePath(pathTo));
  }

  ////////// WRITE

  async appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ) {
    return this.filesIo.appendFile(this.preparePath(pathTo), data, options);
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ) {
    return this.filesIo.writeFile(this.preparePath(pathTo), data, options);
  }

  async rm(paths: string[], options?: RmOptions) {
    return this.filesIo.rm(
      paths.map((path) => this.preparePath(path)),
      options
    );
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    return this.filesIo.cp(
      files.map(([src, dest]) => {
        return [this.preparePath(src), this.preparePath(dest)];
      }),
      options
    );
  }

  async rename(files: [string, string][]): Promise<void> {
    return this.filesIo.rename(
      files.map(([src, dest]) => {
        return [this.preparePath(src), this.preparePath(dest)];
      })
    );
  }

  async mkdir(pathTo: string, options?: MkdirOptions) {
    return this.filesIo.mkdir(this.preparePath(pathTo), options);
  }

  async symlink(target: string, pathTo: string): Promise<void> {
    return this.filesIo.symlink(
      this.preparePath(target),
      this.preparePath(pathTo)
    );
  }

  ////////// ADDITIONAL

  async copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const destPath = this.preparePath(destDir);
    const srcPaths =
      typeof src === 'string'
        ? [this.preparePath(src)]
        : src.map((el) => this.preparePath(el));

    return this.filesIo.cp(
      // TODO: восстановить полные пути
      srcPaths.map((el) => [el, destPath]),
      { recursive: true, force }
    );
  }

  async moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    // TODO: может через копию делать

    return this.filesIo.rename(
      typeof src === 'string'
        ? [[this.preparePath(src), this.preparePath(destDir)]]
        : src.map((el) => [this.preparePath(el), this.preparePath(destDir)]),
      { recursive: true, force }
    );
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const oldPath = this.preparePath(file);
    const newPath = pathJoin(pathDirname(oldPath), newName);

    return this.filesIo.rename([[oldPath, newPath]]);
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    return this.filesIo.rm([this.preparePath(pathToFileOrDir)], {
      recursive: true,
      force: true,
    });
  }

  async mkDirP(pathToDir: string): Promise<void> {
    // TODO: если директория уже существует, будет ли ошибка?
    return this.filesIo.mkdir(this.preparePath(pathToDir), { recursive: true });
  }

  private preparePath(pathTo: string): string {
    return pathJoin(this.rootDir, trimCharStart(clearRelPath(pathTo), '/'));
  }
}
