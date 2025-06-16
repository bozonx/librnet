import type { PackageContext } from '../../system/context/PackageContext.js';
import type { PackageIndex } from '../../types/types.js';
import { AppsServiceIndex } from './AppsService.js';

export function SystemWithUiPkg(): PackageIndex {
  return (ctx: PackageContext) => {
    ctx.useService(AppsServiceIndex);
  };
}
