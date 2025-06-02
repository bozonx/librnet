import type { ServiceIndex, SubprogramError } from '../../types/types.js';
import type { ServiceContext } from '../../system/context/ServiceContext.js';
import { ServiceBase } from '../../base/ServiceBase.js';
import type { ServiceProps } from '../../types/ServiceProps.js';

// управяет файлами приложений, установкой, обновлением,
// запуском, остановкой, инсталляцией, бд и их синхронизацией

export const AppsServiceIndex: ServiceIndex = (
  ctx: ServiceContext
): ServiceBase => {
  return new AppsService(ctx);
};

export interface AppsServiceCfg {}

export const DEFAULT_PUBLIC_API_SERVICE_CFG = {};

export class AppsService extends ServiceBase {
  private cfg!: AppsServiceCfg;

  props: ServiceProps = {
    // @ts-ignore
    ...super.props,
  };

  async init(
    onFall: (err: SubprogramError) => void,
    loadedCfg?: AppsServiceCfg
  ) {
    await super.init(onFall);

    this.cfg = loadedCfg ? loadedCfg : DEFAULT_PUBLIC_API_SERVICE_CFG;
  }

  async destroy() {
    await this.stop();
  }

  async start() {
    await this.startAppBackends();
  }

  async stop(force?: boolean) {
    await this.stopAppBackends();
  }

  async startAppBackends() {
    // TODO: проходится по всем приложениям и запускает их бэкенды
    // TODO:  регистрирует синхронизацию бд приложения
  }

  async stopAppBackends() {
    // TODO: проходится по всем приложениям и останавливает их бэкенды
  }

  installApp(appName: string) {
    // TODO: копирует файлы приложения в папку с кодом приложения
    // TODO: запускает скрипт postinstall
  }

  uninstallApp(appName: string) {
    // TODO: запускает скрипт preuninstall
    // TODO: удаляет код приложения
    // TODO: архивирует бд и файлы приложения
  }

  updateApp(appName: string) {
    // TODO: копирует файлы приложения в папку с кодом приложения
    // TODO: запускает скрипт postinstall
  }
}
