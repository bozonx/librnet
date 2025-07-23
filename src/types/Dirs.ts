export enum RootDirs {
  local = 'local',
  // Synced only using internal synchronization
  synced = 'synced',
  // mounted filesystems
  mnt = 'mnt',
}
export enum LocalDataSubDirs {
  // System files
  system = 'system',
  // files of IO, drivers, services and apps
  // installed via git or archive files
  packages = 'packages',
  // Local data files of services and apps
  data = 'data',
  // Local databases of services and apps
  db = 'db',
  // Local configs of all the entities
  configs = 'configs',
  // Local logs of all the entities
  logs = 'logs',
  // Local cache of all the entities
  cache = 'cache',
  // Local tmp files of all the entities
  tmp = 'tmp',
}
export enum SyncedDataSubDirs {
  // Synced data of services and apps
  data = 'data',
  // Synced databases of services and apps
  db = 'db',
  // Synced configs of all the entities
  configs = 'configs',
  // Synced logs of all the entities
  logs = 'logs',
  // Synced trash of user's files
  trash = 'trash',
  // Synced versions of user's files
  versions = 'versions',
  home = 'home',
}
export enum HomeSubDirs {
  Downloads = 'Downloads',
  Documents = 'Documents',
  Media = 'Media',
}
