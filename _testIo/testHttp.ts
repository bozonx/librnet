import { HttpClientIo } from '../src/ios/NodejsPack/HttpClientIo.js';
import { HttpServerIo } from '../src/ios/NodejsPack/HttpServerIo.js';
import { IoContext } from '../src/system/context/IoContext.js';
import { PackageContext } from '../src/system/context/PackageContext.js';
import { IoSetBase } from '../src/system/base/IoSetBase.js';
import { HttpServerEvent } from '../src/types/io/HttpServerIoType.js';

// TODO: test binary
// TODO: test https

class TestIoSet extends IoSetBase {
  type = 'testIoSet';
}

(async () => {
  const testPort = 48765;
  const testServerId = `localhost:${testPort}`;
  const httpClientIo = new HttpClientIo(
    new TestIoSet({} as PackageContext, {}),
    new IoContext({} as PackageContext)
  );
  const httpServerIo = new HttpServerIo(
    new TestIoSet({} as PackageContext, {}),
    new IoContext({} as PackageContext)
  );

  let handler;

  // ‼️ Чтобы правильно обрабатывались ошибки в коде обработчиков
  //    важно сделать функцию асинхронной
  await httpServerIo.on(async (...args) => {
    await handler(...args);
  });

  ///////////////////////////
  // Start server

  if (await httpServerIo.isServerListening(testServerId)) {
    throw new Error(`Server already listening on port ${testPort}`);
  }

  const serverId = await httpServerIo.newServer({
    port: testPort,
    host: 'localhost',
  });
  // Wait for server to start listening
  await new Promise<void>((resolve, reject) => {
    handler = (eventName, serverId) => {
      if (serverId !== testServerId) {
        reject(`Wrong server id: ${serverId}`);
      } else if (eventName === HttpServerEvent.listening) {
        resolve();
      } else reject(`Din't receive listening event`);
    };
  });

  if (!(await httpServerIo.isServerListening(testServerId))) {
    throw new Error(`Server not listening on port ${testPort}`);
  }

  ///////////////////////////
  // Try to start the same server again
  try {
    await httpServerIo.newServer({
      port: testPort,
      host: 'localhost',
    });
  } catch (e) {
    if (!String(e).includes('already exists')) {
      throw e;
    }
  }

  ///////////////////////////
  // Try to stop and start the server again
  await httpServerIo.stopServer(serverId);
  const serverId2 = await httpServerIo.newServer({
    port: testPort,
    host: 'localhost',
  });
  if (serverId2 !== serverId) {
    throw new Error(`Server id changed: ${serverId2} !== ${serverId}`);
  }
  // Wait for server to start listening
  await new Promise<void>((resolve, reject) => {
    handler = (eventName, serverId) => {
      if (serverId !== testServerId) {
        reject(`Wrong server id: ${serverId}`);
      } else if (eventName === HttpServerEvent.listening) {
        resolve();
      } else reject(`Din't receive listening event`);
    };
  });

  ///////////////////////////
  // Send request
  await new Promise<void>(async (resolve, reject) => {
    handler = (eventName, serverId, requestId, request) => {
      if (serverId !== testServerId) {
        reject(`Wrong server id: ${serverId}`);
      } else if (eventName === HttpServerEvent.request) {
        resolve();
      } else if (typeof requestId !== 'number') {
        reject(`Request id is not a number`);
      } else reject(`Din't receive request event`);

      httpServerIo.sendResponse(requestId, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'Hello, world!',
      });
    };

    const res = await httpClientIo.request({
      url: `http://${testServerId}`,
      method: 'GET',
    });

    if (res.status !== 200) {
      reject(`Request failed with status ${res.status}`);
    }

    const body = await res.body;
    if (body !== 'Hello, world!') {
      reject(`Wrong response body: ${body}`);
    }
  });

  ///////////////////////////
  // Error handling
  await new Promise<void>(async (resolve, reject) => {
    handler = async (eventName, serverId, requestId, request) => {
      if (eventName !== HttpServerEvent.request) {
        return;
      }

      throw new Error('test error');
    };

    const res = await httpClientIo.request({
      url: `http://${testServerId}`,
      method: 'GET',
    });

    if (res.status === 500) {
      resolve();
    } else {
      reject(`Should receive 500 status code`);
    }
  });

  ///////////////////////////
  // Send request with timeout
  await new Promise<void>(async (resolve, reject) => {
    httpServerIo.init &&
      (await httpServerIo.init({
        requestTimeoutSec: 0.3,
      }));

    handler = (eventName, serverId, requestId, request) => {};

    const res = await httpClientIo.request({
      url: `http://${testServerId}`,
      method: 'GET',
    });

    if (res.status === 408) {
      resolve();
    } else {
      reject(`Should receive 408 status code`);
    }
  });

  ///////////////////////////
  // Stop server
  await httpServerIo.stopServer(serverId);

  await new Promise<void>((resolve, reject) => {
    handler = (eventName, serverId) => {
      if (serverId !== testServerId) {
        reject(`Wrong server id: ${serverId}`);
      } else if (eventName === HttpServerEvent.serverClose) {
        resolve();
      } else reject(`Din't receive serverClose event`);
    };
  });

  if (await httpServerIo.isServerListening(testServerId)) {
    throw new Error(`Server still listening on port ${testPort}`);
  }
})();
