import type { System } from './System.js';
import {
  LOCAL_DATA_SUB_DIRS,
  ROOT_DIRS,
  SYNCED_DATA_SUB_DIRS,
  CFG_FILE_EXT,
} from '@/types/constants.js';
import { HOME_SUB_DIRS } from '@/types/constants.js';
import {
  systemLocalCfgDefaults,
  systemSyncedCfgDefaults,
} from '@/types/SystemCfg.js';
import { pathJoin } from 'squidlet-lib';

export async function afterInstall(system: System) {
  // create root dirs
  for (const dir of Object.keys(ROOT_DIRS)) {
    await system.localFiles.mkDirP('/' + dir);
  }

  // /localData/...
  for (const dir of Object.keys(LOCAL_DATA_SUB_DIRS)) {
    await system.localFiles.mkDirP(`/${ROOT_DIRS.localData}/${dir}`);
  }

  // /syncedData/...
  for (const dir of Object.keys(SYNCED_DATA_SUB_DIRS)) {
    await system.localFiles.mkDirP(`/${ROOT_DIRS.syncedData}/${dir}`);
  }

  // /home/...
  for (const dir of Object.keys(HOME_SUB_DIRS)) {
    await system.localFiles.mkDirP(`/${ROOT_DIRS.home}/${dir}`);
  }

  // Make default system config files
  await system.localFiles.writeFile(
    pathJoin(
      ROOT_DIRS.localData,
      LOCAL_DATA_SUB_DIRS.configs,
      'system.' + CFG_FILE_EXT
    ),
    JSON.stringify(systemLocalCfgDefaults, null, 2)
  );
  await system.localFiles.writeFile(
    pathJoin(
      ROOT_DIRS.syncedData,
      SYNCED_DATA_SUB_DIRS.configs,
      'system.' + CFG_FILE_EXT
    ),
    JSON.stringify(systemSyncedCfgDefaults, null, 2)
  );
}
