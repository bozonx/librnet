import { pathBasename, pathDirname, pathJoin } from 'squidlet-lib'

import type { FilesEventData } from '@/types/EventsData.js'
import type { FilesDriverType } from '@/types/FilesDriverType.js'
import {
  DEFAULT_ENCODE,
  IS_TEXT_FILE_UTF8_SAMPLE_SIZE,
} from '@/types/constants.js'
import type {
  AccessMode,
  CopyOptions,
  FullFilesIoType,
  GlobOptions,
  MkdirOptions,
  ReadBinFileOptions,
  ReadTextFileOptions,
  ReaddirOptions,
  RmOptions,
  StatsSimplified,
  WriteFileOptions,
} from '@/types/io/FilesIoType.js'
import { type BinTypes, FileActions } from '@/types/types.js'

// TODO: add uid and gid and to the events

/**
 * Logic of the files driver which:
 *
 * - Adds more methods
 * - Emits events
 * - Adds uid and gid
 * - Uses preparePath which you should implement in your driver
 * - Resolves glob patterns for copyToDest and moveToDest
 */
export abstract class FilesDriverLogic implements FilesDriverType {
  constructor(
    protected readonly entity: string,
    protected readonly filesIo: FullFilesIoType
  ) {}

  protected abstract riseEvent(event: FilesEventData): void
  protected abstract preparePath(pathTo: string): string

  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    const result = await this.filesIo.readTextFile(
      this.preparePath(pathTo),
      options
    )

    this.riseReadEvent(
      pathTo,
      'readTextFile',
      Buffer.byteLength(result, DEFAULT_ENCODE)
    )

    return result
  }

  async readBinFile(
    pathTo: string,
    options?: ReadBinFileOptions
  ): Promise<BinTypes> {
    const result = await this.filesIo.readBinFile(
      this.preparePath(pathTo),
      options
    )

    this.riseReadEvent(pathTo, 'readBinFile', result.byteLength)

    return result
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const result = await this.filesIo.stat(this.preparePath(pathTo))

    // do not calculate size because it is very difficult to do
    // it depends on the file system, OS and cache
    this.riseReadEvent(pathTo, 'stat')

    return result
  }

  async exists(pathTo: string): Promise<boolean> {
    const result = await this.filesIo.exists(this.preparePath(pathTo))

    this.riseReadEvent(pathTo, 'exists')

    return result
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    const result = await this.filesIo.readdir(this.preparePath(pathTo), options)

    this.riseReadEvent(
      pathTo,
      'readdir',
      result.reduce((acc, item) => acc + item.length, 0),
      { recursive: options?.recursive ?? false }
    )

    return result
  }

  async readlink(pathTo: string): Promise<string> {
    const result = await this.filesIo.readlink(this.preparePath(pathTo))

    this.riseReadEvent(pathTo, 'readlink')

    return result
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    const result = await this.filesIo.isTextFileUtf8(this.preparePath(pathTo))

    this.riseReadEvent(pathTo, 'isTextFileUtf8', IS_TEXT_FILE_UTF8_SAMPLE_SIZE)

    return result
  }

  async glob(
    pattern: string | string[],
    options?: GlobOptions
  ): Promise<string[]> {
    const result = await this.filesIo.glob(pattern, options)

    for (const item of result) {
      this.riseReadEvent(item, 'glob', undefined, { options, pattern })
    }

    return result
  }

  /**
   * Resolve the real path of the file
   *
   * @param pathTo - Path to the file
   * @returns
   */
  async realpath(pathTo: string): Promise<string> {
    const result = await this.filesIo.realpath(this.preparePath(pathTo))

    this.riseReadEvent(pathTo, 'realpath')

    return result
  }

  async access(pathTo: string, mode?: AccessMode): Promise<boolean> {
    const result = await this.filesIo.access(this.preparePath(pathTo), mode)

    this.riseReadEvent(pathTo, 'access')

    return result
  }

  ////////// ADDITIONAL

  async isDir(pathToDir: string): Promise<boolean> {
    const result =
      (await this.filesIo.stat(this.preparePath(pathToDir)))?.dir ?? false

    this.riseReadEvent(pathToDir, 'isDir')

    return result
  }

  async isFile(pathToFile: string): Promise<boolean> {
    const result = !(await this.isDir(this.preparePath(pathToFile)))

    this.riseReadEvent(pathToFile, 'isFile')

    return result
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    const result =
      (await this.filesIo.stat(this.preparePath(pathToSymLink)))
        ?.symbolicLink ?? false

    this.riseReadEvent(pathToSymLink, 'isSymLink')

    return result
  }

  ///////// WRITE METHODS

  async appendFile(
    pathTo: string,
    data: string | BinTypes = '',
    options?: WriteFileOptions
  ) {
    await this.filesIo.appendFile(this.preparePath(pathTo), data, options)

    const size =
      typeof data === 'string'
        ? Buffer.byteLength(data, DEFAULT_ENCODE)
        : data.byteLength

    this.riseWriteEvent(pathTo, 'appendFile', size)
  }

  async writeFile(
    pathTo: string,
    data: string | BinTypes = '',
    options?: WriteFileOptions
  ) {
    await this.filesIo.writeFile(this.preparePath(pathTo), data, options)

    const size =
      typeof data === 'string'
        ? Buffer.byteLength(data, DEFAULT_ENCODE)
        : data.byteLength

    this.riseWriteEvent(pathTo, 'writeFile', size)
  }

  async rm(paths: string[], options?: RmOptions) {
    await this.filesIo.rm(
      paths.map((path) => this.preparePath(path)),
      options
    )

    for (const path of paths) {
      // Do not calculate size because it is very difficult to do
      // it depends on the file system, OS journaling and cache
      this.riseWriteEvent(path, 'rm')
    }
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.preparePath(src),
      this.preparePath(dest),
    ])

    await this.filesIo.cp(preparedFiles, options)

    for (const [src, dest] of files) {
      const stats = await this.filesIo.stat(this.preparePath(src))

      if (stats?.dir) {
        continue
      }

      const size = stats?.size ?? 0
      const details = {
        ...options,
        recursive: options?.recursive ?? false,
        src,
        dest,
      }

      this.riseReadEvent(src, 'cp', size, details)
      this.riseWriteEvent(dest, 'cp', size, details)
    }
  }

  async rename(files: [string, string][]): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      this.preparePath(src),
      this.preparePath(dest),
    ])

    await this.filesIo.rename(preparedFiles)

    for (const [src, dest] of files) {
      // it doesn't copy file to another disk
      this.riseWriteEvent(dest, 'rename', undefined, { src })
    }
  }

  async mkdir(pathTo: string, options?: MkdirOptions) {
    await this.filesIo.mkdir(this.preparePath(pathTo), options)

    // do not add size of metadata because it is very difficult to do
    this.riseWriteEvent(pathTo, 'mkdir', undefined, {
      recursive: options?.recursive ?? false,
    })
  }

  async link(target: string, pathTo: string): Promise<void> {
    const preparedTarget = this.preparePath(target)
    const preparedPathTo = this.preparePath(pathTo)

    await this.filesIo.link(preparedTarget, preparedPathTo)

    // do not add size of metadata because it is very difficult to do
    this.riseWriteEvent(pathTo, 'symlink', undefined, { target })
  }

  async utimes(
    pathTo: string,
    atime: number | string,
    mtime: number | string
  ): Promise<void> {
    await this.filesIo.utimes(this.preparePath(pathTo), atime, mtime)

    this.riseWriteEvent(pathTo, 'utimes', undefined, { atime, mtime })
  }

  async truncate(pathTo: string, len: number = 0): Promise<void> {
    await this.filesIo.truncate(this.preparePath(pathTo), len)
    this.riseWriteEvent(pathTo, 'truncate', len, { len })
  }

  async chown(pathTo: string, uid: number, gid: number): Promise<void> {
    await this.filesIo.chown(this.preparePath(pathTo), uid, gid)
    this.riseWriteEvent(pathTo, 'chown', undefined, { uid, gid })
  }

  async chmod(pathTo: string, mode: number): Promise<void> {
    await this.filesIo.chmod(this.preparePath(pathTo), mode)
    this.riseWriteEvent(pathTo, 'chmod', undefined, { mode })
  }

  ////////// ADDITIONAL

  async copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const srcPaths = await this.filesIo.glob(src)

    // TODO: review

    await this.filesIo.cp(
      srcPaths.map((el) => [
        el,
        pathJoin(this.preparePath(destDir), pathBasename(el)),
      ]),
      { recursive: true, force }
    )

    for (const [src, dest] of srcPaths.map((el) => [
      el,
      pathJoin(destDir, pathBasename(el)),
    ])) {
      const stats = await this.filesIo.stat(this.preparePath(src))

      if (stats?.dir) {
        continue
      }

      const size = stats?.size ?? 0
      const details = { src, dest }

      this.riseReadEvent(src, 'copyToDest', size, details)
      this.riseWriteEvent(dest, 'copyToDest', size, details)
    }
  }

  async moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    // TODO: review

    const srcPaths = await this.filesIo.glob(src)
    // first copy to dest
    await this.filesIo.cp(
      srcPaths.map((el) => [
        el,
        pathJoin(this.preparePath(destDir), pathBasename(el)),
      ]),
      { recursive: true, force }
    )
    // TODO: нужно определить находятся ли файлы на разных дисках
    // и если да, то нужно считать размер файлов
    // Делает 2 операциияя - считываение и запись
    // then remove src
    await this.rm(
      srcPaths.map((el) => this.preparePath(el), { recursive: true, force })
    )

    for (const [src, dest] of srcPaths.map((el) => [
      el,
      pathJoin(destDir, pathBasename(el)),
    ])) {
      this.riseWriteEvent(dest, 'moveToDest', undefined, { src })
    }
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const preparedOldPath = this.preparePath(file)
    const newPath = pathJoin(pathDirname(preparedOldPath), newName)

    await this.filesIo.rename([[preparedOldPath, newPath]])

    this.riseWriteEvent(newPath, 'renameFile', undefined, { oldPath: file })
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    await this.filesIo.rm([this.preparePath(pathToFileOrDir)], {
      recursive: true,
      force: true,
    })

    this.riseWriteEvent(pathToFileOrDir, 'rmRf')
  }

  async mkDirP(pathToDir: string): Promise<void> {
    await this.filesIo.mkdir(this.preparePath(pathToDir), { recursive: true })

    this.riseWriteEvent(pathToDir, 'mkDirP')
  }

  private riseReadEvent(
    pathTo: string,
    method: string,
    size?: number,
    details?: Record<string, any>
  ): void {
    this.riseEvent({
      entity: this.entity,
      path: pathTo,
      action: FileActions.read,
      method,
      timestamp: Date.now(),
      size,
      details,
    })
  }

  private riseWriteEvent(
    pathTo: string,
    method: string,
    size?: number,
    details?: Record<string, any>
  ): void {
    this.riseEvent({
      entity: this.entity,
      path: pathTo,
      action: FileActions.write,
      method,
      timestamp: Date.now(),
      size,
      details,
    })
  }
}
