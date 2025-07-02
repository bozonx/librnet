import type { System } from '../System.js';

const SYSTEM_PERMISSIONS_CFG_NAME = 'system.permissions';

export class PermissionsManager {
  // object like {entityName: {permissionName: permissionValue}}
  private permissions: Record<string, Record<string, string>> = {};

  constructor(private readonly system: System) {}

  async init() {
    this.permissions = await this.system.configs.loadEntityConfig(
      SYSTEM_PERMISSIONS_CFG_NAME,
      true
    );
  }

  async savePermissions(
    entityName: string,
    partialPermissions: Record<string, string>
  ) {
    this.permissions[entityName] = {
      ...(this.permissions[entityName] || {}),
      ...partialPermissions,
    };

    await this.system.configs.saveEntityConfig(
      SYSTEM_PERMISSIONS_CFG_NAME,
      this.permissions,
      true
    );
  }

  async deletePermissions(entityName: string, permissionNames: string[]) {
    permissionNames.forEach((permissionName) => {
      delete this.permissions[entityName][permissionName];
    });

    if (Object.keys(this.permissions[entityName]).length === 0) {
      delete this.permissions[entityName];
    }

    await this.system.configs.saveEntityConfig(
      SYSTEM_PERMISSIONS_CFG_NAME,
      this.permissions,
      true
    );
  }
}
