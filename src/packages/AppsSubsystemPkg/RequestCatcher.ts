export interface RequestCatcherContext {
  request: {
    method: string;
    url: string;
    header: Record<string, string>;
    // TODO: supoort binary body
    body?: string | Uint8Array | undefined;
  };
  response: {
    status: number;
    message: string;
    header: Record<string, string>;
    // TODO: supoort binary body
    body?: string | Uint8Array | undefined;
  };
}

export class RequestCatcher {
  private context: RequestCatcherContext;

  constructor(context: RequestCatcherContext) {
    this.context = context;
  }

  async run() {
    console.log(this.context);
  }
}
