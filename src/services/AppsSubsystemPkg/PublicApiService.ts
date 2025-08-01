import { deepGet, deepSet } from 'squidlet-lib'

import { ServiceBase } from '../../../system/base/ServiceBase.js'
import type { ServiceContext } from '../../system/context/ServiceContext.js'
import type { NetworkIncomeRequest } from '../../system/services/NetworkSubSystem/Network.js'
import type { ServiceProps } from '../../types/ServiceProps.js'
import { NETWORK_CODES, SYSTEM_SERVICE_NAMES } from '../../types/constants.js'
import type { ServiceIndex, SubprogramError } from '../../types/types.js'
import type { NetworkServiceApi } from '../Network/NetworkService.js'

export interface PublicApiServiceApi {
  callMethod(
    toHostId: string | undefined,
    pathToMethod: string,
    ...args: any[]
  ): Promise<any>
  registerNode(
    nodePath: string,
    item: Record<string, any> | Function,
    accessToken?: string
  ): void
}

export interface PublicApiServicePayload {
  method: string
  args: string[]
}

export const PublicApiServiceIndex: ServiceIndex = (
  ctx: ServiceContext
): ServiceBase => {
  return new PublicApiService(ctx)
}

export interface PublicApiServiceCfg {}

export const DEFAULT_PUBLIC_API_SERVICE_CFG = {}
export const PUBLIC_API_CATEGORY = 'PUBLIC_API'

export class PublicApiService extends ServiceBase {
  private cfg!: PublicApiServiceCfg
  private nodes: Record<string, any> = {}

  props: ServiceProps = {
    // TODO: require service network
    //requireDriver: [DRIVER_NAMES.WsServerDriver],

    // @ts-ignore
    ...super.props,
  }

  getApi(): PublicApiServiceApi {
    return {
      callMethod: this.callMethod.bind(this),
      registerNode: this.registerNode.bind(this),
    } as PublicApiServiceApi
  }

  async init(
    onFall: (err: SubprogramError) => void,
    loadedCfg?: PublicApiServiceCfg
  ) {
    await super.init(onFall)

    this.cfg = loadedCfg ? loadedCfg : DEFAULT_PUBLIC_API_SERVICE_CFG
  }

  async destroy() {
    await this.stop()
  }

  async start() {
    const network = this.ctx.getServiceApi<NetworkServiceApi>(
      SYSTEM_SERVICE_NAMES.Network
    )

    if (!network) throw new Error(`Can't find NetworkService`)

    network.listenRequests(
      PUBLIC_API_CATEGORY,
      (request: NetworkIncomeRequest<PublicApiServicePayload>) => {
        ;(async () => {
          let payload: any | undefined
          let code: number = 0
          let error: string | undefined

          try {
            payload = await this.callLocalMethod(
              request.payload?.method,
              request.payload?.args
            )
          } catch (e) {
            code = NETWORK_CODES.payloadHandlerError
            error = String(e)
          }

          await network.sendResponse({
            // send back
            toHostId: request.fromHostId,
            category: request.category,
            requestId: request.requestId,
            payload,
            code,
            error,
          })
        })().catch((e) => this.ctx.log.error(String(e)))
      }
    )
  }

  async stop(force?: boolean) {
    const network = this.ctx.getServiceApi<NetworkServiceApi>(
      SYSTEM_SERVICE_NAMES.Network
    )

    if (!network) throw new Error(`Can't find NetworkService`)

    network.removeRequestListener(PUBLIC_API_CATEGORY)
  }

  async callMethod(
    toHostId: string | undefined,
    pathToMethod: string,
    ...args: any[]
  ): Promise<any> {
    // TODO: валидировать - не должно быть ф-и, классов, символов в аргументах в глубине

    if (!toHostId) {
      // TODO: либо хост тот же что и мой
      //  - спросить systemInfoService через контекст

      return this.callLocalMethod(pathToMethod, ...args)
    } else {
      // remote call
      const network = this.ctx.getServiceApi<NetworkServiceApi>(
        SYSTEM_SERVICE_NAMES.Network
      )

      if (!network) throw new Error(`Can't find NetworkService`)

      const resp = await network.sendRequest({
        toHostId,
        category: PUBLIC_API_CATEGORY,
        payload: { method: pathToMethod, args } as PublicApiServicePayload,
      })

      if (resp.error) throw resp.error

      return resp.payload as any
    }
  }

  /**
   * Register new node
   *
   * @param nodePath - Deep path to node
   * @param item - Item which can be functions of objects with functions
   * @param accessToken - Put token if you register a node in restricted area
   */
  registerNode(
    nodePath: string,
    item: Record<string, any> | Function,
    accessToken?: string
  ) {
    // TODO: validate items - only objects and function в глубине
    // TODO: нужен токен разрешения чтобы разрешить где можно регистрировать свои ф-и

    const currentNode = deepGet(this.nodes, nodePath)

    if (currentNode)
      throw new Error(`Node ${nodePath} is exists. Can't replace it.`)

    deepSet(this.nodes, nodePath, item)
  }

  // private async handleRequest(request: NetworkIncomeRequest): Promise<any> {
  //
  // }

  private async callLocalMethod(
    pathToMethod: string | undefined,
    ...args: any[]
  ): Promise<any> {
    if (!pathToMethod)
      throw new Error(`Path to method "${pathToMethod}" is empty.`)

    const method = deepGet(this.nodes, pathToMethod)

    if (method) throw new Error(`Node ${method} doesn't exist.`)
    else if (typeof method !== 'function')
      throw new Error(`Node ${method} is not a function.`)

    const result = await method(...args)

    // TODO: валидировать что в результате не должно быть не нужных типов в глубине

    return result
  }
}
