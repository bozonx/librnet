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

export async function setupFileStructure(system: System) {
  // create root dirs
  for (const dir of Object.keys(RootDirs)) {
    await system.localFiles.mkDirP('/' + dir);
  }

  // /local/...
  for (const dir of Object.keys(LocalDataSubDirs)) {
    await system.localFiles.mkDirP(`/${RootDirs.local}/${dir}`);
  }

  // /synced/...
  for (const dir of Object.keys(SyncedDataSubDirs)) {
    await system.localFiles.mkDirP(`/${RootDirs.synced}/${dir}`);
  }

  // /home/...
  for (const dir of Object.keys(HomeSubDirs)) {
    await system.localFiles.mkDirP(
      `/${RootDirs.synced}/${SyncedDataSubDirs.home}/${dir}`
    );
  }

  // Make default system config files
  try {
    await system.localFiles.writeFile(
      pathJoin(
        RootDirs.local,
        LocalDataSubDirs.configs,
        'system.' + CFG_FILE_EXT
      ),
      JSON.stringify(systemLocalCfgDefaults, null, 2)
    );
  } catch (e) {
    // ignore
  }

  try {
    await system.localFiles.writeFile(
      pathJoin(
        RootDirs.synced,
        SyncedDataSubDirs.configs,
        'system.' + CFG_FILE_EXT
      ),
      JSON.stringify(systemSyncedCfgDefaults, null, 2)
    );
  } catch (e) {
    // ignore
  }

  try {
    await system.localFiles.writeFile(
      pathJoin(RootDirs.local, LocalDataSubDirs.system, 'package.json'),
      JSON.stringify(
        {
          name: 'system',
          version: '0.0.1',
          description: 'System',
          main: 'index.js',
          scripts: {},
        },
        null,
        2
      )
    );
  } catch (e) {
    // ignore
  }

  try {
    await system.localFiles.writeFile(
      pathJoin(RootDirs.local, LocalDataSubDirs.system, 'index.js'),
      `import { System } from '@/system/System.js';

const system = new System();

system.start();`
    );
  } catch (e) {
    // ignore
  }
}
