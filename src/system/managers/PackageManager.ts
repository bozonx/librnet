import {pathJoin} from 'squidlet-lib'
import type {System} from '../System.js'
import {PackageContext} from '../context/PackageContext.js'
import type { FilesDriver } from '../../packages/SystemCommonPkg/FilesDriver/FilesDriver.js';
import type { PackageIndex } from '@/types/types.js';
import type { FilesIo } from '@/ios/NodejsPack/LocalFilesIo.js';
import { IO_NAMES } from '@/types/constants.js';

export class PackageManager {
  private readonly system;
  readonly ctx;

  private get filesIo(): FilesIo {
    return this.system.io.getIo(IO_NAMES.FilesIo);
  }

  constructor(system: System) {
    this.system = system;
    this.ctx = new PackageContext(this.system);
  }

  // async init() {
  //   // TODO: what to do here?
  // }

  async destroy() {
    // TODO: дестроить то на что пакеты навешались дестроить
  }

  // TODO: наверное сделать отдельный дестрой для системных пакетов и пользовательских

  async loadInstalled() {
    // TODO: должно быть установлено всё пакетами
    // TODO: и нужно пройтись по всем пакетам и сделать use(pkg)
    // TODO: загружать нужно файл через import
    // TODO: и нужно использовать sandbox
  }

  async install(pkgPath: string) {
    // TODO: add
  }

  async update(pkgName: string) {
    // TODO: чтобы обновить пакет нужно понять что к нему относится
  }

  async uninstall(pkgName: string) {
    // TODO: чтобы удалить пакет нужно понять что к нему относится
  }

  // это работает без инициализации пакета
  use(pkg: PackageIndex) {
    pkg(this.ctx);
  }
}
