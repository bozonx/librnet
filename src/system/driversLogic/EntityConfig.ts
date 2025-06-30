import { pathJoin } from 'squidlet-lib';
import { System } from '../System.js';
import { ROOT_DIRS } from '@/types/constants.js';
import type { EntityManifest } from '@/types/types.js';

export class EntityConfig<Config extends Record<string, any>> {
  private cfg: Config = {} as Config;

  constructor(
    private readonly system: System,
    private readonly manifest: EntityManifest,
    // local or synced
    private readonly isSynced: boolean
  ) {}

  async init() {
    this.cfg = await this.system.configs.loadEntityConfig<Config>(
      this.manifest.name,
      this.isSynced
    );
  }

  async getConfig() {
    return this.cfg;
  }

  async saveConfig(config: Config) {
    this.cfg = config;

    await this.system.configs.saveEntityConfig(
      this.manifest.name,
      this.cfg,
      this.isSynced
    );
  }

  /**
   * Save partial config. It does not deep merge.
   * @param partial - partial config
   */
  async savePartialConfig(partial: Partial<Config>) {
    this.cfg = { ...this.cfg, ...partial };

    await this.system.configs.saveEntityConfig(
      this.manifest.name,
      this.cfg,
      this.isSynced
    );
  }

  async deleteConfig() {
    await this.system.configs.deleteEntityConfig(
      this.manifest.name,
      this.isSynced
    );

    this.cfg = {} as Config;
  }
}
