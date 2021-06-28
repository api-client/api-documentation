import { AmfStoreService } from '@api-client/amf-store/worker.index.js';
import { get, set } from 'idb-keyval';

const storeKey = 'api-model';

export class IdbAmfStoreService extends AmfStoreService {
  constructor() {
    super(window, {
      amfLocation: '/node_modules/@api-client/amf-store/amf-bundle.js',
    });
  }

  async storeState() {
    await this.init();
    const content = await this.generateGraph();
    await set(storeKey, content);
  }

  async restoreState() {
    const content = await get(storeKey);
    await this.init();
    if (content) {
      await this.loadGraph(content);
      return true;
    }
    return false;
  }
}
