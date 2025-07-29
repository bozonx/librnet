import { pathBasename, pathDirname, pathJoin } from 'squidlet-lib'

import type { FilesEventData } from '@/types/EventsData.js'
import type { FilesDriverType } from '@/types/FilesDriverType.js'
import { IS_TEXT_FILE_UTF8_SAMPLE_SIZE } from '@/types/constants.js'
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
import {
  type BinTypes,
  type BinTypesNames,
  FileActions,
} from '@/types/types.js'

// TODO:  resolve glob patterns in all the methods

/**
 * Logic of the files driver which:
 *
 * - Adds more methods
 * - Emits events
 * - Uses preparePath which you should implement in your driver
 * - Resolves glob patterns in all the methods which are support it
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

    this.riseReadEvent(pathTo, 'readTextFile', result.length)

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

    const size = Buffer.byteLength(result, 'utf8')

    this.riseReadEvent(pathTo, 'readlink', size)

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
      this.riseReadEvent(item, 'glob', Buffer.byteLength(item, 'utf8'), {
        options,
        pattern,
      })
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
    data: string | Uint8Array,
    options?: WriteFileOptions
  ) {
    await this.filesIo.appendFile(this.preparePath(pathTo), data, options)

    this.riseEvent({
      path: pathTo,
      action: FileActions.write,
      method: 'appendFile',
      timestamp: Date.now(),
      size: data.length,
    })
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ) {
    await this.filesIo.writeFile(this.preparePath(pathTo), data, options)

    this.riseEvent({
      path: pathTo,
      action: FileActions.write,
      method: 'writeFile',
      timestamp: Date.now(),
      size: data instanceof Uint8Array ? data.byteLength : data.length,
    })
  }

  async rm(paths: string[], options?: RmOptions) {
    await this.filesIo.rm(
      paths.map((path) => this.preparePath(path)),
      options
    )

    for (const path of paths) {
      this.riseEvent({
        path,
        action: FileActions.write,
        method: 'rm',
        timestamp: Date.now(),
        // Do not calculate size because it is very difficult to do
        // it depends on the file system, OS journaling and cache
      })
    }
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    await this.filesIo.cp(
      files.map(([src, dest]) => [
        this.preparePath(src),
        this.preparePath(dest),
      ]),
      options
    )

    for (const [src, dest] of files) {
      // TODO: Делает 2 операциияя - считываение и запись
      this.riseEvent({
        path: dest,
        action: FileActions.write,
        method: 'cp',
        timestamp: Date.now(),
        details: { src, recursive: options?.recursive ?? false },
        // TODO: calculate size
      })
    }
  }

  async rename(files: [string, string][]): Promise<void> {
    await this.filesIo.rename(
      files.map(([src, dest]) => [
        this.preparePath(src),
        this.preparePath(dest),
      ])
    )

    for (const [src, dest] of files) {
      this.riseEvent({
        path: dest,
        action: FileActions.write,
        method: 'rename',
        timestamp: Date.now(),
        details: { src },
        // TODO: нужно определить находятся ли файлы на разных дисках
        // и если да, то нужно считать размер файлов
        // TODO: Делает 2 операциияя - считываение и запись
      })
    }
  }

  async mkdir(pathTo: string, options?: MkdirOptions) {
    await this.filesIo.mkdir(this.preparePath(pathTo), options)

    this.riseEvent({
      path: pathTo,
      action: FileActions.write,
      method: 'mkdir',
      timestamp: Date.now(),
      details: { recursive: options?.recursive ?? false },
      // TODO: известно ли сколько байт занимает операция?
    })
  }

  async symlink(target: string, pathTo: string): Promise<void> {
    const preparedTarget = this.preparePath(target)
    const preparedPathTo = this.preparePath(pathTo)

    await this.filesIo.link(preparedTarget, preparedPathTo)

    this.riseEvent({
      path: pathTo,
      action: FileActions.write,
      method: 'symlink',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    })
  }

  ////////// ADDITIONAL

  async copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const srcPaths = typeof src === 'string' ? [src] : src

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
      // TODO: Делает 2 операциияя - считываение и запись
      this.riseEvent({
        // TODO: revew
        path: dest,
        action: FileActions.write,
        method: 'copyToDest',
        timestamp: Date.now(),
        details: { src },
        // TODO: считать размер файлов
      })
    }
  }

  async moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const srcPaths = typeof src === 'string' ? [src] : src
    // first copy to dest
    await this.copyToDest(src, destDir, force)
    // then remove src
    await this.rm(
      srcPaths.map((el) => this.preparePath(el), { recursive: true, force })
    )

    // TODO: Делает 2 операциияя - считываение и запись

    for (const [src, dest] of srcPaths.map((el) => [
      el,
      pathJoin(destDir, pathBasename(el)),
    ])) {
      this.riseEvent({
        path: dest,
        action: FileActions.write,
        method: 'moveToDest',
        timestamp: Date.now(),
        details: { src },
        // TODO: нужно определить находятся ли файлы на разных дисках
        // и если да, то нужно считать размер файлов
      })
    }
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const preparedOldPath = this.preparePath(file)
    const newPath = pathJoin(pathDirname(preparedOldPath), newName)

    await this.filesIo.rename([[preparedOldPath, newPath]])

    this.riseEvent({
      path: newPath,
      action: FileActions.write,
      method: 'renameFile',
      timestamp: Date.now(),
      details: { oldPath: file },
      // do not calculate size because it is very difficult to do
    })
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    await this.filesIo.rm([this.preparePath(pathToFileOrDir)], {
      recursive: true,
      force: true,
    })

    this.riseEvent({
      path: pathToFileOrDir,
      action: FileActions.write,
      method: 'rmRf',
      timestamp: Date.now(),
      // do not calculate size because it is very difficult to do
    })
  }

  async mkDirP(pathToDir: string): Promise<void> {
    await this.filesIo.mkdir(this.preparePath(pathToDir), { recursive: true })

    this.riseEvent({
      path: pathToDir,
      action: FileActions.write,
      method: 'mkDirP',
      timestamp: Date.now(),
      // TODO: известно ли сколько байт занимает операция?
    })
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
