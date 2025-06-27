import { WsClientIo } from '../src/ios/NodejsPack/WsClientIo.js';
import { WsServerIo } from '../src/ios/NodejsPack/WsServerIo.js';
import { IoContext } from '../src/system/context/IoContext.js';
import { PackageContext } from '../src/system/context/PackageContext.js';
import { IoSetBase } from '../src/system/base/IoSetBase.js';
import { WsServerEvent } from '../src/types/io/WsServerIoType.js';
import { WsClientEvent } from '../src/types/io/WsClientIoType.js';

class TestIoSet extends IoSetBase {
  type = 'testIoSet';
}

(async () => {
  const testPort = 48765;
  const testServerId = `localhost:${testPort}/ws`;
  const wsClientIo = new WsClientIo(
    new TestIoSet({} as PackageContext, {}),
    new IoContext({} as PackageContext)
  );
  const wsServerIo = new WsServerIo(
    new TestIoSet({} as PackageContext, {}),
    new IoContext({} as PackageContext)
  );

  let serverHandler;
  let clientHandler;

  // ‼️ Чтобы правильно обрабатывались ошибки в коде обработчиков
  //    важно сделать функцию асинхронной
  await wsServerIo.on(async (...args) => {
    await serverHandler(...args);
  });

  await wsClientIo.on(async (...args) => {
    await clientHandler(...args);
  });

  ///////////////////////////
  // Start server

  if (await wsServerIo.isServerListening(testServerId)) {
    throw new Error(`Server already listening on port ${testPort}`);
  }

  const serverIdOnInit = await wsServerIo.newServer({
    port: testPort,
    host: 'localhost',
    path: '/ws',
  });

  // Wait for server to start listening
  await new Promise<void>((resolve, reject) => {
    serverHandler = (eventName, serverId) => {
      if (serverId !== testServerId && serverId !== serverIdOnInit) {
        reject(`Wrong server id: ${serverId}`);
      } else if (eventName === WsServerEvent.listening) {
        resolve();
      } else reject(`Din't receive listening event`);
    };
  });

  if (!(await wsServerIo.isServerListening(testServerId))) {
    throw new Error(`Server not listening on port ${testPort}`);
  }

  ///////////////////////////
  // Try to start the same server again
  try {
    await wsServerIo.newServer({
      port: testPort,
      host: 'localhost',
      path: '/ws',
    });
  } catch (e) {
    if (!String(e).includes('already exists')) {
      throw e;
    }
  }

  ///////////////////////////
  // Try to stop and start the server again
  await wsServerIo.stopServer(serverIdOnInit);
  const serverId2 = await wsServerIo.newServer({
    port: testPort,
    host: 'localhost',
    path: '/ws',
  });
  if (serverId2 !== serverIdOnInit) {
    throw new Error(`Server id changed: ${serverId2} !== ${serverIdOnInit}`);
  }
  // wait for server to start listening
  await new Promise<void>((resolve, reject) => {
    serverHandler = (eventName, serverId) => {
      if (serverId !== testServerId && serverId !== serverId2) {
        reject(`Wrong server id: ${serverId}`);
      } else if (eventName === WsServerEvent.listening) {
        resolve();
      } else reject(`Din't receive listening event`);
    };
  });

  ///////////////////////////
  // New connection full cycle
  const serverPromise = new Promise<void>((resolve, reject) => {
    serverHandler = (eventName, serverId, connectionId, params) => {
      if (serverId !== testServerId) {
        reject(`Wrong server id: ${serverId}`);
      } else if (eventName !== WsServerEvent.newConnection) {
        reject(`Din't receive new connection event`);
      } else if (connectionId !== '0') {
        reject(`Wrong connection id: ${connectionId}`);
      } else if (params.url !== `/ws`) {
        reject(`Wrong url: ${params.url}`);
      } else {
        resolve();
      }
    };
  });

  const clientPromise = new Promise<void>((resolve, reject) => {
    clientHandler = (eventName, connectionId) => {
      if (eventName !== WsClientEvent.open) {
        reject(`Din't receive open event`);
      } else if (connectionId !== '0') {
        reject(`Wrong connection id: ${connectionId}`);
      } else {
        resolve();
      }
    };
  });

  const connectionId = await wsClientIo.newConnection({
    url: `ws://localhost:${testPort}/ws`,
  });

  await Promise.all([serverPromise, clientPromise]);

  // send message
  await wsClientIo.send(connectionId, 'test');

  await new Promise<void>((resolve, reject) => {
    serverHandler = (eventName, serverId, connectionId, params) => {
      console.log('serverHandler', eventName, serverId, connectionId, params);
      // if (serverId !== testServerId) {
      //   reject(`Wrong server id: ${serverId}`);
      // } else if (eventName !== WsServerEvent.newConnection) {
      //   reject(`Din't receive new connection event`);
      // } else if (connectionId !== '0') {
      //   reject(`Wrong connection id: ${connectionId}`);
      // } else if (params.url !== `/ws`) {
      //   reject(`Wrong url: ${params.url}`);
      // } else {
      //   resolve();
      // }
    };
  });

  await wsClientIo.close(connectionId, 1000, 'test');

  console.log('connectionId', connectionId);

  ///////////////////////////
  // Stop server
  await wsServerIo.stopServer(serverIdOnInit);

  // await new Promise<void>((resolve, reject) => {
  //   serverHandler = (eventName, serverId) => {
  //     console.log('serverHandler', eventName, serverId);
  //     if (serverId !== testServerId) {
  //       reject(`Wrong server id: ${serverId}`);
  //     } else if (eventName === WsServerEvent.serverClosed) {
  //       resolve();
  //     } else reject(`Din't receive serverClose event`);
  //   };
  // });

  // if (await wsServerIo.isServerListening(testServerId)) {
  //   throw new Error(`Server still listening on port ${testPort}`);
  // }

  ///////////////////////////
  // Destroy
  await wsClientIo.destroy();
  await wsServerIo.stopServer(serverIdOnInit);
  // TODO: не дожидается закрытия соединений
  // await wsServerIo.destroy();
})();
