import Koa from 'koa';
import type { Context } from 'vm';
import { RequestCatcher, type RequestCatcherContext } from './RequestCatcher';

const app = new Koa();

app.use(async (ctx: Context) => {
  const context: Omit<RequestCatcherContext, 'path'> = {
    fullPath: ctx.request.url,
    query: ctx.request.query,
    meta: ctx.request.header,
    body: ctx.request.body,
    response: {
      status: ctx.status,
      statusMessage: ctx.statusMessage,
      meta: ctx.response.header,
      errors: ctx.response.errors,
      body: ctx.response.body,
    },
  };

  const requestCatcher = new RequestCatcher();

  await requestCatcher.run(context);

  ctx.body = context.response.body;
});

app.listen(3003);
