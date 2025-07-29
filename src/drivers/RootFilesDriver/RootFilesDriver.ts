import type { System } from '@/system/System.js'
import { DriverFactoryBase } from '@/system/base/DriverFactoryBase.js'
import DriverInstanceBase from '@/system/base/DriverInstanceBase.js'
import { checkPermissions } from '@/system/helpers/CheckPathPermission.js'
import { clearAbsolutePath } from '@/system/helpers/helpers.js'
import { RootDirAccess } from '@/system/managers/RootDirAccess.js'
import type {
  CopyOptions,
  MkdirOptions,
  ReadTextFileOptions,
  ReaddirOptions,
  RmOptions,
  StatsSimplified,
  WriteFileOptions,
} from '@/types/io/FilesIoType.js'
import type { BinTypes, BinTypesNames, DriverIndex } from '@/types/types.js'

export const FILE_PERM_DELIMITER = '|'

export const RootFilesDriverIndex: DriverIndex = (
  manifest: DriverManifest,
  system: System
) => {
  return new RootFilesDriver(system, manifest)
}

export class RootFilesDriver extends DriverFactoryBase<
  RootFilesDriverInstance,
  RootFilesDriverProps
> {
  readonly requireIo = [IO_NAMES.LocalFilesIo]
  protected SubDriverClass = RootFilesDriverInstance
}

export interface RootFilesDriverProps {
  entityWhoAsk: string
}

/**
 * Acces to the root files of the system
 *
 * - /programFiles
 * - /localData
 * - /syncedData
 * - /home
 * - /mnt - this is a virtual dir where some external virtual dirs are mounted It
 *   does:
 * - Add more methods
 * - Check permissions
 * - Emits events
 * - Resolve real path
 * - And finaly do requests to the external file system via FilesIo
 */
export class RootFilesDriverInstance extends DriverInstanceBase<
  RootFilesDriverProps,
  Record<string, any>
> {
  // TODO: почуму не  FilesDriverLogic ?
  private driver = new RootDirAccess(this.system, '/')

  ////// READ ONLY METHODS
  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.readTextFile(preparedPath, options)
  }

  async readBinFile(
    pathTo: string,
    returnType?: BinTypesNames
  ): Promise<BinTypes> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.readBinFile(preparedPath, returnType)
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.stat(preparedPath)
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.readdir(preparedPath, options)
  }

  async readlink(pathTo: string): Promise<string> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.readlink(preparedPath)
  }

  // TODO: должна резолвить пути только в пределах rootDir
  async realpath(pathTo: string): Promise<string> {
    return pathTo

    // const preparedPath = this.rootDirDriver.clearPath(pathTo);

    // await this.checkPermissions([preparedPath], FILE_ACTION.read);

    // return await this.rootDirDriver.realpath(preparedPath);

    // this.riseEvent({
    //   path: pathTo,
    //   action: FILE_ACTION.read,
    //   method: 'realpath',
    //   timestamp: Date.now(),
    //   // TODO: известно ли сколько байт считывается?
    // });
  }

  async isDir(pathToDir: string): Promise<boolean> {
    const preparedPath = clearAbsolutePath(pathToDir)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.isDir(preparedPath)
  }

  async isFile(pathToFile: string): Promise<boolean> {
    const preparedPath = clearAbsolutePath(pathToFile)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.isFile(preparedPath)
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    const preparedPath = clearAbsolutePath(pathToSymLink)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.isSymLink(preparedPath)
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    const preparedPath = clearAbsolutePath(pathToFileOrDir)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.isExists(preparedPath)
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.checkPermissions([preparedPath], FILE_ACTION.read)

    return await this.driver.isTextFileUtf8(preparedPath)
  }

  ////// WRITE METHODS
  async appendFile(
    pathTo: string,
    data: string,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.checkPermissions([preparedPath], FILE_ACTION.write)
    await this.driver.appendFile(preparedPath, data, options)
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.checkPermissions([preparedPath], FILE_ACTION.write)
    await this.driver.writeFile(preparedPath, data, options)
  }

  async rm(paths: string[], options?: RmOptions): Promise<void> {
    const preparedPaths = paths.map((path) => clearAbsolutePath(path))

    await this.checkPermissions(preparedPaths, FILE_ACTION.write)
    await this.driver.rm(preparedPaths, options)
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      clearAbsolutePath(src),
      clearAbsolutePath(dest),
    ])

    await this.checkPermissions(
      preparedFiles.map(([src]) => src),
      FILE_ACTION.read
    )
    await this.checkPermissions(
      preparedFiles.map(([, dest]) => dest),
      FILE_ACTION.write
    )

    await this.driver.cp(preparedFiles, options)
  }

  async rename(files: [string, string][]): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      clearAbsolutePath(src),
      clearAbsolutePath(dest),
    ])

    await this.checkPermissions(preparedFiles.flat(), FILE_ACTION.write)
    await this.driver.rename(preparedFiles)
  }

  async mkdir(pathTo: string, options?: MkdirOptions): Promise<void> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.checkPermissions([preparedPath], FILE_ACTION.write)
    await this.driver.mkdir(preparedPath, options)
  }

  /**
   * Target and dest have to have write permissions
   *
   * @param target
   * @param pathTo
   * @returns
   */
  async symlink(target: string, pathTo: string): Promise<void> {
    const preparedTarget = clearAbsolutePath(target)
    const preparedPathTo = clearAbsolutePath(pathTo)

    await this.checkPermissions(
      [preparedTarget, preparedPathTo],
      FILE_ACTION.write
    )
    await this.driver.symlink(preparedTarget, preparedPathTo)
  }

  ////////// ADDITIONAL

  async copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const preparedSrc = Array.isArray(src)
      ? src.map((s) => clearAbsolutePath(s))
      : [clearAbsolutePath(src)]
    const preparedDestDir = clearAbsolutePath(destDir)

    await this.checkPermissions(preparedSrc, FILE_ACTION.read)
    await this.checkPermissions([preparedDestDir], FILE_ACTION.write)
    await this.driver.copyToDest(preparedSrc, preparedDestDir, force)
  }

  async moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    const preparedSrc = Array.isArray(src)
      ? src.map((s) => clearAbsolutePath(s))
      : [clearAbsolutePath(src)]
    const preparedDestDir = clearAbsolutePath(destDir)

    await this.checkPermissions(
      [...preparedSrc, preparedDestDir],
      FILE_ACTION.write
    )

    await this.driver.moveToDest(preparedSrc, preparedDestDir, force)
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const preparedFile = clearAbsolutePath(file)

    if (newName.includes('/') || newName.includes('\\')) {
      throw new Error('New name cannot contain slashes')
    }

    const preparedNewName = newName.trim()

    await this.checkPermissions([preparedFile], FILE_ACTION.write)
    await this.driver.renameFile(preparedFile, preparedNewName)
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    const preparedPath = clearAbsolutePath(pathToFileOrDir)

    await this.checkPermissions([preparedPath], FILE_ACTION.write)
    await this.driver.rmRf(preparedPath)
  }

  async mkDirP(pathToDir: string): Promise<void> {
    const preparedPath = clearAbsolutePath(pathToDir)

    await this.checkPermissions([preparedPath], FILE_ACTION.write)
    await this.driver.mkDirP(preparedPath)
  }

  protected async checkPermissions(paths: string[], action: string) {
    await checkPermissions(
      this.system.permissions.checkPermissions.bind(this.system.permissions),
      this.props.entityWhoAsk,
      this.driverFactory.name,
      paths,
      action
    )
  }
}
