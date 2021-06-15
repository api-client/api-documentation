/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { StoreEvents, StoreEventTypes, ns } from '@api-client/amf-store/worker.index.js';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiSchema.js';
import schemaStyles from './styles/SchemaCommon.js';
import { readPropertyTypeLabel } from '../Utils.js';
import { 
  descriptionValueTemplate, 
  detailsTemplate, 
  paramNameTemplate, 
  typeValueTemplate, 
  fileDetailsTemplate, 
  scalarDetailsTemplate,
  unionDetailsTemplate,
} from './SchemaCommonTemplates.js';
import { ApiExampleGenerator } from '../ApiExampleGenerator.js';
import { ShapeExampleGenerator } from '../generators/ShapeExampleGenerator.js';
import { 
  AmfDocumentationBase,
  queryingValue,
} from './AmfDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiExample} ApiExample */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-client/amf-store').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-client/amf-store').ApiFileShape} ApiFileShape */
/** @typedef {import('@api-client/amf-store').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('@api-client/amf-store').ApiAnyShape} ApiAnyShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiTupleShape} ApiTupleShape */
/** @typedef {import('@api-client/amf-store').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('../types').SchemaExample} SchemaExample */

export const mimeTypeValue = Symbol('mimeTypeValue');
export const querySchema = Symbol('querySchema');
export const examplesValue = Symbol('examplesValue');
export const evaluateExamples = Symbol('evaluateExamples');
export const evaluateExample = Symbol('evaluateExample');
export const schemaValue = Symbol('schemaValue');
export const expandedValue = Symbol('expandedValue');
export const selectedUnionsValue = Symbol('unionsValue');
export const processSchema = Symbol('processSchema');
export const titleTemplate = Symbol('titleTemplate');
export const schemaUpdatedHandler = Symbol('schemaUpdatedHandler');
export const expandHandler = Symbol('expandHandler');
export const anyOfSelectedHandler = Symbol('anyOfSelectedHandler');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const schemaContentTemplate = Symbol('schemaContentTemplate');
export const scalarShapeTemplate = Symbol('scalarSchemaTemplate');
export const nodeShapeTemplate = Symbol('nodeSchemaTemplate');
export const unionShapeTemplate = Symbol('unionSchemaTemplate');
export const fileShapeTemplate = Symbol('fileShapeTemplate');
export const schemaShapeTemplate = Symbol('schemaShapeTemplate');
export const arrayShapeTemplate = Symbol('arrayShapeTemplate');
export const tupleShapeTemplate = Symbol('tupleShapeTemplate');
export const anyShapeTemplate = Symbol('anyShapeTemplate');
export const shapePropertyTemplate = Symbol('shapePropertyTemplate');
export const anyOfUnionTemplate = Symbol('anyOfUnionTemplate');
export const anyOfOptionsTemplate = Symbol('anyOfOptionsTemplate');
export const examplesTemplate = Symbol('examplesTemplate');
export const exampleTemplate = Symbol('exampleTemplate');

const complexTypes = [
  ns.w3.shacl.NodeShape,
  ns.aml.vocabularies.shapes.UnionShape,
  ns.aml.vocabularies.shapes.ArrayShape,
  ns.aml.vocabularies.shapes.TupleShape,
];

export default class AmfSchemaDocumentElement extends AmfDocumentationBase {
  static get styles() {
    return [commonStyles, schemaStyles, elementStyles, MarkdownStyles];
  }

  get mimeType() {
    return this[mimeTypeValue];
  }

  set mimeType(value) {
    const old = this[mimeTypeValue];
    if (old === value) {
      return;
    }
    this[mimeTypeValue] = value;
    this.requestUpdate('mimeType', old);
    if (value) {
      setTimeout(() => {
        this[processSchema]();
        this.requestUpdate();
      });
    }
  }

  static get properties() {
    return {
      /** 
       * The mime type to use to render the examples.
       */
      mimeType: { type: String, reflect: true },
      /** 
       * Generates examples from the schema properties for the given mime type 
       * when examples are not defined in the schema.
       */
      forceExamples: { type: Boolean, reflect: true },
      /** 
       * When set it ignores rendering schema title.
       */
      hideTitle: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    /**
     * @type {ApiShapeUnion}
     */
    this[schemaValue] = undefined;
    /**
     * @type {SchemaExample[]}
     */
    this[examplesValue] = undefined;
    /**
     * @type {string[]}
     */
    this[expandedValue] = undefined;
    /**
     * @type {Record<string, string>}
     */
    this[selectedUnionsValue] = undefined;
    /**
     * @type {string}
     */
    this.mimeType = undefined;
    this.forceExamples = false;
    this.hideTitle = false;

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
    this[expandedValue] = [];
    this[selectedUnionsValue] = {};
    this[queryingValue] = true;
    await this[querySchema](domainId);
    this[processSchema]();
    this[queryingValue] = false;
    await this.requestUpdate();
  }

  /**
   * Queries for the API request data.
   * @param {string} schemaId The request ID to read.
   */
  async [querySchema](schemaId) {
    this[schemaValue] = undefined;
    try {
      const info = await StoreEvents.Type.get(this, schemaId);
      this[schemaValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API schema data: ${e.message}`, this.localName);
    }
  }

  /**
   * The logic to perform after schema is ready.
   * This processes examples for the schema.
   */
  [processSchema]() {
    const type = this[schemaValue];
    if (!type) {
      this[examplesValue] = undefined;
      return;
    }
    let { examples } = type;
    if (Array.isArray(examples) && examples.length) {
      examples = examples.filter((i) => !!i.value || !!i.structuredValue);
    }
    if (Array.isArray(examples) && examples.length) {
      this[examplesValue] = this[evaluateExamples](examples);
    } else {
      const { mimeType, forceExamples } = this;
      this[examplesValue] = undefined;
      if (mimeType && forceExamples) {
        const selectedUnions = [];
        const all = this[selectedUnionsValue];
        Object.keys(all).forEach((id) => {
          if (!selectedUnions.includes(all[id])) {
            selectedUnions.push(all[id]);
          }
        });
        const result = ShapeExampleGenerator.fromSchema(type, mimeType, {
          selectedUnions,
        });
        if (result) {
          this[examplesValue] = [result];
        }
      }
    }
  }

  /**
   * @param {ApiExample[]} examples The list of examples to evaluate
   * @returns {SchemaExample[]}
   */
  [evaluateExamples](examples) {
    return examples.map((example) => this[evaluateExample](example))
  }

  /**
   * @param {ApiExample} example The example to evaluate
   * @returns {SchemaExample}
   */
  [evaluateExample](example) {
    const { mimeType } = this;
    const generator = new ApiExampleGenerator();
    const value = generator.read(example, mimeType);
    const { name, displayName } = example;
    const label = displayName || name;
    const result = /** @type SchemaExample */ ({
      ...example,
      renderValue: value,
    });
    if (label && !label.startsWith('example_')) {
      result.label = label;
    }
    return result;
  }

  /**
   * @param {ApiStoreStateUpdateEvent} e
   */
  async [schemaUpdatedHandler](e) {
    const { graphId, item } = e.detail;
    if (graphId !== this.domainId) {
      return;
    }
    this[schemaValue] = item;
    this[processSchema]();
    this.requestUpdate();
  }

  /**
   * @param {Event} e
   */
  [expandHandler](e) {
    const button = /** @type HTMLElement */ (e.currentTarget);
    const { id } = button.dataset;
    const list = this[expandedValue];
    const index = list.indexOf(id);
    if (index === -1) {
      list.push(id);
    } else {
      list.splice(index, 1);
    }
    this.requestUpdate();
  }

  [anyOfSelectedHandler](e) {
    const { selected, dataset } = e.target
    const { schema } = dataset;
    if (!schema) {
      return;
    }
    this[selectedUnionsValue][schema] = selected;
    this[processSchema]();
    this.requestUpdate();
  }

  render() {
    // todo: render schema examples
    const schema = this[schemaValue];
    if (!schema) {
      return html``;
    }
    return html`
    ${this[titleTemplate]()}
    ${this[descriptionTemplate]()}
    ${this[examplesTemplate]()}
    ${this[schemaContentTemplate](schema)}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the schema title.
   */
  [titleTemplate]() {
    if (this.hideTitle) {
      return '';
    }
    const schema = this[schemaValue];
    const { name, displayName } = schema;
    const label = displayName || name;
    if (label === 'schema') {
      return '';
    }
    return html`
    <div class="schema-title">
      <span class="label">Schema: ${label}</span>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the markdown description.
   */
  [descriptionTemplate]() {
    const schema = this[schemaValue];
    const { description } = schema;
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
   * @returns {TemplateResult|string} The template for the examples section.
   */
  [examplesTemplate]() {
    const examples = this[examplesValue];
    if (!Array.isArray(examples)) {
      return '';
    }
    const filtered = examples.filter((item) => !!item.renderValue);
    if (!filtered.length) {
      return '';
    }
    return html`
    <div class="examples">
    ${filtered.map((item) => this[exampleTemplate](item))}
    </div>
    `;
  }

  /**
   * @param {SchemaExample} item
   * @returns {TemplateResult|string} The template for a single example
   */
  [exampleTemplate](item) {
    const { description, renderValue, label } = item;
    return html`
    <details class="schema-example">
      <summary>Example${label ? `: ${label}` : ''}</summary>
      <div class="example-content">
        ${description ? html`<div class="example-description">${description}</div>` : ''}
        <pre class="code-value"><code>${renderValue}</code></pre>
      </div>
    </details>
    `;
  }

  /**
   * @param {ApiShapeUnion} schema The shape to render.
   * @returns {TemplateResult|string} The template for the schema properties depending on the type
   */
  [schemaContentTemplate](schema) {
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeTemplate](/** @type ApiScalarShape */ (schema));
    }
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this[nodeShapeTemplate](/** @type ApiNodeShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
      return this[unionShapeTemplate](/** @type ApiUnionShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
      return this[fileShapeTemplate](/** @type ApiFileShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.SchemaShape)) {
      return this[schemaShapeTemplate](/** @type ApiSchemaShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      return this[arrayShapeTemplate](/** @type ApiArrayShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.TupleShape)) {
      return this[tupleShapeTemplate](/** @type ApiTupleShape */ (schema));
    }
    return this[anyShapeTemplate](/** @type ApiAnyShape */ (schema));
  }

  /**
   * @param {ApiScalarShape} schema
   * @returns {TemplateResult|string} The template for the scalar shape.
   */
  [scalarShapeTemplate](schema) {
    return scalarDetailsTemplate(schema, true);
  }

  /**
   * @param {ApiNodeShape} schema
   * @returns {TemplateResult} The template for the node shape.
   */
  [nodeShapeTemplate](schema) {
    const { properties } = schema;
    if (!properties.length) {
      return html`<div class="empty-info">Parameters are not defined for this schema.</div>`;
    }
    return html`
    <div class="params-section">
      ${properties.map((item) => this[shapePropertyTemplate](item))}
    </div>
    `;
  }

  /**
   * @param {ApiUnionShape} schema
   * @returns {TemplateResult|string} The template for the union shape.
   */
  [unionShapeTemplate](schema) {
    const unionTemplate = unionDetailsTemplate(schema);
    const { anyOf, or, and } = schema;
    if (Array.isArray(anyOf) && anyOf.length) {
      const schemaContent = this[anyOfUnionTemplate](schema.id, anyOf);
      return html`
      ${unionTemplate}
      ${schemaContent}
      `;
    }
    if (Array.isArray(or) && or.length) {
      const schemaContent = this[anyOfUnionTemplate](schema.id, or);
      return html`
      ${unionTemplate}
      ${schemaContent}
      `;
    }
    if (Array.isArray(and) && and.length) {
      const items = and.map((item) => html`
      <div class="and-union-item">
        ${this[schemaContentTemplate](item)}
      </div>
      `);
      return html`
      <div class="combined-union">
        ${items}
      </div>
      `;
    }
    return unionTemplate;
  }

  /**
   * @param {string} schemaId
   * @param {ApiShapeUnion[]} items
   * @returns {TemplateResult} The template for the `any of` union.
   */
  [anyOfUnionTemplate](schemaId, items) {
    const allSelected = this[selectedUnionsValue];
    let selected = allSelected[schemaId];
    let renderedItem = /** @type ApiShapeUnion */ (null);
    if (selected) {
      renderedItem = items.find((item) => item.id === selected);
    } else {
      [renderedItem] = items;
      selected = renderedItem.id;
    }
    const options = items.map((item, index) => {
      const label = item.name || item.displayName || `Option #${index + 1}`;
      return {
        label,
        id: item.id,
      }
    });
    return html`
    ${this[anyOfOptionsTemplate](schemaId, options, selected)}
    ${this[schemaContentTemplate](renderedItem)}
    `;
  }

  /**
   * @param {string} schemaId The parent schema id value
   * @param {any[]} options The options to render.
   * @param {string} selected
   * @returns {TemplateResult} The template for the union any of selector.
   */
  [anyOfOptionsTemplate](schemaId, options, selected) {
    return html`
    <div class="union-options">
      <label>Any (one or more) of the following schemas</label>
      <anypoint-radio-group 
        @selected="${this[anyOfSelectedHandler]}" 
        attrForSelected="data-value" 
        .selected="${selected}"
        data-schema="${schemaId}"
      >
        ${options.map((item) => html`<anypoint-radio-button name="unionValue" data-value="${item.id}">${item.label}</anypoint-radio-button>`)}
      </anypoint-radio-group>
    </div>
    `;
  }

  /**
   * @param {ApiFileShape} schema
   * @returns {TemplateResult|string} The template for the file shape.
   */
  [fileShapeTemplate](schema) {
    return fileDetailsTemplate(schema);
  }

  /**
   * @param {ApiSchemaShape} schema
   * @returns {TemplateResult} The template for the schema shape.
   */
  [schemaShapeTemplate](schema) {
    const { raw } = schema;
    if (!raw) {
      return html`
      <div class="empty-info">Schema is not defined for this message.</div>
      `;
    }
    return html`
    <div class="schema-content">
    <pre class="code-value"><code>${raw}</code></pre>
    </div>
    `;
  }

  /**
   * @param {ApiArrayShape} schema
   * @returns {TemplateResult} The template for the array shape.
   */
  [arrayShapeTemplate](schema) {
    const { items } = schema;
    if (!items) {
      return html`<div class="empty-info">Items are not defined for this array.</div>`;
    }
    return html`
    <div class="params-section">
      ${this[schemaContentTemplate](items)}
    </div>
    `;
  }

  /**
   * @param {ApiTupleShape} schema
   * @returns {TemplateResult} The template for the tuple shape.
   */
  [tupleShapeTemplate](schema) {
    const { items } = schema;
    if (!items) {
      return html`<div class="empty-info">Items are not defined for this array.</div>`;
    }
    return html`
    <div class="params-section">
      ${items.map((item) => this[schemaContentTemplate](item))}
    </div>
    `;
  }

  /**
   * @param {ApiAnyShape} schema
   * @returns {TemplateResult|string} The template for the Any shape.
   */
  [anyShapeTemplate](schema) {
    const { and, or } = schema;
    if (and.length || or.length) {
      return this[unionShapeTemplate](/** @type ApiUnionShape */ (schema));
    }
    return html`<p class="any-info">Any schema is accepted as the value here.</p>`;
  }

  /**
   * @param {ApiPropertyShape} schema
   */
  [shapePropertyTemplate](schema) {
    const { range, minCount } = schema;
    const { displayName } = range;
    const required = minCount > 0;
    const type = readPropertyTypeLabel(range);
    const label = schema.name || displayName || range.name;
    const desc = schema.description || range.description;
    const [domainType] = range.types;
    
    let isComplex = complexTypes.includes(domainType);
    if (isComplex) {
      if (range.types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
        const { items } = /** @type ApiArrayShape */ (range);
        isComplex = complexTypes.includes(items.types[0]);
      }
    }
    const allExpanded = this[expandedValue];
    const expanded = isComplex && allExpanded.includes(schema.id);
    const buttonLabel = expanded ? 'Hide' : 'Show schema';
    return html`
    <div class="property-container">
      <div class="name-column">
        ${paramNameTemplate(label, required)}
        ${typeValueTemplate(type)}
        ${isComplex ? html`<anypoint-button data-id="${schema.id}" @click="${this[expandHandler]}">${buttonLabel}</anypoint-button>` : ''}
      </div>
      <div class="description-column">
        ${descriptionValueTemplate(desc)}
        ${detailsTemplate(range)}
      </div>
    </div>
    ${expanded ? html`
    <div class="shape-children">
      ${this[schemaContentTemplate](range)}
    </div>
    ` : ''}
    `;
  }
}
