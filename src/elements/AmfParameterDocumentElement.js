/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes } from '@api-client/amf-store/worker.index.js';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiParameter.js';
import schemaStyles from './styles/SchemaCommon.js';
import { readPropertyTypeLabel } from '../Utils.js';
import { paramNameTemplate, typeValueTemplate, detailsTemplate } from './SchemaCommonTemplates.js';
import { 
  AmfDocumentationBase,
  queryingValue,
} from './AmfDocumentationBase.js';
import { DescriptionEditMixin, updateDescription, descriptionTemplate } from './mixins/DescriptionEditMixin.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiParameter} ApiParameter */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */
/** @typedef {import('./mixins/DescriptionEditMixin').DescriptionTemplateOptions} DescriptionTemplateOptions */

export const queryParameter = Symbol('queryParameter');
export const querySchema = Symbol('querySchema');
export const parameterValue = Symbol('parameterValue');
export const schemaValue = Symbol('schemaValue');
export const computeParamType = Symbol('computeParamType');
export const typeLabelValue = Symbol('typeLabelValue');
export const schemaUpdatedHandler = Symbol('schemaUpdatedHandler');
export const parameterUpdatedHandler = Symbol('parameterUpdatedHandler');

/**
 * A web component that renders the documentation for a single request / response parameter.
 */
export default class AmfParameterDocumentElement extends DescriptionEditMixin(AmfDocumentationBase) {
  static get styles() {
    return [MarkdownStyles, commonStyles, schemaStyles, elementStyles];
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
    this[parameterUpdatedHandler] = this[parameterUpdatedHandler].bind(this);
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(StoreEventTypes.Type.State.updated, this[schemaUpdatedHandler]);
    node.addEventListener(StoreEventTypes.Parameter.State.updated, this[parameterUpdatedHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(StoreEventTypes.Type.State.updated, this[schemaUpdatedHandler]);
    node.removeEventListener(StoreEventTypes.Parameter.State.updated, this[parameterUpdatedHandler]);
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

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  [parameterUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    const param = this[parameterValue];
    if (!param || graphId !== param.id) {
      return;
    }
    this[parameterValue] = /** @type ApiParameter */ (item);
    this.requestUpdate();
  }

  /**
   * Updates the description of the response.
   * @param {string} markdown The new markdown to set.
   * @param {DescriptionTemplateOptions=} opts
   * @return {Promise<void>} 
   */
  async [updateDescription](markdown, opts) {
    const { domainId, target } = opts;
    if (target === 'schema') {
      await StoreEvents.Type.update(this, domainId, 'description', markdown);
    } else {
      await StoreEvents.Parameter.update(this, domainId, 'description', markdown);
    }
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
    <div class="property-container simple">
      <div class="name-column">
        ${paramNameTemplate(name, required)}
        <span class="headline-separator"></span>
        ${typeValueTemplate(type)}
      </div>
      <div class="description-column">
        ${this[descriptionTemplate]()}
      </div>
      <div class="details-column">
        ${detailsTemplate(schema)}
      </div>
    </div>
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the parameter description. 
   */
  [descriptionTemplate]() {
    const schema = this[schemaValue];
    if (schema && schema.description) {
      return super[descriptionTemplate](schema.description, {
        domainId: schema.id,
        target: 'schema',
      });
    }
    const param = this[parameterValue];
    return super[descriptionTemplate](param.description, {
      domainId: param.id,
      target: 'param',
    });
  }
}
