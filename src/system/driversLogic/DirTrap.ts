import type { FilesDriverType } from '../../types/FilesDriverType.js';
import type {
  CopyOptions,
  RmOptions,
  WriteFileOptions,
} from '../../types/io/FilesIoType.js';
import type { MkdirOptions } from '../../types/io/FilesIoType.js';
import { pathBasename, pathDirname, pathJoin } from 'squidlet-lib';
import { DirTrapReadOnly } from './DirTrapReadOnly.js';

/**
 * Directory trap driver logic.
 * It does not allow to access files outside of the directory.
 */
export class DirTrap extends DirTrapReadOnly implements FilesDriverType {
  async appendFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ) {
    return this.filesIo.appendFile(this.preparePath(pathTo), data, options);
  }

  async writeFile(
    pathTo: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ) {
    return this.filesIo.writeFile(this.preparePath(pathTo), data, options);
  }

  async rm(paths: string[], options?: RmOptions) {
    return this.filesIo.rm(
      paths.map((path) => this.preparePath(path)),
      options
    );
  }

  async cp(files: [string, string][], options?: CopyOptions): Promise<void> {
    return this.filesIo.cp(
      files.map(([src, dest]) => {
        return [this.preparePath(src), this.preparePath(dest)];
      }),
      options
    );
  }

  async rename(files: [string, string][]): Promise<void> {
    return this.filesIo.rename(
      files.map(([src, dest]) => {
        return [this.preparePath(src), this.preparePath(dest)];
      })
    );
  }

  async mkdir(pathTo: string, options?: MkdirOptions) {
    return this.filesIo.mkdir(this.preparePath(pathTo), options);
  }

  async symlink(target: string, pathTo: string): Promise<void> {
    return this.filesIo.symlink(
      this.preparePath(target),
      this.preparePath(pathTo)
    );
  }

  ////////// ADDITIONAL

  async copyToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    // TODO: suport glob
    const destPath = this.preparePath(destDir);
    const srcPaths =
      typeof src === 'string'
        ? [this.preparePath(src)]
        : src.map((el) => this.preparePath(el));

    return this.filesIo.cp(
      srcPaths.map((el) => [el, pathJoin(destPath, pathBasename(el))]),
      { recursive: true, force }
    );
  }

  async moveToDest(
    src: string | string[],
    destDir: string,
    force?: boolean
  ): Promise<void> {
    // TODO: suport glob
    const destPath = this.preparePath(destDir);
    const srcPaths =
      typeof src === 'string'
        ? [this.preparePath(src)]
        : src.map((el) => this.preparePath(el));

    // TODO: может через копию делать
    // return this.filesIo.rename(
    //   typeof src === 'string'
    //     ? [[this.preparePath(src), this.preparePath(destDir)]]
    //     : src.map((el) => [this.preparePath(el), this.preparePath(destDir)]),
    //   { recursive: true, force }
    // );
  }

  async renameFile(file: string, newName: string): Promise<void> {
    const oldPath = this.preparePath(file);
    const newPath = pathJoin(pathDirname(oldPath), newName);

    return this.filesIo.rename([[oldPath, newPath]]);
  }

  async rmRf(pathToFileOrDir: string): Promise<void> {
    return this.filesIo.rm([this.preparePath(pathToFileOrDir)], {
      recursive: true,
      force: true,
    });
  }

  async mkDirP(pathToDir: string): Promise<void> {
    return this.filesIo.mkdir(this.preparePath(pathToDir), { recursive: true });
  }
}
