import type { GlobOptions, Stats } from 'node:fs'
import fs from 'node:fs/promises'
import { open } from 'node:fs/promises'
import { pathIsAbsolute } from 'squidlet-lib'

import { IoBase } from '../../system/base/IoBase.js'
import {
  DEFAULT_ENCODE,
  IS_TEXT_FILE_UTF8_SAMPLE_SIZE,
} from '../../types/constants.js'
import { AccessMode, type FilesIoType } from '../../types/io/FilesIoType.js'
import type {
  CopyOptions,
  LinkOptions,
  MkdirOptions,
  ReadBinFileOptions,
  ReadTextFileOptions,
  ReaddirOptions,
  RmOptions,
  StatsSimplified,
  UtimesOptions,
  WriteFileOptions,
} from '../../types/io/FilesIoType.js'
import type {
  BinTypes,
  BinTypesNames,
  IoContext,
  IoIndex,
} from '../../types/types.js'

export const FilesIoIndex: IoIndex = (ctx: IoContext) => {
  return new LocalFilesIo(ctx)
}

export class LocalFilesIo extends IoBase implements FilesIoType {
  ////// READING //////

  async readTextFile(
    pathTo: string,
    options: ReadTextFileOptions = { pos: 0 }
  ): Promise<string> {
    if (!options.size) {
      return fs.readFile(pathTo, {
        encoding: options?.encoding || DEFAULT_ENCODE,
      })
    }

    const buffer = await this.readFileBuffer(pathTo, options)

    return buffer.toString(options?.encoding || DEFAULT_ENCODE)
  }

  async readBinFile(
    pathTo: string,
    options: ReadBinFileOptions = { returnType: 'Uint8Array', pos: 0 }
  ): Promise<BinTypes> {
    const buffer = await this.readFileBuffer(pathTo, options)

    // Преобразуем в указанный тип
    switch (options.returnType) {
      case 'Int8Array':
        return new Int8Array(buffer)
      case 'Uint8Array':
        return new Uint8Array(buffer)
      case 'Uint8ClampedArray':
        return new Uint8ClampedArray(buffer)
      case 'Int16Array':
        return new Int16Array(buffer)
      case 'Uint16Array':
        return new Uint16Array(buffer)
      case 'Int32Array':
        return new Int32Array(buffer)
      case 'Uint32Array':
        return new Uint32Array(buffer)
      case 'Float32Array':
        return new Float32Array(buffer)
      case 'Float64Array':
        return new Float64Array(buffer)
      case 'BigInt64Array':
        return new BigInt64Array(buffer)
      case 'BigUint64Array':
        return new BigUint64Array(buffer)
      default:
        throw new Error(`Unknown return type: ${options.returnType}`)
    }
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    let stat: Stats

    try {
      stat = await fs.stat(pathTo)
    } catch (e) {
      return undefined
    }

    return {
      size: stat.size,
      dir: stat.isDirectory(),
      symbolicLink: stat.isSymbolicLink(),
      mtime: stat.mtime.getTime(),
      atime: stat.atime.getTime(),
      ctime: stat.ctime.getTime(),
      birthtime: stat.birthtime.getTime(),
      mode: stat.mode,
      uid: stat.uid,
      gid: stat.gid,
      dev: stat.dev,
      ino: stat.ino,
      nlink: stat.nlink,
      rdev: stat.rdev,
      blksize: stat.blksize,
      blocks: stat.blocks,
    }
  }

  // TODO: test
  async exists(pathTo: string): Promise<boolean> {
    try {
      await fs.access(pathTo)
      return true
    } catch (e) {
      return false
    }
  }

  readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    return fs.readdir(pathTo, {
      ...options,
      encoding: options?.encoding || DEFAULT_ENCODE,
    })
  }

  readlink(pathTo: string): Promise<string> {
    return fs.readlink(pathTo)
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    try {
      // Получаем размер файла
      const stats = await fs.stat(pathTo)

      // Если файл пустой, считаем его валидным UTF-8
      if (stats.size === 0) {
        return true
      }

      // Читаем только первые 8KB для проверки UTF-8
      // Этого достаточно для определения кодировки большинства текстовых файлов
      const sampleSize = Math.min(IS_TEXT_FILE_UTF8_SAMPLE_SIZE, stats.size)

      // Открываем файл и читаем только нужную часть
      const fileHandle = await open(pathTo, 'r')
      try {
        const buffer = Buffer.alloc(sampleSize)
        const { bytesRead } = await fileHandle.read(buffer, 0, sampleSize, 0)

        // Используем нативную функцию Buffer.toString() для проверки UTF-8
        // Если файл не является валидным UTF-8, toString() выбросит ошибку
        buffer.subarray(0, bytesRead).toString('utf8')
      } finally {
        await fileHandle.close()
      }
      return true
    } catch (error) {
      // Если файл не существует или произошла ошибка чтения/декодирования, возвращаем false
      return false
    }
  }

  async realpath(pathTo: string): Promise<string> {
    return fs.realpath(pathTo)
  }

  // TODO: test
  async glob(
    pattern: string | string[],
    options: GlobOptions = {}
  ): Promise<string[]> {
    const patterns = Array.isArray(pattern) ? pattern : [pattern]

    if (!patterns.every(pathIsAbsolute) && !options?.cwd) {
      throw new Error('If you use relative path, you have to pass cwd')
    }

    const result: string[] = []

    for await (const item of fs.glob(pattern, options)) {
      result.push(item.toString())
    }

    return result
  }

  // TODO: test
  async access(
    pathTo: string,
    mode: AccessMode = AccessMode.F_OK
  ): Promise<boolean> {
    try {
      await fs.access(pathTo, mode)
      return true
    } catch (e) {
      return false
    }
  }

  ////// WRITING //////

  async appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void> {
    let wasExist = true

    try {
      await fs.access(pathTo)
    } catch (e) {
      wasExist = false
    }

    if (typeof data === 'string') {
      // if file doesn't exist it will be created
      await fs.appendFile(pathTo, data, {
        encoding: options?.encoding || DEFAULT_ENCODE,
      })
    } else {
      await fs.appendFile(pathTo, data, options)
    }

    if (!wasExist) await this.changeOwner(pathTo, options?.uid, options?.gid)
  }

  async writeFile(
    pathTo: string,
    data: string | BinTypes,
    options?: WriteFileOptions
  ): Promise<void> {
    if (typeof data === 'string') {
      await fs.writeFile(pathTo, data, {
        encoding: options?.encoding || DEFAULT_ENCODE,
      })
    } else {
      await fs.writeFile(pathTo, data, options)
    }

    await this.changeOwner(pathTo, options?.uid, options?.gid)
  }

  async rm(paths: string[], options?: RmOptions): Promise<void> {
    return Promise.allSettled(paths.map((path) => fs.rm(path, options))).then(
      (results) => {
        const errors = results
          .filter(
            (result): result is PromiseRejectedResult =>
              result.status === 'rejected'
          )

          // TODO: откуда берется path?
          .map((result) => ({
            path: result.reason.path || 'unknown',
            error: result.reason.message || 'Unknown error',
          }))

        if (errors.length > 0) {
          throw errors
        }
      }
    )
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    await Promise.allSettled(
      files.map((item) => fs.cp(item[0], item[1], options))
    ).then((results) => {
      const errors = results
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === 'rejected'
        )
        // TODO: откуда берется path?
        .map((result) => ({
          path: result.reason.path || 'unknown',
          error: result.reason.message || 'Unknown error',
        }))

      if (errors.length > 0) {
        throw errors
      }
    })

    if (options?.uid || options?.gid) {
      await Promise.allSettled(
        files.map((item) =>
          this.changeOwner(item[1], options?.uid, options?.gid)
        )
      )
    }
  }

  async rename(files: [string, string][]): Promise<void> {
    return Promise.allSettled(
      files.map((item) => fs.rename(item[0], item[1]))
    ).then((results) => {
      const errors = results
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === 'rejected'
        )
        // TODO: откуда берется path?
        .map((result) => ({
          path: result.reason.path || 'unknown',
          error: result.reason.message || 'Unknown error',
        }))

      if (errors.length > 0) {
        throw errors
      }
    })
  }

  async mkdir(pathTo: string, options?: MkdirOptions): Promise<void> {
    await fs.mkdir(pathTo, options)
    await this.changeOwner(pathTo, options?.uid, options?.gid)
  }

  // TODO: test
  async link(
    target: string,
    pathTo: string,
    options: LinkOptions = { symlink: true }
  ): Promise<void> {
    if (options.symlink) {
      await fs.symlink(target, pathTo)
    } else {
      await fs.link(target, pathTo)
    }

    await this.changeOwner(pathTo, options?.uid, options?.gid)
  }

  // TODO: test
  async utimes(
    pathTo: string,
    atime: number | string,
    mtime: number | string,
    options: UtimesOptions = { followSymlinks: true }
  ): Promise<void> {
    if (options.followSymlinks) {
      await fs.utimes(pathTo, atime, mtime)
    } else {
      await fs.lutimes(pathTo, atime, mtime)
    }
  }

  // TODO: test
  async truncate(pathTo: string, len: number = 0): Promise<void> {
    await fs.truncate(pathTo, len)
  }

  // TODO: test
  async chown(pathTo: string, uid: number, gid: number): Promise<void> {
    await fs.chown(pathTo, uid, gid)
  }

  // TODO: test
  async chmod(pathTo: string, mode: number): Promise<void> {
    await fs.chmod(pathTo, mode)
  }

  private async changeOwner(pathTo: string, uid?: number, gid?: number) {
    if (!uid && !gid) {
      // if noting to change - just return
      return
    } else if (uid && gid) {
      // uid and gid are specified - set both
      return await fs.chown(pathTo, uid, gid)
    }
    // else load stats to resolve lack of params
    const stat: Stats = await fs.stat(pathTo)
    await fs.chown(pathTo, uid || stat.uid, gid || stat.gid)
  }

  /**
   * Приватный метод для чтения файла в буфер с поддержкой позиции и размера
   * @param pathTo - путь к файлу
   * @param options - опции чтения (pos, size)
   * @returns Promise<Buffer> - прочитанный буфер
   */
  private async readFileBuffer(
    pathTo: string,
    options: { pos?: number; size?: number }
  ): Promise<Buffer> {
    // Если размер и позиция не указаны, читаем весь файл
    if (options.size === undefined && options.pos === undefined) {
      return fs.readFile(pathTo)
    }

    // Читаем часть файла с позиции
    const fileHandle = await fs.open(pathTo, 'r')
    try {
      // Получаем размер файла для определения сколько читать
      const stats = await fileHandle.stat()
      const pos = options.pos || 0
      const size = options.size !== undefined ? options.size : stats.size - pos

      // Проверяем, что позиция не выходит за пределы файла
      if (pos >= stats.size) {
        return Buffer.alloc(0)
      }

      // Ограничиваем размер чтения размером файла
      const readSize = Math.min(size, stats.size - pos)

      if (readSize <= 0) {
        return Buffer.alloc(0)
      }

      const buffer = Buffer.alloc(readSize)
      const result = await fileHandle.read(buffer, 0, readSize, pos)

      // Возвращаем только прочитанные байты
      return buffer.subarray(0, result.bytesRead)
    } finally {
      await fileHandle.close()
    }
  }
}
