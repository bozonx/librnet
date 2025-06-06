import type { FilesDriver } from '@/drivers/FilesDriver/FilesDriver.js';
import type { System } from './System.js';
import { SYSTEM_SUB_DIRS } from '@/types/constants.js';
import { ROOT_DIRS } from '@/types/constants.js';
import { HOME_SUB_DIRS } from '@/types/constants.js';
import {
  systemLocalCfgDefaults,
  systemSyncedCfgDefaults,
} from '@/types/SystemCfg.js';
import { pathJoin } from 'squidlet-lib';

export async function afterInstall(system: System) {
  const driver = system.drivers.getDriver<FilesDriver>('FilesDriver');

  // create root dirs
  for (const dir of Object.keys(ROOT_DIRS)) {
    await driver.mkDirP('/' + dir);
  }

  // /system/...
  for (const dir of Object.keys(SYSTEM_SUB_DIRS)) {
    await driver.mkDirP(`/${ROOT_DIRS.system}/${dir}`);
  }
  // /home/...
  for (const dir of Object.keys(HOME_SUB_DIRS)) {
    await driver.mkDirP(`/${ROOT_DIRS.home}/${dir}`);
  }

  // Make default system config files
  await driver.writeFile(
    pathJoin(ROOT_DIRS.system, SYSTEM_SUB_DIRS.cfgLocal, 'system.json'),
    JSON.stringify(systemLocalCfgDefaults, null, 2)
  );
  await driver.writeFile(
    pathJoin(ROOT_DIRS.system, SYSTEM_SUB_DIRS.cfgSynced, 'system.json'),
    JSON.stringify(systemSyncedCfgDefaults, null, 2)
  );
}
