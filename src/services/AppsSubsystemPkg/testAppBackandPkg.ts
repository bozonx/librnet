import { AppBase } from '@/system/base/AppBase'
import type { PackageContext } from '@/system/context/PackageContext'
import type { AppIndex, PackageIndex } from '@/types/types'

export function TestAppBackendPkg(): PackageIndex {
  return (ctx: PackageContext) => {
    ctx.useApp(appIndex)
  }
}

const appIndex: AppIndex = () => {
  return new TestAppBackend()
}

class TestAppBackend extends AppBase {
  myName = 'testAppBackend'

  constructor() {
    super()
    this.registerUiApi(useUiApi(this))
  }

  async afterInstall(isUpdate: boolean): Promise<void> {
    return Promise.resolve()
  }

  async start(cfg?: Record<string, any>): Promise<void> {
    return Promise.resolve()
  }

  async stop(): Promise<void> {
    return Promise.resolve()
  }
}

function useUiApi(app: TestAppBackend) {
  return {
    testApi(arg1: string, arg2: number) {
      console.log(arg1, arg2)

      return {
        result: 'Hello, world!',
      }
    },
  }
}
