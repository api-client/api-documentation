/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import elementStyles from './styles/ApiResource.js';
import commonStyles from './styles/Common.js';
import '../../amf-operation-document.js'
import { AmfDocumentationBase, paramsSectionTemplate, schemaItemTemplate } from './AmfDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiEndPoint} ApiEndPoint */
/** @typedef {import('@api-client/amf-store').ApiServer} ApiServer */
/** @typedef {import('@api-client/amf-store').ApiStoreStateCreateEvent} ApiStoreStateCreateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateDeleteEvent} ApiStoreStateDeleteEvent */

export const resourceIdValue = Symbol('resourceId');
export const queryingValue = Symbol('queryingValue');
export const queryEndpoint = Symbol('queryEndpoint');
export const queryServers = Symbol('queryServers');
export const endpointValue = Symbol('endpointValue');
export const serversValue = Symbol('serversValue');
export const serverIdValue = Symbol('serverIdValue');
export const urlValue = Symbol('urlValue');
export const computeUrlValue = Symbol('computeUrlValue');
export const titleTemplate = Symbol('titleTemplate');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const urlTemplate = Symbol('urlTemplate');
export const operationsTemplate = Symbol('operationsTemplate');
export const operationTemplate = Symbol('operationTemplate');
export const parametersTemplate = Symbol('parametersTemplate');
export const serverCreatedHandler = Symbol('serverCreatedHandler');
export const serverUpdatedHandler = Symbol('serverUpdatedHandler');
export const serverDeletedHandler = Symbol('serverDeletedHandler');
export const operationCreatedHandler = Symbol('operationCreatedHandler');
export const operationDeletedHandler = Symbol('operationDeletedHandler');

/**
 * A web component that renders the documentation page for an API resource built from 
 * the AMF graph model.
 */
export default class AmfResourceDocumentationElement extends AmfDocumentationBase {
  static get styles() {
    return [elementStyles, commonStyles, markdownStyles];
  }

  /** 
   * @returns {string|undefined} The domain id of the resource to render.
   */
  get resourceId() {
    return this[resourceIdValue];
  }

  /** 
   * @returns {string|undefined} The domain id of the resource to render.
   */
  set resourceId(value) {
    const old = this[resourceIdValue];
    if (old === value) {
      return;
    }
    this[resourceIdValue] = value;
    this.requestUpdate('resourceId', value);
    if (value) {
      setTimeout(() => this.queryGraph(value));
    }
  }

  /** 
   * @returns {boolean} When true then the element is currently querying for the graph data.
   */
  get querying() {
    return this[queryingValue] || false;
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
       * The domain id of the resource to render.
       */
      resourceId: { type: String, reflect: true },
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

    this[serverCreatedHandler] = this[serverCreatedHandler].bind(this);
    this[serverUpdatedHandler] = this[serverUpdatedHandler].bind(this);
    this[serverDeletedHandler] = this[serverDeletedHandler].bind(this);
    this[operationCreatedHandler] = this[operationCreatedHandler].bind(this);
    this[operationDeletedHandler] = this[operationDeletedHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.resourceId) {
      this.queryGraph(this.resourceId);
    }
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
  }

  /**
   * Queries the graph store for the API Endpoint data.
   * @param {string} resourceId The resource id to render the documentation for.
   * @returns {Promise<void>}
   */
  async queryGraph(resourceId) {
    if (this.querying) {
      return;
    }
    this[queryingValue] = true;
    await this[queryEndpoint](resourceId);
    await this[queryServers]();
    this[queryingValue] = false;
    this[computeUrlValue]();
    await this.requestUpdate();
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
    if (!this.resourceId || domainParent !== this.resourceId) {
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
    // if (!this.resourceId || domainParent !== this.resourceId) {
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
    if (!this.resourceId || domainParent !== this.resourceId) {
      return;
    }
    await this[queryEndpoint](this.resourceId);
    await this.requestUpdate();
  }

  render() {
    if (!this[endpointValue]) {
      return html``;
    }
    return html`
    ${this[titleTemplate]()}
    ${this[descriptionTemplate]()}
    ${this[urlTemplate]()}
    ${this[parametersTemplate]()}
    ${this[operationsTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the Operation title.
   */
  [titleTemplate]() {
    const endPoint = this[endpointValue];
    const { name, path } = endPoint;
    const label = name || path;
    if (!label) {
      return '';
    }
    return html`
    <div class="endpoint-header">
      <div class="endpoint-title">
        <span class="label">${label}</span>
      </div>
      <p class="sub-header">API endpoint</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the markdown description.
   */
  [descriptionTemplate]() {
    const endPoint = this[endpointValue];
    const { description } = endPoint;
    if (!description) {
      return '';
    }
    return html`
    <div class="api-description">
      <arc-marked .markdown="${description}" sanitize>
        <div slot="markdown-html" class="markdown-body"></div>
      </arc-marked>
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
    const { serverId } = this;
    return html`<amf-operation-document .operationId="${id}" .serverId="${serverId}" responsesOpened></amf-operation-document>`;
  }

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
