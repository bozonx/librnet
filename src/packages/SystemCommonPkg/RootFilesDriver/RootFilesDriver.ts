import { pathBasename, pathDirname, pathJoin } from 'squidlet-lib';
import { DriverFactoryBase } from '../../../system/base/DriverFactoryBase.js';
import type { DriverIndex } from '../../../types/types.js';
import DriverInstanceBase from '../../../system/base/DriverInstanceBase.js';
import { IO_NAMES } from '@/types/constants.js';
import type {
  FilesIoType,
  ReadTextFileOptions,
  WriteFileOptions,
} from '@/types/io/FilesIoType.js';
import type { IoBase } from '@/system/base/IoBase.js';
import type { FilesDriverType } from '@/types/FilesDriverType.js';
import type { System } from '../../../system/System.js';

// TODO:  add tmpdir https://nodejs.org/api/fs.html#fspromisesmkdtempprefix-options
// TODO: запретить передавать URL и другие типы путей для чтения и записи

// export const FilesIoIndex: IoIndex = (ctx: IoContext) => {
//   // if root dir is relative then make it absolute relate to PWD
//   const rootDir = ctx.env.ROOT_DIR ? path.resolve(ctx.env.ROOT_DIR) : '';
//   const external = JSON.parse(process.env.EXT_DIRS || '{}');
//   // check if external paths are absolute
//   for (const name of Object.keys(external)) {
//     if (external[name].indexOf('/') !== 0) {
//       throw new Error(
//         `External path ${name}: ${external[name]} has to be absolute`
//       );
//     }
//   }

//   const cfg: FilesIoConfig = {
//     uid: process.env.FILES_UID ? Number(process.env.FILES_UID) : undefined,
//     gid: process.env.FILES_GID ? Number(process.env.FILES_GID) : undefined,
//     external,
//     dirs: {
//       appFiles: prepareSubPath(
//         ROOT_DIRS.appFiles,
//         rootDir,
//         process.env.APP_FILES_DIR
//       ),
//       appDataLocal: prepareSubPath(
//         ROOT_DIRS.appDataLocal,
//         rootDir,
//         process.env.APP_DATA_LOCAL_DIR
//       ),
//       appDataSynced: prepareSubPath(
//         ROOT_DIRS.appDataSynced,
//         rootDir,
//         process.env.APP_DATA_SYNCED_DIR
//       ),
//       cacheLocal: prepareSubPath(
//         ROOT_DIRS.cacheLocal,
//         rootDir,
//         process.env.CACHE_LOCAL_DIR
//       ),
//       cfgLocal: prepareSubPath(
//         ROOT_DIRS.cfgLocal,
//         rootDir,
//         process.env.CFG_LOCAL_DIR
//       ),
//       cfgSynced: prepareSubPath(
//         ROOT_DIRS.cfgSynced,
//         rootDir,
//         process.env.CFG_SYNCED_DIR
//       ),
//       db: prepareSubPath(ROOT_DIRS.db, rootDir, process.env.DB_DIR),
//       log: prepareSubPath(ROOT_DIRS.log, rootDir, process.env.LOG_DIR),
//       tmpLocal: prepareSubPath(
//         ROOT_DIRS.tmpLocal,
//         rootDir,
//         process.env.TMP_LOCAL_DIR
//       ),
//       home: prepareSubPath(ROOT_DIRS.home, rootDir, process.env.USER_HOME_DIR),
//     },
//   };
//   return new FilesIo(ctx, cfg);
// };

export const RootFilesDriverIndex: DriverIndex = (system: System) => {
  return new RootFilesDriver(system);
};

export class RootFilesDriver extends DriverFactoryBase<
  any,
  RootFilesDriverInstance
> {
  readonly name = 'RootFilesDriver';
  protected SubDriverClass = RootFilesDriverInstance;
}

/**
 * Acces to the root files of the system
 */
export class RootFilesDriverInstance extends DriverInstanceBase<any> {
  // requireIo = [IO_NAMES.FilesIo];

  private get io(): IoBase & FilesIoType {
    return this.system.io.getIo(IO_NAMES.LocalFilesIo);
  }

  ////// READ ONLY METHODS
  async readTextFile(
    pathTo: string,
    options?: ReadTextFileOptions
  ): Promise<string> {
    return this.io.readTextFile(this.preparePath(pathTo), options);
  }

  ////// WRITE METHODS
  async writeTextFile(
    pathTo: string,
    data: string,
    options?: WriteFileOptions
  ): Promise<void> {
    return this.io.writeFile(this.preparePath(pathTo), data, options);
  }

  private preparePath(pathTo: string): string {
    // TODO: check if path is allowed
    return pathTo;
  }

  // private checkPermissions(pathTo: string, perm: PermissionFileType) {
  //   // TODO: throw an error if path is not allowed
  // }

  // private async prepareBatchFileNames(
  //   src: string | string[],
  //   destDir: string
  // ): Promise<[string, string][]> {
  //   let resolvedSrc: string[];
  //   const prepared: [string, string][] = [];

  //   if (typeof src === 'string') {
  //     this.checkPermissions(src, 'r');
  //     resolvedSrc = [src];
  //   } else {
  //     for (const item of src) this.checkPermissions(item, 'r');
  //     resolvedSrc = src;
  //   }

  //   this.checkPermissions(destDir, 'w');

  //   for (const item of resolvedSrc) {
  //     const fileStats: StatsSimplified | undefined = await this.io.stat(item);

  //     if (!fileStats) throw new Error(`File "${item}" doesn't exist`);
  //     // the same for dir and file
  //     prepared.push([item, pathJoin(destDir, pathBasename(item))]);
  //   }

  //   return prepared;
  // }

  /**
   * Make real path on external file system
   * @param pathTo - it has to be /appFiles/..., /cfg/... etc.
   *   /external/extMountedDir/... is a virtual path to virtual dir where some
   *   external virtual dirs are mounted
   * @private
   */
  // private makePath(pathTo: string): string {
  //   if (pathTo.indexOf('/') !== 0) {
  //     throw new Error(`Path has to start with "/": ${pathTo}`);
  //   }

  //   const pathMatch = pathTo.match(/^\/([^\/]+)(\/.+)?$/);

  //   if (!pathMatch) throw new Error(`Wrong path "${pathTo}"`);

  //   const subDir = pathMatch[1] as keyof typeof ROOT_DIRS;
  //   const restPath = pathMatch[2] || '';

  //   if ((subDir as string) === EXTERNAL_ROOT_DIR) {
  //     const extMatch = pathTo.match(/^\/([^\/]+)(\/.+)?$/);

  //     if (!extMatch) throw new Error(`Wrong external path "${pathTo}"`);

  //     const extDir = extMatch[1];
  //     const extRestPath = extMatch[2] || '';
  //     const resolvedExtAbsDir: string | undefined = this.cfg.external[extDir];

  //     if (resolvedExtAbsDir) return resolvedExtAbsDir + extRestPath;

  //     throw new Error(`Can't resolve external path "${pathTo}"`);
  //   }
  //   // resolve root dir
  //   const resolvedAbsDir: string | undefined = this.cfg.dirs[subDir];
  //   // replace sub dir to system path
  //   if (resolvedAbsDir) return resolvedAbsDir + restPath;

  //   throw new Error(`Can't resolve path "${pathTo}"`);
  // }

  // function prepareSubPath(
  //   subDirOfRoot: string,
  //   rootDir?: string,
  //   envPath?: string
  // ): string {
  //   // specified env var is preferred
  //   if (envPath) {
  //     // it env variable set then use it as absolute or relative to PWD
  //     return path.resolve(envPath);
  //   } else if (rootDir) {
  //     // if ROOT_DIR env set then just join sub path with it
  //     return pathJoin(rootDir, subDirOfRoot);
  //   }

  //   throw new Error(
  //     `FilesIo: can't resolve path for "${subDirOfRoot}". There are no ROOT_DIR and specified env variable`
  //   );
  // }
}
