import type { System } from '../System.js';

const SYSTEM_PERMISSIONS_CFG_NAME = 'system.permissions';

export class PermissionsManager {
  // object like {entityWhoAsk: {permitForEntity: {permissionName: true, false or undefined}}}
  private permissions: Record<string, Record<string, Record<string, boolean>>> =
    {};

  constructor(private readonly system: System) {}

  async init() {
    this.permissions = await this.system.configs.loadEntityConfig(
      SYSTEM_PERMISSIONS_CFG_NAME,
      true
    );
  }

  async checkPermissions(
    entityWhoAsk: string,
    permitForEntity: string,
    permissionName: string
  ): Promise<boolean> {
    if (!this.permissions[entityWhoAsk]?.[permitForEntity]) return false;

    return !!this.permissions[entityWhoAsk][permitForEntity]?.[permissionName];
  }

  async savePermissions(
    entityWhoAsk: string,
    permitForEntity: string,
    partialPermissions: Record<string, boolean>
  ) {
    if (!this.permissions[entityWhoAsk]) {
      this.permissions[entityWhoAsk] = {};
    }

    this.permissions[entityWhoAsk][permitForEntity] = {
      ...(this.permissions[entityWhoAsk][permitForEntity] || {}),
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
    permitForEntity: string,
    permissionNames: string[]
  ) {
    permissionNames.forEach((permissionName) => {
      delete this.permissions[entityWhoAsk]?.[permitForEntity]?.[
        permissionName
      ];
    });

    if (
      Object.keys(this.permissions[entityWhoAsk]?.[permitForEntity] || {})
        .length === 0
    ) {
      delete this.permissions[entityWhoAsk]?.[permitForEntity];
    }

    if (Object.keys(this.permissions[entityWhoAsk] || {}).length === 0) {
      delete this.permissions[entityWhoAsk];
    }

    await this.system.configs.saveEntityConfig(
      SYSTEM_PERMISSIONS_CFG_NAME,
      this.permissions,
      true
    );
  }
}
