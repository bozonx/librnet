import type { ServiceOnInit } from '../../../types/types.js';
import type { ServiceContext } from '../../../system/context/ServiceContext.js';
import { Channel } from '../../../system/driversLogic/Channel.js';

export const WsChannelServiceIndex: ServiceOnInit = async (
  ctx: ServiceContext
): Promise<void> => {
  ctx.registerApi({
    makeChannel: async (channelName: string) => {
      return new Channel(ctx, channelName);
    },
  });
};

export class Channel {
  constructor(
    protected readonly serviceContext: ServiceContext,
    protected readonly channelName: string
  ) {}

  send(message: string | Uint8Array) {
    // this.serviceContext.system.wsServer.send(this.channelName, message);
  }

  close() {
    // this.serviceContext.system.wsServer.close(this.channelName);
  }

  onMessage(cb: (message: string | Uint8Array) => void) {
    // this.serviceContext.system.wsServer.on(this.channelName, eventName, callback);
  }

  // onError(callback: (error: any) => void) {
  //   this.serviceContext.system.wsServer.onError(this.channelName, callback);
  // }

  off(handlerIndex: number) {
    // this.serviceContext.system.wsServer.off(this.channelName, eventName, callback);
  }
}
