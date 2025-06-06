import type { FilesDriver } from '@/drivers/FilesDriver/FilesDriver.js';
import type { System } from './System.js';
import { SYSTEM_SUB_DIRS } from '@/types/constants.js';
import { ROOT_DIRS } from '@/types/constants.js';
import { HOME_SUB_DIRS } from '@/types/constants.js';

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

  // TODO: make default config files

  // if not exist then make a new file with default config
  await this.filesIo.writeFile(
    SYSTEM_LOCAL_CONFIG_FILE,
    JSON.stringify(systemCfgDefaults, null, 2)
  );
}
