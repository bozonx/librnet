import { FilesDriverLogic } from './FilesDriverLogic.js'
import type { System } from '@/system/System.js'
import { clearAbsolutePath } from '@/system/helpers/helpers.js'
import { IoNames } from '@/types/EntitiesNames.js'
import type { FilesEventData } from '@/types/EventsData.js'
import type {
  CopyOptions,
  FullFilesIoType,
  MkdirOptions,
  RmOptions,
  WriteFileOptions,
} from '@/types/io/FilesIoType.js'
import { SystemEvents } from '@/types/types.js'

export class DirTrapLogic extends FilesDriverLogic {
  constructor(
    protected readonly trappedDir: string,
    protected readonly isReadonly: boolean,
    protected readonly system: System
  ) {
    super(system.ios.getIo<FullFilesIoType>(IoNames.LocalFilesIo))
  }

  protected riseEvent(event: FilesEventData): void {
    this.system.events.emit(SystemEvents.localFiles, event)
  }

  protected preparePath(pathTo: string): string {
    const clearedPath = clearAbsolutePath(pathTo)
    // TODO: to do
    return clearedPath
  }

  async appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.appendFile(pathTo, data, options)
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.writeFile(pathTo, data, options)
  }

  async rm(paths: string[], options?: RmOptions) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.rm(paths, options)
  }

  async cp(files: [string, string][], options?: CopyOptions) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.cp(files, options)
  }

  async rename(files: [string, string][]) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.rename(files)
  }

  async mkdir(pathTo: string, options?: MkdirOptions) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.mkdir(pathTo, options)
  }

  async symlink(target: string, pathTo: string) {
    if (this.isReadonly) throw new Error('Readonly mode')
  }

  async copyToDest(src: string | string[], destDir: string, force?: boolean) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.copyToDest(src, destDir, force)
  }

  async moveToDest(src: string | string[], destDir: string, force?: boolean) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.moveToDest(src, destDir, force)
  }

  async renameFile(file: string, newName: string) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.renameFile(file, newName)
  }

  async rmRf(pathToFileOrDir: string) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.rmRf(pathToFileOrDir)
  }

  async mkDirP(pathToDir: string) {
    if (this.isReadonly) throw new Error('Readonly mode')

    await super.mkDirP(pathToDir)
  }
}
