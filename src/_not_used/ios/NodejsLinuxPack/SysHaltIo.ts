import { exec } from 'node:child_process'
import type { ExecException } from 'node:child_process'

import type { IoContext } from '../../../../_old/IoContext.js'
import { IoBase } from '../../../system/base/IoBase.js'
import { WAIT_BEFORE_HALT_MS } from '../../../types/constants.js'
import type { IoIndex } from '../../../types/types.js'
import type SysHaltIoType from '../../types/io/SysHaltIoType.js'

export const SysHaltIoIndex: IoIndex = (ctx: IoContext) => {
  return new SysHaltIo(ctx)
}

export default class SysHaltIo extends IoBase implements SysHaltIoType {
  async exit(code: number = 0) {
    setTimeout(() => {
      process.exit(code)
    }, WAIT_BEFORE_HALT_MS)
  }

  async reboot() {
    // TODO: сделать это через пару сек чтобы успел прийти ответ
    return new Promise<void>((resolve, reject) => {
      exec(
        'reboot',
        (error: ExecException | null, stdout: string, stderr: string) => {
          if (error) return reject(error)

          resolve()
        }
      )
    })
  }

  async shutdown() {
    // TODO: сделать это через пару сек чтобы успел прийти ответ
    return new Promise<void>((resolve, reject) => {
      exec(
        'shutdown',
        (error: ExecException | null, stdout: string, stderr: string) => {
          if (error) return reject(error)

          resolve()
        }
      )
    })
  }
}
