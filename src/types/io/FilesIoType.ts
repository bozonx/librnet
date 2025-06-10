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

/**
 * FilesIo works with absolute paths like /envSet/..., /varData/... and /tmp/...
 * But actually it joins these paths with workDir and result will be like /workdir/envSet/...
 */
export default interface FilesIoType {
  readTextFile(pathTo: string): Promise<string>;
  readBinFile(pathTo: string): Promise<Uint8Array>;

  /**
   * You should pass only symlink. Resolve it by using stat().
   * It returns an absolute path to target file
   */
  readlink(pathTo: string): Promise<string>;

  /**
   * Append data to file even if it doesn't exist
   * @param pathTo
   * @param data
   * @returns
   */
  appendFile(pathTo: string, data: string | Uint8Array): Promise<void>;

  /**
   * Write or overwrite file
   * @param pathTo
   * @param data
   */
  writeFile(pathTo: string, data: string | Uint8Array): Promise<void>;

  /**
   * Try to remove all the files.
   * If has errors it will wait for all the files to be removed
   * and return the array of errors like {path, error}
   * @param paths
   * @returns
   */
  unlink(paths: string[]): Promise<PromiseSettledResult<void>[]>;

  stat(pathTo: string): Promise<StatsSimplified | undefined>;

  /**
   * Copy specified files. Use full path
   * files is [SRC, DEST][]
   * @param files
   * @returns
   */
  copyFiles(files: [string, string][]): Promise<void>;

  /**
   * Rename or remove. Use full path
   * files is [OLD_PATH, NEW_PATH][]
   * @param files
   * @returns
   */
  renameFiles(files: [string, string][]): Promise<void>;

  readdir(pathTo: string): Promise<string[]>;

  mkdir(pathTo: string): Promise<void>;
  /**
   * Create directory recursively as mkdir -p
   * @param pathTo
   * @returns
   */
  mkDirP(pathTo: string): Promise<void>;

  /**
   * Remove an empty dir
   * @param pathTo
   * @returns
   */
  rmdir(pathTo: string): Promise<void>;

  /**
   * Remove directory recursively as rm -Rf
   * @param pathTo
   * @returns
   */
  // remove directory recursively
  rmdirRf(pathTo: string): Promise<void>;
}
