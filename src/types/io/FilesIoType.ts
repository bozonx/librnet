import type { BinTypes, BinTypesNames } from '../types';

export interface StatsSimplified {
  // in bytes
  size: number;
  // is it dir or file
  dir: boolean;
  symbolicLink: boolean;
  // modified time - number of milliseconds elapsed since 1 January 1970 00:00:00 UTC
  mtime: number;
  // access time - number of milliseconds elapsed since 1 January 1970 00:00:00 UTC
  atime: number;
  // change time - number of milliseconds elapsed since 1 January 1970 00:00:00 UTC
  ctime: number;
  // birth time - number of milliseconds elapsed since 1 January 1970 00:00:00 UTC
  birthtime: number;
  // file mode (permissions)
  mode: number;
  // user ID of owner
  uid: number;
  // group ID of owner
  gid: number;
  // device ID
  dev: number;
  // inode number
  ino: number;
  // number of hard links
  nlink: number;
  // device ID (if special file)
  rdev: number;
  // block size for I/O operations
  blksize: number;
  // number of blocks allocated
  blocks: number;
}

export interface CopyOptions {
  // overwrite existing file or directory. The copy operation will ignore errors if you set this to false and the destination exists. Use the errorOnExist option to change this behavior. Default: true.
  force?: boolean;
  // When true timestamps from src will be preserved. Default: false.
  preserveTimestamps?: boolean;
  // copy directories recursively Default: false
  recursive?: boolean;
  // when force is false, and the destination exists, throw an error. Default: false.
  errorOnExist?: boolean;
}

export interface RmOptions {
  // When true, exceptions will be ignored if path does not exist. Default: false
  force?: boolean;
  // If true, perform a recursive directory removal. In recursive mode operations are retried on failure. Default: false.
  recursive?: boolean;
}

export interface ReadTextFileOptions {
  // if not set then it will be UTF-8
  encoding?: BufferEncoding;
}

export interface WriteFileOptions {
  // if not set then it will be UTF-8
  encoding?: BufferEncoding;
}

export interface ReaddirOptions {
  // if not set then it will be UTF-8
  encoding?: BufferEncoding;
  // If true, reads the contents of a directory recursively. In recursive mode, it will list all files, sub files, and directories. Default: false.
  recursive?: boolean;
}

export interface MkdirOptions {
  // If true, creates parent directories recursively. Default: false.
  recursive?: boolean;
}

/**
 * FilesIo works with absolute paths like /envSet/..., /varData/... and /tmp/...
 * But actually it joins these paths with workDir and result will be like /workdir/envSet/...
 */
export interface FilesIoType {
  /**
   * Read text file and return it as string
   * @param pathTo
   * @param options
   * @returns
   */
  readTextFile(pathTo: string, options?: ReadTextFileOptions): Promise<string>;

  /**
   * Read binary file and return it as specified type
   * @param pathTo
   * @param returnType - Default is Uint8Array
   * @returns
   */
  readBinFile(pathTo: string, returnType?: BinTypesNames): Promise<BinTypes>;

  /**
   * Check if file is a valid UTF-8 text file
   * @param pathTo - path to file to check
   * @returns true if file is valid UTF-8 text, false otherwise
   */
  isTextFileUtf8(pathTo: string): Promise<boolean>;

  /**
   * Append data to file even if it doesn't exist
   * @param pathTo
   * @param data
   * @param options - If data is string then default encoding is UTF-8
   * @returns
   */
  appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void>;

  /**
   * Write or overwrite file
   * @param pathTo
   * @param data
   * @param options - If data is string then default encoding is UTF-8
   */
  writeFile(
    pathTo: string,
    data: string | BinTypes,
    options?: WriteFileOptions
  ): Promise<void>;

  /**
   * Try to remove all the files.
   * If has errors it will wait for all the files to be removed
   * and return the array of errors like {path, error}
   * @param paths
   * @param options
   * @returns
   */
  rm(paths: string[], options?: RmOptions): Promise<void>;

  /**
   * Get file or directory stats
   * @param pathTo
   * @returns
   */
  stat(pathTo: string): Promise<StatsSimplified | undefined>;

  /**
   * Copy specified files. Use full path
   * files is ["~/1/old.txt", "~/2/new.txt"][]
   * If has errors it will wait for all the files to be copied
   * and return the array of errors like {path, error}
   * @param files
   * @param options
   * @returns
   */
  cp(files: [string, string][], options?: CopyOptions): Promise<void>;

  /**
   * Rename or move files and dirs. Use full path
   * files is ["~/1/old.txt", "~/2/new.txt"][]
   * The destination path or directory should`t exist.
   * If has errors it will wait for all the files to be renamed
   * and return the array of errors like {path, error}
   * @param files
   * @param options
   * @returns
   */
  rename(files: [string, string][]): Promise<void>;

  /**
   * Read directory
   * @param pathTo
   * @param options - Default encoding is UTF-8
   * @returns
   */
  readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]>;

  /**
   * Create directory
   * If recursive is true, it will create parent directories recursively
   *   and if destination directory already exists, it will NOT throw an error
   * But if recursive is false, it will throw an error if destination directory already exists
   * @param pathTo
   * @param options
   * @returns
   */
  mkdir(pathTo: string, options?: MkdirOptions): Promise<void>;

  /**
   * You should pass only symlink. Resolve it by using stat().
   * It returns an absolute path to target file.
   * Encoding is UTF-8
   * @param pathTo
   * @returns path to target file which is set in symlink (can be relative)
   */
  readlink(pathTo: string): Promise<string>;

  /**
   * Resolve path to real path through symlinks
   * Encoding is UTF-8
   * @param pathTo
   * @returns absolute path to deeply linked target file
   */
  realpath(pathTo: string): Promise<string>;

  /**
   * Create symlink.
   * On windows type file or dir are automatically detected
   * @param target - target path (source file)
   * @param pathTo - path to place symlink
   * @returns
   */
  symlink(target: string, pathTo: string): Promise<void>;
}
