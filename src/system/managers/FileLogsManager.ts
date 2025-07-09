import { pathJoin, trimCharStart } from 'squidlet-lib';
import type { LogLevel } from 'squidlet-lib';
import type { System } from '../System';
import {
  LOCAL_DATA_SUB_DIRS,
  ROOT_DIRS,
  SYNCED_DATA_SUB_DIRS,
} from '@/types/constants';
import { clearAbsolutePath } from '../helpers/helpers';

export class FileLogsManager {
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
    const pathToLog = this.preparePath(entityName, isSynced, relPathToLog);

    await this.system.localFiles.mkDirP(pathToLog);
    await this.system.localFiles.appendFile(
      pathToLog,
      this.makeMsg(logLevel, msg)
    );

    // TODO: поддержка ротации
  }

  // TODO: read 100 last lines of log file
  async readLog(
    entityName: string,
    isSynced: boolean,
    relPathToLog: string,
    linesCount: number = 100,
    fromLine: number = 0
  ) {
    const pathToLog = this.preparePath(entityName, isSynced, relPathToLog);

    return await this.system.localFiles.readTextFile(pathToLog);
  }

  private preparePath(
    entityName: string,
    isSynced: boolean,
    relPathToLog: string
  ) {
    const preparedRelPath = trimCharStart(clearAbsolutePath(relPathToLog), '/');

    return pathJoin(
      '/',
      isSynced ? ROOT_DIRS.synced : ROOT_DIRS.local,
      isSynced ? SYNCED_DATA_SUB_DIRS.logs : LOCAL_DATA_SUB_DIRS.logs,
      entityName,
      preparedRelPath
    );
  }

  private makeMsg(logLevel: LogLevel, msg: string) {
    const date = new Date().toISOString();

    return `${date} ${logLevel.toUpperCase()}: ${msg}\n`;
  }
}
