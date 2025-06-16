export interface AppApiRequestContext {
  // This is path to function of channel, not the full path of request
  path: string;

  // full path of request including channel name
  // fullPath: string;

  // arguments of the function
  args?: (any | Uint8Array)[];
  response: {
    error: string;
    // success result
    result?: any | Uint8Array;
  };
}
