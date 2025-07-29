import { arraysDifference } from 'squidlet-lib'

import type { EntityStatus } from '../../types/constants.js'
import type { EntityManifest, EntityType } from '../../types/types.js'
import type { System } from '../System'
import type { EntityBaseContext } from '../context/EntityBaseContext.js'

// TODO: use status fallen

enum ENTITY_POSITIONS {
  manifest,
  onInit,
  context,
  status,
}

export abstract class EntityManagerBase<Context extends EntityBaseContext> {
  abstract readonly type: Extract<EntityType, 'app' | 'service'>

  private entities: Record<
    string,
    [EntityManifest, (ctx: Context) => Promise<void>, Context, EntityStatus]
  > = {}

  constructor(protected readonly system: System) {}

  getNames(): string[] {
    return Object.keys(this.entities)
  }

  getContext(entityName: string): Context | undefined {
    return this.entities[entityName][ENTITY_POSITIONS.context]
  }

  getStatus(entityName: string): EntityStatus {
    return this.entities[entityName][ENTITY_POSITIONS.status]
  }

  /**
   * On system init
   */
  async init() {
    // TODO: use Promise.allSettled([
    // TODO: add timeout for each item
    if (this.system.isProdMode) {
      // TODO: load apps manifest and register apps in production mode
    }

    for (const entityName of Object.keys(this.entities)) {
      await this.initEntity(entityName)
    }
  }

  /**
   * On system destroy
   */
  async destroy() {
    // TODO: use Promise.allSettled([
    for (const entityName of Object.keys(this.entities)) {
      await this.destroyEntity(entityName)
    }
  }

  async startAll() {
    for (const entityName of Object.keys(this.entities)) {
      await this.startEntity(entityName)
    }
  }

  /**
   * On system init or install
   */
  async initEntity(entityName: string) {
    if (this.getStatus(entityName) !== 'loaded') {
      this.system.log.warn(
        `EntityManager: entity "${entityName}" has been already initialized`
      )
      return
    } else if (!this.entities[entityName]) {
      this.system.log.warn(
        `EntityManager: entity "${entityName}" has not been registered`
      )
      return
    }

    try {
      this.checkDependencies(entityName)
    } catch (e) {
      this.system.log.error(
        `EntityManager: "${entityName}" no meet dependencies on init: ${e}`
      )
      return this.setStatus(entityName, 'initError', String(e))
    }

    const [, entityIndex, context] = this.entities[entityName]

    this.system.log.debug(`EntityManager: initializing entity "${entityName}"`)
    this.setStatus(entityName, 'initializing')

    try {
      await context.init()
      await entityIndex(context)
    } catch (e) {
      this.system.log.error(
        `EntityManager: entity "${entityName}" initialization error: ${e}`
      )
      this.setStatus(entityName, 'initError', String(e))
      return
    }

    this.setStatus(entityName, 'initialized')
  }

  /**
   * Destroy entity on system destroy or uninstall
   */
  async destroyEntity(entityName: string) {
    const [, , context] = this.entities[entityName]

    this.system.log.debug(`EntityManager: destroying "${entityName}"`)
    this.setStatus(entityName, 'destroying')
    // TODO: добавить таймаут дестроя
    try {
      await context.$getHooks().onDestroy()
      await context.destroy()

      delete this.entities[entityName]
    } catch (e) {
      this.system.log.error(`${entityName} destroyed with error: ${e}`)
    }
  }

  async startEntity(entityName: string) {
    if (this.getStatus(entityName) === 'starting') {
      return this.system.log.warn(
        `EntityManager: entity "${entityName}" is already starting`
      )
    } else if (this.getStatus(entityName) === 'running') {
      return this.system.log.warn(
        `EntityManager: entity "${entityName}" has been already started`
      )
    }

    try {
      this.checkDependencies(entityName)
    } catch (e) {
      this.system.log.error(
        `EntityManager: "${entityName}" no meet dependencies on start: ${e}`
      )
      return this.setStatus(entityName, 'startError', String(e))
    }

    this.system.log.debug(`EntityManager: starting entity "${entityName}"`)
    this.setStatus(entityName, 'starting')

    // TODO: add timeout

    const [, , context] = this.entities[entityName]
    try {
      await context.$getHooks().onStart()
    } catch (e) {
      this.system.log.error(
        `EntityManager: entity "${entityName}" start error: ${e}`
      )
      this.setStatus(entityName, 'startError', String(e))

      return
    }

    this.setStatus(entityName, 'running')
  }

  async stopEntity(entityName: string) {
    if (this.getStatus(entityName) === 'stopping') {
      return this.system.log.warn(
        `EntityManager: entity "${entityName}" is already stopping`
      )
    } else if (this.getStatus(entityName) === 'stopped') {
      return this.system.log.warn(
        `EntityManager: entity "${entityName}" has been already stopped`
      )
    }

    this.system.log.debug(`EntityManager: stopping entity "${entityName}"`)
    this.setStatus(entityName, 'stopping')

    // TODO: add timeout

    const [, , context] = this.entities[entityName]

    try {
      await context.$getHooks().onStop()
    } catch (e) {
      this.system.log.error(
        `EntityManager: entity "${entityName}" stop error: ${e}`
      )

      this.setStatus(entityName, 'stopError', String(e))

      return
    }

    this.setStatus(entityName, 'stopped')
  }

  /**
   * Register entity in the system in development mode.
   * @param manifest - entity manifest.
   * @param entityIndex - entity index function.
   */
  useEntity(
    manifest: EntityManifest,
    entityIndex: (ctx: Context) => Promise<void>,
    context: Context
  ) {
    if (this.entities[manifest.name]) {
      return this.system.log.warn(
        `EntityManager: entity "${manifest.name}" has been already loaded`
      )
    }

    this.entities[manifest.name] = [manifest, entityIndex, context, 'loaded']
  }

  protected checkDependencies(entityName: string) {
    const [manifest] = this.entities[entityName]

    if (manifest.requireDriver) {
      const found: string[] = this.system.drivers.getNames().filter((el) => {
        if (manifest.requireDriver?.includes(el)) return true
      })

      if (found.length !== manifest.requireDriver.length) {
        throw new Error(
          `Missed drivers: ${arraysDifference(
            found,
            manifest.requireDriver
          ).join()}`
        )
      }
    }

    if (manifest.requireService) {
      const found: string[] = this.getNames().filter((el) => {
        if (manifest.requireService?.includes(el)) return true
      })

      if (found.length !== manifest.requireService.length) {
        throw new Error(
          `Missed services: ${arraysDifference(
            found,
            manifest.requireService
          ).join()}`
        )
      }
    }
  }

  protected setStatus(
    entityName: string,
    newStatus: EntityStatus,
    details?: any
  ) {
    this.entities[entityName][ENTITY_POSITIONS.status] = newStatus
    this.system.events.emit(this.type, entityName, newStatus, details)
  }
}
