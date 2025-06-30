import type { LogLevel } from 'squidlet-lib';
import type { System } from '../System.js';
import type { EntityManifest } from '@/types/types.js';

export class EntityLogFile {
  constructor(
    private readonly system: System,
    private readonly manifest: EntityManifest,
    private readonly isSynced: boolean
  ) {}


  async writeLog(pathToLog: string, msg: string, logLevel: LogLevel) {
    return this.system.fileLogs.writeLog(
      this.manifest.name,
      this.isSynced,
      pathToLog,
      msg,
      logLevel
    );
  }

  async readLogFile(pathTo: string, linesCount: number = 100): Promise<string> {
    return this.system.fileLogs.readLog(
      this.manifest.name,
      this.isSynced,
      pathTo,
      linesCount
    );
  }
}
