import type { System } from '@/system/System.js'

const SYSTEM_PERMISSIONS_CFG_NAME = 'system.permissions'

export class PermissionsManager {
  // object like {entityWhoAsk: {permitForEntity: {permissionName: true, false or undefined}}}
  private _permissions: Record<
    string,
    Record<string, Record<string, boolean>>
  > = {}

  get permissions() {
    return structuredClone(this._permissions)
  }

  constructor(private readonly system: System) {}

  async init() {
    this._permissions = await this.system.configs.loadEntityConfig(
      SYSTEM_PERMISSIONS_CFG_NAME,
      true
    )
  }

  async checkPermissions(
    entityWhoAsk: string,
    permitForEntity: string,
    permissionName: string
  ): Promise<boolean> {
    if (!this._permissions[entityWhoAsk]?.[permitForEntity]) return false

    return !!this._permissions[entityWhoAsk][permitForEntity]?.[permissionName]
  }

  async savePermissions(
    entityWhoAsk: string,
    permitForEntity: string,
    partialPermissions: Record<string, boolean>
  ) {
    if (!this._permissions[entityWhoAsk]) {
      this._permissions[entityWhoAsk] = {}
    }

    this._permissions[entityWhoAsk][permitForEntity] = {
      ...(this._permissions[entityWhoAsk][permitForEntity] || {}),
      ...partialPermissions,
    }

    await this.system.configs.saveEntityConfig(
      SYSTEM_PERMISSIONS_CFG_NAME,
      this._permissions,
      true
    )
  }

  async deletePermissions(
    entityWhoAsk: string,
    permitForEntity: string,
    permissionNames: string[]
  ) {
    permissionNames.forEach((permissionName) => {
      delete this._permissions[entityWhoAsk]?.[permitForEntity]?.[
        permissionName
      ]
    })

    if (
      Object.keys(this._permissions[entityWhoAsk]?.[permitForEntity] || {})
        .length === 0
    ) {
      delete this._permissions[entityWhoAsk]?.[permitForEntity]
    }

    if (Object.keys(this._permissions[entityWhoAsk] || {}).length === 0) {
      delete this._permissions[entityWhoAsk]
    }

    await this.system.configs.saveEntityConfig(
      SYSTEM_PERMISSIONS_CFG_NAME,
      this._permissions,
      true
    )
  }
}
