import type { FilesDriver } from '@/packages/SystemCommonPkg/FilesDriver/FilesDriver.js';
import type { FilesDriverType } from '../../types/FilesDriverType.js';
import type { StatsSimplified } from '../../types/io/FilesIoType.js';
import { pathJoin } from 'squidlet-lib';

/**
 * This is implementation of files driver which is
 *  restricting access to the files ony in the dir
 */
export class RestrictedDir implements FilesDriverType {
  readonly rootDir: string;
  protected readonly filesDriver: FilesDriver;
  readonly readonly: boolean;

  constructor(
    filesDriver: FilesDriver,
    rootDir: string,
    readonly: boolean = false
  ) {
    this.filesDriver = filesDriver;
    this.rootDir = rootDir;
    this.readonly = readonly;
  }

  async readDir(pathTo: string): Promise<string[]> {
    return this.filesDriver.readDir(this.preparePath(pathTo));
  }

  async readTextFile(pathTo: string): Promise<string> {
    return this.filesDriver.readTextFile(this.preparePath(pathTo));
  }

  async readBinFile(pathTo: string): Promise<Uint8Array> {
    return this.filesDriver.readBinFile(this.preparePath(pathTo));
  }

  async readlink(pathTo: string): Promise<string> {
    return this.filesDriver.readlink(this.preparePath(pathTo));
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    return this.filesDriver.stat(this.preparePath(pathTo));
  }

  async isDir(pathToDir: string): Promise<boolean> {
    return this.filesDriver.isDir(this.preparePath(pathToDir));
  }

  async isFile(pathToFile: string): Promise<boolean> {
    return this.filesDriver.isFile(this.preparePath(pathToFile));
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    return this.filesDriver.isExists(this.preparePath(pathToFileOrDir));
  }

  async isFileUtf8(pathTo: string): Promise<boolean> {
    return this.filesDriver.isFileUtf8(this.preparePath(pathTo));
  }

  async appendFile(pathTo: string, data: string | Uint8Array) {
    return this.filesDriver.appendFile(this.preparePath(pathTo), data);
  }

  async mkdir(pathTo: string) {
    return this.filesDriver.mkdir(this.preparePath(pathTo));
  }

  async rmdir(pathTo: string) {
    return this.filesDriver.rmdir(this.preparePath(pathTo));
  }

  async unlink(pathTo: string) {
    return this.filesDriver.unlink(this.preparePath(pathTo));
  }

  async writeFile(pathTo: string, data: string | Uint8Array) {
    return this.filesDriver.writeFile(this.preparePath(pathTo), data);
  }

  async copyFiles(files: [string, string][]) {
    return this.filesDriver.copyFiles(
      files.map(([src, dest]) => {
        return [this.preparePath(src), this.preparePath(dest)];
      })
    );
  }

  async renameFiles(files: [string, string][]) {
    return this.filesDriver.copyFiles(
      files.map(([src, dest]) => {
        return [this.preparePath(src), this.preparePath(dest)];
      })
    );
  }

  async rmdirR(pathToDir: string): Promise<void> {
    return this.filesDriver.rmdirR(this.preparePath(pathToDir));
  }

  async mkDirP(pathToDir: string): Promise<void> {
    return this.filesDriver.mkDirP(this.preparePath(pathToDir));
  }

  ////////// ADDITIONAL

  async rm(pathToFileOrDir: string) {
    return this.filesDriver.rm(this.preparePath(pathToFileOrDir));
  }

  async cp(src: string | string[], destDir: string): Promise<void> {
    const fixedSrc =
      typeof src === 'string'
        ? this.preparePath(src)
        : src.map((el) => this.preparePath(el));

    return this.filesDriver.cp(fixedSrc, this.preparePath(destDir));
  }

  async mv(src: string | string[], destDir: string): Promise<void> {
    const fixedSrc =
      typeof src === 'string'
        ? this.preparePath(src)
        : src.map((el) => this.preparePath(el));

    return this.filesDriver.mv(fixedSrc, this.preparePath(destDir));
  }

  async rename(pathToFileOrDir: string, newName: string): Promise<void> {
    return this.filesDriver.rename(this.preparePath(pathToFileOrDir), newName);
  }

  private preparePath(pathTo: string): string {
    return pathJoin(this.rootDir, trimCharStart(clearRelPath(pathTo), '/'));
  }
}
