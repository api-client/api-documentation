import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import { NavigationEventTypes } from '@api-client/graph-project';
import { TransportEventTypes } from '@advanced-rest-client/arc-events';
import '@api-client/graph-project/graph-api-navigation.js';
import '@advanced-rest-client/authorization/oauth2-authorization.js';
import '@advanced-rest-client/authorization/oauth1-authorization.js';
import '../amf-http-request.js';
import { AuthorizationPreProcessor } from '../src/lib/AuthorizationPreProcessor.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';

/** @typedef {import('@api-client/graph-project').APIGraphNavigationEvent} APIGraphNavigationEvent */
/** @typedef {import('@api-client/graph-project').APIExternalNavigationEvent} APIExternalNavigationEvent */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([
      'selectedId', 'selectedType', 'globalCache',
    ]);
    this.globalCache = true;
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.componentName = 'amf-http-request';
    // this.oauth2redirect = 'http://auth.advancedrestclient.com/arc.html';
    this.oauth2redirect = `${window.location.origin}/node_modules/@advanced-rest-client/authorization/oauth-popup.html`;
    this.oauth2AuthorizationUri = `${window.location.origin}/demo/oauth-authorize.html`;
    // this.oauth2AuthorizationUri = `${window.location.origin}/auth/authorize`;
    this.oauth2AccessTokenUri = `${window.location.origin}/auth/token`;
    window.addEventListener(NavigationEventTypes.navigate, this.navigationHandler.bind(this));
    window.addEventListener(NavigationEventTypes.navigateExternal, this.externalNavigationHandler.bind(this));
    window.addEventListener(TransportEventTypes.request, this.transportHandler.bind(this));
  }

  /**
   * @param {CustomEvent} e
   */
  transportHandler(e) {
    const authFactory = new AuthorizationPreProcessor();
    const request = authFactory.apply(e.detail.request, { removeProcessed: true, processInvalid: true });
    console.log(request);
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
      <oauth2-authorization></oauth2-authorization>
      <oauth1-authorization></oauth1-authorization>
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
    const { demoStates, darkThemeActive, selectedId, globalCache, oauth2redirect, oauth2AuthorizationUri, oauth2AccessTokenUri } = this;
    if (!selectedId) {
      return html`<p>Select API operation in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <amf-http-request
        .domainId="${selectedId}"
        ?globalCache="${globalCache}"
        .oauth2RedirectUri="${oauth2redirect}"
        .oauth2AuthorizationUri="${oauth2AuthorizationUri}"
        .oauth2AccessTokenUri="${oauth2AccessTokenUri}"
        slot="content"
      >
      </amf-http-request>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="edit"
        .checked="${globalCache}"
        @change="${this._toggleMainOption}"
      >
        Global cache
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }
}
const instance = new ComponentPage();
instance.render();
