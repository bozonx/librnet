import type { ReadOnlyFilesDriverType } from '../../types/FilesDriverType.js';
import type {
  ReaddirOptions,
  ReadTextFileOptions,
  StatsSimplified,
} from '../../types/io/FilesIoType.js';
import { IO_NAMES } from '../../types/constants.js';
import { System } from '../System.js';
import type { FilesIoType } from '../../types/io/FilesIoType.js';
import type { IoBase } from '../base/IoBase.js';
import type { BinTypes, BinTypesNames } from '@/types/types.js';
import { clearRelPath, pathJoin, trimCharStart } from 'squidlet-lib';

/**
 * Directory trap read only driver logic.
 * It does not allow to access files outside of the directory.
 */
export class DirTrapReadOnly implements ReadOnlyFilesDriverType {
  protected get filesIo(): FilesIoType & IoBase {
    return this.system.io.getIo<FilesIoType & IoBase>(IO_NAMES.LocalFilesIo);
  }

  constructor(
    protected readonly system: System,
    protected readonly rootDir: string
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

  ////////// ADDITIONAL

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

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    return this.filesIo.isTextFileUtf8(this.preparePath(pathTo));
  }

  protected preparePath(pathTo: string): string {
    return pathJoin(this.rootDir, trimCharStart(clearRelPath(pathTo), '/'));
  }
}
