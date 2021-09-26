import { AmfStoreService } from '@api-client/amf-store/worker.index.js';

/** @typedef {import('@api-client/amf-store').ParserVendors} ParserVendors */

export class TestHelper {
  /**
   * Reads AMF graph model as string
   * @param {string} [fileName='demo-api']
   * @returns {Promise<string>} 
   */
  static async getGraph(fileName='demo-api') {
    const file = `${fileName}.json`;
    const url = `${window.location.protocol}//${window.location.host}/demo/${file}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Unable to download API data model');
    }
    return response.text();
  }

  /**
   * Initializes an empty store.
   * @param {EventTarget=} eventsTarget The event target to use to init the store.
   * @returns {Promise<AmfStoreService>} 
   */
  static async initStore(eventsTarget) {
    const service = new AmfStoreService(eventsTarget, {
      amfLocation: '/node_modules/@api-client/amf-store/amf-bundle.js',
    });
    await service.init();
    return service;
  }

  /**
   * Initializes the store with a graph model.
   * @param {string} model The graph model (as string) to load.
   * @param {ParserVendors} vendor The originating API spec format.
   * @param {EventTarget=} eventsTarget The event target to use to init the store.
   * @returns {Promise<AmfStoreService>} 
   */
  static async initDataStore(model, vendor, eventsTarget) {
    const service = await TestHelper.initStore(eventsTarget);
    await service.loadGraph(model, vendor);
    return service;
  }

  /**
   * Initializes the store with a graph model.
   * @param {string} fileName The file name to load from the `demo` folder.
   * @param {ParserVendors} vendor The originating API spec format.
   * @param {EventTarget=} eventsTarget The event target to use to init the store.
   * @returns {Promise<AmfStoreService>} 
   */
  static async getModelStore(fileName, vendor, eventsTarget) {
    const model = await TestHelper.getGraph(fileName);
    if (!model) {
      throw new Error(`Unable to load file ${fileName}`);
    }
    return TestHelper.initDataStore(model, vendor, eventsTarget);
  }
}
