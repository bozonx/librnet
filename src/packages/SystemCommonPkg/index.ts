import type {PackageContext} from '../../system/context/PackageContext.js'
import type {PackageIndex} from '../../types/types.js'
import { FilesDriverIndex } from './RootFilesDriver/FilesDriver.js';
import { HttpServerDriverIndex } from './HttpServerDriver/HttpServerDriver.js';
import { HttpClientDriverIndex } from './HttpClientDriver/HttpClientDriver.js';
import { WsClientDriverIndex } from './WsClientDriver/WsClientDriver.js';
import { WsServerDriverIndex } from './WsServerDriver/WsServerDriver.js';
import {NetworkServiceIndex} from '../../services/Network/NetworkService.js'
import { PublicApiServiceIndex } from '../AppsSubsystemPkg/PublicApiService.js';
import {SessionsServiceIndex} from '../../services/Sessions/SessionsService.js'
import {ChannelServiceIndex} from '../../services/ChannelsService/ChannelsService.js'
import {ClusterServiceIndex} from '../../services/ClusterService/ClusterService.js'


export function SystemCommonPkg (): PackageIndex {
  return (ctx: PackageContext) => {
    ctx.useDriver(FilesDriverIndex);
    ctx.useDriver(HttpClientDriverIndex);
    ctx.useDriver(HttpServerDriverIndex);
    // ctx.useDriver(WsClientDriverIndex)
    // ctx.useDriver(WsServerDriverIndex)
    // ctx.useService(SessionsServiceIndex)
    // ctx.useService(ChannelServiceIndex)
    // ctx.useService(ClusterServiceIndex)
    // ctx.useService(NetworkServiceIndex)
    // ctx.useService(PublicApiServiceIndex)
  }
}
