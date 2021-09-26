/* eslint-disable class-methods-use-this */
import { html } from "lit-element";
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store/worker.index.js';
import { TransportEvents, RequestEventTypes } from '@advanced-rest-client/arc-events';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import { HeadersParser } from "@advanced-rest-client/arc-headers";
import { v4 } from '@advanced-rest-client/uuid-generator';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@advanced-rest-client/body-editor/body-formdata-editor.js';
import '@advanced-rest-client/body-editor/body-multipart-editor.js';
import '@advanced-rest-client/body-editor/body-raw-editor.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import { ifProperty } from "@advanced-rest-client/body-editor";
import elementStyles from './styles/HttpRequest.js';
import { AmfInputParser } from "../lib/AmfInputParser.js";
import { ensureContentType, generateHeaders } from "../lib/Utils.js";
import { applyUrlParameters, applyUrlVariables, computeEndpointUrlValue } from "../lib/UrlUtils.js";
import { cachePayloadValue, getPayloadValue, readCachePayloadValue } from "./PayloadUtils.js";
import * as InputCache from '../lib/InputCache.js';
import { AmfEditorsBase, queryingValue, queryEndpoint, queryOperation, queryServers, operationValue, endpointValue, serversValue } from './AmfEditorsBase.js';
import '../../amf-authorization-editor.js';
import { AmfParameterMixin, parametersValue, nilValues, parameterTemplate } from './mixins/AmfParameterMixin.js';
import { SecurityProcessor } from "../lib/SecurityProcessor.js";


/** @typedef {import('@api-client/amf-store').ApiStoreStateCreateEvent} ApiStoreStateCreateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateDeleteEvent} ApiStoreStateDeleteEvent */
/** @typedef {import('@api-client/amf-store').ApiServer} ApiServer */
/** @typedef {import('@api-client/amf-store').ApiRequest} ApiRequest */
/** @typedef {import('@api-client/amf-store').ApiPayload} ApiPayload */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-client/amf-store').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-client/amf-store').ApiFileShape} ApiFileShape */
/** @typedef {import('@api-client/amf-store').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('@api-client/amf-store').ApiAnyShape} ApiAnyShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiTupleShape} ApiTupleShape */
/** @typedef {import('@api-client/amf-store').ApiExample} ApiExample */
/** @typedef {import('@api-client/amf-store').ApiArrayNode} ApiArrayNode */
/** @typedef {import('@api-client/amf-store').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-client/amf-store').ApiParameterRecursive} ApiParameterRecursive */
/** @typedef {import('@api-client/amf-store').ApiPayloadRecursive} ApiPayloadRecursive */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */
/** @typedef {import('@anypoint-web-components/anypoint-input').SupportedInputTypes} SupportedInputTypes */
/** @typedef {import('@anypoint-web-components/anypoint-checkbox').AnypointCheckbox} AnypointCheckbox */
/** @typedef {import('@anypoint-web-components/anypoint-radio-button/index').AnypointRadioGroupElement} AnypointRadioGroupElement */
/** @typedef {import('@advanced-rest-client/body-editor').BodyRawEditorElement} BodyRawEditorElement */
/** @typedef {import('@advanced-rest-client/body-editor').BodyFormdataEditorElement} BodyFormdataEditorElement */
/** @typedef {import('@advanced-rest-client/arc-types').ApiTypes.ApiType} ApiType */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.ArcBaseRequest} ArcBaseRequest */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.RequestAuthorization} RequestAuthorization */
/** @typedef {import('../types').OperationParameter} OperationParameter */
/** @typedef {import('../types').SecuritySelectorListItem} SecuritySelectorListItem */

const serverIdValue = Symbol('serverIdValue');
const computeUrlValue = Symbol('computeUrlValue');
const processOperation = Symbol('processOperation');
const operationUpdatedHandler = Symbol('operationUpdatedHandler');
const endpointUpdatedHandler = Symbol('endpointUpdatedHandler');
const serverCreatedHandler = Symbol('serverCreatedHandler');
const serverUpdatedHandler = Symbol('serverUpdatedHandler');
const serverDeletedHandler = Symbol('serverDeletedHandler');
const payloadCreatedHandler = Symbol('payloadCreatedHandler');
const payloadDeletedHandler = Symbol('payloadDeletedHandler');
const mediaTypeSelectHandler = Symbol('mediaTypeSelectHandler');
const urlValue = Symbol('urlValue');
const preselectServer = Symbol('preselectServer');
const serversSectionTemplate = Symbol('serversSectionTemplate');
const serverItemTemplate = Symbol('serverItemTemplate');
const serverChangeHandler = Symbol('serverChangeHandler');
const queryParameters = Symbol('queryParameters');
const updateServerParameters = Symbol('updateServerParameters');
const updateEndpointParameters = Symbol('updateEndpointParameters');
const parametersTemplate = Symbol('parametersTemplate');
const headersTemplate = Symbol('headersTemplate');
const appendToParams = Symbol('appendToParams');
const mainActionTemplate = Symbol('mainActionTemplate');
const sendClickHandler = Symbol('sendClickHandler');
const bodyTemplate = Symbol('bodyTemplate');
const mediaTypeSelectorTemplate = Symbol('mediaTypeSelectorTemplate');
const rawBodyChangeHandler = Symbol('rawBodyChangeHandler');
const modelBodyEditorChangeHandler = Symbol('urlEncodeChangeHandler');
const formDataEditorTemplate = Symbol('formDataEditorTemplate');
const multipartEditorTemplate = Symbol('multipartEditorTemplate');
const rawEditorTemplate = Symbol('rawEditorTemplate');
const authorizationTemplate = Symbol('authorizationTemplate');
const authorizationSelectorTemplate = Symbol('authorizationSelectorTemplate');
const processSecurity = Symbol('processSecurity');
const securityList = Symbol('securityList');
const selectedSecurity = Symbol('selectedSecurity');
const authorizationSelectorItemTemplate = Symbol('authorizationSelectorItemTemplate');
const authSelectorHandler = Symbol('authSelectorHandler');
const internalSendHandler = Symbol('internalSendHandler');

/**
 * A class that creates an editor for for an HTTP request based on the AMF entry.
 */
export default class AmfHttpRequestElement extends AmfParameterMixin(AmfEditorsBase) {
  static get styles() {
    return [elementStyles];
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
    this[updateServerParameters]();
  }

  /**
   * @returns {ApiPayloadRecursive|undefined} The currently rendered payload, if any.
   */
  get payload() {
    const { payloads } = this;
    if (!payloads) {
      return undefined;
    }
    const { mimeType } = this;
    /** @type ApiPayloadRecursive */
    let payload;
    if (mimeType) {
      payload = payloads.find(i => i.mediaType === mimeType);
    }
    if (!payload) {
      [payload] = payloads;
    }
    return payload;
  }

  /**
   * @type {ApiPayloadRecursive[]|undefined}
   */
  get payloads() {
    const operation = this[operationValue];
    if (!operation) {
      return undefined;
    }
    const { request } = operation;
    if (!request) {
      return undefined;
    }
    const { payloads } = request;
    if (!Array.isArray(payloads) || !payloads.length) {
      return undefined;
    }
    return payloads;
  }

  static get properties() {
    return {
      /** 
       * The currently selected media type for the payloads.
       */
      mimeType: { type: String, reflect: true, },
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       */
      oauth2RedirectUri: { type: String },
      /** 
       * When set it overrides the `authorizationUri` in the authorization editor,
       * regardless to the authorization scheme applied to the request.
       * This is to be used with the mocking service.
       */
      oauth2AuthorizationUri: { type: String },
      /** 
       * When set it overrides the `authorizationUri` in the authorization editor,
       * regardless to the authorization scheme applied to the request.
       * This is to be used with the mocking service.
       */
      oauth2AccessTokenUri: { type: String },
      /**
       * List of credentials source
       */
      credentialsSource: { type: Array },
    };
  }

  constructor() {
    super();
    /**
     * @type {string}
     */
    this.mimeType = undefined;
    /**
     * @type {string}
     */
    this[urlValue] = undefined;
    /** @type number */
    this[selectedSecurity] = undefined;
    /** @type string */
    this.oauth2RedirectUri = undefined;
    /** @type string */
    this.oauth2AuthorizationUri = undefined;
    /** @type string */
    this.oauth2AccessTokenUri = undefined;
    /** @type any[] */
    this.credentialsSource = undefined;
    
    this[operationUpdatedHandler] = this[operationUpdatedHandler].bind(this);
    this[endpointUpdatedHandler] = this[endpointUpdatedHandler].bind(this);
    this[serverCreatedHandler] = this[serverCreatedHandler].bind(this);
    this[serverUpdatedHandler] = this[serverUpdatedHandler].bind(this);
    this[serverDeletedHandler] = this[serverDeletedHandler].bind(this);
    this[payloadCreatedHandler] = this[payloadCreatedHandler].bind(this);
    this[payloadDeletedHandler] = this[payloadDeletedHandler].bind(this);
    this[internalSendHandler] = this[internalSendHandler].bind(this);
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
    node.addEventListener(StoreEventTypes.Payload.State.created, this[payloadCreatedHandler]);
    node.addEventListener(StoreEventTypes.Payload.State.deleted, this[payloadDeletedHandler]);
    this.addEventListener(RequestEventTypes.send, this[internalSendHandler]);
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
    node.removeEventListener(StoreEventTypes.Payload.State.created, this[payloadCreatedHandler]);
    node.removeEventListener(StoreEventTypes.Payload.State.deleted, this[payloadDeletedHandler]);
    this.removeEventListener(RequestEventTypes.send, this[internalSendHandler]);
  }

  /**
   * The main function to use to query the graph for the model being rendered.
   * To be implemented by the child classes.
   */
  async queryGraph() {
    if (this.querying) {
      return;
    }
    this.mimeType = undefined;
    const { domainId } = this;
    this[queryingValue] = true;
    await this[queryEndpoint](domainId);
    await this[updateEndpointParameters]();
    await this[queryServers]();
    await this[queryOperation](domainId);
    this[processOperation]();
    this[processSecurity]();
    this[preselectServer]();
    await this[updateServerParameters]();
    this[queryingValue] = false;
    this[computeUrlValue]();
    await this.requestUpdate();
  }

  /**
   * Collects operations input parameters into a single object.
   */
  [processOperation]() {
    const source = 'request';
    const operation = this[operationValue];
    // clears previously set request parameters (query, path, headers)
    this[parametersValue] = this[parametersValue].filter(item => item.source !== source);
    const { request } = operation;
    if (!request) {
      return;
    }
    this[appendToParams](request.queryParameters, source);
    this[appendToParams](request.headers, source);
    this[appendToParams](request.cookieParameters, source);
  }

  /**
   * Processes security information for the UI.
   */
  [processSecurity]() {
    const operation = this[operationValue];
    const { security } = operation;
    this[securityList] = SecurityProcessor.readSecurityList(security);
    this[selectedSecurity] = 0;
  }

  /**
   * Appends a list of parameters to the list of rendered parameters
   * @param {ApiParameterRecursive[]} list
   * @param {string} source
   */
  [appendToParams](list, source) {
    const params = this[parametersValue];
    if (Array.isArray(list)) {
      list.forEach((param) => {
        params.push({
          paramId: param.id,
          parameter: param,
          binding: param.binding,
          source,
          schema: param.schema,
          schemaId: param.schema && param.schema.id ? param.schema.id : undefined,
        });
      });
    }
  }

  /**
   * Queries for parameters in bulk
   * @param {string[]} ids
   * @param {string} source
   * @returns {Promise<OperationParameter[]>} 
   */
  async [queryParameters](ids, source) {
    if (!Array.isArray(ids) || !ids.length) {
      return undefined;
    }
    /** @type OperationParameter[] */
    let result;
    try {
      const list = await StoreEvents.Parameter.getBulkRecursive(this, ids);
      const filteredParams = list.filter(param => !!param);
      result = filteredParams.map((param) => {
        const item = /** @type OperationParameter */ ({
          binding: param.binding,
          paramId: param.id,
          parameter: param,
          source,
        });
        if (param.schema) {
          item.schema = param.schema;
          item.schemaId = param.schema.id;
        }
        return item;
      });
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for parameters data: ${e.message}`, this.localName);
    }
    return result;
  }

  /**
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue]() {
    const result = computeEndpointUrlValue(this[endpointValue], this[serversValue], this[serverIdValue]);
    this[urlValue] = result;
  }

  /**
   * Called when anything server related changed to check whether there is 
   * a valid sever selection and whether a server should be selected.
   */
  [preselectServer]() {
    const servers = this[serversValue];
    const serverId = this[serverIdValue];
    if (!Array.isArray(servers) || !servers.length) {
      // do nothing, including cleaning the server id value.
      // this can change in the future when the same operation is restored.
      return;
    }
    if (serverId) {
      const hasSelected = servers.some((item) => item.id === serverId);
      if (hasSelected) {
        return;
      }
    }
    // pre-select the first server on the list.
    const [server] = servers;
    this[serverIdValue] = server.id;
  }

  /**
   * Checks if the current server has variables and requests them when needed.
   */
  async [updateServerParameters]() {
    const source = 'server';
    // clears previously set request parameters related to server configuration.
    this[parametersValue] = this[parametersValue].filter(item => item.source !== source);
    const servers = this[serversValue];
    const serverId = this[serverIdValue];
    if (!serverId || !Array.isArray(servers) || !servers.length) {
      return;
    }
    let params = this[parametersValue];
    const server = servers.find(i => i.id === serverId);
    if (!server) {
      return;
    }
    if (Array.isArray(server.variables) && server.variables.length) {
      const items = await this[queryParameters](server.variables, source);
      if (items) {
        params = params.concat(items);
      }
    }
    this[parametersValue] = params;
  }

  /**
   * Checks if the current endpoint has variables and requests them when needed.
   */
  async [updateEndpointParameters]() {
    const source = 'endpoint';
    // clears previously set request parameters related to server configuration.
    this[parametersValue] = this[parametersValue].filter(item => item.source !== source);
    const endpoint = this[endpointValue];
    if (!endpoint) {
      return;
    }
    let params = this[parametersValue];
    if (Array.isArray(endpoint.parameters) && endpoint.parameters.length) {
      const items = await this[queryParameters](endpoint.parameters, source);
      if (items) {
        params = params.concat(items);
      }
    }
    this[parametersValue] = params;
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  async [operationUpdatedHandler](e) {
    const { graphId } = e.detail;
    if (graphId !== this.domainId) {
      return;
    }
    await this[queryOperation](graphId);
    this[processOperation]();
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
  async [serverCreatedHandler](e) {
    const { item } = e.detail;
    const servers = this[serversValue] || [];
    servers.push(item)
    this[serversValue] = servers;
    this[computeUrlValue]();
    await this[updateServerParameters]();
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  async [serverUpdatedHandler](e) {
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
    await this[updateServerParameters]();
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateDeleteEvent} e
   */
  async [serverDeletedHandler](e) {
    const { graphId } = e.detail;
    const servers = this[serversValue];
    if (!Array.isArray(servers) || !servers.length) {
      return;
    }
    const index = servers.findIndex(s => s.id === graphId);
    if (index === -1) {
      return;
    }
    servers.splice(index, 1);
    this[computeUrlValue]();
    if (graphId === this[serverIdValue]) {
      this[serverIdValue] = undefined;
      this[preselectServer]();
      await this[updateServerParameters]();
    }
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateCreateEvent} e
   */
  async [payloadCreatedHandler](e) {
    const { domainParent, graphId } = e.detail;
    const operation = this[operationValue];
    if (!operation) {
      return;
    }
    if (operation.request && domainParent === operation.request.id) {
      const value = await StoreEvents.Payload.getRecursive(this, graphId);
      if (!Array.isArray(operation.request.payloads)) {
        operation.request.payloads = [];
      }
      operation.request.payloads.push(value);
      this.requestUpdate();
      return;
    }
    if (!Array.isArray(operation.responses) || !operation.responses.length) {
      return;
    }
    const response = operation.responses.find(r => r.id === domainParent);
    if (!response) {
      return;
    }
    const value = await StoreEvents.Payload.getRecursive(this, graphId);
    if (!response.payloads) {
      response.payloads = [];
    }
    response.payloads.push(value);
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateDeleteEvent} e
   */
  [payloadDeletedHandler](e) {
    const { domainParent, graphId } = e.detail;
    const operation = this[operationValue];
    if (!operation) {
      return;
    }
    if (operation.request && domainParent === operation.request.id) {
      if (!Array.isArray(operation.request.payloads)) {
        operation.request.payloads = [];
      }
      const index = operation.request.payloads.findIndex(p => p.id === graphId);
      if (index >= 0) {
        operation.request.payloads.splice(index, 1);
        this.requestUpdate();
      }
      return;
    }
    if (!Array.isArray(operation.responses) || !operation.responses.length) {
      return;
    }
    const response = operation.responses.find(r => r.id === domainParent);
    if (!response) {
      return;
    }
    if (!response.payloads) {
      response.payloads = [];
    }
    const index = response.payloads.findIndex(p => p.id === graphId);
    if (index >= 0) {
      response.payloads.splice(index, 1);
      this.requestUpdate();
    }
  }

  /**
   * @param {Event} e
   */
  [mediaTypeSelectHandler](e) {
    const select = /** @type AnypointRadioGroupElement */ (e.target);
    const { selected } = select;
    const mime = String(selected);
    this.mimeType = mime;
  }

  /**
   * @param {Event} e
   */
  [serverChangeHandler](e) {
    const select = /** @type AnypointListbox */ (e.target);
    const serverId = String(select.selected);
    this.serverId = serverId;
  }

  /**
   * Handler for the send button click.
   */
  [sendClickHandler]() {
    this.send();
  }

  /**
   * A handler for the change event dispatched by the `raw` editor.
   * @param {Event} e
   */
  [rawBodyChangeHandler](e) {
    const editor = /** @type BodyRawEditorElement */ (e.target);
    const { value, dataset } = editor;
    const { payloadId } = dataset;
    if (!payloadId) {
      return;
    }
    cachePayloadValue(payloadId, value);
  }

  /**
   * A handler for the change event dispatched by the 
   * `urlEncode` editor.
   * Updated the local value, model, and notifies the change.
   * @param {Event} e
   */
  [modelBodyEditorChangeHandler](e) {
    const editor = /** @type BodyFormdataEditorElement */ (e.target);
    const { value, model, dataset } = editor;
    const { payloadId } = dataset;
    if (!payloadId) {
      return;
    }
    cachePayloadValue(payloadId, value, model);
  }

  /**
   * @param {Event} e
   */
  [authSelectorHandler](e) {
    const list = /** @type AnypointListbox */ (e.target);
    const { selected } = list;
    this[selectedSecurity] = Number(selected);
    this.requestUpdate();
  }

  /**
   * @param {Event} e
   */
  [internalSendHandler](e) {
    e.stopPropagation();
    this.send();
  }

  /**
   * Serializes the request to the EditorRequest object with the `ArcBaseRequest` request on it.
   * @returns {ArcBaseRequest}
   */
  serialize() {
    const op = this[operationValue];
    const method = (op.method || 'get').toUpperCase();
    const params = this[parametersValue].map(item => item.parameter);
    const report = AmfInputParser.reportRequestInputs(params, InputCache.getStore(this, this.globalCache), this[nilValues]);
    const serverUrl = this[urlValue];
    let url = applyUrlVariables(serverUrl, report.path, true);
    url = applyUrlParameters(url, report.query, true);
    const headers = generateHeaders(report.header);
    const request = /** @type ArcBaseRequest */ ({
      method,
      url,
      headers,
    });
    if (!['GET', 'HEAD'].includes(method)) {
      /** @type any */
      let body;
      const { payload } = this;
      if (payload) {
        const info = readCachePayloadValue(payload.id);
        if (info && info.value) {
          body = info.value;
        }
      }
      if (body instanceof FormData) {
        request.headers = /** @type string */ (HeadersParser.replace(request.headers, 'content-type', null));
      } else if (payload) {
        request.headers = ensureContentType(request.headers, payload.mediaType);
      }
      if (typeof body !== 'undefined') {
        request.payload = body;
      }
    }
    const authElement = this.shadowRoot.querySelector('amf-authorization-editor');
    if (authElement) {
      const auth = authElement.serialize();
      request.authorization = auth;
    }
    return request;
  }

  /**
   * Executes the current request.
   * This dispatches the send event with request details and the hosting application
   * should decide what to do with it.
   */
  async send() {
    const authElement = this.shadowRoot.querySelector('amf-authorization-editor');
    if (authElement) {
      const valid = authElement.validate();
      if (!valid) {
        const auth = authElement.serialize();
        const oauth = auth.find(i => i.type === 'oauth 2');
        if (oauth) {
          await authElement.authorize();
        }
      }
    }

    const request = this.serialize();
    const uuid = v4();
    TransportEvents.request(this, {
      id: uuid,
      request,
    });
  }
  
  render() {
    return html`
    ${this[serversSectionTemplate]()}
    ${this[parametersTemplate]()}
    ${this[headersTemplate]()}
    ${this[mediaTypeSelectorTemplate]()}
    ${this[bodyTemplate]()}
    ${this[authorizationTemplate]()}
    ${this[mainActionTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for a server selector.
   */
  [serversSectionTemplate]() {
    const servers = this[serversValue];
    // TODO: Allow for providing a custom base URL setting.
    // Use case: Mocking service with a custom URL.
    // Use case: Testing environment not defined in the API.
    if (!Array.isArray(servers) || !servers.length) {
      return '';
    }
    const { anypoint } = this;
    const serverId = this[serverIdValue];
    return html`
    <section class="editor-section" data-section="servers">
      <div class="form-item">
        <anypoint-dropdown-menu
          class="amf-server-selector"
          ?compatibility="${anypoint}"
          fitPositionTarget
          dynamicAlign
        >
          <label slot="label">Server</label>
          <anypoint-listbox
            slot="dropdown-content"
            attrforselected="data-value"
            .selected="${serverId}"
            @selected-changed="${this[serverChangeHandler]}"
            ?compatibility="${anypoint}"
          >
            ${servers.map((server) => this[serverItemTemplate](server))}
          </anypoint-listbox>
        </anypoint-dropdown-menu>
      </div>
    </section>
    `;
  }

  /**
   * @param {ApiServer} server The API server to process.
   * @returns {TemplateResult} The template for a server list item. 
   */
  [serverItemTemplate](server) {
    const { anypoint } = this;
    const { id, description, url } = server;
    const twoLines = !!description;
    return html`
    <anypoint-item data-label="${url}" data-value="${id}" ?compatibility="${anypoint}">
      <anypoint-item-body ?twoLine="${twoLines}">
        <div>${url}</div>
        ${twoLines ? html`<div data-secondary>${description}</div>` : ''}
      </anypoint-item-body>
    </anypoint-item>
    `;
  }

  [parametersTemplate]() {
    /** @type OperationParameter[] */
    const qp = [];
    /** @type OperationParameter[] */
    const path = [];
    this[parametersValue].forEach((item) => {
      if (item.binding === 'query') {
        qp.push(item)
      } else if (item.binding === 'path') {
        path.push(item);
      }
    });
    if (!qp.length && !path.length) {
      return '';
    }

    return html`
    <section class="params-section">
      <div class="section-title"><span class="label">Parameters</span></div>
      ${path.map(param => this[parameterTemplate](param))}
      ${qp.map(param => this[parameterTemplate](param))}
    </section>
    `;
  }

  [headersTemplate]() {
    /** @type OperationParameter[] */
    const headers = this[parametersValue].filter(item => item.binding === 'header');
    if (!headers.length) {
      return '';
    }
    return html`
    <section class="params-section">
      <div class="section-title"><span class="label">Headers</span></div>
      ${headers.map(param => this[parameterTemplate](param))}
    </section>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the main CTA
   */
  [mainActionTemplate]() {
    return html`
    <div class="main-action">
      <anypoint-button class="send-button" emphasis="high" @click="${this[sendClickHandler]}">Send</anypoint-button>
    </div>
    `;
  }

  [mediaTypeSelectorTemplate]() {
    const { payloads, mimeType } = this;
    if (!payloads || payloads.length === 1) {
      return '';
    }
    const mimes = payloads.map(p => p.mediaType);
    let index = mimes.indexOf(mimeType);
    if (index === -1) {
      index = 0;
    }

    return html`
    <div class="payload-mime-selector">
      <label>Payload media type</label>
      <anypoint-radio-group 
        @selected="${this[mediaTypeSelectHandler]}" 
        .selected="${index}"
        attrForSelected="data-value" 
      >
        ${mimes.map((item) => html`<anypoint-radio-button name="mediaTypeValue" data-value="${item}">${item}</anypoint-radio-button>`)}
      </anypoint-radio-group>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the body editor. 
   */
  [bodyTemplate]() {
    const { payload } = this;
    if (!payload) {
      return '';
    }
    const mimeType = payload.mediaType;
    const info = getPayloadValue(payload);
    if (mimeType === 'application/x-www-form-urlencoded') {
      return this[formDataEditorTemplate](info, payload.id);
    }
    if (mimeType === 'multipart/form-data') {
      return this[multipartEditorTemplate](info, payload.id);
    }
    return this[rawEditorTemplate](info, payload.id, mimeType);
  }

  /**
   * @param {any} info
   * @param {string} id
   * @returns {TemplateResult} The template for the editor that specializes in the URL encoded form data
   */
  [formDataEditorTemplate](info, id) {
    const editorModel = /** @type ApiType[] */ (info.model);
    const effectiveValue = Array.isArray(editorModel) && editorModel.length ? undefined : info.value;
    return html`
    <body-formdata-editor 
      autoEncode
      .value="${ifProperty(effectiveValue)}"
      .model="${ifProperty(editorModel)}"
      data-payload-id="${id}"
      @change="${this[modelBodyEditorChangeHandler]}"
    ></body-formdata-editor>
    `;
  }

  /**
   * @param {any} info
   * @param {string} id
   * @returns {TemplateResult} The template for the editor that specializes in the multipart form data
   */
  [multipartEditorTemplate](info, id) {
    const editorModel = /** @type ApiType[] */ (info.model);
    const effectiveValue = Array.isArray(editorModel) && editorModel.length ? undefined : info.value;
    return html`
    <body-multipart-editor 
      .value="${ifProperty(effectiveValue)}"
      .model="${ifProperty(editorModel)}"
      ignoreContentType
      data-payload-id="${id}"
      @change="${this[modelBodyEditorChangeHandler]}"
    ></body-multipart-editor>
    `;
  }

  /**
   * @param {any} info
   * @param {string} id
   * @param {string} mimeType
   * @returns {TemplateResult} The template for the editor that specializes in any text data
   */
  [rawEditorTemplate](info, id, mimeType) {
    let schemas;
    if (Array.isArray(info.schemas) && info.schemas.length) {
      schemas = info.schemas;
    }
    return html`
    <body-raw-editor 
      .value="${info.value}" 
      .contentType="${mimeType}"
      .schemas="${ifProperty(schemas)}"
      data-payload-id="${id}"
      @change="${this[rawBodyChangeHandler]}"
    ></body-raw-editor>
    `;
  }

  [authorizationTemplate]() {
    const security = this[securityList];
    if (!security || !security.length) {
      return '';
    }
    const selected = this[selectedSecurity] || 0;
    const rendered = security[selected];
    return html`
    <section class="authorization params-section">
      ${security.length > 1 ? this[authorizationSelectorTemplate](security, selected) : ''}
      <amf-authorization-editor 
        .domainId="${rendered.security.id}" 
        .anypoint="${this.anypoint}"
        .oauth2RedirectUri="${this.oauth2RedirectUri}"
        .oauth2AuthorizationUri="${this.oauth2AuthorizationUri}"
        .oauth2AccessTokenUri="${this.oauth2AccessTokenUri}"
        .credentialsSource="${this.credentialsSource}"></amf-authorization-editor>
    </section>
    `;
  }

  /**
   * @param {SecuritySelectorListItem[]} security
   * @param {number} selected
   * @returns {TemplateResult} The template for the security drop down selector.
   */
  [authorizationSelectorTemplate](security, selected) {
    const { anypoint } = this;
    return html`
    <anypoint-dropdown-menu
      name="selected"
      .compatibility="${anypoint}"
      class="auth-selector"
    >
      <label slot="label">Authorization method</label>
      <anypoint-listbox slot="dropdown-content"
        .selected="${selected}"
        @selected-changed="${this[authSelectorHandler]}"
        .compatibility="${anypoint}"
        attrForItemTitle="data-label"
      >
        ${security.map((item) => this[authorizationSelectorItemTemplate](item))}
      </anypoint-listbox>
    </anypoint-dropdown-menu>
    `;
  }

  /**
   * @param {SecuritySelectorListItem} info
   * @returns {TemplateResult} The template for the security drop down selector list item.
   */
  [authorizationSelectorItemTemplate](info) {
    const { labels, types } = info;
    const label = labels.join(', ');
    const type = types.join(', ');
    const single = !type;
    return html`
    <anypoint-item
      .compatibility="${this.anypoint}"
      data-label="${label}"
    >
      <anypoint-item-body ?twoline="${!single}">
        <div>${label}</div>
        ${!single ? html`<div data-secondary>${type}</div>` : ''}
      </anypoint-item-body>
    </anypoint-item>
    `;
  }
}
