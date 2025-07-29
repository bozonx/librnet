import { FILE_ACTION, IO_NAMES } from '../../../types/constants.js'
import { SystemEvents } from '../../../types/constants.js'
import type {
  CopyOptions,
  MkdirOptions,
  ReadTextFileOptions,
  ReaddirOptions,
  RmOptions,
  StatsSimplified,
  WriteFileOptions,
} from '../../../types/io/FilesIoType.js'
import type {
  BinTypes,
  BinTypesNames,
  DriverIndex,
} from '../../../types/types.js'
import type { FilesEventData } from '../../../types/types.js'
import type { System } from '../../System.js'
import { DriverFactoryBase } from '../../base/DriverFactoryBase.js'
import DriverInstanceBase from '../../base/DriverInstanceBase.js'
import { checkPermissions } from '../../helpers/CheckPathPermission.js'
import { FilesDriverLogic } from '@/system/driversLogic/FilesDriverLogic.js'
import { RootDirDriverLogic } from '@/system/driversLogic/RootDirDriverLogic.js'
import { clearAbsolutePath } from '@/system/helpers/helpers.js'

export const FILE_PERM_DELIMITER = '|'

export const ArchiveDriverIndex: DriverIndex = (
  name: string,
  system: System
) => {
  return new ArchiveDriver(system, name)
}

export class ArchiveDriver extends DriverFactoryBase<
  ArchiveDriverInstance,
  ArchiveDriverProps
> {
  readonly requireIo = [IO_NAMES.ArchiveIo]
  protected SubDriverClass = ArchiveDriverInstance
}

export interface ArchiveDriverProps {
  entityWhoAsk: string
  archivePath: string
}

class ArchiveDriverLogic extends FilesDriverLogic {
  constructor(
    protected readonly system: System,
    protected readonly rootDir: string
  ) {
    super(
      system.io.getIo<FilesIoType & IoBase>(IO_NAMES.LocalFilesIo),
      (data: FilesEventData) => {
        this.system.events.emit(SystemEvents.localFiles, data)
      }
    )
  }

  // TODO: check permissions

  // await checkPermissions(
  //   this.system.permissions.checkPermissions.bind(this.system.permissions),
  //   this.props.entityWhoAsk,
  //   this.driverFactory.name,
  //   paths,
  //   action
  // );

  // Make real path on external file system
  protected preparePath(pathTo: string): string {
    return resolveRealPath(
      pathTo,
      this.system.mountPoints.rootDir,
      this.system.mountPoints.getMountPoints()
    )
  }
}

/**
 * Acces to files in archive
 * It does:
 * - Add more methods
 * - Check permissions
 * - Emits events
 * - Resolve real path
 * - And finaly do requests to the external file system via FilesIo
 */
export class ArchiveDriverInstance extends DriverInstanceBase<
  ArchiveDriverProps,
  Record<string, any>
> {
  // TODO: add archive path
  private driver = new ArchiveDriverLogic(this.system, '/')

  async extract(paths: [string, string][], archivePath: string): Promise<void> {
    // const preparedPath = clearAbsolutePath(pathTo);
  }

  async archive(pathToFileOrDir: string, archivePath: string): Promise<void> {
    // const preparedPath = clearAbsolutePath(pathTo);
  }

  async add(paths: [string, string][], archivePath: string): Promise<void> {
    // const preparedPath = clearAbsolutePath(pathTo);
  }

  async extractToDest(
    pathInArchive: string,
    destDir: string,
    archivePath: string
  ): Promise<void> {
    // TODO: resolve destDir
    this.extract([[pathInArchive, destDir]], archivePath)
  }

  async addToDest(
    pathToFileOrDir: string,
    destDir: string,
    archivePath: string
  ): Promise<void> {
    // TODO: resolve destDir
    this.add([[pathToFileOrDir, destDir]], archivePath)
  }

  ////// READ ONLY METHODS
  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    const preparedPath = clearAbsolutePath(pathTo)

    return await this.driver.readTextFile(preparedPath, options)
  }

  async readBinFile(
    pathTo: string,
    returnType?: BinTypesNames
  ): Promise<BinTypes> {
    const preparedPath = clearAbsolutePath(pathTo)

    return await this.driver.readBinFile(preparedPath, returnType)
  }

  async stat(pathTo: string): Promise<StatsSimplified | undefined> {
    const preparedPath = clearAbsolutePath(pathTo)

    return await this.driver.stat(preparedPath)
  }

  async readdir(pathTo: string, options?: ReaddirOptions): Promise<string[]> {
    const preparedPath = clearAbsolutePath(pathTo)

    return await this.driver.readdir(preparedPath, options)
  }

  async readlink(pathTo: string): Promise<string> {
    const preparedPath = clearAbsolutePath(pathTo)

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

    return await this.driver.isDir(preparedPath)
  }

  async isFile(pathToFile: string): Promise<boolean> {
    const preparedPath = clearAbsolutePath(pathToFile)

    return await this.driver.isFile(preparedPath)
  }

  async isSymLink(pathToSymLink: string): Promise<boolean> {
    const preparedPath = clearAbsolutePath(pathToSymLink)

    return await this.driver.isSymLink(preparedPath)
  }

  async isExists(pathToFileOrDir: string): Promise<boolean> {
    const preparedPath = clearAbsolutePath(pathToFileOrDir)

    return await this.driver.isExists(preparedPath)
  }

  async isTextFileUtf8(pathTo: string): Promise<boolean> {
    const preparedPath = clearAbsolutePath(pathTo)

    return await this.driver.isTextFileUtf8(preparedPath)
  }

  ////// WRITE METHODS
  async appendFile(
    pathTo: string,
    data: string,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.driver.appendFile(preparedPath, data, options)
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): Promise<void> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.driver.writeFile(preparedPath, data, options)
  }

  async rm(paths: string[], options?: RmOptions): Promise<void> {
    const preparedPaths = paths.map((path) => clearAbsolutePath(path))

    await this.driver.rm(preparedPaths, options)
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      clearAbsolutePath(src),
      clearAbsolutePath(dest),
    ])

    await this.driver.cp(preparedFiles, options)
  }

  async rename(files: [string, string][]): Promise<void> {
    const preparedFiles: [string, string][] = files.map(([src, dest]) => [
      clearAbsolutePath(src),
      clearAbsolutePath(dest),
    ])

    await this.driver.rename(preparedFiles)
  }

  async mkdir(pathTo: string, options?: MkdirOptions): Promise<void> {
    const preparedPath = clearAbsolutePath(pathTo)

    await this.driver.mkdir(preparedPath, options)
  }

  /**
   * Target and dest have to have write permissions
   * @param target
   * @param pathTo
   * @returns
   */
  async symlink(target: string, pathTo: string): Promise<void> {
    const preparedTarget = clearAbsolutePath(target)
    const preparedPathTo = clearAbsolutePath(pathTo)

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

    await this.driver.moveToDest(preparedSrc, preparedDestDir, force)
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const preparedFile = clearAbsolutePath(file)

    if (newName.includes('/') || newName.includes('\\')) {
      throw new Error('New name cannot contain slashes')
    }

    const preparedNewName = newName.trim()

    await this.driver.renameFile(preparedFile, preparedNewName)
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    const preparedPath = clearAbsolutePath(pathToFileOrDir)

    await this.driver.rmRf(preparedPath)
  }

  async mkDirP(pathToDir: string): Promise<void> {
    const preparedPath = clearAbsolutePath(pathToDir)

    await this.driver.mkDirP(preparedPath)
  }
}
