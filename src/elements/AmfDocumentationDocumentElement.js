/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store';
import { Styles as HttpStyles } from '@api-components/http-method-label';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import elementStyles from './styles/ApiDocumentationDocument.js';
import commonStyles from './styles/Common.js';
import '../../amf-request-document.js'
import '../../amf-response-document.js'
import { AmfDocumentationBase } from './AmfDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiDocumentation} ApiDocumentation */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */

export const documentationIdValue = Symbol('documentationIdValue');
export const queryingValue = Symbol('queryingValue');
export const documentationValue = Symbol('documentationValue');
export const titleTemplate = Symbol('titleTemplate');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const documentationUpdatedHandler = Symbol('serverUpdatedHandler');

/**
 * A web component that renders the documentation page for an API documentation (like in RAML documentations) built from 
 * the AMF graph model.
 */
export default class AmfDocumentationDocumentElement extends AmfDocumentationBase {
  static get styles() {
    return [elementStyles, commonStyles, HttpStyles.default, markdownStyles];
  }

  /** 
   * @returns {string|undefined} The domain id of the documentation to render.
   */
  get documentationId() {
    return this[documentationIdValue];
  }

  /** 
   * @returns {string|undefined} The domain id of the documentation to render.
   */
  set documentationId(value) {
    const old = this[documentationIdValue];
    if (old === value) {
      return;
    }
    this[documentationIdValue] = value;
    this.requestUpdate('documentationId', old);
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

  static get properties() {
    return {
      /** 
       * The domain id of the documentation to render.
       */
      documentationId: { type: String, reflect: true },
    };
  }

  constructor() {
    super();
    /**
     * @type {ApiDocumentation}
     */
    this[documentationValue] = undefined;
    this[documentationUpdatedHandler] = this[documentationUpdatedHandler].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.documentationId) {
      this.queryGraph(this.documentationId);
    }
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(StoreEventTypes.Documentation.State.updated, this[documentationUpdatedHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(StoreEventTypes.Documentation.State.updated, this[documentationUpdatedHandler]);
  }

  /**
   * Queries the graph store for the API Documentation data.
   * @param {string} documentationId The operation id to render the documentation for.
   * @returns {Promise<void>}
   */
  async queryGraph(documentationId) {
    if (this.querying) {
      return;
    }
    if (!documentationId) {
      this[documentationValue] = undefined;
      this.requestUpdate();
      return;
    }
    this[queryingValue] = true;
    this.requestUpdate();
    try {
      const info = await StoreEvents.Documentation.get(this, documentationId);
      // console.log(info);
      this[documentationValue] = info;
    } catch (e) {
      this[documentationValue] = undefined;
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API Documentation data: ${e.message}`, this.localName);
    }
    this[queryingValue] = false;
    await this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  [documentationUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    const { documentationId } = this;
    if (!documentationId || documentationId !== graphId) {
      return;
    }
    this[documentationValue] = item;
    this.requestUpdate();
  }

  render() {
    if (!this[documentationValue]) {
      return html``;
    }
    return html`
    ${this[titleTemplate]()}
    ${this[descriptionTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the Documentation title.
   */
  [titleTemplate]() {
    const docs = this[documentationValue];
    const { title } = docs;
    const label = title || 'Unnamed document';
    return html`
    <div class="documentation-header">
      <div class="documentation-title">
        <span class="label">${label}</span>
      </div>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the markdown description.
   */
  [descriptionTemplate]() {
    const operation = this[documentationValue];
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
}
