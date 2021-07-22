import { AmfStoreService } from '@api-client/amf-store/worker.index.js';
import { get, set } from 'idb-keyval';

const storeKey = 'api-model';
const vendorKey = 'api-vendor';

export class IdbAmfStoreService extends AmfStoreService {
  constructor() {
    super(window, {
      amfLocation: '/node_modules/@api-client/amf-store/amf-bundle.js',
    });
    /** 
     * @type {string}
     */
    this.vendor = undefined;
  }

  async storeState() {
    await this.init();
    const content = await this.generateGraph();
    await set(storeKey, content);
    await set(vendorKey, this.vendor);
  }

  async restoreState() {
    const content = await get(storeKey);
    const vendor = await get(vendorKey);
    await this.init();
    if (content) {
      await this.loadGraph(content, vendor);
      return true;
    }
    return false;
  }
}
