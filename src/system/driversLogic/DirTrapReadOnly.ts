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
}
