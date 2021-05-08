/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiResponse.js';
import '../../amf-parameter-document.js';
import '../../amf-payload-document.js';
import { AmfDocumentationBase, paramsSectionTemplate, schemaItemTemplate } from './AmfDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiResponse} ApiResponse */
/** @typedef {import('@api-client/amf-store').ApiPayload} ApiPayload */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateCreateEvent} ApiStoreStateCreateEvent */
/** @typedef {import('@api-client/amf-store').ApiStoreStateDeleteEvent} ApiStoreStateDeleteEvent */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */

export const responseIdValue = Symbol('responseIdValue');
export const queryingValue = Symbol('queryingValue');
export const queryResponse = Symbol('queryResponse');
export const responseValue = Symbol('responseValue');
export const queryPayloads = Symbol('queryPayloads');
export const payloadsValue = Symbol('payloadsValue');
export const payloadValue = Symbol('payloadValue');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const headersTemplate = Symbol('headersTemplate');
export const payloadTemplate = Symbol('payloadTemplate');
export const payloadSelectorTemplate = Symbol('payloadSelectorTemplate');
export const responseUpdatedHandler = Symbol('responseUpdatedHandler');
export const payloadCreatedHandler = Symbol('payloadCreatedHandler');
export const payloadDeletedHandler = Symbol('payloadDeletedHandler');
export const mediaTypeSelectHandler = Symbol('mediaTypeSelectHandler');

/**
 * A web component that renders the documentation page for an API response object.
 */
export default class AmfResponseDocumentElement extends AmfDocumentationBase {
  static get styles() {
    return [commonStyles, elementStyles, markdownStyles];
  }

  /** 
   * @returns {string|undefined} The domain id of the API response to render.
   */
  get responseId() {
    return this[responseIdValue];
  }

  /** 
   * @returns {string|undefined} The domain id of the API response to render.
   */
  set responseId(value) {
    const old = this[responseIdValue];
    if (old === value) {
      return;
    }
    this[responseIdValue] = value;
    this.requestUpdate('responseId', old);
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

  /**
   * @returns {boolean} true when has headers parameters definition
   */
  get hasHeaders() {
    const response = this[responseValue];
    if (!response) {
      return false;
    }
    return Array.isArray(response.headers) && !!response.headers.length;
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
       * The domain id of the API response to render.
       */
      responseId: { type: String, reflect: true },
      /** 
       * When set it opens the headers section
       */
      headersOpened: { type: Boolean, reflect: true },
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
     * @type {ApiResponse}
     */
    this[responseValue] = undefined;
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

    this[responseUpdatedHandler] = this[responseUpdatedHandler].bind(this);
    this[payloadCreatedHandler] = this[payloadCreatedHandler].bind(this);
    this[payloadDeletedHandler] = this[payloadDeletedHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.responseId) {
      this.queryGraph(this.responseId);
    }
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(StoreEventTypes.Response.State.updated, this[responseUpdatedHandler]);
    node.addEventListener(StoreEventTypes.Payload.State.created, this[payloadCreatedHandler]);
    node.addEventListener(StoreEventTypes.Payload.State.deleted, this[payloadDeletedHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(StoreEventTypes.Response.State.updated, this[responseUpdatedHandler]);
    node.removeEventListener(StoreEventTypes.Payload.State.created, this[payloadCreatedHandler]);
    node.removeEventListener(StoreEventTypes.Payload.State.deleted, this[payloadDeletedHandler]);
  }

  /**
   * Queries the graph store for the API Response data.
   * @param {string} responseId The domain id of the API response to render.
   * @returns {Promise<void>}
   */
  async queryGraph(responseId) {
    if (this.querying) {
      return;
    }
    this[queryingValue] = true;
    await this[queryResponse](responseId);
    await this[queryPayloads]();
    this[queryingValue] = false;
    await this.requestUpdate();
  }

  /**
   * Queries for the API response data.
   * @param {string} responseId The response ID to read.
   */
  async [queryResponse](responseId) {
    this[responseValue] = undefined;
    try {
      const info = await StoreEvents.Response.get(this, responseId);
      this[responseValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API response data: ${e.message}`, this.localName);
    }
  }

  async [queryPayloads]() {
    const response = this[responseValue];
    if (!response || !response.payloads.length) {
      this[payloadsValue] = undefined;
      return;
    }
    try {
      const ps = response.payloads.map((id) => StoreEvents.Payload.get(this, id));
      this[payloadsValue] = await Promise.all(ps);
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API payload data: ${e.message}`, this.localName);
      this[payloadsValue] = undefined;
    }
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  [responseUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    if (graphId !== this.responseId) {
      return;
    }
    this[responseValue] = item;
    this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateCreateEvent} e
   */
  [payloadCreatedHandler](e) {
    const { item, domainParent } = e.detail;
    if (domainParent !== this.responseId) {
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
    if (domainParent !== this.responseId) {
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
    if (!this[responseValue]) {
      return html``;
    }
    return html`
    ${this[descriptionTemplate]()}
    ${this[headersTemplate]()}
    ${this[payloadTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the markdown description.
   */
  [descriptionTemplate]() {
    const response = this[responseValue];
    const { description } = response;
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
   * @return {TemplateResult|string} The template for the headers
   */
  [headersTemplate]() {
    if (!this.hasHeaders) {
      return '';
    }
    const response = this[responseValue];
    const content = response.headers.map((id) => this[schemaItemTemplate](id));
    return this[paramsSectionTemplate]('Headers', 'headersOpened', content);
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
    <amf-payload-document .payloadId="${payload.id}"></amf-payload-document>
    `;
    return this[paramsSectionTemplate]('Response body', 'payloadOpened', content);
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
