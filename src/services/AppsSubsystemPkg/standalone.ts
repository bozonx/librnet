import WebSocket from 'ws'

import { AppsServiceIndex } from './AppsService'

const ws = new WebSocket('ws://localhost:3003')

ws.on('open', () => {
  console.log('connected')
})

ws.on('message', (message) => {
  // TODO: десериализовать message где перывый аргумент
  //  это путь к функции, а второй это аргументы ключая бинарные данные
  console.log('args: %s', message)

  const [path, ...args] = JSON.parse(message.toString())

  const appsService = AppsServiceIndex({
    // TODO: create context
  })

  // TODO: вызвать функцию с аргументами
  // TODO: отправить результат обратно
})

ws.on('error', (error) => {
  console.error(error)
})

ws.on('close', () => {
  console.log('closed')
})

ws.on('ping', (message) => {
  console.log(message)
})

ws.on('pong', (message) => {
  console.log(message)
})

// import Koa from 'koa';
// import type { Context } from 'koa';
// import { RequestCatcher, type RequestCatcherContext } from './RequestCatcher';

// const app = new Koa();

// app.use(async (ctx: Context) => {
//   const context: Omit<RequestCatcherContext, 'path'> = {
//     fullPath: ctx.request.url,
//     args: ctx.request.query.args
//       ? JSON.parse(ctx.request.query.args as string)
//       : undefined,
//     meta: ctx.request.header['Request-meta']
//       ? JSON.parse(ctx.request.header['Request-meta'] as string)
//       : undefined,
//     // TODO: support binary body
//     data: typeof ctx.body === 'string' ? JSON.parse(ctx.body) : ctx.body,
//     response: {
//       status: ctx.status,
//       statusMessage: ctx.statusMessage,
//     },
//   };

//   const requestCatcher = new RequestCatcher();

//   await requestCatcher.run(context);

//   if (context.response.errors) {
//     ctx.body = JSON.stringify(context.response.errors);
//   } else if (context.response.result instanceof Uint8Array) {
//     // TODO: support binary body
//     ctx.body = context.response.result;
//   } else {
//     ctx.body = JSON.stringify(context.response.result);
//   }

//   ctx.response.status = context.response.status;
//   ctx.response.message = context.response.statusMessage || '';
//   ctx.response.header = {
//     'Content-Type': 'application/json',
//     'Request-meta': context.meta ? JSON.stringify(context.meta) : undefined,
//   };
// });

// app.listen(3003);
