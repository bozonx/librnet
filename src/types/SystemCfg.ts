

export interface SystemLocalCfg {
  // defaultVersionsCount: number
  // // like {fullRelPathToDir: 10}
  // versionsCount: Record<string, number>
  // rootDir: string;
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

