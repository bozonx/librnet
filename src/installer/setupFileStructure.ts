import { pathJoin } from 'squidlet-lib'

import type { System } from '@/system/System.js'
import {
  HomeSubDirs,
  LocalDataSubDirs,
  RootDirs,
  SyncedDataSubDirs,
} from '@/types/Dirs.js'
import {
  systemLocalCfgDefaults,
  systemSyncedCfgDefaults,
} from '@/types/SystemCfg.js'
import { CFG_FILE_EXT } from '@/types/constants.js'

export async function setupFileStructure(system: System) {
  // create root dirs
  for (const dir of Object.keys(RootDirs)) {
    await system.localFiles.mkDirP('/' + dir)
  }

  // /local/...
  for (const dir of Object.keys(LocalDataSubDirs)) {
    await system.localFiles.mkDirP(`/${RootDirs.local}/${dir}`)
  }

  // /synced/...
  for (const dir of Object.keys(SyncedDataSubDirs)) {
    await system.localFiles.mkDirP(`/${RootDirs.synced}/${dir}`)
  }

  // /home/...
  for (const dir of Object.keys(HomeSubDirs)) {
    await system.localFiles.mkDirP(
      `/${RootDirs.synced}/${SyncedDataSubDirs.home}/${dir}`
    )
  }

  // Make default system config files
  const systemLocalCfgPath = pathJoin(
    RootDirs.local,
    LocalDataSubDirs.configs,
    'system.' + CFG_FILE_EXT
  )
  if (!(await system.localFiles.exists(systemLocalCfgPath))) {
    await system.localFiles.writeFile(
      systemLocalCfgPath,
      JSON.stringify(systemLocalCfgDefaults, null, 2)
    )
  }

  const systemSyncedCfgPath = pathJoin(
    RootDirs.synced,
    SyncedDataSubDirs.configs,
    'system.' + CFG_FILE_EXT
  )
  if (!(await system.localFiles.exists(systemSyncedCfgPath))) {
    await system.localFiles.writeFile(
      systemSyncedCfgPath,
      JSON.stringify(systemSyncedCfgDefaults, null, 2)
    )
  }

  // system/package.json
  const systemPackageJsonPath = pathJoin(
    RootDirs.local,
    LocalDataSubDirs.system,
    'package.json'
  )
  if (!(await system.localFiles.exists(systemPackageJsonPath))) {
    await system.localFiles.writeFile(
      systemPackageJsonPath,
      JSON.stringify(
        {
          name: 'system',
          version: '0.0.1',
          description: 'System',
          main: 'index.js',
          scripts: {},
          dependencies: { '@squidlet/lib': 'latest' },
        },
        null,
        2
      )
    )
  }

  // system/index.js
  const systemIndexJsPath = pathJoin(
    RootDirs.local,
    LocalDataSubDirs.system,
    'index.js'
  )

  if (!(await system.localFiles.exists(systemIndexJsPath))) {
    await system.localFiles.writeFile(
      pathJoin(RootDirs.local, LocalDataSubDirs.system, 'index.js'),
      `import { StartProduction } from 'k-os';

StartProduction();`
    )
  }
}
