import { FilesDriverLogic } from './FilesDriverLogic.js'
import { System } from '@/system/System.js'
import type { IoBase } from '@/system/base/IoBase.js'
import { resolveRealPath } from '@/system/helpers/helpers.js'
import { IoNames } from '@/types/EntitiesNames.js'
import type { FilesEventData } from '@/types/EventsData.js'
import type { FilesIoType } from '@/types/io/FilesIoType.js'
import { SystemEvents } from '@/types/types.js'

export class RootDirDriverLogic extends FilesDriverLogic {
  constructor(
    protected readonly system: System,
    protected readonly rootDir: string
  ) {
    super(system.ios.getIo<FilesIoType & IoBase>(IoNames.LocalFilesIo))
  }

  protected riseEvent(event: FilesEventData): void {
    this.system.events.emit(SystemEvents.localFiles, event)
  }

  // Make real path on external file system
  protected preparePath(pathTo: string): string {
    // TODO: review
    return resolveRealPath(
      pathTo,
      this.system.mountPoints.rootDir,
      this.system.mountPoints.getMountPoints()
    )
  }
}
