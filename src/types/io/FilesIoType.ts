import type { IoBase } from '@/system/base/IoBase'
import type { BinTypes, BinTypesNames } from '@/types/types'

export interface StatsSimplified {
  // in bytes
  size: number
  // is it dir or file
  dir: boolean
  symbolicLink: boolean
  // modified time - number of milliseconds elapsed since 1 January 1970 00:00:00 UTC
  mtime: number
  // access time - number of milliseconds elapsed since 1 January 1970 00:00:00 UTC
  atime: number
  // change time - number of milliseconds elapsed since 1 January 1970 00:00:00 UTC
  ctime: number
  // birth time - number of milliseconds elapsed since 1 January 1970 00:00:00 UTC
  birthtime: number
  // file mode (permissions)
  mode: number
  // user ID of owner
  uid: number
  // group ID of owner
  gid: number
  // device ID
  dev: number
  // inode number
  ino: number
  // number of hard links
  nlink: number
  // device ID (if special file)
  rdev: number
  // block size for I/O operations
  blksize: number
  // number of blocks allocated
  blocks: number
}

export interface CopyOptions {
  // overwrite existing file or directory. The copy operation will ignore errors if you set this to false and the destination exists. Use the errorOnExist option to change this behavior. Default: true.
  force?: boolean
  // When true timestamps from src will be preserved. Default: false.
  preserveTimestamps?: boolean
  // copy directories recursively Default: false
  recursive?: boolean
  // when force is false, and the destination exists, throw an error. Default: false.
  errorOnExist?: boolean
  // Set User ID to the destination file or directory
  uid?: number
  // Set Group ID to the destination file or directory
  gid?: number
}

export interface RmOptions {
  // When true, exceptions will be ignored if path does not exist. Default: false
  force?: boolean
  // If true, perform a recursive directory removal. In recursive mode operations are retried on failure. Default: false.
  recursive?: boolean
}

export interface ReadTextFileOptions {
  // if not set then it will be UTF-8
  encoding?: BufferEncoding
  // Position to start reading from
  pos?: number
  // Number of bytes to read
  size?: number
}

export interface ReadBinFileOptions {
  // if not set then it will be Uint8Array
  returnType?: BinTypesNames
  // Position to start reading from
  pos?: number
  // Number of bytes to read
  size?: number
}

export interface WriteFileOptions {
  // if not set then it will be UTF-8
  encoding?: BufferEncoding
  // Set User ID to the created file
  uid?: number
  // Set Group ID to the created file
  gid?: number
}

export interface ReaddirOptions {
  // if not set then it will be UTF-8
  encoding?: BufferEncoding
  // If true, reads the contents of a directory recursively. In recursive mode, it will list all files, sub files, and directories. Default: false.
  recursive?: boolean
}

export interface MkdirOptions {
  // If true, creates parent directories recursively. Default: false.
  recursive?: boolean
  // Set User ID to the created directory
  uid?: number
  // Set Group ID to the created directory
  gid?: number
}

export interface GlobOptions {
  // The current working directory of the process
  // You have to pass it if you use relative paths
  cwd?: string
  // Patterns to exclude. Default: [].
  exclude?: string[]
  // If true, the result will contain file info objects. Default: false.
  withFileTypes?: boolean
}

export enum AccessMode {
  F_OK = 0, // check if file exists
  R_OK = 4, // check if file exists and is readable
  W_OK = 2, // check if file exists and is writable
  X_OK = 1, // check if file exists and is executable
}

export interface UtimesOptions {
  // If true, the access time will be set to the target of the symlink.
  // If false, the access time will be set to the symlink itself.
  // Default: true.
  followSymlinks?: boolean
}

export interface LinkOptions {
  // If true, the link will be a symlink.
  // If false, the link will be a hard link.
  // Default: true.
  symlink?: boolean
  // Set User ID to the created link
  uid?: number
  // Set Group ID to the created link
  gid?: number
}

/**
 * FilesIo works with absolute paths like /envSet/..., /varData/... and /tmp/...
 * But actually it joins these paths with workDir and result will be like
 * /workdir/envSet/...
 */
export interface FilesIoType {
  // TODO: add access

  ////// READING //////

  /**
   * Read text file and return it as string
   *
   * @param pathTo
   * @param options
   * @returns
   */
  readTextFile(pathTo: string, options?: ReadTextFileOptions): Promise<string>

  /**
   * Read binary file and return it as specified type
   *
   * @param pathTo
   * @param options - Default returnType is Uint8Array
   * @returns
   */
  readBinFile(pathTo: string, options?: ReadBinFileOptions): Promise<BinTypes>

  /**
   * Get file or directory stats. If file or directory doesn't exist, it will
   * return undefined.
   *
   * @param pathTo
   * @returns
   */
  stat(pathTo: string): Promise<StatsSimplified | undefined>

  /**
   * Check if file or directory exists
   *
   * @param pathTo
   * @returns True if file or directory exists, false otherwise
   */
  exists(pathTo: string): Promise<boolean>

  /**
   * Read directory
   *
   * @param pathTo
   * @param options - Default encoding is UTF-8
   * @returns
   */
  readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]>

  /**
   * You should pass only symlink. Resolve it by using stat(). It returns an
   * absolute path to target file. Encoding is UTF-8
   *
   * @param pathTo
   * @returns Path to target file which is set in symlink (can be relative)
   */
  readlink(pathTo: string): Promise<string>

  /**
   * Check if file is a valid UTF-8 text file
   *
   * @param pathTo - Path to file to check
   * @returns True if file is valid UTF-8 text, false otherwise
   */
  isTextFileUtf8(pathTo: string): Promise<boolean>

  /**
   * Resolve path to real path through symlinks Encoding is UTF-8
   *
   * @param pathTo
   * @returns Absolute path to deeply linked target file
   */
  realpath(pathTo: string): Promise<string>

  /**
   * Get all files by pattern
   *
   * @param pattern
   * @param options
   * @returns
   */
  glob(pattern: string | string[], options?: GlobOptions): Promise<string[]>

  /**
   * Check if file or directory exists and has access to it
   *
   * @param pathTo
   * @param mode - Default is AccessMode.F_OK
   * @returns
   */
  access(pathTo: string, mode?: AccessMode): Promise<boolean>

  ////// WRITING //////

  /**
   * Append data to file even if it doesn't exist
   *
   * @param pathTo
   * @param data
   * @param options - If data is string then default encoding is UTF-8
   * @param options.uid - Set User ID to the created file (not appended)
   * @param options.gid - Set Group ID to the created file (not appended)
   * @returns
   */
  appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void>

  /**
   * Write or overwrite file
   *
   * @param pathTo
   * @param data
   * @param options - If data is string then default encoding is UTF-8
   */
  writeFile(
    pathTo: string,
    data: string | BinTypes,
    options?: WriteFileOptions
  ): Promise<void>

  /**
   * Try to remove all the files. If has errors it will wait for all the files
   * to be removed and return the array of errors like {path, error}
   *
   * @param paths
   * @param options
   * @returns
   */
  rm(paths: string[], options?: RmOptions): Promise<void>

  /**
   * Copy specified files. Use full path files is ["~/1/old.txt",
   * "~/2/new.txt"][] If has errors it will wait for all the files to be copied
   * and return the array of errors like {path, error}
   *
   * @param files
   * @param options
   * @returns
   */
  cp(files: [string, string][], options?: CopyOptions): Promise<void>

  /**
   * Rename or move files and dirs. Use full path files is ["~/1/old.txt",
   * "~/2/new.txt"][] The destination path or directory should`t exist. If has
   * errors it will wait for all the files to be renamed and return the array of
   * errors like {path, error}
   *
   * @param files
   * @param options
   * @returns
   */
  rename(files: [string, string][]): Promise<void>

  /**
   * Create directory If recursive is true, it will create parent directories
   * recursively and if destination directory already exists, it will NOT throw
   * an error But if recursive is false, it will throw an error if destination
   * directory already exists
   *
   * @param pathTo
   * @param options
   * @returns
   */
  mkdir(pathTo: string, options?: MkdirOptions): Promise<void>

  /**
   * Create a link. On windows type file or dir are automatically detected
   *
   * @param target - Target path (source file)
   * @param pathTo - Path to place link
   * @returns
   */
  link(target: string, pathTo: string, options?: LinkOptions): Promise<void>

  /**
   * Set access and modification times of a file
   *
   * @param pathTo
   * @param atime
   * @param mtime
   * @returns
   */
  utimes(
    pathTo: string,
    atime: number | string,
    mtime: number | string,
    options?: UtimesOptions
  ): Promise<void>

  /**
   * Truncate file to specified length
   *
   * @param pathTo
   * @param len Default is 0
   * @returns
   */
  truncate(pathTo: string, len: number): Promise<void>

  /**
   * Change file or directory owner
   *
   * @param pathTo
   * @param uid
   * @param gid
   * @returns
   */
  chown(pathTo: string, uid: number, gid: number): Promise<void>

  /**
   * Change file or directory permissions
   *
   * @param pathTo
   * @param mode
   * @returns
   */
  chmod(pathTo: string, mode: number): Promise<void>
}

export type FullFilesIoType = FilesIoType & IoBase
