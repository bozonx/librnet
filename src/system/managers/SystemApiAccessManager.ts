import type { System } from '../System.js';
import type { SystemCfg } from '@/types/SystemCfg.js';

export class SystemApiAccessManager {
  constructor(private readonly system: System) {}

  async getSystemConfig(): Promise<SystemCfg> {
    return this.system.configs.systemCfg;
  }

  // TODO: add other methods
}
