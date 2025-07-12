export const DEFAULT_ENCODE = 'utf-8';
export const EVENT_DELIMITER = '|';
//export const VERSIONS_DIR_NAME = '.versions'
// TODO: move this to system cfg
export const WAIT_BEFORE_HALT_MS = 1000;
export const ENTITY_INIT_TIMEOUT_SEC = 20;
export const ENTITY_DESTROY_TIMEOUT_SEC = 20;
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
//export const SERVER_STARTING_TIMEOUT_SEC = 60
export const REQUEST_ID_LENGTH = 8;

export enum SystemEvents {
  // driversInitialized,
  // servicesInitialized,
  // devicesInitialized,
  // appInitialized,
  // beforeDestroy,
  logger,
  systemInited,
  systemStarted,
  systemDestroying,
  localFiles,
  wsServer,
  wsClient,
  httpServer,
  // when service or app status changed.
  //  ('app'|'service', entityName, EntityStatus, details?)
  entityStatus,
}

// TODO: review
// export enum RootEvents {
//   service,
// }

// TODO: review
// export enum ServiceEvents {
//   status,
// }

// TODO: review, move to network service
export enum NETWORK_CODES {
  success,
  badRequest,
  // error of remote method
  payloadHandlerError,
  // error while request or response process
  fatalError,
  noCategory,
}

export const ENV_MODES = {
  development: 'development',
  production: 'production',
  test: 'test',
};

export type EnvMode = keyof typeof ENV_MODES;

// root dirs
export const ROOT_DIRS = {
  local: 'local',
  // TODO: так обще можно называть?
  // Synced only using internal synchronization
  synced: 'synced',
  // mounted filesystems
  mnt: 'mnt',
};
export const LOCAL_DATA_SUB_DIRS = {
  // Installed files of IO, drivers, services and apps
  programs: 'programs',
  // Local data files of services and apps
  data: 'data',
  // Databases of services and apps
  db: 'db',
  configs: 'configs',
  logs: 'logs',
  cache: 'cache',
  tmp: 'tmp',
};
export const SYNCED_DATA_SUB_DIRS = {
  // Synced data of io, drivers, services and apps
  data: 'data',
  db: 'db',
  configs: 'configs',
  logs: 'logs',
  trash: 'trash',
  // versions of user files
  versions: 'versions',
  // synced home dir using watch
  home: 'home',
};
export const HOME_SUB_DIRS = {
  Downloads: 'Downloads',
  Documents: 'Documents',
  Media: 'Media',
};

//// virtual local device root dir
// export const DEVICE_ROOT_DIR = 'Device';
//// virtual synced storage root dir
// export const SYNCED_STORAGE_ROOT_DIR = 'Storage';

export type EntityStatus =
  | 'loaded'
  | 'initializing'
  | 'initError'
  | 'initialized'
  | 'destroying'
  | 'starting'
  | 'startError'
  | 'running'
  // fallen on error from running state
  | 'fallen'
  | 'stopping'
  | 'stopError'
  | 'stopped';

export const ENTITY_STATUS: Record<EntityStatus, EntityStatus> = {
  loaded: 'loaded',
  initializing: 'initializing',
  initError: 'initError',
  initialized: 'initialized',
  destroying: 'destroying',
  starting: 'starting',
  startError: 'startError',
  running: 'running',
  fallen: 'fallen',
  stopping: 'stopping',
  stopError: 'stopError',
  stopped: 'stopped',
};

export const IO_NAMES = {
  LocalFilesIo: 'LocalFilesIo',
  ArchiveIo: 'ArchiveIo',
  HttpClientIo: 'HttpClientIo',
  HttpServerIo: 'HttpServerIo',
  MqttClientIo: 'MqttClientIo',
  WsClientIo: 'WsClientIo',
  WsServerIo: 'WsServerIo',
};

export const DRIVER_NAMES = {
  FilesDriver: 'FilesDriver',
  ArchiveDriver: 'ArchiveDriver',
  HttpClientDriver: 'HttpClientDriver',
  HttpServerDriver: 'HttpServerDriver',
  MqttClientDriver: 'MqttClientDriver',
  WsClientDriver: 'WsClientDriver',
  WsServerDriver: 'WsServerDriver',
};

// system services which have api
export const SERVICE_NAMES = {
  // Network: 'Network',
  // // PublicApiService: 'PublicApiService',
  // Sessions: 'Sessions',
};

export const IO_SET_TYPES = {
  IoSetLocal: 'IoSetLocal',
};

export const DRIVER_DESTROY_REASON = {
  shutdown: 'shutdown',
};

export type DriverDestroyReason = keyof typeof DRIVER_DESTROY_REASON;

export const FILE_ACTION = {
  read: 'r',
  write: 'w',
};

export type FileAction = keyof typeof FILE_ACTION;