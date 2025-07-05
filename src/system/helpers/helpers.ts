import { clearRelPath, makeUniqId, trimCharStart } from 'squidlet-lib';
import { pathJoin } from 'squidlet-lib';
import type { MountPoint } from '../../types/types';
import { REQUEST_ID_LENGTH } from '../../types/constants';

export interface RequestError {
  code: number;
  message: string;
}

export function requestError(code: number, message: string): RequestError {
  return {
    code,
    message,
  };
}

/**
 * Common request id.
 * Used by WsAppApi service
 */
export function makeRequestId(): string {
  return makeUniqId(REQUEST_ID_LENGTH);
}

export function resolveRealPath(
  path: string,
  rootDir: string,
  getMountPoints: MountPoint[]
): string {
  // TODO: resolve real path using mount points

  return pathJoin(rootDir, path);
}

// TODO: do it. remove urls and relative paths
export function clearAbsolutePath(pathTo: string): string {
  return trimCharStart(clearRelPath(pathTo), '/');
}
