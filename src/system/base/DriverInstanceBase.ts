import type { DriverDestroyReason } from '@/types/constants.js';
import type { DriverFactoryBase } from './DriverFactoryBase.js';

// export interface DriverInstanceParams<
//   Props extends Record<string, any> = Record<string, any>,
//   Driver = DriverFactoryBase<DriverInstanceBase, Props>
// > {
//   instanceId: number;
//   // get driver config
//   driverConfig: () => Record<string, any>;
//   // instance props
//   props: Props;
//   cfg?: Record<string, any>;
// }

export default class DriverInstanceBase<
  Props extends { [index: string]: any } = any,
  Driver extends DriverFactoryBase<any, Props> = DriverFactoryBase<any, Props>
> {
  get props(): Props {
    return this._props;
  }

  // If you have props you can validate it in this method
  protected validateProps?: (props: Props) => string | undefined;

  constructor(
    protected readonly driver: Driver,
    private readonly instanceId: number,
    private readonly _props: Props,
    private readonly destroyCb?: () => Promise<void>
  ) {
    // if (this.driversDidInit) this.ctx.onDriversInit(this.driversDidInit.bind(this))
    // if (this.servicesDidInit) this.ctx.onServicesInit(this.servicesDidInit.bind(this))
    // if (this.appDidInit) this.ctx.onAppInit(this.appDidInit.bind(this))
  }

  init?(): Promise<void>;

  // TODO: зачем отдельный метод?
  // destroy logic of instance
  // $doDestroy?(): Promise<void>;
  // define this method to destroy entity when system is destroying.
  // Don't call this method in other cases.
  // Use force in shutdown reason
  async destroy(destroyReason: DriverDestroyReason): Promise<void> {
    await this.destroyCb?.();
  }

  // // it will be called after all the entities of entityType have been inited
  // protected driversDidInit?(): Promise<void>
  // protected servicesDidInit?(): Promise<void>
  // // it will be risen after app init or immediately if app was inited
  // protected appDidInit?(): Promise<void>
}

// /**
//  * Print errors to console of async functions
//  */
// protected wrapErrors(cb: (...cbArgs: any[]) => Promise<void>): (...args: any[]) => void {
//   return (...args: any[]) => {
//     try {
//       cb(...args)
//         .catch(this.ctx.log.error)
//     }
//     catch (err) {
//       this.ctx.log.error(err)
//     }
//   };
// }

// private doPropsValidation() {
//   if (this.validateProps) {
//     const errorMsg: string | undefined = this.validateProps(this.props)
//
//     if (errorMsg) throw new Error(errorMsg)
//   }
// }
