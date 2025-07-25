import type { System } from '../system/System.js';
import { CFG_FILE_EXT } from '../types/constants.js';
import {
  systemLocalCfgDefaults,
  systemSyncedCfgDefaults,
} from '../types/SystemCfg.js';
import {
  RootDirs,
  LocalDataSubDirs,
  SyncedDataSubDirs,
  HomeSubDirs,
} from '../types/Dirs.js';
import { pathJoin } from 'squidlet-lib';

export async function makeDirs(system: System) {
  // create root dirs
  for (const dir of Object.keys(RootDirs)) {
    await system.localFiles.mkDirP('/' + dir);
  }

  // /localData/...
  for (const dir of Object.keys(LocalDataSubDirs)) {
    await system.localFiles.mkDirP(`/${RootDirs.localData}/${dir}`);
  }

  // /syncedData/...
  for (const dir of Object.keys(SyncedDataSubDirs)) {
    await system.localFiles.mkDirP(`/${RootDirs.syncedData}/${dir}`);
  }

  // /home/...
  for (const dir of Object.keys(HomeSubDirs)) {
    await system.localFiles.mkDirP(`/${RootDirs.home}/${dir}`);
  }

  // Make default system config files
  await system.localFiles.writeFile(
    pathJoin(
      RootDirs.localData,
      LocalDataSubDirs.configs,
      'system.' + CFG_FILE_EXT
    ),
    JSON.stringify(systemLocalCfgDefaults, null, 2)
  );
  await system.localFiles.writeFile(
    pathJoin(
      RootDirs.syncedData,
      SyncedDataSubDirs.configs,
      'system.' + CFG_FILE_EXT
    ),
    JSON.stringify(systemSyncedCfgDefaults, null, 2)
  );
}
