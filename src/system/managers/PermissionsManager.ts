import type { System } from '../System.js';

const SYSTEM_PERMISSIONS_CFG_NAME = 'system.permissions';

export class PermissionsManager {
  // object like {entityName: {permissionName: true, false or undefined}}
  private permissions: Record<string, Record<string, boolean>> = {};

  constructor(private readonly system: System) {}

  async init() {
    this.permissions = await this.system.configs.loadEntityConfig(
      SYSTEM_PERMISSIONS_CFG_NAME,
      true
    );
  }

  async checkPermissions(
    entityWhoAsk: string,
    entityName: string,
    permissionName: string
  ) {
    if (!this.permissions[entityName]) return false;

    return (
      !!this.permissions[entityName][permissionName] ||
      this.permissions[entityName][permissionName] === entityWhoAsk
    );
  }

  async savePermissions(
    entityWhoAsk: string,
    entityName: string,
    partialPermissions: Record<string, boolean>
  ) {
    // TODO: check if entityWhoAsk has permission to save permissions for entityName

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

  async deletePermissions(
    entityWhoAsk: string,
    entityName: string,
    permissionNames: string[]
  ) {
    // TODO: check if entityWhoAsk has permission to delete permissions for entityName

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
