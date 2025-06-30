import { pathJoin } from 'squidlet-lib';
import type { LogLevel } from 'squidlet-lib';
import type { System } from '../System';
import {
  IO_NAMES,
  LOCAL_DATA_SUB_DIRS,
  LOG_FILE_EXT,
  ROOT_DIRS,
  SYNCED_DATA_SUB_DIRS,
} from '@/types/constants';
import type { LocalFilesIo } from '@/ios/NodejsPack/LocalFilesIo.js';

export class FileLogsManager {
  private get filesIo(): LocalFilesIo {
    return this.system.io.getIo(IO_NAMES.LocalFilesIo);
  }

  constructor(private readonly system: System) {}

  /**
   * Append to existent file or create it if doesn't exists
   */
  async writeLog(
    entityName: string,
    isSynced: boolean,
    relPathToLog: string,
    msg: string,
    logLevel: LogLevel
  ) {
    const pathToLog = pathJoin(
      '/',
      isSynced ? ROOT_DIRS.syncedData : ROOT_DIRS.localData,
      isSynced ? SYNCED_DATA_SUB_DIRS.logs : LOCAL_DATA_SUB_DIRS.logs,
      entityName + '.' + LOG_FILE_EXT
    );

    await this.filesIo.appendFile(pathToLog, msg);

    // const fullPath = pathJoin(this.logDirPath, clearRelPath(pathToLog));

    // // TODO: add date and time and log level
    // const fullLog = data;
    // // create dir if need
    // await this.driver.mkDirP(pathDirname(fullPath));

    // try {
    //   await this.driver.appendFile(fullPath, fullLog);
    // } catch (e) {
    //   // TODO: ошибка должна быть только связанна с тем что файл уже существует
    //   // TODO: а может appendFile уже подразумевает создание файла ????
    //   throw e;
    // }

    // TODO: поддержка ротации
  }

  // TODO: read 100 last lines of log file
  async readLog(
    entityName: string,
    isSynced: boolean,
    relPathToLog: string,
    linesCount: number = 100
  ) {
    const pathToLog = pathJoin(
      '/',
      isSynced ? ROOT_DIRS.syncedData : ROOT_DIRS.localData,
      isSynced ? SYNCED_DATA_SUB_DIRS.logs : LOCAL_DATA_SUB_DIRS.logs,
      entityName + '.' + LOG_FILE_EXT
    );

    return await this.filesIo.readTextFile(pathToLog);
  }
}
