/* eslint-disable lit-a11y/click-events-have-key-events */
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import { NavigationEventTypes, NavigationEditCommands, NavigationContextMenu, ReportingEventTypes } from '@api-client/graph-project';
import '@api-client/graph-project/graph-api-navigation.js';
import { IdbAmfStoreService } from './lib/IdbAmfStoreService.js';
import '../amf-operation-document.js';

/** @typedef {import('@api-client/graph-project').APIGraphNavigationEvent} APIGraphNavigationEvent */
/** @typedef {import('@api-client/graph-project').APIExternalNavigationEvent} APIExternalNavigationEvent */
/** @typedef {import('@api-client/graph-project').GraphErrorEvent} GraphErrorEvent */

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'loaded', 'initialized',
      'selectedId', 'selectedType',
      'apiId', 'edit'
    ]);
    this.loaded = false;
    this.initialized = false;
    this.edit = false;
    this.renderViewControls = true;
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.apiId = undefined;
    this.store = new IdbAmfStoreService();
    this.componentName = 'amf-operation-document';
    this.actionHandler = this.actionHandler.bind(this);
    window.addEventListener(NavigationEventTypes.navigate, this.navigationHandler.bind(this));
    window.addEventListener(NavigationEventTypes.navigateExternal, this.externalNavigationHandler.bind(this));
    window.addEventListener(ReportingEventTypes.error, this.errorHandler.bind(this));
    this.autoLoad();
  }

  async autoLoad() {
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
    switch (button.id) {
      case 'init': this.initStore(); break;
      case 'loadApiGraph': this.loadDemoApi(button.dataset.src, button.dataset.vendor); break;
      case 'createWebApi': this.createWebApi(); break;
      default: console.warn(`Unhandled action ${button.id}`);
    }
  }

  async loadDemoApi(file, vendor) {
    this.loaded = false;
    const rsp = await fetch(`./${file}`);
    const model = await rsp.text();
    await this.store.loadGraph(model, vendor);
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

  /**
   * @param {APIGraphNavigationEvent} e 
   */
  navigationHandler(e) {
    const { graphId, graphType, options } = e;
    if (graphType === 'operation') {
      this.selectedId = graphId;
      this.selectedType = graphType;
      this.selectedOptions = options;
    } else {
      this.selectedId = undefined;
      this.selectedType = undefined;
      this.selectedOptions = undefined;
    }
  }

  /**
   * @param {APIExternalNavigationEvent} e
   */
  externalNavigationHandler(e) {
    e.preventDefault();
    const { url } = e;
    console.log('Opening', url);
    window.open(url);
  }

  contentTemplate() {
    return html`
      <h2>API operation</h2>
      ${this._dataTemplate()}
      ${this._demoTemplate()}
    `;
  }

  _demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the Graph API navigation document with various configuration options.
      </p>

      <div class="api-demo-content">
        ${this._navTemplate()}
        ${!loaded ? html`<p>Load an API model first.</p>` : this._componentTemplate()}
      </div>
    </section>
    `;
  }

  _navTemplate() {
    const { apiId } = this;
    return html`
    <graph-api-navigation
      endpointsOpened
      .apiId="${apiId}"
      summary
      sort
      filter
      edit
      manualQuery
    >
    </graph-api-navigation>
    `;
  }

  _componentTemplate() {
    const { demoStates, darkThemeActive, selectedId, edit } = this;
    if (!selectedId) {
      return html`<p>Select API operation in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <amf-operation-document
        .domainId="${selectedId}"
        slot="content"
        ?edit="${edit}"
      >
      </amf-operation-document>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="edit"
        @change="${this._toggleMainOption}"
      >
        Edit graph
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }
  
  _dataTemplate() {
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
const instance = new ComponentPage();
instance.render();
