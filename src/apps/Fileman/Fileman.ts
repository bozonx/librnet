import { AppBase } from '../../system/base/AppBase.js';

export class Fileman extends AppBase {
  myName = 'Fileman';

  async start() {
    console.log('Fileman init');
  }

  async stop() {
    console.log('Fileman stop');
  }
}
