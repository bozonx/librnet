import { HttpClientIo } from '../src/ios/NodejsPack/HttpClientIo.js';
import { HttpServerIo } from '../src/ios/NodejsPack/HttpServerIo.js';
import { IoContext } from '../src/system/context/IoContext.js';
import { PackageContext } from '../src/system/context/PackageContext.js';
import { IoSetBase } from '../src/system/base/IoSetBase.js';

class TestIoSet extends IoSetBase {
  type = 'testIoSet';
}

(async () => {
  const httpClientIo = new HttpClientIo(
    new TestIoSet({} as PackageContext, {}),
    new IoContext({} as PackageContext)
  );

  const httpServerIo = new HttpServerIo(
    new TestIoSet({} as PackageContext, {}),
    new IoContext({} as PackageContext)
  );

  // const res = await fetch('https://api.github.com', {
  //   method: 'GET',
  // });

  // console.log(res);

  const res = await httpClientIo.request({
    url: 'https://github.com',
    method: 'GET',
  });

  console.log(res);
})();
