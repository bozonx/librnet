

export interface SystemCfg {
  defaultVersionsCount: number
  // like {fullRelPathToDir: 10}
  versionsCount: Record<string, number>
}

export const systemCfgDefaults: SystemCfg = {
  // TODO: WTF?
  defaultVersionsCount: 5,
  // TODO: WTF?
  versionsCount: {},
};
