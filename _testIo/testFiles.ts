import { LocalFilesIo } from '../src/ios/NodejsPack/LocalFilesIo.js';
import { IoSetBase } from '../src/system/base/IoSetBase.js';
import { IoContext } from '../src/system/context/IoContext.js';
import { PackageContext } from '../src/system/context/PackageContext.js';
import { fileURLToPath } from 'url';
import path from 'path';

class TestIoSet extends IoSetBase {
  type = 'testIoSet';
}

const tmpDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tmp');

(async () => {
  const filesIo = new LocalFilesIo(
    new TestIoSet({} as PackageContext, {}),
    new IoContext({} as PackageContext)
  );

  await filesIo.appendFile(path.join(tmpDir, 'test.txt'), 'test');
  await filesIo.appendFile(path.join(tmpDir, 'test.txt'), '\ntest2');

  const stats = await filesIo.stat(path.join(tmpDir, 'test.txt'));
  console.log(stats);
  if (stats?.dir) {
    throw new Error('File is a directory');
  } else if (stats?.symbolicLink) {
    throw new Error('File is a symbolic link');
  }

  const text = await filesIo.readTextFile(path.join(tmpDir, 'test.txt'));
  if (text !== 'test\ntest2') {
    throw new Error('Text is not correct');
  }

  await filesIo.unlink([path.join(tmpDir, 'test.txt')]);

  // readtextfile, readBinFile , append bin, writeFile bin
  // readlink

  // TODO: удаление не пустой директории - mkdir, rmdir, rmdirR, readdir
})();
