import type { FilesDriverType } from '../../types/FilesDriverType.js';
import type { StatsSimplified } from '../../types/io/FilesIoType.js';
import { pathJoin, trimCharStart } from 'squidlet-lib';
import { IO_NAMES } from '../../types/constants.js';
import { LocalFilesIo } from '../../packages/SystemCommonPkg/io/LocalFilesIo.js';
import { System } from '../System.js';

/**
 * This is implementation of files driver which is
 *  restricting access to the files ony in the dir
 */
export class DirTrapReadOnly implements FilesDriverType {
  private get filesIo(): LocalFilesIo {
    return this.system.io.getIo(IO_NAMES.LocalFilesIo);
  }

  constructor(
    private readonly system: System,
    private readonly rootDir: string,
    private readonly readOnly: boolean = false
  ) {}

  async readDir(pathTo: string): Promise<string[]> {
    return this.filesIo.readDir(this.preparePath(pathTo));
  }

  async readTextFile(pathTo: string): Promise<string> {
    return this.filesIo.readTextFile(this.preparePath(pathTo));
  }

  async readBinFile(pathTo: string): Promise<Uint8Array> {
    return this.filesIo.readBinFile(this.preparePath(pathTo));
  }

  async readlink(pathTo: string): Promise<string> {
    return this.filesIo.readlink(this.preparePath(pathTo));
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    return this.filesIo.stat(this.preparePath(pathTo));
  }

  async isDir(pathToDir: string): Promise<boolean> {
    return this.filesIo.isDir(this.preparePath(pathToDir));
  }

  async isFile(pathToFile: string): Promise<boolean> {
    return this.filesIo.isFile(this.preparePath(pathToFile));
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    return this.filesIo.isExists(this.preparePath(pathToFileOrDir));
  }

  async isFileUtf8(pathTo: string): Promise<boolean> {
    return this.filesIo.isFileUtf8(this.preparePath(pathTo));
  }

  async appendFile(pathTo: string, data: string | Uint8Array) {
    return this.filesIo.appendFile(this.preparePath(pathTo), data);
  }

  async mkdir(pathTo: string) {
    return this.filesIo.mkdir(this.preparePath(pathTo));
  }

  async rmdir(pathTo: string) {
    return this.filesIo.rmdir(this.preparePath(pathTo));
  }

  async unlink(pathTo: string) {
    return this.filesIo.unlink(this.preparePath(pathTo));
  }

  async writeFile(pathTo: string, data: string | Uint8Array) {
    return this.filesIo.writeFile(this.preparePath(pathTo), data);
  }

  async copyFiles(files: [string, string][]) {
    return this.filesIo.copyFiles(
      files.map(([src, dest]) => {
        return [this.preparePath(src), this.preparePath(dest)];
      })
    );
  }

  async renameFiles(files: [string, string][]) {
    return this.filesIo.copyFiles(
      files.map(([src, dest]) => {
        return [this.preparePath(src), this.preparePath(dest)];
      })
    );
  }

  async rmdirR(pathToDir: string): Promise<void> {
    return this.filesIo.rmdirR(this.preparePath(pathToDir));
  }

  async mkDirP(pathToDir: string): Promise<void> {
    return this.filesIo.mkDirP(this.preparePath(pathToDir));
  }

  ////////// ADDITIONAL

  async rm(pathToFileOrDir: string) {
    return this.filesIo.rm(this.preparePath(pathToFileOrDir));
  }

  async cp(src: string | string[], destDir: string): Promise<void> {
    const fixedSrc =
      typeof src === 'string'
        ? this.preparePath(src)
        : src.map((el) => this.preparePath(el));

    return this.filesIo.cp(fixedSrc, this.preparePath(destDir));
  }

  async mv(src: string | string[], destDir: string): Promise<void> {
    const fixedSrc =
      typeof src === 'string'
        ? this.preparePath(src)
        : src.map((el) => this.preparePath(el));

    return this.filesIo.mv(fixedSrc, this.preparePath(destDir));
  }

  async rename(pathToFileOrDir: string, newName: string): Promise<void> {
    return this.filesIo.rename(this.preparePath(pathToFileOrDir), newName);
  }

  private preparePath(pathTo: string): string {
    return pathJoin(this.rootDir, trimCharStart(clearRelPath(pathTo), '/'));
  }
}
