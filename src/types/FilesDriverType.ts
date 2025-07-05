import type {
  CopyOptions,
  MkdirOptions,
  ReaddirOptions,
  ReadTextFileOptions,
  RmOptions,
  StatsSimplified,
  WriteFileOptions,
} from './io/FilesIoType.js';
import type { BinTypes, BinTypesNames } from './types';

export interface ReadOnlyFilesDriverType {
  readTextFile(pathTo: string, options?: ReadTextFileOptions): Promise<string>;
  readBinFile(pathTo: string, returnType?: BinTypesNames): Promise<BinTypes>;
  stat(pathTo: string): Promise<StatsSimplified | undefined>;
  readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]>;
  readlink(pathTo: string): Promise<string>;
  // skip realpath

  ////////// ADDITIONAL
  isDir(pathToDir: string): Promise<boolean>;
  isFile(pathToFile: string): Promise<boolean>;
  isSymLink(pathToSymLink: string): Promise<boolean>;
  isExists(pathToFileOrDir: string): Promise<boolean>;
  isTextFileUtf8(pathTo: string): Promise<boolean>;
}

export interface WriteFilesDriverType {
  appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void>;
  writeFile(
    pathTo: string,
    data: string | BinTypes,
    options?: WriteFileOptions
  ): Promise<void>;
  rm(paths: string[], options?: RmOptions): Promise<void>;
  cp(files: [string, string][], options?: CopyOptions): Promise<void>;
  rename(files: [string, string][]): Promise<void>;
  mkdir(pathTo: string, options?: MkdirOptions): Promise<void>;
  symlink(target: string, pathTo: string): Promise<void>;

  ////////// ADDITIONAL

  /**
   * Copy files to destination directory recursively
   * @param src - source path or array of paths. Glob is supported.
   * @param destDir - destination directory
   * @returns
   */
  copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void>;

  /**
   * Move files to destination directory recursively.
   * First it copies files and after thar removes src
   * @param src - source path or array of paths. Glob is supported.
   * @param destDir - destination directory
   * @returns
   */
  moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void>;

  /**
   * Rename file
   * @param file - file path
   * @param newName - new name (not path)
   * @returns
   */
  renameFile(file: string, newName: string): Promise<void>;

  /**
   * Remove file or directory recursively
   * @param pathToFileOrDir - file or directory path
   * @returns
   */
  rmRf(pathToFileOrDir: string): Promise<void>;

  /**
   * Create directory recursively
   * @param pathToDir - directory path
   * @returns
   */
  mkDirP(pathToDir: string): Promise<void>;
}

export type FilesDriverType = ReadOnlyFilesDriverType & WriteFilesDriverType;
