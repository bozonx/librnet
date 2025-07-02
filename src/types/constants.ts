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
// UI port for localhost
export const DEFAULT_HTTP_LOCAL_PORT = 41808;
// Secured port for external connections
export const DEFAULT_WSS_EXTERNAL_PORT = 41809;
//export const SERVER_STARTING_TIMEOUT_SEC = 60
//export const REQUEST_ID_LENGTH = 8

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
}

// TODO: review
export enum RootEvents {
  service,
}

// TODO: review
export enum ServiceEvents {
  status,
}

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
  // Installed files of IO, drivers, services and apps
  programFiles: 'programFiles',
  localData: 'localData',
  // Synced only using internal synchronization
  syncedData: 'syncedData',
  // synced home dir using watch
  home: 'home',
  // mounted filesystems
  mnt: 'mnt',
};
export const LOCAL_DATA_SUB_DIRS = {
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

export const SERVICE_STATUS = {
  // just instantiated
  loaded: 'loaded',
  // has not met some dependencies. Service has been destroyed and removed in this case
  noDependencies: 'noDependencies',
  // wait while service which is it depends on will be started
  wait: 'wait',
  // was falled if it was in running state
  fallen: 'fallen',
  // init is in progress
  initializing: 'initializing',
  initialized: 'initialized',
  // initError: 'initError',
  starting: 'starting',
  restarting: 'restarting',
  // after successfully run
  running: 'running',
  // startError: 'startError',
  stopping: 'stopping',
  stopped: 'stopped',
  // stopError: 'stopError',
  destroying: 'destroying',
  destroyed: 'destroyed',
};

export const SERVICE_DESTROY_REASON = {
  noDependencies: 'noDependencies',
  systemDestroying: 'systemDestroying',
};

export const SERVICE_TYPES = {
  service: 'service',
  target: 'target',
  oneshot: 'oneshot', // может быть таймаут запуска
  interval: 'interval', // переодично запускается типа cron
};

export const SERVICE_TARGETS = {
  // only for system low level services
  root: 'root',
  // for not system services
  systemInitialized: 'systemInitialized',
};

export const IO_NAMES = {
  LocalFilesIo: 'LocalFilesIo',
  HttpClientIo: 'HttpClientIo',
  HttpServerIo: 'HttpServerIo',
  MqttClientIo: 'MqttClientIo',
  WsClientIo: 'WsClientIo',
  WsServerIo: 'WsServerIo',
};

export const DRIVER_NAMES = {
  FilesDriver: 'FilesDriver',
  HttpClientDriver: 'HttpClientDriver',
  HttpServerDriver: 'HttpServerDriver',
  MqttClientDriver: 'MqttClientDriver',
  WsClientDriver: 'WsClientDriver',
  WsServerDriver: 'WsServerDriver',
};

// system services which have api
export const SYSTEM_SERVICE_NAMES = {
  Network: 'Network',
  // PublicApiService: 'PublicApiService',
  Sessions: 'Sessions',
};

export const IO_SET_TYPES = {
  IoSetLocal: 'IoSetLocal',
};
