import type { DriverDestroyReason } from '@/types/constants.js';
import type { DriverFactoryBase } from './DriverFactoryBase.js';
import type { System } from '../System.js';

export default class DriverInstanceBase<
  Props extends Record<string, any>,
  CommonProps extends Record<string, any> = Record<string, any>
> {
  get props(): Props {
    return this._props;
  }

  constructor(
    protected readonly system: System,
    protected readonly driver: DriverFactoryBase<
      Props,
      DriverInstanceBase<Props, CommonProps>
    >,
    private readonly _props: Props,
    protected readonly commonProps: CommonProps,
    private readonly destroyCb?: () => Promise<void>
  ) {}

  init?(): Promise<void>;

  // Use force in shutdown reason
  async destroy(destroyReason: DriverDestroyReason): Promise<void> {
    await this.destroyCb?.();
  }
}
