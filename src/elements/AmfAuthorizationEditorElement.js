/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents } from '@api-client/amf-store/worker.index.js';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import { AmfEditorsBase, queryingValue } from "./AmfEditorsBase.js";
import '@advanced-rest-client/authorization/authorization-method.js';
import elementStyles from './styles/AuthorizationEditor.js';
import '../../amf-authorization-method.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiSecurityRequirementRecursive} ApiSecurityRequirementRecursive */
/** @typedef {import('@api-client/amf-store').ApiParametrizedSecuritySchemeRecursive} ApiParametrizedSecuritySchemeRecursive */
/** @typedef {import('@api-client/amf-store').ApiSecuritySchemeRecursive} ApiSecuritySchemeRecursive */
/** @typedef {import('@api-client/amf-store').ApiSecurityHttpSettings} ApiSecurityHttpSettings */
/** @typedef {import('./AmfAuthorizationMethodElement').default} AmfAuthorizationMethodElement */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.RequestAuthorization} RequestAuthorization */

export const querySecurity = Symbol('querySecurity');
export const securityValue = Symbol('securityValue');
export const processModel = Symbol('processModel');
export const methodsValue = Symbol('methodsValue');
export const computeMethods = Symbol('computeMethods');
export const listSchemeLabels = Symbol('listSchemeLabels');
export const methodTemplate = Symbol('methodTemplate');
export const apiKeyTemplate = Symbol('apiKeyTemplate');
export const oa2AuthTemplate = Symbol('oa2AuthTemplate');
export const oa1AuthTemplate = Symbol('oa1AuthTemplate');
export const bearerAuthTemplate = Symbol('bearerAuthTemplate');
export const basicAuthTemplate = Symbol('basicAuthTemplate');
export const digestAuthTemplate = Symbol('digestAuthTemplate');
export const passThroughAuthTemplate = Symbol('passThroughAuthTemplate');
export const ramlCustomAuthTemplate = Symbol('ramlCustomAuthTemplate');
export const methodTitleTemplate = Symbol('methodTitleTemplate');
export const changeHandler = Symbol('changeHandler');
export const createSettings = Symbol('createSettings');

export default class AmfAuthorizationEditorElement extends AmfEditorsBase {
  static get styles() {
    return [elementStyles];
  }

  static get properties() {
    return {
      /**
       * Redirect URL for the OAuth2 authorization.
       */
      redirectUri: { type: String },
      // Current HTTP method. Passed by digest method.
      httpMethod: { type: String },
      // Current request URL. Passed by digest method.
      requestUrl: { type: String },
      // Current request body. Passed by digest method.
      requestBody: { type: String },
      /**
       * Whether or not the element is invalid. The validation state changes
       * when settings change or when the `validate()` function is called.
       */
      invalid: { type: Boolean, reflect: true },
      /**
       * List of credentials source
       */
      credentialsSource: { type: Array },
    };
  }

  constructor() {
    super();
    /** @type ApiSecurityRequirementRecursive */
    this[securityValue] = undefined;
    /** @type string */
    this.redirectUri = undefined;
    /** @type string */
    this.httpMethod = undefined;
    /** @type string */
    this.requestUrl = undefined;
    /** @type string */
    this.requestBody = undefined;
    /** @type any[] */
    this.credentialsSource = undefined;
  }

  /**
   * Queries for the security requirement.
   */
  async queryGraph() {
    if (this.querying) {
      return;
    }
    const { domainId } = this;
    this[queryingValue] = true;
    await this[querySecurity](domainId);
    this[processModel]();
    this[queryingValue] = false;
    await this.requestUpdate();
  }
  
  /**
   * @param {string} id The domain id of the security requirement.
   */
  async [querySecurity](id) {
    this[securityValue] = undefined;
    if (!id) {
      return;
    }
    try {
      const info = await StoreEvents.Security.getRequirementRecursive(this, id);
      // console.log(info);
      this[securityValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API operation data: ${e.message}`, this.localName);
    }
  }

  /**
   * Reads list of authorization methods from the model.
   */
  [processModel]() {
    const security = this[securityValue];
    if (!security) {
      return;
    }
    this[methodsValue] = this[computeMethods](security.schemes);
  }

  /**
   * Computes list of security schemes that can be applied to the element.
   *
   * @param {ApiParametrizedSecuritySchemeRecursive[]} schemes A list of security schemes to process.
   * @returns {any} A list of authorization methods that can be applied to
   * the current endpoint. Each object describes the list of security types
   * that can be applied to the editor. In OAS an auth method may be an union
   * of methods.
   */
  [computeMethods](schemes) {
    const result = {
      types: [],
      names: [],
      schemes: [],
    };
    schemes.forEach((security) => {
      const [type, name] = this[listSchemeLabels](security);
      if (!type || !name) {
        return;
      }
      result.types.push(type);
      result.names.push(name);
      result.schemes.push(security);
    });
    return result;
  }

  /**
   * Reads authorization scheme's name and type from the AMF model.
   * @param {ApiParametrizedSecuritySchemeRecursive} security
   * @return {string[]} First item is the type and the second is the name. May be undefined.
   */
  [listSchemeLabels](security) {
    const { name, scheme } = security;
    if (name === 'null') {
      // RAML allows to define a "null" scheme. This means that the authorization
      // for this endpoint is optional.
      return [name, 'No authorization'];
    }
    if (!scheme) {
      return [];
    }
    let { type } = scheme;
    if (type === 'http') {
      // HTTP type can be `basic` or `bearer`.
      const config = /** @type ApiSecurityHttpSettings */ (scheme.settings);
      if (!config) {
        // this happens when AMF doesn't properly read graph model back to the store.
        // AMF team promised to fix this...
        return [];
      }
      type = config.scheme;
    }
    return [type, name];
  }

  /**
   * A function called each time anything change in the editor.
   * Revalidates the component and dispatches the `change` event.
   */
  [changeHandler]() {
    this.validate();
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * Validates state of the editor. It sets `invalid` property when called.
   *
   * Exception: OAuth 2 form reports valid even when the `accessToken` is not
   * set. This adjust for this and reports invalid when `accessToken` for OAuth 2
   * is missing.
   *
   * @return {Boolean} True when the form has valid data.
   */
  validate() {
    const nodes = this.shadowRoot.querySelectorAll('amf-authorization-method');
    let valid = true;
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = /** @type AmfAuthorizationMethodElement */(nodes[i]);
      const result = node.validate();
      if (!result) {
        valid = result;
        break;
      } else if (node.type === 'oauth 2' && !node.accessToken) {
        valid = false;
        break;
      }
    }
    this.invalid = !valid;
    return valid;
  }

  /**
   * Creates a list of configuration by calling the `serialize()` function on each
   * currently rendered authorization form.
   *
   * @return {RequestAuthorization[]} List of authorization settings.
   */
  serialize() {
    const nodes = this.shadowRoot.querySelectorAll('amf-authorization-method');
    const result = [];
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = /** @type AmfAuthorizationMethodElement */(nodes[i]);
      result.push(this[createSettings](node));
    }
    return result;
  }

  /**
   * Creates an authorization settings object for passed authorization panel.
   * @param {AmfAuthorizationMethodElement} target api-authorization-method instance
   * @return {RequestAuthorization}
   */
  [createSettings](target) {
    const config = target.serialize();
    let valid = target.validate();
    const { type } = target;
    if (type === 'oauth 2' && !config.accessToken) {
      valid = false;
    }
    return {
      type,
      valid,
      config,
      enabled: true,
    };
  }

  render() {
    const methods = this[methodsValue];
    if (!methods || !methods.names.length) {
      return html``;
    }
    return html`
    <section class="authorization-union">
    ${methods.schemes.map((scheme, index) => this[methodTemplate](scheme, methods.types[index]))}
    </section>
    `;
  }

  /**
   * @param {ApiParametrizedSecuritySchemeRecursive} scheme
   * @param {string} type
   * @return {TemplateResult|string} 
   */
  [methodTemplate](scheme, type) {
    switch (type) {
      case 'Basic Authentication':
      case 'basic':
        return this[basicAuthTemplate](scheme);
      case 'Digest Authentication':
        return this[digestAuthTemplate](scheme);
      case 'Pass Through':
        return this[passThroughAuthTemplate](scheme);
      case 'OAuth 2.0':
        return this[oa2AuthTemplate](scheme);
      case 'OAuth 1.0':
        return this[oa1AuthTemplate](scheme);
      case 'bearer':
        return this[bearerAuthTemplate](scheme);
      case 'Api Key':
        return this[apiKeyTemplate](scheme);
      default:
        if (String(type).indexOf('x-') === 0) {
          return this[ramlCustomAuthTemplate](scheme);
        }
    }
    return '';
  }

  /**
   * Renders title to be rendered above authorization method
   * @param {ApiParametrizedSecuritySchemeRecursive} scheme Authorization scheme to be applied to the method
   * @return {TemplateResult|string}
   */
  [methodTitleTemplate](scheme) {
    const { name } = scheme;
    if (!name) {
      return '';
    }
    return html`<div class="auth-label">${name}</div>`;
  }

  /**
   * Renders a template for Basic authorization.
   *
   * @param {ApiParametrizedSecuritySchemeRecursive} security Security scheme
   * @return {TemplateResult}
   */
  [basicAuthTemplate](security) {
    const { anypoint } = this;
    return html`
    ${this[methodTitleTemplate](security)}
    <amf-authorization-method
      ?compatibility="${anypoint}"
      type="basic"
      @change="${this[changeHandler]}"
    ></amf-authorization-method>`;
  }

  /**
   * Renders a template for Digest authorization.
   *
   * @param {ApiParametrizedSecuritySchemeRecursive} security Security scheme
   * @param {boolean=} renderTitle
   * @return {TemplateResult}
   */
  [digestAuthTemplate](security, renderTitle) {
    const {
      anypoint,
      httpMethod,
      requestUrl,
      requestBody,
    } = this;
    return html`
    ${renderTitle ? this[methodTitleTemplate](security) : ''}
    <amf-authorization-method
      ?compatibility="${anypoint}"
      .httpMethod="${httpMethod}"
      .requestUrl="${requestUrl}"
      .requestBody="${requestBody}"
      type="digest"
      @change="${this[changeHandler]}"
    ></amf-authorization-method>`;
  }

  /**
   * Renders a template for Pass through authorization.
   *
   * @param {ApiParametrizedSecuritySchemeRecursive} security Security scheme
   * @param {boolean=} renderTitle
   * @return {TemplateResult}
   */
  [passThroughAuthTemplate](security, renderTitle) {
    const { anypoint } = this;
    return html`
    ${renderTitle ? this[methodTitleTemplate](security) : ''}
    <amf-authorization-method
      ?compatibility="${anypoint}"
      .security="${security}"
      type="pass through"
      @change="${this[changeHandler]}"
    ></amf-authorization-method>`;
  }

  /**
   * Renders a template for RAML custom authorization.
   *
   * @param {ApiParametrizedSecuritySchemeRecursive} security Security scheme
   * @return {TemplateResult}
   */
  [ramlCustomAuthTemplate](security) {
    const { anypoint } = this;
    return html`<amf-authorization-method
      ?compatibility="${anypoint}"
      .security="${security}"
      type="custom"
      @change="${this[changeHandler]}"
    ></amf-authorization-method>`;
  }

  /**
   * Renders a template for Bearer authorization (OAS).
   *
   * @param {ApiParametrizedSecuritySchemeRecursive} security Security scheme
   * @param {boolean=} renderTitle
   * @return {TemplateResult}
   */
  [bearerAuthTemplate](security, renderTitle) {
    const { anypoint } = this;
    return html`
    ${renderTitle ? this[methodTitleTemplate](security) : ''}
    <amf-authorization-method
      ?compatibility="${anypoint}"
      type="bearer"
      .security="${security}"
      @change="${this[changeHandler]}"
    ></amf-authorization-method>`;
  }

  /**
   * Renders a template for OAuth 1 authorization.
   *
   * @param {ApiParametrizedSecuritySchemeRecursive} security Security scheme
   * @param {boolean=} renderTitle
   * @return {TemplateResult}
   */
  [oa1AuthTemplate](security, renderTitle) {
    const { anypoint, redirectUri } = this;
    return html`
    ${renderTitle ? this[methodTitleTemplate](security) : ''}
    <amf-authorization-method
      ?compatibility="${anypoint}"
      type="oauth 1"
      .redirectUri="${redirectUri}"
      .security="${security}"
      @change="${this[changeHandler]}"
    ></amf-authorization-method>`;
  }

  /**
   * Renders a template for OAuth 2 authorization.
   *
   * @param {ApiParametrizedSecuritySchemeRecursive} security Security scheme
   * @return {TemplateResult}
   */
  [oa2AuthTemplate](security) {
    const {
      anypoint,
      redirectUri,
      credentialsSource
    } = this;
    return html`
    ${this[methodTitleTemplate](security)}
    <amf-authorization-method
      ?compatibility="${anypoint}"
      type="oauth 2"
      .redirectUri="${redirectUri}"
      .security="${security}"
      .credentialsSource="${credentialsSource}"
      @change="${this[changeHandler]}"
    ></amf-authorization-method>`;
  }

  /**
   * Renders a template for Api Keys authorization.
   *
   * @param {ApiParametrizedSecuritySchemeRecursive} security Security scheme
   * @return {TemplateResult}
   */
  [apiKeyTemplate](security) {
    const { anypoint } = this;
    return html`<amf-authorization-method
      ?compatibility="${anypoint}"
      type="api key"
      .security="${security}"
      @change="${this[changeHandler]}"
    ></amf-authorization-method>
    `;
  }
}
