import { NETWORK_ERROR_CODE } from '../../../../../../../../mnt/disk2/workspace/squidlet/__idea2021/src/plugins/networking/constants.js';
export declare function encodeNetworkMessage(fromHostId: string, toHostId: string, messageId: string, initialTtl: number, payload?: Uint8Array, uri?: string): Uint8Array;
export declare function decodeNetworkMessage(data: Uint8Array): [string, string, string, number, Uint8Array, string];
export declare function encodeErrorPayload(errorType: NETWORK_ERROR_CODE, message?: string): Uint8Array;
export declare function decodeErrorPayload(payload: Uint8Array): [NETWORK_ERROR_CODE, string];
export declare function encodeEventRegisterPayload(eventName: string, handlerId: string): Uint8Array;
export declare function decodeEventRegisterPayload(payload: Uint8Array): [string, string];
export declare function encodeEventOffPayload(handlerId: string): Uint8Array;
export declare function decodeEventOffPayload(payload: Uint8Array): string;
export declare function encodeEventEmitPayload(eventName: string | number, ...params: any[]): Uint8Array;
export declare function вуcodeEventEmitPayload(payload: Uint8Array): [string, any[]];
