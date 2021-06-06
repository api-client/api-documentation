/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store';
import { Styles as HttpStyles } from '@api-components/http-method-label';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import elementStyles from './styles/ApiDocumentationDocument.js';
import commonStyles from './styles/Common.js';
import { 
  AmfDocumentationBase,
  queryingValue,
} from './AmfDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiDocumentation} ApiDocumentation */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */

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

  constructor() {
    super();
    /**
     * @type {ApiDocumentation}
     */
    this[documentationValue] = undefined;
    this[documentationUpdatedHandler] = this[documentationUpdatedHandler].bind(this);
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
   * @returns {Promise<void>}
   */
  async queryGraph() {
    if (this.querying) {
      return;
    }
    const { domainId } = this;
    if (!domainId) {
      this[documentationValue] = undefined;
      this.requestUpdate();
      return;
    }
    this[queryingValue] = true;
    this.requestUpdate();
    try {
      const info = await StoreEvents.Documentation.get(this, domainId);
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
    const { domainId } = this;
    if (!domainId || domainId !== graphId) {
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
