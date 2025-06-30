import { IndexedEventEmitter, pathJoin } from 'squidlet-lib';
import { ROOT_DIRS } from '../../types/constants.js';
import type { Logger } from 'squidlet-lib';
import type { System } from '../System';
import { RestrictedDir } from '../driversLogic/RestrictedDir.js';
import type { EntityManifest } from '@/types/types.js';
import { EntityConfig } from '../driversLogic/EntityConfig.js';
import { EntityLogFile } from '../driversLogic/EntityLogFile.js';
import { DriverBase } from '../base/DriverBase.js';

// TODO: add register api and crud api

export class EntityBaseContext {
  // Server side context
  // save here custom runtime data eg driver instances
  readonly context: Record<string, any> = {};
  // only for server
  readonly serverEvents = new IndexedEventEmitter();
  // for server and client
  readonly commonEvents = new IndexedEventEmitter();
  // local config files of this app
  readonly localConfig = new EntityConfig(this.system, this.manifest, false);
  // synced config files of this app
  readonly syncedConfig = new EntityConfig(this.system, this.manifest, true);
  // local files log of this app
  readonly localLog = new EntityLogFile(this.system, this.manifest, false);
  // synced files log of this app
  readonly syncedLog = new EntityLogFile(this.system, this.manifest, true);
  // readonly files of package relative to the app
  readonly packageFiles;
  // local data of this app. Only for local machine
  readonly localData;
  // syncronized data of this app between all the hosts
  readonly syncedData;
  // temporary files of this app
  readonly tmp;

  get consoleLog(): Logger {
    return {
      debug: (msg: string) => `[${this.manifest.name}]: ${msg}`,
      info: (msg: string) => `[${this.manifest.name}]: ${msg}`,
      warn: (msg: string) => `[${this.manifest.name}]: ${msg}`,
      error: (msg: string) => `[${this.manifest.name}]: ${msg}`,
      log: (msg: string) => `[${this.manifest.name}]: ${msg}`,
    };
  }

  // TODO: Downloads - наверное все приложения имеют туда полный доступ

  // TODO: use db key-value storage for cache
  // readonly cacheLocal;
  // // data bases for this app
  // readonly db;

  // TODO: manifent of packager or app?
  constructor(
    private readonly system: System,
    readonly manifest: EntityManifest,
    private readonly accessToken: string
  ) {
    this.packageFiles = new FilesReadOnly(
      filesDriver,
      pathJoin('/', ROOT_DIRS.packages, this.manifest.name),
      true
    );
    this.localData = new RestrictedDir(
      filesDriver,
      pathJoin('/', ROOT_DIRS.localData, this.manifest.name)
    );
    this.syncedData = new RestrictedDir(
      filesDriver,
      pathJoin('/', ROOT_DIRS.syncedData, this.manifest.name)
    );
    this.tmp = new RestrictedDir(
      filesDriver,
      pathJoin('/', ROOT_DIRS.tmp, this.manifest.name)
    );
  }

  async init() {
    //
  }

  async destroy() {
    //
  }

  async makeDriverInstance<T extends DriverBase>(
    driverName: string,
    params: Record<string, any>
  ): Promise<T> {
    // TODO: use accessToken to make driver instance
    // return this.system.drivers.getDriver<T>(driverName);
  }
}
