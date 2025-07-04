import type { MountPoint } from '@/types/types';
import type { System } from '../System';

export class MountPointsManager {
  private mountPoints: MountPoint[] = [];

  constructor(private readonly system: System, readonly rootDir: string) {}

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

  public registerMountPoint(point: MountPoint) {
    if (point.src.type === 'root' && point.dest.type === 'root') {
      throw new Error(
        `Root mount point cannot be both source and destination. ${JSON.stringify(
          point
        )}`
      );
    }

    this.mountPoints.push(point);
  }

  public unregisterMountPointBySrcPath(path: string) {
    this.mountPoints = this.mountPoints.filter((p) => p.src.path !== path);
  }

  public unregisterMountPointByDestPath(path: string) {
    this.mountPoints = this.mountPoints.filter((p) => p.dest.path !== path);
  }
}
