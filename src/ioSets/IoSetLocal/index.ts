import type { IoIndex, PackageIndex, IoSetEnv } from '../../types/types.js';
import type { PackageContext } from '../../system/context/PackageContext.js';
import { IoSetBase } from '../IoSetBase.js';
import { IO_SET_TYPES } from '@/types/constants.js';

export function ioSetLocalPkg(ios: IoIndex[], env: IoSetEnv): PackageIndex {
  return (pkgCtx: PackageContext) => {
    const ioSetLocal = new IoSetLocal(pkgCtx, env);
    // register all the IO items in IoSet
    for (const io of ios) ioSetLocal.registerIo(io);
    // register IoSet in the system
    pkgCtx.useIoSet(ioSetLocal);
  };
}

/**
 * It loads IO set index file where all the used IOs are defined.
 */
export class IoSetLocal extends IoSetBase {
  type = IO_SET_TYPES.IoSetLocal;
}
