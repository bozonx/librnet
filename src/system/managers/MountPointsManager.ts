import type { MountPoint } from '@/types/types';
import type { System } from '../System';

const SYSTEM_MOUNT_POINT_CFG_NAME = 'system.mountPoints';

export class MountPointsManager {
  private mountPoints: MountPoint[] = [];

  constructor(private readonly system: System, readonly rootDir: string) {}

  async init() {
    this.mountPoints =
      (
        await this.system.configs.loadEntityConfig(
          SYSTEM_MOUNT_POINT_CFG_NAME,
          false
        )
      )?.items || [];
  }

  public getMountPoints(): MountPoint[] {
    return structuredClone(this.mountPoints);
  }

  public getMountPointBySrcPath(path: string): MountPoint | undefined {
    return structuredClone(
      this.mountPoints.find((point) => point.src.path === path)
    );
  }

  public getMountPointByDestPath(path: string): MountPoint | undefined {
    return structuredClone(
      this.mountPoints.find((point) => point.dest.path === path)
    );
  }

  public async registerMountPoint(point: MountPoint) {
    if (point.src.type === 'root' && point.dest.type === 'root') {
      throw new Error(
        `Root mount point cannot be both source and destination. ${JSON.stringify(
          point
        )}`
      );
    }

    if (
      this.mountPoints.find(
        (p) => p.src.path === point.src.path && p.dest.path === point.dest.path
      )
    ) {
      throw new Error(`Mount point already exists: ${JSON.stringify(point)}`);
    }

    // TODO: запретить зацикливание точек монтирования

    this.mountPoints.push(point);

    await this.system.configs.saveEntityConfig(
      SYSTEM_MOUNT_POINT_CFG_NAME,
      { items: this.mountPoints },
      false
    );
  }

  public async unregisterMountPointBySrcPath(path: string) {
    this.mountPoints = this.mountPoints.filter((p) => p.src.path !== path);

    await this.system.configs.saveEntityConfig(
      SYSTEM_MOUNT_POINT_CFG_NAME,
      { items: this.mountPoints },
      false
    );
  }

  public async unregisterMountPointByDestPath(path: string) {
    this.mountPoints = this.mountPoints.filter((p) => p.dest.path !== path);

    await this.system.configs.saveEntityConfig(
      SYSTEM_MOUNT_POINT_CFG_NAME,
      { items: this.mountPoints },
      false
    );
  }
}
