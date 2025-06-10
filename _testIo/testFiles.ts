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

  await filesIo.mkDirP(path.join(tmpDir, '1'));

  // append text file and read it
  await filesIo.appendFile(path.join(tmpDir, 'test.txt'), 'test');
  await filesIo.appendFile(path.join(tmpDir, 'test.txt'), '\ntest2');

  const stats = await filesIo.stat(path.join(tmpDir, 'test.txt'));

  if (stats?.dir) {
    throw new Error('File is a directory');
  } else if (stats?.symbolicLink) {
    throw new Error('File is a symbolic link');
  }

  const text = await filesIo.readTextFile(path.join(tmpDir, 'test.txt'));
  if (text !== 'test\ntest2') {
    throw new Error('Text is not correct');
  }

  // Try to remove directory with unlink
  await filesIo.unlink([path.join(tmpDir, 'test.txt')]);
  try {
    await filesIo.unlink([path.join(tmpDir, '1')]);
  } catch (errors) {
    if (errors.length !== 1) {
      throw new Error('Errors length is not correct');
    }
  }

  // writeFile  and remove dir

  await filesIo.writeFile(path.join(tmpDir, '1', 'test.txt'), 'test');
  await filesIo.writeFile(path.join(tmpDir, '1', 'test.txt'), 'test2');
  const text2 = await filesIo.readTextFile(path.join(tmpDir, '1', 'test.txt'));
  if (text2 !== 'test2') {
    throw new Error('Text is not correct');
  }

  // readBinFile , append bin, writeFile bin
  // readlink, renameFiles, copyFiles, writeFile

  // TODO: удаление не пустой директории - mkdir, rmdir, rmdirRf, readdir
})();
