/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiParameter.js';
import schemaStyles from './styles/SchemaCommon.js';
import { readPropertyTypeLabel } from '../Utils.js';
import { paramNameTemplate, typeValueTemplate, descriptionValueTemplate, detailsTemplate } from './SchemaCommonTemplates.js';
import { 
  AmfDocumentationBase,
  queryingValue,
} from './AmfDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiParameter} ApiParameter */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */

export const queryParameter = Symbol('queryParameter');
export const querySchema = Symbol('querySchema');
export const parameterValue = Symbol('parameterValue');
export const schemaValue = Symbol('schemaValue');
export const computeParamType = Symbol('computeParamType');
export const typeLabelValue = Symbol('typeLabelValue');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const schemaUpdatedHandler = Symbol('schemaUpdatedHandler');

/**
 * A web component that renders the documentation for a single request / response parameter.
 */
export default class AmfParameterDocumentElement extends AmfDocumentationBase {
  static get styles() {
    return [markdownStyles, commonStyles, schemaStyles, elementStyles];
  }

  constructor() {
    super();
    /**
     * @type {ApiParameter}
     */
    this[parameterValue] = undefined;
    /**
     * @type {ApiShapeUnion}
     */
    this[schemaValue] = undefined;
    /**
     * @type {string}
     */
    this[typeLabelValue] = undefined;

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
   * Queries the graph store for the API Parameter data.
   * @returns {Promise<void>}
   */
  async queryGraph() {
    if (this.querying) {
      return;
    }
    const { domainId } = this;
    this[queryingValue] = true;
    await this[queryParameter](domainId);
    await this[querySchema]();
    this[computeParamType]();
    this[queryingValue] = false;
    await this.requestUpdate();
  }

  /**
   * Queries for the API parameter data.
   * @param {string} parameterId The domain id to read.
   */
  async [queryParameter](parameterId) {
    this[parameterValue] = undefined;
    try {
      const info = await StoreEvents.Parameter.get(this, parameterId);
      this[parameterValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API parameter data: ${e.message}`, this.localName);
    }
  }

  /**
   * Queries for the API type (schema) data for the current parameter
   */
  async [querySchema]() {
    this[schemaValue] = undefined;
    const param = this[parameterValue];
    if (!param || !param.schema) {
      return;
    }
    try {
      const schema = await StoreEvents.Type.get(this, param.schema);
      this[schemaValue] = schema;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API schema data: ${e.message}`, this.localName);
    }
  }

  /**
   * Computes the schema type label value to render in the type view.
   */
  [computeParamType]() {
    const schema = this[schemaValue];
    const label = readPropertyTypeLabel(schema);
    this[typeLabelValue] = label;
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  [schemaUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    const schema = this[schemaValue];
    if (!schema || graphId !== schema.id) {
      return;
    }
    this[schemaValue] = /** @type ApiShapeUnion */ (item);
    this[computeParamType]();
    this.requestUpdate();
  }

  render() {
    const param = this[parameterValue];
    if (!param) {
      return html``;
    }
    const { name, required } = param;
    const type = this[typeLabelValue];
    const schema = this[schemaValue];
    return html`
    <div class="property-container">
      <div class="name-column">
        ${paramNameTemplate(name, required)}
        ${typeValueTemplate(type)}
      </div>
      <div class="description-column">
        ${this[descriptionTemplate]()}
        ${detailsTemplate(schema)}
      </div>
    </div>
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the parameter description. 
   */
  [descriptionTemplate]() {
    const param = this[parameterValue];
    let { description } = param;
    if (!description) {
      description = this[schemaValue] && this[schemaValue].description;
    }
    return descriptionValueTemplate(description);
  }
}
