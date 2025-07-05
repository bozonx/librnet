import { resolveRealPath } from '../helpers/helpers.js';
import { System } from '../System.js';
import { FilesDriverLogic } from './FilesDriverLogic.js';
import type { FilesIoType } from '../../types/io/FilesIoType.js';
import type { IoBase } from '../base/IoBase.js';
import { IO_NAMES, SystemEvents } from '../../types/constants.js';
import type { FilesEventData } from '../../types/types.js';

export class RootDirDriverLogic extends FilesDriverLogic {
  constructor(
    protected readonly system: System,
    protected readonly rootDir: string
  ) {
    super(
      system.io.getIo<FilesIoType & IoBase>(IO_NAMES.LocalFilesIo),
      (data: FilesEventData) => {
        this.system.events.emit(SystemEvents.localFiles, data);
      }
    );
  }

  // Make real path on external file system
  protected preparePath(pathTo: string): string {
    return resolveRealPath(
      pathTo,
      this.system.mountPoints.rootDir,
      this.system.mountPoints.getMountPoints()
    );
  }
}
