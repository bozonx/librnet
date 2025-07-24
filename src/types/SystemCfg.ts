export interface SystemLocalCfg {
  // WAIT_BEFORE_HALT_MS: number;
  ENTITY_INIT_TIMEOUT_SEC: number;
  ENTITY_DESTROY_TIMEOUT_SEC: number;
  REQUEST_TIMEOUT_SEC: number;
  // UI port for localhost
  DEFAULT_HTTP_LOCAL_PORT: number;
  // Secured port for external connections
  DEFAULT_WSS_EXTERNAL_PORT: number;
}

export interface SystemSyncedCfg {
  //
}

export interface SystemCfg {
  local: SystemLocalCfg;
  synced: SystemSyncedCfg;
}

export const systemLocalCfgDefaults: SystemLocalCfg = {
  // WAIT_BEFORE_HALT_MS: 1000,
  ENTITY_INIT_TIMEOUT_SEC: 20,
  ENTITY_DESTROY_TIMEOUT_SEC: 20,
  REQUEST_TIMEOUT_SEC: 60,
  DEFAULT_HTTP_LOCAL_PORT: 41808,
  DEFAULT_WSS_EXTERNAL_PORT: 41809,
};

export const systemSyncedCfgDefaults: SystemSyncedCfg = {
  //
};
