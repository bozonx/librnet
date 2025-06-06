import path from 'node:path'
import fs from 'node:fs/promises'
import {exec} from 'node:child_process'
import {promisify} from 'node:util'
import type {Stats} from 'node:fs'
import {pathJoin, DEFAULT_ENCODE, convertBufferToUint8Array} from 'squidlet-lib'
import type FilesIoType from '../../types/io/FilesIoType.js'
import type {FilesIoConfig, StatsSimplified} from '../../types/io/FilesIoType.js'
import {IoBase} from '../../base/IoBase.js'
import type {IoIndex} from '../../types/types.js'
import type {IoContext} from '../../system/context/IoContext.js'
import { ROOT_DIRS } from '../../types/constants.js';


export const execPromise = promisify(exec)


function prepareSubPath(subDirOfRoot: string, rootDir?: string, envPath?: string): string {
  // specified env var is preferred
  if (envPath) {
    // it env variable set then use it as absolute or relative to PWD
    return path.resolve(envPath)
  }
  else if (rootDir) {
    // if ROOT_DIR env set then just join sub path with it
    return pathJoin(rootDir, subDirOfRoot)
  }

  throw new Error(`FilesIo: can't resolve path for "${subDirOfRoot}". There are no ROOT_DIR and specified env variable`)
}

export const FilesIoIndex: IoIndex = (ctx: IoContext) => {
  // if root dir is relative then make it absolute relate to PWD
  const rootDir = ctx.env.ROOT_DIR ? path.resolve(ctx.env.ROOT_DIR) : '';
  const external = JSON.parse(process.env.EXT_DIRS || '{}')
  // check if external paths are absolute
  for (const name of Object.keys(external)) {
    if (external[name].indexOf('/') !== 0) {
      throw new Error(`External path ${name}: ${external[name]} has to be absolute`)
    }
  }

  const cfg: FilesIoConfig = {
    uid: (process.env.FILES_UID) ? Number(process.env.FILES_UID) : undefined,
    gid: (process.env.FILES_GID) ? Number(process.env.FILES_GID) : undefined,
    external,
    dirs: {
      appFiles: prepareSubPath(ROOT_DIRS.appFiles, rootDir, process.env.APP_FILES_DIR),
      appDataLocal: prepareSubPath(ROOT_DIRS.appDataLocal, rootDir, process.env.APP_DATA_LOCAL_DIR),
      appDataSynced: prepareSubPath(ROOT_DIRS.appDataSynced, rootDir, process.env.APP_DATA_SYNCED_DIR),
      cacheLocal: prepareSubPath(ROOT_DIRS.cacheLocal, rootDir, process.env.CACHE_LOCAL_DIR),
      cfgLocal: prepareSubPath(ROOT_DIRS.cfgLocal, rootDir, process.env.CFG_LOCAL_DIR),
      cfgSynced: prepareSubPath(ROOT_DIRS.cfgSynced, rootDir, process.env.CFG_SYNCED_DIR),
      db: prepareSubPath(ROOT_DIRS.db, rootDir, process.env.DB_DIR),
      log: prepareSubPath(ROOT_DIRS.log, rootDir, process.env.LOG_DIR),
      tmpLocal: prepareSubPath(ROOT_DIRS.tmpLocal, rootDir, process.env.TMP_LOCAL_DIR),
      home: prepareSubPath(ROOT_DIRS.home, rootDir, process.env.USER_HOME_DIR),
    },
  }

  return new FilesIo(ctx, cfg)
}


export class FilesIo extends IoBase implements FilesIoType {
  private readonly cfg: FilesIoConfig

  constructor(ctx: IoContext, cfg: FilesIoConfig) {
    super(ctx)

    this.cfg = cfg
  }

  async appendFile(pathTo: string, data: string | Uint8Array): Promise<void> {
    const fullPath = this.makePath(pathTo)
    let wasExist = true

    try {
      await fs.lstat(pathTo)
    }
    catch (e) {
      wasExist = false
    }

    if (typeof data === 'string') {
      await fs.appendFile(fullPath, data, DEFAULT_ENCODE)
    }
    else {
      await fs.appendFile(fullPath, data)
    }

    if (!wasExist) await this.chown(fullPath)
  }

  async mkdir(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo)

    await fs.mkdir(fullPath)

    return this.chown(fullPath)
  }

  readdir(pathTo: string): Promise<string[]> {
    const fullPath = this.makePath(pathTo)

    return fs.readdir(fullPath, DEFAULT_ENCODE)
  }

  async readTextFile(pathTo: string): Promise<string> {
    const fullPath = this.makePath(pathTo)

    return fs.readFile(fullPath, DEFAULT_ENCODE)
  }

  async readBinFile(pathTo: string): Promise<Uint8Array> {
    const fullPath = this.makePath(pathTo);

    const buffer: Buffer = await fs.readFile(fullPath)

    return convertBufferToUint8Array(buffer)
  }

  readlink(pathTo: string): Promise<string> {
    const fullPath = this.makePath(pathTo)

    return fs.readlink(fullPath)
  }

  rmdir(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo)

    return fs.rmdir(fullPath)
  }

  unlink(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo)

    return fs.unlink(fullPath)
  }

  async writeFile(pathTo: string, data: string | Uint8Array): Promise<void> {
    const fullPath = this.makePath(pathTo)

    if (typeof data === 'string') {
      await fs.writeFile(fullPath, data, DEFAULT_ENCODE)
    }
    else {
      await fs.writeFile(fullPath, data)
    }

    await this.chown(fullPath)
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const fullPath = this.makePath(pathTo)
    let stat: Stats

    try {
      stat = await fs.lstat(fullPath)
    }
    catch (e) {
      return undefined
    }

    return {
      size: stat.size,
      dir: stat.isDirectory(),
      symbolicLink: stat.isSymbolicLink(),
      mtime: stat.mtime.getTime(),
    };
  }

  async copyFiles(files: [string, string][]): Promise<void> {
    for (const item of files) {
      const dest = this.makePath(item[1])
      const src = this.makePath(item[0])

      await fs.copyFile(src, dest)
      await this.chown(dest)
    }
  }

  async renameFiles(files: [string, string][]): Promise<void> {
    for (const item of files) {
      const oldPath = this.makePath(item[0])
      const newPath = this.makePath(item[1])

      await fs.rename(oldPath, newPath)
    }
  }

  async rmdirR(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo)

    const res = await execPromise(`rm -R "${fullPath}"`)

    // TODO: а резве ошибка не произойдёт?
    if (res.stderr) {
      throw new Error(`Can't remove a directory recursively: ${res.stderr}`)
    }

    return
  }

  async mkDirP(pathTo: string): Promise<void> {
    const fullPath = this.makePath(pathTo)
    const res = await execPromise(`mkdir -p "${fullPath}"`)

    // TODO: а резве ошибка не произойдёт?
    if (res.stderr) {
      throw new Error(`Can't mkDirP: ${res.stderr}`)
    }

    return
  }


  private async chown(pathTo: string) {
    if (!this.cfg.uid && !this.cfg.gid) {
      // if noting to change - just return
      return
    }
    else if (this.cfg.uid && this.cfg.gid) {
      // uid and gid are specified - set both
      return await fs.chown(pathTo, this.cfg.uid, this.cfg.gid)
    }
    // else load stats to resolve lack of params
    const stat: Stats = await fs.lstat(pathTo)

    await fs.chown(
      pathTo,
      (!this.cfg.uid) ? stat.uid : this.cfg.uid,
      (!this.cfg.gid) ? stat.gid : this.cfg.gid,
    )
  }

  /**
   * Make real path on external file system
   * @param pathTo - it has to be /appFiles/..., /cfg/... etc.
   *   /external/extMountedDir/... is a virtual path to virtual dir where some
   *   external virtual dirs are mounted
   * @private
   */
  private makePath(pathTo: string): string {
    if (pathTo.indexOf('/') !== 0) {
      throw new Error(`Path has to start with "/": ${pathTo}`)
    }

    const pathMatch = pathTo.match(/^\/([^\/]+)(\/.+)?$/)

    if (!pathMatch) throw new Error(`Wrong path "${pathTo}"`)

    const subDir = pathMatch[1] as keyof typeof ROOT_DIRS
    const restPath = pathMatch[2] || ''

    if (subDir as string === EXTERNAL_ROOT_DIR) {
      const extMatch = pathTo.match(/^\/([^\/]+)(\/.+)?$/)

      if (!extMatch) throw new Error(`Wrong external path "${pathTo}"`)

      const extDir = extMatch[1]
      const extRestPath = extMatch[2] || ''
      const resolvedExtAbsDir: string | undefined = this.cfg.external[extDir]

      if (resolvedExtAbsDir) return resolvedExtAbsDir + extRestPath

      throw new Error(`Can't resolve external path "${pathTo}"`)
    }
    // resolve root dir
    const resolvedAbsDir: string | undefined = this.cfg.dirs[subDir]
    // replace sub dir to system path
    if (resolvedAbsDir) return resolvedAbsDir + restPath

    throw new Error(`Can't resolve path "${pathTo}"`)
  }

}
