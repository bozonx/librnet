export const DEFAULT_ENCODE = 'utf-8';
export const EVENT_DELIMITER = '|';
export const CFG_FILE_EXT = 'json';
export const LOG_FILE_EXT = 'log';
export const LOCAL_HOST = 'localhost';
export const SYSTEM_ENTITY = 'system';
export const SYSTEM_API_SERVICE_NAME = 'systemApi';
export const ENTITY_MANIFEST_FILE_NAME = 'manifest.yaml';
export const IS_TEXT_FILE_UTF8_SAMPLE_SIZE = 8192;
// UI port for localhost
export const DEFAULT_HTTP_LOCAL_PORT = 41808;
// Secured port for external connections
export const DEFAULT_WSS_EXTERNAL_PORT = 41809;
export const REQUEST_ID_LENGTH = 8;


export enum EnvModes {
  development = 'development',
  production = 'production',
  test = 'test',
}

export enum SystemEvents {
  driversInitialized = 'driversInitialized',
  servicesInitialized = 'servicesInitialized',
  systemInited = 'systemInited',
  systemStarted = 'systemStarted',
  systemDestroying = 'systemDestroying',
  logger = 'logger',
  // any actions with local files
  localFiles = 'localFiles',
  // any actions with ws server
  wsServer = 'wsServer',
  // any actions with ws client
  wsClient = 'wsClient',
  // any actions with http server
  httpServer = 'httpServer',
  // any actions with http client
  httpClient = 'httpClient',
  // when service or app status changed.
  //  ('app'|'service', entityName, EntityStatus, details?)
  entityStatus = 'entityStatus',
}

export enum RootDirs {
  local = 'local',
  // Synced only using internal synchronization
  synced = 'synced',
  // mounted filesystems
  mnt = 'mnt',
}
export enum LocalDataSubDirs {
  // Installed files of IO, drivers, services and apps
  programs = 'programs',
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

export enum EntityStatuses {
  loaded = 'loaded',
  initializing = 'initializing',
  initError = 'initError',
  initialized = 'initialized',
  destroying = 'destroying',
  starting = 'starting',
  startError = 'startError',
  running = 'running',
  // fallen on error from running state
  fallen = 'fallen',
  stopping = 'stopping',
  stopError = 'stopError',
  stopped = 'stopped',
}

// All the IO sets names
export enum IoSetNames {
  IoSetLocal = 'IoSetLocal',
}

// All the IOs names
export enum IoNames {
  LocalFilesIo = 'LocalFilesIo',
  ArchiveIo = 'ArchiveIo',
  HttpClientIo = 'HttpClientIo',
  HttpServerIo = 'HttpServerIo',
  MqttClientIo = 'MqttClientIo',
  WsClientIo = 'WsClientIo',
  WsServerIo = 'WsServerIo',
}

// All the drivers names
export enum DriverNames {
  FilesDriver = 'FilesDriver',
  ArchiveDriver = 'ArchiveDriver',
  HttpClientDriver = 'HttpClientDriver',
  HttpServerDriver = 'HttpServerDriver',
  MqttClientDriver = 'MqttClientDriver',
  WsClientDriver = 'WsClientDriver',
  WsServerDriver = 'WsServerDriver',
}

// System services names
export enum ServiceNames {
  // Network: 'Network',
  // // PublicApiService: 'PublicApiService',
  // Sessions: 'Sessions',
};


export enum DriverDestroyReasons {
  shutdown = 'shutdown',
}

export enum FileActions {
  read = 'r',
  write = 'w',
}

export enum EntityTypes {
  app = 'app',
  service = 'service',
  driver = 'driver',
  io = 'io',
}

export enum MountPointTypes {
  // TODO: WTF?
  root = 'root',
  // path to external directory
  external = 'external',
  // path to archive
  archive = 'archive',
}


//export const SERVER_STARTING_TIMEOUT_SEC = 60

// TODO: review, move to network service
// export enum NETWORK_CODES {
//   success,
//   badRequest,
//   // error of remote method
//   payloadHandlerError,
//   // error while request or response process
//   fatalError,
//   noCategory,
// }