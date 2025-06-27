import type { Logger } from 'squidlet-lib';
import type { System } from '../System';

export class EntityBaseContext {
  protected readonly system: System;
  // TODO: add logger to the context
  get log(): Logger {
    return this.system.log;
  }

  constructor(system: System) {
    this.system = system;
  }
}
