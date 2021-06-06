/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiRequest.js';
import '../../amf-payload-document.js';
import { 
  AmfDocumentationBase, 
  paramsSectionTemplate, 
  schemaItemTemplate,
  queryingValue,
} from './AmfDocumentationBase.js';
import '../../amf-parameter-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiRequest} ApiRequest */
/** @typedef {import('@api-client/amf-store').ApiPayload} ApiPayload */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateCreateEvent} ApiStoreStateCreateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateDeleteEvent} ApiStoreStateDeleteEvent */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */

export const queryRequest = Symbol('queryRequest');
export const requestValue = Symbol('requestValue');
export const queryPayloads = Symbol('queryPayloads');
export const payloadsValue = Symbol('payloadsValue');
export const payloadValue = Symbol('payloadValue');
export const queryParamsTemplate = Symbol('queryParamsTemplate');
export const headersTemplate = Symbol('headersTemplate');
export const cookiesTemplate = Symbol('cookiesTemplate');
export const payloadTemplate = Symbol('payloadTemplate');
export const payloadSelectorTemplate = Symbol('payloadSelectorTemplate');
export const requestUpdatedHandler = Symbol('requestUpdatedHandler');
export const payloadCreatedHandler = Symbol('payloadCreatedHandler');
export const payloadDeletedHandler = Symbol('payloadDeletedHandler');
export const mediaTypeSelectHandler = Symbol('mediaTypeSelectHandler');

/**
 * A web component that renders the documentation page for an API request object.
 */
export default class AmfRequestDocumentElement extends AmfDocumentationBase {
  static get styles() {
    return [commonStyles, elementStyles];
  }

  /**
   * @returns {boolean} true when has cookie parameters definition
   */
  get hasCookieParameters() {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.cookieParameters) && !!request.cookieParameters.length;
  }

  /**
   * @returns {boolean} true when has headers parameters definition
   */
  get hasHeaders() {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.headers) && !!request.headers.length;
  }

  /**
   * @returns {boolean} true when has query parameters definition
   */
  get hasQueryParameters() {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.queryParameters) && !!request.queryParameters.length;
  }

  /**
   * @returns {ApiPayload|undefined}
   */
  get [payloadValue]() {
    const { mimeType } = this;
    const payloads = this[payloadsValue];
    if (!Array.isArray(payloads) || !payloads.length) {
      return undefined;
    }
    if (!mimeType) {
      return payloads[0];
    }
    return payloads.find((item) => item.mediaType === mimeType);
  }

  static get properties() {
    return {
      /** 
       * When set it opens the parameters section
       */
      parametersOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the headers section
       */
      headersOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the cookies section
       */
      cookiesOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the payload section
       */
      payloadOpened: { type: Boolean, reflect: true },
      /** 
       * The currently selected media type for the payloads.
       */
      mimeType: { type: String, reflect: true },
    };
  }

  constructor() {
    super();
    /**
     * @type {ApiRequest}
     */
    this[requestValue] = undefined;
    /**
     * @type {ApiPayload[]}
     */
    this[payloadsValue] = undefined;
    /**
     * @type {string}
     */
    this.mimeType = undefined;

    this.headersOpened = false;
    this.payloadOpened = false;
    this.cookiesOpened = false;
    this.parametersOpened = false;

    this[requestUpdatedHandler] = this[requestUpdatedHandler].bind(this);
    this[payloadCreatedHandler] = this[payloadCreatedHandler].bind(this);
    this[payloadDeletedHandler] = this[payloadDeletedHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(StoreEventTypes.Request.State.updated, this[requestUpdatedHandler]);
    node.addEventListener(StoreEventTypes.Payload.State.created, this[payloadCreatedHandler]);
    node.addEventListener(StoreEventTypes.Payload.State.deleted, this[payloadDeletedHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(StoreEventTypes.Request.State.updated, this[requestUpdatedHandler]);
    node.removeEventListener(StoreEventTypes.Payload.State.created, this[payloadCreatedHandler]);
    node.removeEventListener(StoreEventTypes.Payload.State.deleted, this[payloadDeletedHandler]);
  }

  /**
   * Queries the graph store for the API Request data.
   * @returns {Promise<void>}
   */
  async queryGraph() {
    if (this.querying) {
      return;
    }
    const { domainId } = this;
    this.mimeType = undefined;
    this[queryingValue] = true;
    await this[queryRequest](domainId);
    await this[queryPayloads]();
    this[queryingValue] = false;
    await this.requestUpdate();
  }

  /**
   * Queries for the API request data.
   * @param {string} requestId The request ID to read.
   */
  async [queryRequest](requestId) {
    this[requestValue] = undefined;
    try {
      const info = await StoreEvents.Request.get(this, requestId);
      this[requestValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API request data: ${e.message}`, this.localName);
    }
  }

  async [queryPayloads]() {
    const request = this[requestValue];
    if (!request || !request.payloads.length) {
      this[payloadsValue] = undefined;
      return;
    }
    try {
      const ps = request.payloads.map((id) => StoreEvents.Payload.get(this, id));
      this[payloadsValue] = await Promise.all(ps);
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API request data: ${e.message}`, this.localName);
      this[payloadsValue] = undefined;
    }
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  [requestUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    if (graphId !== this.domainId) {
      return;
    }
    this[requestValue] = item;
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateCreateEvent} e
   */
  [payloadCreatedHandler](e) {
    const { item, domainParent } = e.detail;
    if (domainParent !== this.domainId) {
      return;
    }
    if (!this[payloadsValue]) {
      this[payloadsValue] = [];
    }
    this[payloadsValue].push(item);
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateDeleteEvent} e
   */
  [payloadDeletedHandler](e) {
    const { graphId, domainParent } = e.detail;
    if (domainParent !== this.domainId) {
      return;
    }
    if (!this[payloadsValue]) {
      return;
    }
    const index = this[payloadsValue].findIndex((item) => item.id === graphId);
    if (index !== -1) {
      this[payloadsValue].splice(index, 1);
      this.requestUpdate();
    }
  }

  /**
   * @param {Event} e
   */
  [mediaTypeSelectHandler](e) {
    const select = /** @type AnypointListbox */ (e.target);
    const mime = String(select.selected);
    this.mimeType = mime;
  }

  render() {
    if (!this[requestValue]) {
      return html``;
    }
    return html`
    ${this[queryParamsTemplate]()}
    ${this[headersTemplate]()}
    ${this[cookiesTemplate]()}
    ${this[payloadTemplate]()}
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the query parameters
   */
  [queryParamsTemplate]() {
    if (!this.hasQueryParameters) {
      return '';
    }
    const request = this[requestValue];
    const content = request.queryParameters.map((id) => this[schemaItemTemplate](id));
    return this[paramsSectionTemplate]('Parameters', 'parametersOpened', content);
  }

  /**
   * @return {TemplateResult|string} The template for the headers
   */
  [headersTemplate]() {
    if (!this.hasHeaders) {
      return '';
    }
    const request = this[requestValue];
    const content = request.headers.map((id) => this[schemaItemTemplate](id));
    return this[paramsSectionTemplate]('Headers', 'headersOpened', content);
  }

  /**
   * @return {TemplateResult|string} The template for the cookies list section
   */
  [cookiesTemplate]() {
    if (!this.hasCookieParameters) {
      return '';
    }
    const request = this[requestValue];
    const content = request.cookieParameters.map((id) => this[schemaItemTemplate](id));
    return this[paramsSectionTemplate]('Cookies', 'cookiesOpened', content);
  }

  /**
   * @return {TemplateResult|string} The template for the payload section
   */
  [payloadTemplate]() {
    const payload = this[payloadValue];
    if (!payload) {
      return '';
    }
    const content = html`
    ${this[payloadSelectorTemplate]()}
    <amf-payload-document .domainId="${payload.id}"></amf-payload-document>
    `;
    return this[paramsSectionTemplate]('Request body', 'payloadOpened', content);
  }

  /**
   * @return {TemplateResult|string} The template for the payload media type selector.
   */
  [payloadSelectorTemplate]() {
    const payloads = this[payloadsValue];
    if (!Array.isArray(payloads) || payloads.length < 2) {
      return '';
    }
    const mime = [];
    payloads.forEach((item) => {
      if (item.mediaType) {
        mime.push(item.mediaType);
      }
    });
    if (!mime.length) {
      return '';
    }
    const mimeType = this.mimeType || mime[0];
    return html`
    <div class="media-type-selector">
      <anypoint-dropdown-menu
        class="amf-media-types"
      >
        <label slot="label">Body content type</label>
        <anypoint-listbox
          slot="dropdown-content"
          attrforselected="data-value"
          .selected="${mimeType}"
          @selected-changed="${this[mediaTypeSelectHandler]}"
        >
          ${mime.map((type) => html`<anypoint-item data-value="${type}">${type}</anypoint-item>`)}
        </anypoint-listbox>
      </anypoint-dropdown-menu>
    </div>
    `;
  }
}
