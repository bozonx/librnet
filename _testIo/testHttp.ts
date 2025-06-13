import { HttpClientIo } from '../src/ios/NodejsPack/HttpClientIo.js';
import { HttpServerIo } from '../src/ios/NodejsPack/HttpServerIo.js';
import { IoContext } from '../src/system/context/IoContext.js';
import { PackageContext } from '../src/system/context/PackageContext.js';
import { IoSetBase } from '../src/system/base/IoSetBase.js';
import { HttpServerEvent } from '../src/types/io/HttpServerIoType.js';

// TODO: повторно возможно запустить сервер?
// TODO: test error handling
// TODO: test binary
// TODO: test timeout

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

  await httpServerIo.on((...args) => {
    handler(...args);
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
