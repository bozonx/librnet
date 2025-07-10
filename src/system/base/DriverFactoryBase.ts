import type { System } from '../System.js';
import type DriverInstanceBase from './DriverInstanceBase.js';
import type { DriverInstanceClass } from './DriverInstanceBase.js';
import type { DriverManifest } from '@/types/types.js';

/**
 * This factory creates instances of sub drivers and keeps them in the memory.
 * The instances are owned by service or appp which uses them.
 * By default, the instances are matched by props,
 * if you need more precise match, overload makeMatchString method.
 * Do not add public methods to the factory because they
 *   will be available not only for the instances.
 */
export abstract class DriverFactoryBase<
  Instance extends DriverInstanceBase<any, any, any> = DriverInstanceBase<
    any,
    any,
    any
  >,
  Props extends Record<string, any> = Record<string, any>
> {
  abstract readonly requireIo: string[];

  protected instances: Instance[] = [];
  // Specify your sub driver class
  protected abstract SubDriverClass: DriverInstanceClass<Instance, Props>;
  // Put here common functions and properties for all instances
  protected common: Record<string, any> = {};
  private _localCfg: Record<string, any> = {};
  private _syncedCfg: Record<string, any> = {};

  get localCfg(): Record<string, any> {
    return structuredClone(this._localCfg);
  }

  get syncedCfg(): Record<string, any> {
    return structuredClone(this._syncedCfg);
  }

  get manifest(): DriverManifest {
    return this._manifest;
  }

  get name(): string {
    return this._manifest.name;
  }

  constructor(
    protected readonly system: System,
    private readonly _manifest: DriverManifest
  ) {}

  async init(
    localCfg: Record<string, any> = {},
    syncedCfg: Record<string, any> = {}
  ) {
    this._localCfg = localCfg;
    this._syncedCfg = syncedCfg;
  }

  async destroy(destroyReason: string) {
    for (const instance of this.instances) {
      // It will call destroyCb to remove instance from this.instances
      await instance.destroy(destroyReason);
    }
  }

  async makeInstance(instanceProps: Props = {} as Props): Promise<Instance> {
    await this.validateInstanceProps(instanceProps);

    const matchString = this.makeMatchString(instanceProps);
    const theSameInstance = this.instances.find(
      (instance) => this.makeMatchString(instance.props) === matchString
    );

    if (theSameInstance) {
      throw new Error(`Instance with props "${matchString}" already exists`);
    }

    const instanceId = this.instances.length;
    const instance = new this.SubDriverClass(
      this.system,
      this,
      structuredClone(await this.makeInstanceProps(instanceProps)),
      this.common,
      this.destroyCb.bind(this, instanceId)
    );

    this.instances.push(instance);
    await instance.init?.();

    return instance;
  }

  /**
   * Overload this method to make more precise match instance by props
   * @param instanceProps
   * @returns
   */
  protected makeMatchString(instanceProps: Props): string {
    return JSON.stringify(instanceProps);
  }

  /**
   * Overload this method to add some props
   * @param instanceProps
   * @returns
   */
  protected async makeInstanceProps(instanceProps: Props): Promise<Props> {
    return instanceProps;
  }

  /**
   * Just remove instance from this.instances
   * @param instanceId
   */
  protected async destroyCb(instanceId: number): Promise<void> {
    this.instances.splice(instanceId, 1);
  }

  /**
   * Overload this method to validate instance props
   * @param instanceProps
   */
  protected async validateInstanceProps(instanceProps: Props): Promise<void> {
    // TODO: validate using props schema
  }
}
