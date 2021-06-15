/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store/worker.index.js';
import { Styles as HttpStyles } from '@api-components/http-method-label';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import elementStyles from './styles/ApiOperation.js';
import commonStyles from './styles/Common.js';
import '../../amf-request-document.js';
import '../../amf-response-document.js';
import '../../amf-security-requirement-document.js';
import { 
  AmfDocumentationBase, 
  paramsSectionTemplate,
  queryingValue,
} from './AmfDocumentationBase.js';
import { 
  tablePropertyTemplate,
} from './SchemaCommonTemplates.js';
import schemaStyles from './styles/SchemaCommon.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiEndPoint} ApiEndPoint */
/** @typedef {import('@api-client/amf-store').ApiServer} ApiServer */
/** @typedef {import('@api-client/amf-store').ApiOperation} ApiOperation */
/** @typedef {import('@api-client/amf-store').ApiResponse} ApiResponse */
/** @typedef {import('@api-client/amf-store').ApiStoreStateCreateEvent} ApiStoreStateCreateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateDeleteEvent} ApiStoreStateDeleteEvent */
/** @typedef {import('@anypoint-web-components/anypoint-tabs').AnypointTabs} AnypointTabs */

export const queryEndpoint = Symbol('queryEndpoint');
export const queryOperation = Symbol('queryOperation');
export const queryServers = Symbol('queryServers');
export const queryResponses = Symbol('queryResponses');
export const operationValue = Symbol('operationValue');
export const endpointValue = Symbol('endpointValue');
export const serversValue = Symbol('serversValue');
export const serverIdValue = Symbol('serverIdValue');
export const urlValue = Symbol('urlValue');
export const responsesValue = Symbol('responsesValue');
export const computeUrlValue = Symbol('computeUrlValue');
export const preselectResponse = Symbol('preselectResponse');
export const titleTemplate = Symbol('titleTemplate');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const urlTemplate = Symbol('urlTemplate');
export const requestTemplate = Symbol('requestTemplate');
export const responseTemplate = Symbol('responseTemplate');
export const responseTabsTemplate = Symbol('responseTabsTemplate');
export const responseContentTemplate = Symbol('responseContentTemplate');
export const operationUpdatedHandler = Symbol('operationUpdatedHandler');
export const endpointUpdatedHandler = Symbol('endpointUpdatedHandler');
export const serverCreatedHandler = Symbol('serverCreatedHandler');
export const serverUpdatedHandler = Symbol('serverUpdatedHandler');
export const serverDeletedHandler = Symbol('serverDeletedHandler');
export const statusCodeHandler = Symbol('statusCodeHandler');
export const securitySectionTemplate = Symbol('securitySectionTemplate');
export const deprecatedTemplate = Symbol('deprecatedTemplate');
export const metaDataTemplate = Symbol('metaDataTemplate');

/**
 * A web component that renders the documentation page for an API operation built from 
 * the AMF graph model.
 */
export default class AmfOperationDocumentElement extends AmfDocumentationBase {
  static get styles() {
    return [elementStyles, commonStyles, HttpStyles.default, MarkdownStyles, schemaStyles];
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
       * When set it opens the response section
       */
      responsesOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the security section
       */
      securityOpened: { type: Boolean, reflect: true },
      /** 
       * The selected status code in the responses section.
       */
      selectedStatus: { type: String },
    };
  }

  constructor() {
    super();
    /**
     * @type {ApiOperation}
     */
    this[operationValue] = undefined;
    /**
     * @type {ApiServer[]}
     */
    this[serversValue] = undefined;
    /**
     * @type {ApiEndPoint}
     */
    this[endpointValue] = undefined;
    /**
     * @type {string}
     */
    this[urlValue] = undefined;
    /**
     * @type {ApiResponse[]}
     */
    this[responsesValue] = undefined;
    /**
     * @type {string}
     */
    this.selectedStatus = undefined;

    this.responsesOpened = false;
    this.securityOpened = false;

    this[operationUpdatedHandler] = this[operationUpdatedHandler].bind(this);
    this[endpointUpdatedHandler] = this[endpointUpdatedHandler].bind(this);
    this[serverCreatedHandler] = this[serverCreatedHandler].bind(this);
    this[serverUpdatedHandler] = this[serverUpdatedHandler].bind(this);
    this[serverDeletedHandler] = this[serverDeletedHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(StoreEventTypes.Operation.State.updated, this[operationUpdatedHandler]);
    node.addEventListener(StoreEventTypes.Endpoint.State.updated, this[endpointUpdatedHandler]);
    node.addEventListener(StoreEventTypes.Server.State.created, this[serverCreatedHandler]);
    node.addEventListener(StoreEventTypes.Server.State.updated, this[serverUpdatedHandler]);
    node.addEventListener(StoreEventTypes.Server.State.deleted, this[serverDeletedHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(StoreEventTypes.Operation.State.updated, this[operationUpdatedHandler]);
    node.removeEventListener(StoreEventTypes.Endpoint.State.updated, this[endpointUpdatedHandler]);
    node.removeEventListener(StoreEventTypes.Server.State.created, this[serverCreatedHandler]);
    node.removeEventListener(StoreEventTypes.Server.State.updated, this[serverUpdatedHandler]);
    node.removeEventListener(StoreEventTypes.Server.State.deleted, this[serverDeletedHandler]);
  }

  /**
   * Queries the graph store for the API Operation data.
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
    await this[queryOperation](domainId);
    await this[queryResponses]();
    this[preselectResponse]();
    this[queryingValue] = false;
    this[computeUrlValue]();
    await this.requestUpdate();
  }

  /**
   * Queries for the API operation data.
   * @param {string} operationId The operation ID to read.
   */
  async [queryOperation](operationId) {
    this[operationValue] = undefined;
    try {
      const info = await StoreEvents.Operation.get(this, operationId);
      // console.log(info);
      this[operationValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API operation data: ${e.message}`, this.localName);
    }
  }

  /**
   * Queries for the API operation's endpoint data.
   * @param {string} operationId The operation ID.
   */
  async [queryEndpoint](operationId) {
    this[endpointValue] = undefined;
    try {
      const info = await StoreEvents.Operation.getParent(this, operationId);
      // console.log(info);
      this[endpointValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for Operation's parent data: ${e.message}`, this.localName);
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
   * Queries for the responses data of the current operation.
   */
  async [queryResponses]() {
    this[responsesValue] = undefined;
    const operation = this[operationValue];
    if (!operation) {
      return;
    }
    const { responses=[] } = operation;
    if (!responses.length) {
      return;
    }
    try {
      const ps = responses.map((id) => StoreEvents.Response.get(this, id));
      const data = await Promise.all(ps);
      this[responsesValue] = data;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for responses data: ${e.message}`, this.localName);
    }
  }

  /**
   * Updates the `selectedStatus` if not selected or the current selection doesn't 
   * exists in the current list of responses.
   */
  [preselectResponse]() {
    const responses = this[responsesValue];
    if (!Array.isArray(responses) || !responses.length) {
      return;
    }
    const { selectedStatus } = this;
    if (!selectedStatus) {
      this.selectedStatus = responses[0].statusCode;
      return;
    }
    const selected = responses.find((item) => item.statusCode === selectedStatus);
    if (selected) {
      return;
    }
    this.selectedStatus = responses[0].statusCode;
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
   * @param {ApiStoreStateUpdateEvent} e
   */
  [operationUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    if (graphId !== this.domainId) {
      return;
    }
    this[operationValue] = item;
    this[computeUrlValue]();
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  [endpointUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    const endpoint = this[endpointValue];
    if (!endpoint || graphId !== endpoint.id) {
      return;
    }
    this[endpointValue] = item;
    this[computeUrlValue]();
    this.requestUpdate();
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
   * A handler for the status code tab selection.
   * @param {Event} e
   */
  [statusCodeHandler](e) {
    const tabs = /** @type AnypointTabs */ (e.target);
    this.selectedStatus = String(tabs.selected);
  }

  render() {
    if (!this[operationValue]) {
      return html``;
    }
    return html`
    ${this[titleTemplate]()}
    ${this[deprecatedTemplate]()}
    ${this[descriptionTemplate]()}
    ${this[metaDataTemplate]()}
    ${this[urlTemplate]()}
    ${this[requestTemplate]()}
    ${this[responseTemplate]()}
    ${this[securitySectionTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the Operation title.
   */
  [titleTemplate]() {
    const operation = this[operationValue];
    const { name, method, deprecated, summary } = operation;
    const label = summary || name || method;
    const labelClasses = {
      label: true,
      deprecated,
    };
    return html`
    <div class="operation-header">
      <div class="operation-title">
        <span class="${classMap(labelClasses)}">${label}</span>
      </div>
      <p class="sub-header">API operation</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the Operation meta information.
   */
  [metaDataTemplate]() {
    const operation = this[operationValue];
    const { operationId, } = operation;
    const result = [];
    if (operationId) {
      result.push(tablePropertyTemplate('Operation ID', operationId));
    }

    if (result.length) {
      return result;
    }
    return '';
  }

  /**
   * @returns {TemplateResult|string} The template for the deprecated message.
   */
  [deprecatedTemplate]() {
    const operation = this[operationValue];
    const { deprecated } = operation;
    if (!deprecated) {
      return '';
    }
    return html`
    <div class="deprecated-message">
      <arc-icon icon="warning"></arc-icon>
      <span class="message">
      This operation is marked as deprecated.
      </span>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the markdown description.
   */
  [descriptionTemplate]() {
    const operation = this[operationValue];
    const { description } = operation;
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
    const operation = this[operationValue];
    const { method } = operation;
    return html`
    <div class="endpoint-url">
      <div class="method-label" data-method="${method}">${method}</div>
      <div class="url-value">${url}</div>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the operation's request documentation element.
   */
  [requestTemplate]() {
    const operation = this[operationValue];
    if (!operation || !operation.request) {
      return '';
    }
    return html`
    <amf-request-document .domainId="${operation.request}" payloadOpened headersOpened parametersOpened></amf-request-document>
    `;
  }

  [responseTemplate]() {
    const responses = this[responsesValue];
    if (!Array.isArray(responses) || !responses.length) {
      return '';
    }
    const content = html`
    ${this[responseTabsTemplate](responses)}
    ${this[responseContentTemplate](responses)}
    `;
    return this[paramsSectionTemplate]('Responses', 'responsesOpened', content);
  }

  /**
   * @param {ApiResponse[]} responses The responses to render.
   * @returns {TemplateResult} The template for the responses selector.
   */
  [responseTabsTemplate](responses) {
    const { selectedStatus } = this;
    const filtered = responses.filter((item) => !!item.statusCode);
    return html`
    <div class="status-codes-selector">
      <anypoint-tabs
        scrollable
        .selected="${selectedStatus}"
        attrForSelected="data-status"
        @selected="${this[statusCodeHandler]}"
      >
        ${filtered.map((item) => html`<anypoint-tab data-status="${item.statusCode}">${item.statusCode}</anypoint-tab>`)}
      </anypoint-tabs>
      <div class="codes-selector-divider"></div>
    </div>
    `;
  }

  /**
   * @param {ApiResponse[]} responses The responses to render.
   * @returns {TemplateResult} The template for the currently selected response.
   */
  [responseContentTemplate](responses) {
    const { selectedStatus } = this;
    const response = responses.find((item) => item.statusCode === selectedStatus);
    if (!response) {
      return html`<div class="empty-info">Select a response to render the documentation.</div>`;
    }
    return html`
    <amf-response-document .domainId="${response.id}" headersOpened payloadOpened></amf-response-document>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the security list section.
   */
  [securitySectionTemplate]() {
    const operation = this[operationValue];
    if (!operation || !Array.isArray(operation.security) || !operation.security.length) {
      return '';
    }
    const content = operation.security.map((id) => html`<amf-security-requirement-document .domainId="${id}"></amf-security-requirement-document>`);
    return this[paramsSectionTemplate]('Security', 'securityOpened', content);
  }
}
