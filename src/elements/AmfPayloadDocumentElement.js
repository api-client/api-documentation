/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiPayload.js';
import '../../amf-schema-document.js';
import { 
  AmfDocumentationBase,
  queryingValue,
} from './AmfDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiPayload} ApiPayload */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiExample} ApiExample */

export const queryPayload = Symbol('queryPayload');
export const queryExamples = Symbol('queryExamples');
export const payloadValue = Symbol('payloadValue');
export const examplesValue = Symbol('examplesValue');
export const processPayload = Symbol('processPayload');
export const payloadUpdatedHandler = Symbol('payloadUpdatedHandler');
export const mediaTypeTemplate = Symbol('mediaTypeTemplate');
export const nameTemplate = Symbol('nameTemplate');
export const schemaTemplate = Symbol('schemaTemplate');

export default class AmfPayloadDocumentElement extends AmfDocumentationBase {
  static get styles() {
    return [commonStyles, elementStyles];
  }

  constructor() {
    super();
    /**
     * @type {ApiPayload}
     */
    this[payloadValue] = undefined;
    /**
     * @type {ApiExample[]}
     */
    this[examplesValue] = undefined;

    this[payloadUpdatedHandler] = this[payloadUpdatedHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(StoreEventTypes.Payload.State.updated, this[payloadUpdatedHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(StoreEventTypes.Payload.State.updated, this[payloadUpdatedHandler]);
  }

  /**
   * Queries the graph store for the API Payload data.
   * @returns {Promise<void>}
   */
  async queryGraph() {
    if (this.querying) {
      return;
    }
    const { domainId } = this;
    this[queryingValue] = true;
    await this[queryPayload](domainId);
    await this[processPayload]();
    this[queryingValue] = false;
    await this.requestUpdate();
  }

  /**
   * Queries for the API request data.
   * @param {string} requestId The request ID to read.
   */
  async [queryPayload](requestId) {
    this[payloadValue] = undefined;
    try {
      const info = await StoreEvents.Payload.get(this, requestId);
      this[payloadValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API payload data: ${e.message}`, this.localName);
    }
  }

  async [processPayload]() {
    const payload = this[payloadValue];
    if (!payload) {
      return;
    }
    const { examples } = payload;
    if (Array.isArray(examples) && examples.length) {
      this[examplesValue] = await this[queryExamples](examples);
    }
  }

  /**
   * @param {string[]} examples
   * @returns {Promise<ApiExample[]|null>} 
   */
  async [queryExamples](examples) {
    try {
      const ps = examples.map((id) => StoreEvents.Example.get(this, id));
      const result = await Promise.all(ps);
      return result;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API payload data: ${e.message}`, this.localName);
    }
    return null;
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  async [payloadUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    if (graphId !== this.domainId) {
      return;
    }
    this[payloadValue] = item;
    await this[processPayload]();
    this.requestUpdate();
  }

  render() {
    const payload = this[payloadValue];
    if (!payload) {
      return html``;
    }
    // todo: render examples for the payload.
    return html`
    ${this[nameTemplate]()}
    ${this[mediaTypeTemplate]()}
    ${this[schemaTemplate]()}
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the payload mime type.
   */
  [mediaTypeTemplate]() {
    const payload = this[payloadValue];
    const { mediaType } = payload;
    if (!mediaType) {
      return '';
    }
    return html`
    <div class="media-type">
      <label>Media type:</label>
      <span>${mediaType}</span>
    </div>
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the payload name
   */
  [nameTemplate]() {
    const payload = this[payloadValue];
    const { name } = payload;
    if (!name) {
      return '';
    }
    return html`
    <div class="payload-name">${name}</div>
    `;
  }

  /**
   * @return {TemplateResult} The template for the payload's schema
   */
  [schemaTemplate]() {
    const payload = this[payloadValue];
    const { schema, mediaType } = payload;
    if (!schema) {
      return html`<div class="empty-info">Schema is not defined for this payload.</div>`;
    }
    return html`
    <amf-schema-document .domainId="${schema}" .mimeType="${mediaType}" forceExamples></amf-schema-document>
    `;
  }
}
