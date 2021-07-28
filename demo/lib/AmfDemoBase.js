/* eslint-disable lit-a11y/click-events-have-key-events */
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { MonacoLoader } from '@advanced-rest-client/monaco-support';
import { ReportingEventTypes, NavigationContextMenu, NavigationEditCommands } from '@api-client/graph-project';
import { ApiSearch } from '@api-client/amf-store/worker.index.js';
import { IdbAmfStoreService } from './IdbAmfStoreService.js';

/** @typedef {import('@api-client/graph-project').GraphErrorEvent} GraphErrorEvent */
/** @typedef {import('@api-client/amf-store').ParserVendors} ParserVendors */

export class AmfDemoBase extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'loaded', 'initialized', 'apiId',
    ]);
    this.loaded = false;
    this.initialized = false;
    this.renderViewControls = true;
    this.apiId = undefined;
    this.store = new IdbAmfStoreService();
    window.addEventListener(ReportingEventTypes.error, this.errorHandler.bind(this));
    this.autoLoad();
  }

  async autoLoad() {
    await this.loadMonaco();
    const restored = await this.store.restoreState();
    if (!restored) {
      await this.loadDemoApi('demo-api.json', 'RAML 1.0');
    } else {
      const api = await this.store.getApi();
      this.apiId = api.id;
      this.loaded = true;
    }
    this.initialized = true;
  }

  async loadMonaco() {
    const base = `../node_modules/monaco-editor/`;
    MonacoLoader.createEnvironment(base);
    await MonacoLoader.loadMonaco(base);
    await MonacoLoader.monacoReady();
  }

  async firstRender() {
    super.firstRender();
    const element = document.body.querySelector('graph-api-navigation');
    if (element) {
      this.contextMenu = new NavigationContextMenu(element);
      this.contextMenu.registerCommands(NavigationEditCommands);
      this.contextMenu.connect();
    }
  }

  /**
   * @param {GraphErrorEvent} e 
   */
  errorHandler(e) {
    const { error, description, component } = e;
    console.error(`[${component}]: ${description}`);
    console.error(error);
  }

  async initStore() {
    await this.store.init();
    this.initialized = true;
  }

  /**
   * @param {Event} e 
   */
   async actionHandler(e) {
    const button = /** @type HTMLButtonElement */ (e.target);
    if (typeof this[button.id] === 'function') {
      this[button.id]();
      return;
    }
    switch (button.id) {
      case 'init': this.initStore(); break;
      case 'loadApiGraph': this.loadDemoApi(button.dataset.src, /** @type ParserVendors */ (button.dataset.vendor)); break;
      case 'createWebApi': this.createWebApi(); break;
      default: console.warn(`Unhandled action ${button.id}`);
    }
  }

  /**
   * @param {string} file File to load in the `demo/` folder.
   * @param {ParserVendors} vendor API format vendor
   */
  async loadDemoApi(file, vendor) {
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.apiId = undefined;
    this.loaded = false;
    const rsp = await fetch(`./${file}`);
    const model = await rsp.text();
    await this.store.loadGraph(model, vendor);
    this.store.vendor = vendor;
    this.store.storeState();
    const api = await this.store.getApi();
    this.apiId = api.id;
    this.loaded = true;
  }

  async createWebApi() {
    this.loaded = false;
    const api = await this.store.createWebApi();
    this.apiId = api;
    this.loaded = true;
  }

  async selectApiDirectory() {
    // @ts-ignore
    const dirHandle = await window.showDirectoryPicker();
    if (!dirHandle) {
      return;
    }
    this.loaded = false;
    this.apiId = undefined;
    const files = [];
    await this.listDirectory(dirHandle, files, '');
    // @ts-ignore
    const [mainHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'API files',
          accept: {
            'application/json': ['.json'],
            'application/ld+json': ['.jsonld'],
            'application/yaml': ['.raml', '.yaml'],
            'application/raml': ['.raml'],
          }
        },
      ],
      excludeAcceptAllOption: true,
    });
    const file = await mainHandle.getFile();
    const content = await file.text();
    const helper = new ApiSearch();
    const result = helper.readApiType({
      content,
      name: mainHandle.name,
      lastModified: Date.now(),
      size: 0,
      type: '',
    });
    await this.store.loadApi(files, result.type, result.contentType, mainHandle.name);
    const api = await this.store.getApi();
    this.apiId = api.id;
    this.loaded = true;
  }

  async listDirectory(handle, result, parent) {
    for await (const entry of handle.values()) {
      await this.listContent(entry, result, parent);
    }
  }

  async listContent(handle, result, parent='/') {
    if (handle.kind === 'file') {
      const file = await handle.getFile();
      const contents = await file.text();
      const fPath = `${parent}${handle.name}`;
      result.push({
        contents,
        path: fPath,
        parent,
        name: handle.name,
      });
    } else {
      await this.listDirectory(handle, result, `${parent}${handle.name}/`);
    }
  }

  dataTemplate() {
    const { initialized } = this;
    return html`
    <section class="documentation-section">
      <h3>Store actions</h3>

      <h4>Initialization</h4>
      <div @click="${this.actionHandler}">
        <button id="init">Init</button>
        <button id="createWebApi" ?disabled="${!initialized}">Create empty Web API</button>
        <button ?disabled="${!initialized}" id="selectApiDirectory">Select API</button>
      </div>
      ${this.apisListTemplate()}
    </section>
    `;
  }

  apisListTemplate() {
    const apis = [
      ['demo-api.json', 'RAML 1.0', 'Demo API'],
      ['async-api.json', 'ASYNC 2.0', 'ASYNC API'],
      ['google-drive-api.json', 'RAML 1.0', 'Google Drive API'],
      ['streetlights.json', 'ASYNC 2.0', 'Streetlights (async) API'],
      ['oas-3-api.json', 'OAS 3.0', 'OAS 3.0'],
      ['petstore.json', 'OAS 3.0', 'Pet store (OAS 3)'],
      ['oas-bearer.json', 'OAS 3.0', 'OAS Bearer'],
      ['oauth-flows.json', 'OAS 3.0', 'OAuth flows'],
      ['oauth-pkce.json', 'RAML 1.0', 'OAuth PKCE'],
      ['secured-api.json', 'RAML 1.0', 'Secured api'],
      ['secured-unions.json', 'ASYNC 2.0', 'Secured unions'],
      ['api-keys.json', 'OAS 3.0', 'API keys'],
    ];
    const { initialized } = this;
    return html`
    <h4>APIs</h4>
    <div @click="${this.actionHandler}">
    ${apis.map(([file, vendor, label]) => html`
      <button id="loadApiGraph" 
        data-src="${file}" 
        data-vendor="${vendor}" 
        ?disabled="${!initialized}"
      >${label}</button>`)}
    </div>
    `;
  }
}
