import type { DriverFactoryBase } from './DriverFactoryBase.js';
import type { System } from '../System.js';

export type DriverInstanceClass<
  Instance extends DriverInstanceBase<any, any, any> = DriverInstanceBase<
    any,
    any,
    any
  >,
  Props extends Record<string, any> = Record<string, any>,
  CommonProps extends Record<string, any> = Record<string, any>,
  Driver extends DriverFactoryBase<any, any> = DriverFactoryBase<any, any>
> = new (
  system: System,
  driverFactory: Driver,
  props: Props,
  common: CommonProps,
  destroyCb?: () => Promise<void>
) => Instance;

export default class DriverInstanceBase<
  Props extends Record<string, any> = Record<string, any>,
  CommonProps extends Record<string, any> = Record<string, any>,
  Driver extends DriverFactoryBase<any, any> = DriverFactoryBase<any, any>
> {
  get props(): Props {
    return this._props;
  }

  constructor(
    protected readonly system: System,
    protected readonly driverFactory: Driver,
    private readonly _props: Props,
    protected readonly common: CommonProps,
    private readonly destroyCb?: () => Promise<void>
  ) {}

  init?(): Promise<void>;

  // Use force in shutdown reason
  async destroy(destroyReason: string = 'destroy'): Promise<void> {
    await this.destroyCb?.();
  }
}
