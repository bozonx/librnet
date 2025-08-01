import { IndexedEvents, makeUniqId } from 'squidlet-lib'

import { Connections } from './Connections.js'
import type { ConnectionsIncomeMsgHandler } from './Connections.js'
import { ServiceBase } from '@/system/base/ServiceBase.js'
import type { ServiceContext } from '@/system/context/ServiceContext.js'
import type {
  NetworkIncomeRequest,
  NetworkIncomeResponse,
  NetworkResponseStatus,
  NetworkSendRequest,
  NetworkSendResponse,
} from '@/types/Network.js'
import type { ServiceProps } from '@/types/ServiceProps.js'
import { NETWORK_CODES, REQUEST_ID_LENGTH } from '@/types/constants.js'
import type { ServiceIndex, SubprogramError } from '@/types/types.js'

export interface NetworkServiceApi {
  sendRequest<T = any>(
    request: NetworkSendRequest
  ): Promise<NetworkIncomeResponse<T>>
  sendResponse(response: NetworkSendResponse): Promise<NetworkResponseStatus>
  listenRequests(
    category: string,
    handler: CategoryHandler,
    token?: string
  ): void
  removeRequestListener(category: string, token?: string): void
}

export type CategoryHandler = (request: NetworkIncomeRequest) => void

export const NetworkServiceIndex: ServiceIndex = (
  ctx: ServiceContext
): ServiceBase => {
  return new NetworkService(ctx)
}

export interface NetworkServiceCfg {}

export const DEFAULT_NETWORK_SERVICE_CFG = {}

export class NetworkService extends ServiceBase {
  private cfg!: NetworkServiceCfg
  private categoriesHandlers: Record<string, CategoryHandler> = {}
  private readonly connections = new Connections(this)
  private readonly incomeMessages =
    new IndexedEvents<ConnectionsIncomeMsgHandler>()

  props: ServiceProps = {
    //requireDriver: [DRIVER_NAMES.WsServerDriver],

    // @ts-ignore
    ...super.props,
  }

  getApi(): NetworkServiceApi {
    return {
      sendRequest: this.sendRequest.bind(this),
      listenRequests: this.listenRequests.bind(this),
      removeRequestListener: this.removeRequestListener.bind(this),
      sendResponse: this.sendResponse.bind(this),
    }
  }

  async init(
    onFall: (err: SubprogramError) => void,
    loadedCfg?: NetworkServiceCfg
  ) {
    await super.init(onFall)

    this.cfg = loadedCfg ? loadedCfg : DEFAULT_NETWORK_SERVICE_CFG
  }

  async destroy() {
    this.categoriesHandlers = {}

    await this.connections.destroy()
  }

  async start() {
    await this.connections.start(this.incomeConnectionMsgHandler)
  }

  async stop(force?: boolean) {
    await this.connections.stop()
  }

  /**
   * Send message to remote host, wait and receive a response from it request
   * is:
   *
   * - ToHostId - remote host id or id of local host
   * - Category - unique category name which is use to resolve requests
   * - Msg - message object with only allowed types of nodes
   *
   * @param request
   */
  async sendRequest<T = any>(
    request: NetworkSendRequest
  ): Promise<NetworkIncomeResponse<T>> {
    const requestId = makeUniqId(REQUEST_ID_LENGTH)

    // TODO: validate message - only supported types

    await this.connections.send({ ...request, requestId })

    return new Promise((resolve, reject) => {
      // TODO: timeout of waiting

      const handlerIndex = this.incomeMessages.addListener(
        (incomeMsg: NetworkIncomeRequest | NetworkIncomeResponse) => {
          if (incomeMsg.requestId !== requestId) return

          this.incomeMessages.removeListener(handlerIndex)

          resolve(incomeMsg as NetworkIncomeResponse)

          // TODO: надо ли отправить что всё дошло??? или это уже выше делается?

          // this.sendResponseStatus({
          //   code: NETWORK_CODES.success
          // })
          //   .catch((e) => this.ctx.log.error(String(e)))
        }
      )
    })
  }

  async sendResponse(
    response: NetworkSendResponse
  ): Promise<NetworkResponseStatus> {
    // TODO: проверить что указан requestId
    // TODO: сделать ещё один requetId или responseId
    // TODO: отправить в connections
    // TODO: ожидать с таймаутом response

    return { code: response.code, error: response.error }
  }

  /**
   * Set handler to handle a request for this handler
   *
   * @param category - Name of unique category to handle requests
   * @param handler - Handle income request here and call sendResponse(resp)
   *   after processing a request.
   * @param token - Access token to ocupate special categories
   */
  listenRequests(category: string, handler: CategoryHandler, token?: string) {
    if (this.categoriesHandlers[category]) {
      throw new Error(
        `Category "${category}" has already registered. Can't replace it.`
      )
    }

    // TODO: check token. категория common - общая, любые запрос разрешены

    this.categoriesHandlers[category] = handler
  }

  removeRequestListener(category: string, token?: string) {
    // TODO: check token

    delete this.categoriesHandlers[category]
  }

  private incomeConnectionMsgHandler = (
    incomeMsg: NetworkIncomeRequest | NetworkIncomeResponse
  ) => {
    if (this.categoriesHandlers[incomeMsg.category]) {
      return this.incomeMessages.emit(incomeMsg)
    }

    this.sendResponse({
      toHostId: incomeMsg.fromHostId,
      category: incomeMsg.category,
      requestId: incomeMsg.requestId,
      code: NETWORK_CODES.noCategory,
      error: `Host "${incomeMsg.toHostId}" doesn't have a category "${incomeMsg.category}" handler`,
    }).catch((e) => this.ctx.log.error(String(e)))
  }
}
