import type { System } from '@/system/System.js'
import type { SystemCfg } from '@/types/SystemCfg.js'
import type { MountPoint } from '@/types/types.js'

export class SystemApiManager {
  constructor(private readonly system: System) {}

  async getSystemConfig(): Promise<SystemCfg> {
    return this.system.configs.systemCfg
  }

  async getMountPoints(): Promise<MountPoint[]> {
    return this.system.mountPoints.getMountPoints()
  }

  async getPermissions(): Promise<
    Record<string, Record<string, Record<string, boolean>>>
  > {
    return this.system.permissions.permissions
  }

  async getIoNames(): Promise<string[]> {
    return this.system.io.getNames()
  }

  // TODO: add other methods
  // TODO: add events
}
