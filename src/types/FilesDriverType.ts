import type {
  AccessMode,
  CopyOptions,
  GlobOptions,
  LinkOptions,
  MkdirOptions,
  ReadBinFileOptions,
  ReadTextFileOptions,
  ReaddirOptions,
  RmOptions,
  StatsSimplified,
  UtimesOptions,
  WriteFileOptions,
} from './io/FilesIoType.js'
import type { BinTypes } from './types'

export interface ReadOnlyFilesDriverType {
  readTextFile(pathTo: string, options?: ReadTextFileOptions): Promise<string>
  readBinFile(pathTo: string, options?: ReadBinFileOptions): Promise<BinTypes>
  stat(pathTo: string): Promise<StatsSimplified | undefined>
  exists(pathTo: string): Promise<boolean>
  readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]>
  readlink(pathTo: string): Promise<string>
  isTextFileUtf8(pathTo: string): Promise<boolean>
  realpath(pathTo: string): Promise<string>
  glob(pattern: string | string[], options?: GlobOptions): Promise<string[]>
  access(pathTo: string, mode?: AccessMode): Promise<boolean>

  ////////// ADDITIONAL
  isDir(pathToDir: string): Promise<boolean>
  isFile(pathToFile: string): Promise<boolean>
  isSymLink(pathToSymLink: string): Promise<boolean>
}

export interface WriteFilesDriverType {
  appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void>
  writeFile(
    pathTo: string,
    data: string | BinTypes,
    options?: WriteFileOptions
  ): Promise<void>
  rm(paths: string[], options?: RmOptions): Promise<void>
  cp(files: [string, string][], options?: CopyOptions): Promise<void>
  rename(files: [string, string][]): Promise<void>
  mkdir(pathTo: string, options?: MkdirOptions): Promise<void>
  link(target: string, pathTo: string, options?: LinkOptions): Promise<void>
  utimes(
    pathTo: string,
    atime: number | string,
    mtime: number | string,
    options?: UtimesOptions
  ): Promise<void>
  truncate(pathTo: string, len: number): Promise<void>
  chown(pathTo: string, uid: number, gid: number): Promise<void>
  chmod(pathTo: string, mode: number): Promise<void>

  ////////// ADDITIONAL

  /**
   * Copy files to destination directory recursively
   *
   * @param src - Source path or array of paths. Glob is supported.
   * @param destDir - Destination directory
   * @returns
   */
  copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void>

  /**
   * Move files to destination directory recursively. First it copies files and
   * after thar removes src
   *
   * @param src - Source path or array of paths. Glob is supported.
   * @param destDir - Destination directory
   * @returns
   */
  moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void>

  /**
   * Rename file
   *
   * @param file - File path
   * @param newName - New name (not path)
   * @returns
   */
  renameFile(file: string, newName: string): Promise<void>

  /**
   * Remove file or directory recursively
   *
   * @param pathToFileOrDir - File or directory path
   * @returns
   */
  rmRf(pathToFileOrDir: string): Promise<void>

  /**
   * Create directory recursively
   *
   * @param pathToDir - Directory path
   * @returns
   */
  mkDirP(pathToDir: string): Promise<void>
}

export type FilesDriverType = ReadOnlyFilesDriverType & WriteFilesDriverType
