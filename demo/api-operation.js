import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import { NavigationEventTypes } from '@api-client/graph-project';
import '@api-client/graph-project/graph-api-navigation.js';
import '../amf-operation-document.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';

/** @typedef {import('@api-client/graph-project').APIGraphNavigationEvent} APIGraphNavigationEvent */
/** @typedef {import('@api-client/graph-project').APIExternalNavigationEvent} APIExternalNavigationEvent */
/** @typedef {import('@api-client/graph-project').GraphErrorEvent} GraphErrorEvent */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([ 'selectedId', 'selectedType', 'edit' ]);
    this.edit = false;
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.apiId = undefined;
    this.componentName = 'amf-operation-document';
    window.addEventListener(NavigationEventTypes.navigate, this.navigationHandler.bind(this));
    window.addEventListener(NavigationEventTypes.navigateExternal, this.externalNavigationHandler.bind(this));
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
      ${this.dataTemplate()}
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
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
}
const instance = new ComponentPage();
instance.render();
