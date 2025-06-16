import Koa from 'koa';
import type { Context } from 'koa';
import { RequestCatcher, type RequestCatcherContext } from './RequestCatcher';

const app = new Koa();

app.use(async (ctx: Context) => {
  const context: Omit<RequestCatcherContext, 'path'> = {
    fullPath: ctx.request.url,
    args: ctx.request.query.args
      ? JSON.parse(ctx.request.query.args as string)
      : undefined,
    meta: ctx.request.header['Request-meta']
      ? JSON.parse(ctx.request.header['Request-meta'] as string)
      : undefined,
    // TODO: support binary body
    data: JSON.stringify(ctx.body),
    response: {
      status: ctx.status,
      statusMessage: ctx.statusMessage,
    },
  };

  const requestCatcher = new RequestCatcher();

  await requestCatcher.run(context);

  if (context.response.errors) {
    ctx.body = JSON.stringify(context.response.errors);
  } else if (context.response.result instanceof Uint8Array) {
    // TODO: support binary body
    ctx.body = context.response.result;
  } else {
    ctx.body = JSON.stringify(context.response.result);
  }

  ctx.response.status = context.response.status;
  ctx.response.message = context.response.statusMessage || '';
  ctx.response.header = {
    'Content-Type': 'application/json',
    'Request-meta': context.meta ? JSON.stringify(context.meta) : undefined,
  };
});

app.listen(3003);
