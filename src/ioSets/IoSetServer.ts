import type { IoBase } from '@/system/base/IoBase';
import type { IoManifest } from '@/types/Manifests';

export class IoSetServer {
  private readonly ios: { [index: string]: IoBase } = {};

  use(manifest: IoManifest, io: IoBase) {
    this.ios[io.name] = io;
  }
}
