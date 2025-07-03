import type { System } from '../System.js';
import type DriverInstanceBase from './DriverInstanceBase.js';
import type { DriverInstanceParams } from './DriverInstanceBase.js';

/**
 * This factory creates instances of sub drivers and keeps them in the memory.
 * The instances are owned by service or appp which uses them.
 *
 * If the "instanceId" method is set then id of instances of subDriver will be calculated there.
 * If there no "instanceId" method then a new instance will be created each call of "subDriver"
 * and never be saved.
 */
export abstract class DriverFactoryBase<
  Instance extends DriverInstanceBase,
  Props extends Record<string, any> = Record<string, any>
> {
  // put name of the driver here
  abstract readonly name: string;

  // readonly requireIo?: string[];

  protected instances: Instance[] = [];
  // Specify your sub driver class. It's required.
  protected abstract SubDriverClass: new (
    DriverInstanceParams: any,
    destroyCb: () => Promise<void>
  ) => Instance;
  protected cfg?: Record<string, any>;

  constructor(protected readonly system: System) {}

  async init(cfg?: Record<string, any>) {
    this.cfg = cfg;
  }

  async destroy() {
    for (const instance of this.instances) {
      // It will call destroyCb to remove instance from this.instances
      await instance.destroy(true);
    }
  }

  async makeInstance(instanceProps: Props = {} as Props): Promise<Instance> {
    await this.validateInstanceProps(instanceProps);

    const instanceId = this.instances.length;

    const instanceParams: DriverInstanceParams<Props> = {
      instanceId,
      driver: this,
      props: instanceProps,
      cfg: this.cfg,
    };

    const instance = new this.SubDriverClass(
      instanceParams,
      this.destroyCb.bind(this, instanceId)
    );

    this.instances.push(instance);
    await instance.init?.();

    return instance;
  }

  /**
   * Just remove instance from this.instances
   * @param instanceId
   */
  private async destroyCb(instanceId: number): Promise<void> {
    this.instances.splice(instanceId, 1);
  }

  private async validateInstanceProps(instanceProps: Record<string, any>) {
    // // TODO: а нужно ли повторно загружать манифест, он же должен быть заружен в drivers manager
    // const manifest: EntityManifest =
    //   await this.context.system.envSet.loadManifest(
    //     'driver',
    //     this.definition.id
    //   );
    // if (!manifest.props) return;
    // const validationErr: string | undefined =
    //   validateProps(instanceProps, manifest.props) ||
    //   validateRequiredProps(mergedProps, manifest.props);
    // if (validationErr) {
    //   throw new Error(
    //     `Props of sub driver "${this.definition.id}" are invalid: ${validationErr}`
    //   );
    // }
  }
}
