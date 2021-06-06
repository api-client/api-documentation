/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store';
import { Styles as HttpStyles } from '@api-components/http-method-label';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import elementStyles from './styles/ApiSchemaDocumentation.js';
import commonStyles from './styles/Common.js';
import '../../amf-schema-document.js';
import { 
  AmfDocumentationBase,
  queryingValue,
} from './AmfDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */

export const schemaValue = Symbol('schemaValue');
export const titleTemplate = Symbol('titleTemplate');
export const schemaTemplate = Symbol('schemaTemplate');
export const schemaUpdatedHandler = Symbol('schemaUpdatedHandler');

/**
 * A web component that renders the schema (type) documentation page built from 
 * the AMF graph model.
 */
export default class ApiSchemaDocumentationElement extends AmfDocumentationBase {
  static get styles() {
    return [elementStyles, commonStyles, HttpStyles.default, markdownStyles];
  }

  constructor() {
    super();
    /**
     * @type {ApiShapeUnion}
     */
    this[schemaValue] = undefined;
    this[schemaUpdatedHandler] = this[schemaUpdatedHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(StoreEventTypes.Type.State.updated, this[schemaUpdatedHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(StoreEventTypes.Type.State.updated, this[schemaUpdatedHandler]);
  }

  /**
   * Queries the graph store for the API schema data.
   * @returns {Promise<void>}
   */
  async queryGraph() {
    if (this.querying) {
      return;
    }
    const { domainId } = this;
    if (!domainId) {
      this[schemaValue] = undefined;
      this.requestUpdate();
      return;
    }
    this[queryingValue] = true;
    this.requestUpdate();
    try {
      const info = await StoreEvents.Type.get(this, domainId);
      // console.log(info);
      this[schemaValue] = info;
    } catch (e) {
      this[schemaValue] = undefined;
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API Schema data: ${e.message}`, this.localName);
    }
    this[queryingValue] = false;
    await this.requestUpdate();
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  [schemaUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    const { domainId } = this;
    if (!domainId || domainId !== graphId) {
      return;
    }
    this[schemaValue] = item;
    this.requestUpdate();
  }

  render() {
    if (!this[schemaValue]) {
      return html``;
    }
    return html`
    ${this[titleTemplate]()}
    ${this[schemaTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the Documentation title.
   */
  [titleTemplate]() {
    const type = this[schemaValue];
    const { displayName, name } = type;
    const label = displayName || name || 'Unnamed schema';
    return html`
    <div class="schema-header">
      <div class="schema-title">
        <span class="label">${label}</span>
      </div>
    </div>
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the schema properties documentation
   */
  [schemaTemplate]() {
    const type = this[schemaValue];
    if (!type) {
      return '';
    }
    // .mimeType="${mediaType}"
    return html`
    <amf-schema-document .domainId="${type.id}" forceExamples hideTitle></amf-schema-document>
    `;
  }
}
