import { pathJoin } from 'squidlet-lib';
import type { FilesIoType } from '../../types/io/FilesIoType.js';
import type { System } from '../System.js';
import type { IoBase } from '../base/IoBase.js';
import {
  CFG_FILE_EXT,
  IO_NAMES,
  ROOT_DIRS,
  SYNCED_DATA_SUB_DIRS,
} from '../../types/constants.js';

const SYSTEM_PERMISSIONS_CFG_NAME = 'system.permissions';

// TODO: use configs manager

export class PermissionsManager {
  private permissionsPath: string = pathJoin(
    '/',
    ROOT_DIRS.syncedData,
    SYNCED_DATA_SUB_DIRS.configs,
    `${SYSTEM_PERMISSIONS_CFG_NAME}.${CFG_FILE_EXT}`
  );
  // object like {entityName: {permissionName: permissionValue}}
  private permissions: Record<string, Record<string, string>> = {};

  private get filesIo(): FilesIoType & IoBase {
    return this.system.io.getIo<FilesIoType & IoBase>(IO_NAMES.LocalFilesIo);
  }

  constructor(private readonly system: System) {}

  async init() {
    if (await this.filesIo.stat(this.permissionsPath)) {
      this.permissions = JSON.parse(
        await this.filesIo.readTextFile(this.permissionsPath)
      );
    }
  }

  async savePermissions(
    entityName: string,
    partialPermissions: Record<string, string>
  ) {
    this.permissions[entityName] = {
      ...(this.permissions[entityName] || {}),
      ...partialPermissions,
    };

    await this.filesIo.writeFile(
      this.permissionsPath,
      JSON.stringify(this.permissions)
    );
  }

  async deletePermissions(entityName: string, permissionNames: string[]) {
    permissionNames.forEach((permissionName) => {
      delete this.permissions[entityName][permissionName];
    });

    if (Object.keys(this.permissions[entityName]).length === 0) {
      delete this.permissions[entityName];
    }

    await this.filesIo.rm([this.permissionsPath]);
  }
}
