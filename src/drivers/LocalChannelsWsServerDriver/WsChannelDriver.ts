import type { ServiceOnInit } from '../../../types/types.js'
import type { ServiceContext } from '../../context/ServiceContext.js'
import { Channel } from '../../driversLogic/Channel.js'

// TODO:  remake to driver

export const WsChannelServiceIndex: ServiceOnInit = async (
  ctx: ServiceContext
): Promise<void> => {
  ctx.registerApi({
    makeChannel: async (channelName: string) => {
      return new WsChannel(ctx, channelName)
    },
  })
}

export class WsChannel extends Channel {}
