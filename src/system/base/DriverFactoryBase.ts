import type { DriverDestroyReason } from '@/types/constants.js';
import type { System } from '../System.js';
import type DriverInstanceBase from './DriverInstanceBase.js';

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
  // put name of the driver here
  abstract readonly name: string;
  private _cfg: Record<string, any> = {};

  // TODO: Нужно ли это?
  // readonly requireIo?: string[];

  protected instances: Instance[] = [];
  // Specify your sub driver class
  protected abstract SubDriverClass: new (
    system: System,
    driver: DriverFactoryBase<any, any>,
    props: Props,
    commonProps: any,
    destroyCb?: () => Promise<void>
  ) => Instance;
  // Put here common functions and properties for all instances
  protected commonProps: Record<string, any> = {};

  get cfg(): Record<string, any> {
    return this._cfg;
  }

  constructor(protected readonly system: System) {}

  async init(cfg: Record<string, any> = {}) {
    this._cfg = cfg;
  }

  async destroy(destroyReason: DriverDestroyReason) {
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
      instanceProps,
      this.commonProps,
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
   * Just remove instance from this.instances
   * @param instanceId
   */
  private async destroyCb(instanceId: number): Promise<void> {
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
