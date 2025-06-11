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

  await filesIo.mkdir(path.join(tmpDir, '1'), { recursive: true });

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
  await filesIo.rm([path.join(tmpDir, 'test.txt')]);
  try {
    await filesIo.rm([path.join(tmpDir, '1')]);
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
  await filesIo.mkdir(path.join(tmpDir, '1/2'));
  const files = await filesIo.readdir(tmpDir + '/1');
  if (files.length !== 2) {
    throw new Error('Files length is not correct');
  } else if (files[0] !== '2' || files[1] !== 'test.txt') {
    throw new Error('File is not correct');
  }
  try {
    await filesIo.rmdir(path.join(tmpDir, '1'));
    throw new Error('Directory is not removed');
  } catch (e) {
    // ok
  }
  await filesIo.rmdirRf(path.join(tmpDir, '1'));

  // renameFiles
  await filesIo.mkdir(path.join(tmpDir, '2'), { recursive: true });
  await filesIo.writeFile(path.join(tmpDir, 'testToMove.txt'), 'test');
  await filesIo.rename([
    [
      path.join(tmpDir, 'testToMove.txt'),
      path.join(tmpDir, '2', 'testMoved.txt'),
    ],
  ]);
  await filesIo.rename([[path.join(tmpDir, '2'), path.join(tmpDir, '3')]]);
  if (!(await filesIo.stat(path.join(tmpDir, '3', 'testMoved.txt')))) {
    throw new Error('File is not removed');
  }
  await filesIo.rmdirRf(path.join(tmpDir, '3'));
  try {
    await filesIo.rename([[path.join(tmpDir, '4'), path.join(tmpDir, '5')]]);
  } catch (errors) {
    if (errors.length !== 1) {
      throw new Error('Errors length is not correct');
    }
  }

  // copy files
  await filesIo.mkdir(path.join(tmpDir, '4'), { recursive: true });
  await filesIo.writeFile(path.join(tmpDir, 'testCopy.txt'), 'test');
  await filesIo.cp(
    [
      [
        path.join(tmpDir, 'testCopy.txt'),
        path.join(tmpDir, '4', 'testCopy.txt'),
      ],
    ],
    {
      errorOnExist: true,
    }
  );
  if (!(await filesIo.stat(path.join(tmpDir, '4', 'testCopy.txt')))) {
    throw new Error('File is not copied');
  }

  await filesIo.cp([[path.join(tmpDir, '4'), path.join(tmpDir, '5')]], {
    errorOnExist: true,
    recursive: true,
  });
  if (!(await filesIo.stat(path.join(tmpDir, '5', 'testCopy.txt')))) {
    throw new Error('File is not copied');
  }
  // try to copy to existing dir
  try {
    await filesIo.cp([[path.join(tmpDir, '4'), path.join(tmpDir, '5')]], {
      errorOnExist: true,
    });
  } catch (errors) {
    if (errors.length !== 1) {
      throw new Error('Errors length is not correct');
    }
  }

  await filesIo.rmdirRf(path.join(tmpDir, '4'));
  await filesIo.rmdirRf(path.join(tmpDir, '5'));
  await filesIo.rmdirRf(path.join(tmpDir, 'testCopy.txt'));

  try {
    await filesIo.cp([
      [path.join(tmpDir, 'nonexistent'), path.join(tmpDir, 'nonexistent2')],
    ]);
  } catch (errors) {
    if (errors.length !== 1) {
      throw new Error('Errors length is not correct');
    }
  }

  // readBinFile , append bin, writeFile bin
  // readlink, createLink
})();
