/* eslint-disable lit-a11y/click-events-have-key-events */
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import { AmfStoreService } from '@api-client/amf-store/worker.index.js';
import { NavigationEventTypes, NavigationEditCommands, NavigationContextMenu, ReportingEventTypes } from '@api-client/graph-project';
import '@api-client/graph-project/graph-api-navigation.js';
import '../amf-documentation-document.js';

/** @typedef {import('@api-client/graph-project').APIGraphNavigationEvent} APIGraphNavigationEvent */
/** @typedef {import('@api-client/graph-project').APIExternalNavigationEvent} APIExternalNavigationEvent */
/** @typedef {import('@api-client/graph-project').GraphErrorEvent} GraphErrorEvent */

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'loaded', 'initialized',
      'selectedId', 'selectedType',
      'apiId',
    ]);
    this.loaded = false;
    this.initialized = false;
    this.renderViewControls = true;
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.apiId = undefined;
    this.store = new AmfStoreService(window, {
      amfLocation: '/node_modules/@api-client/amf-store/amf-bundle.js',
    });
    this.componentName = 'amf-documentation-document';
    this.actionHandler = this.actionHandler.bind(this);
    window.addEventListener(NavigationEventTypes.navigate, this.navigationHandler.bind(this));
    window.addEventListener(NavigationEventTypes.navigateExternal, this.externalNavigationHandler.bind(this));
    window.addEventListener(ReportingEventTypes.error, this.errorHandler.bind(this));
    this.autoLoad();
  }

  async autoLoad() {
    await this.initStore();
    await this.loadDemoApi('demo-api.json');
  }

  async firstRender() {
    await super.firstRender();
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
      case 'loadApiGraph': this.loadDemoApi(button.dataset.src); break;
      case 'createWebApi': this.createWebApi(); break;
      default: console.warn(`Unhandled action ${button.id}`);
    }
  }

  async loadDemoApi(file) {
    this.loaded = false;
    const rsp = await fetch(`./${file}`);
    const model = await rsp.text();
    await this.store.loadGraph(model);
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
    const { graphId, graphType, } = e;
    if (graphType === 'documentation') {
      this.selectedId = graphId;
      this.selectedType = graphType;
    } else {
      this.selectedId = undefined;
      this.selectedType = undefined;
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
      <h2>API documentation</h2>
      ${this._demoTemplate()}
      ${this._dataTemplate()}
    `;
  }

  _demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API endpoint document with various configuration options.
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
    const { demoStates, darkThemeActive, selectedId } = this;
    if (!selectedId) {
      return html`<p>Select API documentation in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <amf-documentation-document
        .domainId="${selectedId}"
        slot="content"
      >
      </amf-documentation-document>

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
        <button id="loadApiGraph" data-src="demo-api.json" ?disabled="${!initialized}">Load demo API</button>
        <button id="loadApiGraph" data-src="async-api.json" ?disabled="${!initialized}">Load async API</button>
        <button id="loadApiGraph" data-src="google-drive-api.json" ?disabled="${!initialized}">Load Google Drive API</button>
        <button id="loadApiGraph" data-src="streetlights.json" ?disabled="${!initialized}">Streetlights (async) API</button>
        <button id="loadApiGraph" data-src="oas-3-api.json" ?disabled="${!initialized}">OAS 3</button>
        <button id="loadApiGraph" data-src="petstore.json" ?disabled="${!initialized}">Pet store (OAS 3)</button>
        <button id="createWebApi" ?disabled="${!initialized}">Create empty Web API</button>
      </div>
    </section>
    `;
  }
}
const instance = new ComponentPage();
instance.render();
