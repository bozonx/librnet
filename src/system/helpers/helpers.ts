import {
  Promised,
  clearRelPath,
  makeUniqId,
  pathJoin,
  trimCharStart,
} from 'squidlet-lib'

import { REQUEST_ID_LENGTH } from '../../types/constants'
import type { MountPoint } from '../../types/types'

export interface RequestError {
  code: number
  message: string
}

export function requestError(code: number, message: string): RequestError {
  return {
    code,
    message,
  }
}

/** Common request id. Used by WsAppApi service */
export function makeRequestId(): string {
  return makeUniqId(REQUEST_ID_LENGTH)
}

export function resolveRealPath(
  path: string,
  rootDir: string,
  getMountPoints: MountPoint[]
): string {
  // TODO: resolve real path using mount points

  return pathJoin(rootDir, path)
}

// TODO: do it. remove urls and relative paths
export function clearAbsolutePath(pathTo: string): string {
  return trimCharStart(clearRelPath(pathTo), '/')
}

export async function allSettledWithTimeout(
  promises: Promise<any>[],
  timeout: number,
  errorMessage: string
): Promise<void> {
  for (const item of promises) {
    const promised = new Promised()

    promises.push(promised.start(item, timeout))
  }

  const result = await Promise.allSettled(promises)
  let errors = result
    .filter((item) => item.status === 'rejected')
    .map((item) => item.reason)

  if (errors.length > 0) {
    throw new Error(`${errorMessage}:\n${errors.join('\n')}`)
  }
}
