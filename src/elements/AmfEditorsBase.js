/* eslint-disable class-methods-use-this */
import { LitElement } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin';
import { StoreEvents } from '@api-client/amf-store/worker.index.js';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';

/** @typedef {import('@api-client/amf-store').ApiOperationRecursive} ApiOperationRecursive */
/** @typedef {import('@api-client/amf-store').ApiServer} ApiServer */
/** @typedef {import('@api-client/amf-store').ApiEndPoint} ApiEndPoint */

export const queryDebounce = Symbol('queryDebounce');
export const debounceValue = Symbol('debounceValue');
export const queryingValue = Symbol('queryingValue');
export const domainIdValue = Symbol('domainIdValue');
export const queryEndpoint = Symbol('queryEndpoint');
export const queryOperation = Symbol('queryOperation');
export const queryServers = Symbol('queryServers');
export const operationValue = Symbol('operationValue');
export const endpointValue = Symbol('endpointValue');
export const serversValue = Symbol('serversValue');

export class AmfEditorsBase extends EventsTargetMixin(LitElement) {
  /** 
   * @returns {boolean} When true then the element is currently querying for the graph data.
   */
  get querying() {
    return this[queryingValue] || false;
  }

  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  get domainId() {
    return this[domainIdValue];
  }

  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  set domainId(value) {
    const old = this[domainIdValue];
    if (old === value) {
      return;
    }
    this[domainIdValue] = value;
    this.requestUpdate('domainId', old);
    if (value) {
      this[queryDebounce]();
    }
  }

  static get properties() {
    return {
      /** 
       * The domain id of the object to render.
       */
      domainId: { type: String, reflect: true },
      /** 
       * Enabled compatibility with the Anypoint platform.
       */
      anypoint: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    /** 
     * The timeout after which the `queryGraph()` function is called 
     * in the debouncer.
     */
    this.queryDebouncerTimeout = 2;
    /** @type {boolean} */
    this.anypoint = undefined;
    /** 
     * Flag set when the element is querying for the data.
     */
    this[queryingValue] = false;
    /**
     * @type {ApiOperationRecursive}
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
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.domainId) {
      this[queryDebounce]();
    }
  }

  /**
   * Calls the `queryGraph()` function in a debouncer.
   */
  [queryDebounce]() {
    if (this[debounceValue]) {
      clearTimeout(this[debounceValue]);
    }
    this[debounceValue] = setTimeout(() => {
      this[debounceValue] = undefined;
      this.queryGraph();
    }, this.queryDebouncerTimeout);
  }

  /**
   * The main function to use to query the graph for the model being rendered.
   * To be implemented by the child classes.
   */
  queryGraph() {
    // ...
  }

  /**
   * Queries for the API operation data.
   * @param {string} operationId The operation ID to read.
   */
  async [queryOperation](operationId) {
    this[operationValue] = undefined;
    try {
      const info = await StoreEvents.Operation.getRecursive(this, operationId);
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
    if (this[endpointValue]) {
      const isParent = this[endpointValue].operations.some((op) => op === operationId);
      if (isParent) {
        return;
      }
    }
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
}
