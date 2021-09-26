/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store/worker.index.js';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import elementStyles from './styles/ApiResource.js';
import commonStyles from './styles/Common.js';
import '../../amf-operation-document.js'
import { 
  AmfDocumentationBase, 
  paramsSectionTemplate, 
  schemaItemTemplate,
  queryingValue,
} from './AmfDocumentationBase.js';
import '../../amf-parameter-document.js';
import { DescriptionEditMixin, updateDescription, descriptionTemplate } from './mixins/DescriptionEditMixin.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiEndPoint} ApiEndPoint */
/** @typedef {import('@api-client/amf-store').ApiServer} ApiServer */
/** @typedef {import('@api-client/amf-store').ApiStoreStateCreateEvent} ApiStoreStateCreateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateDeleteEvent} ApiStoreStateDeleteEvent */

export const operationIdValue = Symbol('operationIdValue');
export const queryEndpoint = Symbol('queryEndpoint');
export const queryServers = Symbol('queryServers');
export const endpointValue = Symbol('endpointValue');
export const serversValue = Symbol('serversValue');
export const serverIdValue = Symbol('serverIdValue');
export const urlValue = Symbol('urlValue');
export const computeUrlValue = Symbol('computeUrlValue');
export const titleTemplate = Symbol('titleTemplate');
export const urlTemplate = Symbol('urlTemplate');
export const operationsTemplate = Symbol('operationsTemplate');
export const operationTemplate = Symbol('operationTemplate');
export const parametersTemplate = Symbol('parametersTemplate');
export const serverCreatedHandler = Symbol('serverCreatedHandler');
export const serverUpdatedHandler = Symbol('serverUpdatedHandler');
export const serverDeletedHandler = Symbol('serverDeletedHandler');
export const operationCreatedHandler = Symbol('operationCreatedHandler');
export const operationDeletedHandler = Symbol('operationDeletedHandler');
export const endpointUpdatedHandler = Symbol('endpointUpdatedHandler');
export const operationIdChanged = Symbol('operationIdChanged');
export const editBlurHandler = Symbol('editBlurHandler');
export const editableKeydown = Symbol('editableKeydown');
export const commitNodeEditChange = Symbol('commitNodeEditChange');

/**
 * A web component that renders the documentation page for an API resource built from 
 * the AMF graph model.
 */
export default class AmfResourceDocumentationElement extends DescriptionEditMixin(AmfDocumentationBase) {
  static get styles() {
    return [elementStyles, commonStyles, MarkdownStyles];
  }

  get operationId() {
    return this[operationIdValue];
  }

  set operationId(value) {
    const old = this[operationIdValue];
    if (old === value) {
      return;
    }
    this[operationIdValue] = value;
    this.requestUpdate('operationId', old);
    this[operationIdChanged]();
  }

  get serverId() {
    return this[serverIdValue];
  }

  set serverId(value) {
    const old = this[serverIdValue];
    if (old === value) {
      return;
    }
    this[serverIdValue] = value;
    this[computeUrlValue]();
  }

  static get properties() {
    return {
      /** 
       * The id of the currently selected server to use to construct the URL.
       * If not set a first server in the API servers array is used.
       */
      serverId: { type: String, reflect: true },
      /** 
       * When set it scrolls to the operation with the given id, if exists.
       * The operation is performed after render.
       */
      operationId: { type: String, reflect: true },
      /** 
       * When set it opens the parameters section
       */
      parametersOpened: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    /**
     * @type {ApiEndPoint}
     */
    this[endpointValue] = undefined;
    /**
     * @type {ApiServer[]}
     */
    this[serversValue] = undefined;
    /**
     * @type {string}
     */
    this[urlValue] = undefined;

    this.parametersOpened = false;
    /**
     * @type {string}
     */
    this.operationId = undefined;

    this[serverCreatedHandler] = this[serverCreatedHandler].bind(this);
    this[serverUpdatedHandler] = this[serverUpdatedHandler].bind(this);
    this[serverDeletedHandler] = this[serverDeletedHandler].bind(this);
    this[operationCreatedHandler] = this[operationCreatedHandler].bind(this);
    this[operationDeletedHandler] = this[operationDeletedHandler].bind(this);
    this[endpointUpdatedHandler] = this[endpointUpdatedHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(StoreEventTypes.Server.State.created, this[serverCreatedHandler]);
    node.addEventListener(StoreEventTypes.Server.State.updated, this[serverUpdatedHandler]);
    node.addEventListener(StoreEventTypes.Server.State.deleted, this[serverDeletedHandler]);
    node.addEventListener(StoreEventTypes.Operation.State.created, this[operationCreatedHandler]);
    node.addEventListener(StoreEventTypes.Operation.State.deleted, this[operationDeletedHandler]);
    node.addEventListener(StoreEventTypes.Endpoint.State.updated, this[endpointUpdatedHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(StoreEventTypes.Server.State.created, this[serverCreatedHandler]);
    node.removeEventListener(StoreEventTypes.Server.State.updated, this[serverUpdatedHandler]);
    node.removeEventListener(StoreEventTypes.Server.State.deleted, this[serverDeletedHandler]);
    node.removeEventListener(StoreEventTypes.Operation.State.created, this[operationCreatedHandler]);
    node.removeEventListener(StoreEventTypes.Operation.State.deleted, this[operationDeletedHandler]);
    node.removeEventListener(StoreEventTypes.Endpoint.State.updated, this[endpointUpdatedHandler]);
  }

  /**
   * Queries the graph store for the API Endpoint data.
   * @returns {Promise<void>}
   */
  async queryGraph() {
    if (this.querying) {
      return;
    }
    const { domainId } = this;
    this[queryingValue] = true;
    await this[queryEndpoint](domainId);
    await this[queryServers]();
    this[queryingValue] = false;
    this[computeUrlValue]();
    await this.requestUpdate();
    if (this.operationId) {
      // this timeout gives few milliseconds for the operations to render.
      setTimeout(() => {
        // Todo: operations should inform the parent that the view is rendered
        // and after that this function should be called.
        this.scrollToOperation(this.operationId);
      }, 200);
    }
  }

  /**
   * Scrolls the view to the operation, when present in the DOM.
   * @param {string} id The operation domain id to scroll into.
   */
  scrollToOperation(id) {
    const elm = this.shadowRoot.querySelector(`amf-operation-document[domainId="${id}"]`);
    if (!elm) {
      return;
    }
    elm.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
  }

  /**
   * Scrolls to the selected operation after view update.
   */
  async [operationIdChanged]() {
    await this.updateComplete;
    const { operationId } = this;
    if (operationId) {
      this.scrollToOperation(operationId);
    } else {
      this.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
    }
  }

  /**
   * Queries for the API operation's endpoint data.
   * @param {string} resourceId The operation ID.
   */
  async [queryEndpoint](resourceId) {
    this[endpointValue] = undefined;
    try {
      const info = await StoreEvents.Endpoint.get(this, resourceId);
      // console.log(info);
      this[endpointValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for EndPoint data: ${e.message}`, this.localName);
    }
  }

  /**
   * Queries for the current servers value.
   */
  async [queryServers]() {
    this[serversValue] = undefined;
    try {
      const info = await StoreEvents.Server.list(this);
      // console.log(info);
      this[serversValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for servers data: ${e.message}`, this.localName);
    }
  }

  /**
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue]() {
    const servers = this[serversValue];
    const endpoint = this[endpointValue];
    const serverId = this[serverIdValue];
    let result = '';
    let server;
    if (Array.isArray(servers) && servers.length) {
      if (serverId) {
        server = servers.find((item) => item.id === serverId);
      } else {
        [server] = servers;
      }
    }
    if (server) {
      result += server.url;
      if (result.endsWith('/')) {
        result = result.substr(0, result.length - 1);
      }
    }
    if (endpoint) {
      let { path='' } = endpoint;
      if (path[0] !== '/') {
        path = `/${path}`;
      }
      result += path;
    }
    if (!result) {
      result = '(unknown path)';
    }
    this[urlValue] = result;
  }

  /**
   * @param {ApiStoreStateCreateEvent} e
   */
  [serverCreatedHandler](e) {
    const { item } = e.detail;
    const servers = this[serversValue] || [];
    servers.push(item)
    this[serversValue] = servers;
    this[computeUrlValue]();
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  [serverUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    const servers = this[serversValue];
    if (!Array.isArray(servers) || !servers.length) {
      return;
    }
    const index = servers.findIndex((s) => s.id === graphId);
    if (index === -1) {
      return;
    }
    servers[index] = item;
    this[computeUrlValue]();
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateDeleteEvent} e
   */
  [serverDeletedHandler](e) {
    const { graphId } = e.detail;
    const servers = this[serversValue];
    if (!Array.isArray(servers) || !servers.length) {
      return;
    }
    const index = servers.findIndex((s) => s.id === graphId);
    if (index === -1) {
      return;
    }
    servers.splice(index, 1);
    this[computeUrlValue]();
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateCreateEvent} e
   */
  [operationCreatedHandler](e) {
    const { graphId, domainParent } = e.detail;
    if (!this.domainId || domainParent !== this.domainId) {
      return;
    }
    const endPoint = this[endpointValue];
    const { operations } = endPoint;
    operations.push(graphId);
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateDeleteEvent} e
   */
  async [operationDeletedHandler](e) {
    // const { graphId, domainParent } = e.detail;
    // if (!this.domainId || domainParent !== this.domainId) {
    //   return;
    // }
    // const endPoint = this[endpointValue];
    // const { operations } = endPoint;
    // const index = operations.findIndex((id) => id === graphId);
    // if (index !== -1) {
    //   operations.splice(index, 1);
    //   this.requestUpdate();
    // }
    const { domainParent } = e.detail;
    if (!this.domainId || domainParent !== this.domainId) {
      return;
    }
    await this[queryEndpoint](this.domainId);
    await this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  [endpointUpdatedHandler](e) {
    const { graphId, item, property } = e.detail;
    if (graphId !== this.domainId) {
      return;
    }
    if (!['name', 'description', 'path'].includes(property)) {
      return;
    }
    this[endpointValue] = item;
    if (property === 'path') {
      this[computeUrlValue]();
    }
    this.requestUpdate();
  }

  [editBlurHandler](e) {
    const node = /** @type HTMLElement */ (e.target);
    this[commitNodeEditChange](node);
  }

  /**
   * @param {HTMLElement} node
   * @return {Promise<void>} 
   */
  async [commitNodeEditChange](node) {
    const value = node.textContent;
    const { property } = node.dataset;
    const endPoint = this[endpointValue];
    if (endPoint[property] === value) {
      return;
    }
    await StoreEvents.Endpoint.update(this, this.domainId, property, value);
  }

  /**
   * @param {KeyboardEvent} e
   */
  [editableKeydown](e) {
    const node = /** @type HTMLElement */ (e.target);
    const { multiline } = node.dataset;
    if (multiline !== 'true' && e.code === 'Enter') {
      node.blur();
      e.preventDefault();
    }
  }

  /**
   * Updates the description of the endpoint.
   * @param {string} markdown The new markdown to set.
   * @return {Promise<void>} 
   */
  async [updateDescription](markdown) {
    await StoreEvents.Endpoint.update(this, this.domainId, 'description', markdown);
    this[endpointValue].description = markdown;
  }

  render() {
    if (!this[endpointValue]) {
      return html``;
    }
    return html`
    ${this[titleTemplate]()}
    ${this[descriptionTemplate](this[endpointValue].description)}
    ${this[urlTemplate]()}
    ${this[parametersTemplate]()}
    ${this[operationsTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the Operation title.
   */
  [titleTemplate]() {
    const { edit } = this;
    const endPoint = this[endpointValue];
    const { name, path } = endPoint;
    const label = name || path;
    if (!label) {
      return '';
    }
    const blurHandler = edit ? this[editBlurHandler] : undefined;
    const keyHandler = edit ? this[editableKeydown] : undefined;
    return html`
    <div class="endpoint-header">
      <div class="endpoint-title">
        <span 
          class="label" 
          contentEditable="${ifDefined(edit ? 'plaintext-only' : undefined)}"
          data-property="${ifDefined(edit ? 'name': undefined)}"
          data-multiline="false"
          @blur="${blurHandler}"
          @keydown="${keyHandler}"
        >${label}</span>
      </div>
      <p class="sub-header">API endpoint</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the operation's URL.
   */
  [urlTemplate]() {
    const url = this[urlValue];
    return html`
    <div class="endpoint-url">
      <div class="url-value">${url}</div>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the list of operations.
   */
  [operationsTemplate]() {
    const endPoint = this[endpointValue];
    const { operations } = endPoint;
    if (!operations.length) {
      return '';
    }
    return html`
    ${operations.map((id) => this[operationTemplate](id))}
    `;
  }

  /**
   * @param {string} id The graph id of the operation.
   * @returns {TemplateResult} The template for the API operation.
   */
  [operationTemplate](id) {
    const { serverId, edit } = this;
    return html`<amf-operation-document 
      .domainId="${id}" 
      .serverId="${serverId}" 
      responsesOpened
      ?edit="${edit}"></amf-operation-document>`;
  }

  /**
   * @return {TemplateResult|string} The template for the endpoint's URI params.
   */
  [parametersTemplate]() {
    const endPoint = this[endpointValue];
    const { parameters } = endPoint;
    if (!parameters.length) {
      return '';
    }
    const content = parameters.map((id) => this[schemaItemTemplate](id));
    return this[paramsSectionTemplate]('URI parameters', 'parametersOpened', content);
  }
}
