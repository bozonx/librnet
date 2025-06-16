import Koa from 'koa';
import type { Context } from 'vm';
import { RequestCatcher, type RequestCatcherContext } from './RequestCatcher';

const app = new Koa();

app.use(async (ctx: Context) => {
  const context: RequestCatcherContext = {
    request: {
      method: ctx.request.method,
      url: ctx.request.url,
      header: ctx.request.header,
      body: ctx.request.body,
    },
    response: {
      status: ctx.status,
      message: ctx.message,
      header: ctx.response.header,
    },
  };

  const requestCatcher = new RequestCatcher(context);

  await requestCatcher.run();

  ctx.body = context.response.body;
});

app.listen(3003);
