

export interface SystemLocalCfg {
  // defaultVersionsCount: number
  // // like {fullRelPathToDir: 10}
  // versionsCount: Record<string, number>
  // rootDir: string;
  export const WAIT_BEFORE_HALT_MS = 1000;
export const ENTITY_INIT_TIMEOUT_SEC = 20;
export const ENTITY_DESTROY_TIMEOUT_SEC = 20;
// UI port for localhost
export const DEFAULT_HTTP_LOCAL_PORT = 41808;
// Secured port for external connections
export const DEFAULT_WSS_EXTERNAL_PORT = 41809;
}

export interface SystemSyncedCfg {
  //
}

export interface SystemCfg {
  local: SystemLocalCfg;
  synced: SystemSyncedCfg;
}

export const systemLocalCfgDefaults: SystemLocalCfg = {
  // // TODO: WTF?
  // defaultVersionsCount: 5,
  // // TODO: WTF?
  // versionsCount: {},
  // rootDir: '',
};

export const systemSyncedCfgDefaults: SystemSyncedCfg = {
  //cfgSynced: {},
};

