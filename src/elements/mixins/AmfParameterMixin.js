/* eslint-disable class-methods-use-this */
/* eslint-disable arrow-body-style */
// eslint-disable-next-line no-unused-vars
import { LitElement, html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { ns } from '@api-client/amf-store';
import { notifyChange, } from '@advanced-rest-client/authorization/src/Utils.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import { ifDefined } from 'lit-html/directives/if-defined.js'
import * as InputCache from '../../lib/InputCache.js';
import { AmfSchemaProcessor } from '../../lib/AmfSchemaProcessor.js';
import { AmfInputParser } from '../../lib/AmfInputParser.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiParameterRecursive} ApiParameterRecursive */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiTupleShape} ApiTupleShape */
/** @typedef {import('@api-client/amf-store').ApiAnyShape} ApiAnyShape */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */
/** @typedef {import('@anypoint-web-components/anypoint-input').SupportedInputTypes} SupportedInputTypes */
/** @typedef {import('@anypoint-web-components/anypoint-checkbox').AnypointCheckbox} AnypointCheckbox */
/** @typedef {import('../../types').OperationParameter} OperationParameter */
/** @typedef {import('../../types').ShapeTemplateOptions} ShapeTemplateOptions */

export const addArrayValueHandler = Symbol('addArrayValueHandler');
export const readInputValue = Symbol('readInputValue');
export const paramChangeHandler = Symbol('paramChangeHandler');
export const booleanHandler = Symbol('booleanHandler');
export const deleteParamHandler = Symbol('deleteParamHandler');
export const enumSelectionHandler = Symbol('enumSelectionHandler');
export const nilHandler = Symbol('nilHandler');
export const nilValues = Symbol('nilValues');
export const parametersValue = Symbol('parametersValue');
export const parameterTemplate = Symbol('parameterTemplate');
export const parameterSchemaTemplate = Symbol('parameterSchemaTemplate');
export const scalarShapeTemplate = Symbol('scalarSchemaTemplate');
export const nodeShapeTemplate = Symbol('nodeSchemaTemplate');
export const unionShapeTemplate = Symbol('unionSchemaTemplate');
export const fileShapeTemplate = Symbol('fileShapeTemplate');
export const schemaShapeTemplate = Symbol('schemaShapeTemplate');
export const arrayShapeTemplate = Symbol('arrayShapeTemplate');
export const tupleShapeTemplate = Symbol('tupleShapeTemplate');
export const anyShapeTemplate = Symbol('anyShapeTemplate');
export const enumTemplate = Symbol('enumTemplate');
export const booleanTemplate = Symbol('booleanTemplate');
export const nillInputTemplate = Symbol('nillInputTemplate');
export const textInputTemplate = Symbol('textInputTemplate');
export const addArrayItemTemplate = Symbol('addArrayItemTemplate');
export const deleteParamTemplate = Symbol('deleteParamTemplate');

/**
 * @param {typeof LitElement} base
 */
const mxFunction = base => {
  class AmfParameterMixin extends base {
    static get properties() {
      return {
        /**
         * By default the element stores user input in a map that is associated with the specific
         * instance of this element. This way the element can be used multiple times in the same document.
         * However, this way parameter values generated by the generators or entered by the user won't 
         * get populated in different operations.
         * 
         * By setting this value the element prefers a global cache for values. Once the user enter
         * a value it is registered in the global cache and restored when the same parameter is used again.
         * 
         * Do not use this option when the element is embedded multiple times in the page. It will result
         * in generating request data from the cache and not what's in the form inputs and these may not be in sync.
         * 
         * These values are stored in memory only. Listen to the `change` event to learn that something changed.
         */
        globalCache: { type: Boolean, reflect: true, },
      };
    }

    constructor() {
      super();
      /** @type {boolean} */
      this.globalCache = undefined;
      /** @type {boolean} */
      this.anypoint = undefined;
      /** 
       * @type {OperationParameter[]}
       */
      this[parametersValue] = [];
      /**
       * @type {string[]}
       */
      this[nilValues] = [];
    }

    connectedCallback() {
      InputCache.registerLocal(this);
      super.connectedCallback();
    }

    /**
     * @param {Event} e
     */
    [addArrayValueHandler](e) {
      const button = /** @type HTMLElement */ (e.target);
      const { id } = button.dataset;
      if (!id) {
        return;
      }
      if (!InputCache.has(this, id, this.globalCache)) {
        InputCache.set(this, id, [], this.globalCache);
      }
      const items = /** @type any[] */ (InputCache.get(this, id, this.globalCache));
      items.push(undefined);
      this.requestUpdate();
    }

    /**
     * Reads the value to be set on an input.
     * 
     * @param {ApiParameterRecursive} parameter
     * @param {ApiScalarShape} schema
     * @param {boolean=} [isArray=false] Whether the value should be read for an array.
     * @returns {any} The value to set on the input. Note, it is not cast to the type.
     */
    [readInputValue](parameter, schema, isArray=false) {
      const { id } = parameter;
      if (InputCache.has(this, id, this.globalCache)) {
        return InputCache.get(this, id, this.globalCache);
      }
      let result;
      if (isArray) {
        result = AmfSchemaProcessor.readArrayValues(parameter, schema);
      } else {
        result = AmfSchemaProcessor.readInputValue(parameter, schema);
      }
      if (result !== undefined) {
        InputCache.set(this, id, result, this.globalCache);
      }
      return result;
    }

    /**
     * @param {Event} e
     */
    [paramChangeHandler](e) {
      const input = /** @type HTMLInputElement */ (e.target);
      const { value, dataset } = input;
      const { domainId, isArray, index } = dataset;
      if (!domainId) {
        return;
      }
      const param = this[parametersValue].find(p => p.paramId === domainId);
      if (!param) {
        return;
      }
      // sets cached value of the input.
      const typed = AmfInputParser.parseUserInput(value, param.schema);
      InputCache.set(this, domainId, typed, this.globalCache, isArray === 'true', index ? Number(index) : undefined);
      notifyChange(this);
    }

    /**
     * @param {Event} e
     */
    [booleanHandler](e) {
      const input = /** @type AnypointCheckbox */ (e.target);
      const { checked, dataset } = input;
      const { domainId, isArray, index } = dataset;
      if (!domainId) {
        return;
      }
      const param = this[parametersValue].find(p => p.paramId === domainId);
      if (!param) {
        return;
      }
      InputCache.set(this, domainId, checked, this.globalCache, isArray === 'true', index ? Number(index) : undefined);
      notifyChange(this);
    }

    /**
     * A handler for the remove param button click.
     * @param {Event} e
     */
    [deleteParamHandler](e) {
      const button = /** @type HTMLElement */ (e.currentTarget);
      const { dataset } = button;
      const { domainId, index } = dataset;
      if (!domainId) {
        return;
      }
      if (!InputCache.has(this, domainId, this.globalCache)) {
        return;
      }
      InputCache.remove(this, domainId, this.globalCache, index ? Number(index) : undefined);
      this.requestUpdate();
      notifyChange(this);
    }

    /**
     * @param {Event} e
     */
    [enumSelectionHandler](e) {
      const list = /** @type AnypointListbox */ (e.target);
      const select = /** @type HTMLElement */ (list.parentElement);
      const { domainId, isArray, index } = select.dataset;
      if (!domainId) {
        return;
      }
      const param = this[parametersValue].find(p => p.paramId === domainId);
      if (!param) {
        return;
      }
      const enumValues = /** @type ApiScalarNode[] */ (param.schema.values);
      const { value } = enumValues[list.selected];
      const typed = AmfInputParser.parseUserInput(value, param.schema);
      InputCache.set(this, domainId, typed, this.globalCache, isArray === 'true', index ? Number(index) : undefined);
      notifyChange(this);
    }

    /**
     * Handler for the nil value toggle.
     * @param {Event} e
     */
    [nilHandler](e) {
      const button = /** @type AnypointCheckbox */ (e.target);
      const { checked, dataset } = button;
      const { domainId } = dataset;
      if (!domainId) {
        return;
      }
      const list = this[nilValues];
      const has = list.includes(domainId);
      if (checked && !has) {
        list.push(domainId);
        this.requestUpdate();
      } else if (!checked && has) {
        const index = list.indexOf(domainId);
        list.splice(index, 1);
        this.requestUpdate();
      }
      notifyChange(this);
    }

    /**
     * @param {OperationParameter} param
     * @returns {TemplateResult|string} The template for the request parameter form control.
     */
    [parameterTemplate](param) {
      const { schema, parameter } = param;
      if (!schema) {
        return '';
      }
      return this[parameterSchemaTemplate](parameter, schema);
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @param {ApiShapeUnion} schema
     * @param {ShapeTemplateOptions=} opts
     * @returns {TemplateResult|string} The template for the request parameter form control.
     */
    [parameterSchemaTemplate](parameter, schema, opts={}) {
      const { types } = schema;
      if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
        return this[scalarShapeTemplate](parameter, /** @type ApiScalarShape */ (schema), opts);
      }
      if (types.includes(ns.w3.shacl.NodeShape)) {
        return this[nodeShapeTemplate]();
      }
      if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
        return this[unionShapeTemplate](parameter, /** @type ApiUnionShape */ (schema));
      }
      if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
        return this[fileShapeTemplate]();
      }
      if (types.includes(ns.aml.vocabularies.shapes.SchemaShape)) {
        return this[schemaShapeTemplate]();
      }
      if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
        return this[arrayShapeTemplate](parameter, /** @type ApiArrayShape */ (schema));
      }
      if (types.includes(ns.aml.vocabularies.shapes.TupleShape)) {
        return this[tupleShapeTemplate](parameter, /** @type ApiTupleShape */ (schema));
      }
      return this[anyShapeTemplate](parameter, /** @type ApiAnyShape */ (schema));
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @param {ApiScalarShape} schema
     * @param {ShapeTemplateOptions=} opts
     * @returns {TemplateResult|string} The template for the schema parameter.
     */
    [scalarShapeTemplate](parameter, schema, opts={}) {
      const { readOnly, values, dataType } = schema;
      if (readOnly) {
        return '';
      }
      if (values && values.length) {
        return this[enumTemplate](parameter, schema, opts);
      }
      const inputType = AmfInputParser.readInputType(dataType);
      if (inputType === 'boolean') {
        return this[booleanTemplate](parameter, schema, opts);
      }
      return this[textInputTemplate](parameter, schema, inputType, opts);
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @param {ApiScalarShape} schema
     * @param {SupportedInputTypes=} type The input type.
     * @param {ShapeTemplateOptions=} opts
     * @return {TemplateResult} A template for an input form item for the given type and schema
     */
    [textInputTemplate](parameter, schema, type, opts={}) {
      const { id, binding } = parameter;
      const { pattern, minimum, minLength, maxLength, maximum, multipleOf } = schema;
      const label = AmfSchemaProcessor.readLabelValue(parameter, schema);
      const { required, allowEmptyValue, } = parameter;
      let value;
      if (opts.arrayItem) {
        value = opts.value || '';
      } else {
        value = this[readInputValue](parameter, schema);
      }
      if (value) {
        value = AmfInputParser.parseSchemaInput(value, schema);
      }
      /** @type number */
      let step;
      if (['time', 'datetime-local'].includes(type)) {
        step = 1;
      } else if (typeof multipleOf !== 'undefined') {
        step = Number(multipleOf);
      }
      const title = parameter.description || schema.description;
      const nillables = this[nilValues];
      const nillDisabled = !!opts.nillable && nillables.includes(id);
      return html`
      <div class="form-item">
        <anypoint-input 
          data-domain-id="${id}"
          data-is-array="${ifDefined(opts.arrayItem)}"
          data-index="${ifDefined(opts.index)}"
          data-binding="${ifDefined(binding)}"
          name="${parameter.name || schema.name}" 
          class="form-input"
          ?required="${required && !allowEmptyValue}"
          ?autoValidate="${required && !allowEmptyValue}"
          .value="${value}"
          .pattern="${pattern}"
          .min="${typeof minimum !== 'undefined' ? String(minimum) : undefined}"
          .minLength="${minLength}"
          .max="${typeof maximum !== 'undefined' ? String(maximum) : undefined}"
          .maxLength="${maxLength}"
          .step="${step}"
          type="${ifDefined(type)}"
          title="${ifDefined(title)}"
          @change="${this[paramChangeHandler]}"
          ?disabled="${nillDisabled}"
        >
          <label slot="label">${label}</label>
        </anypoint-input>
        ${opts.nillable ? this[nillInputTemplate](parameter) : ''}
        ${opts.arrayItem ? this[deleteParamTemplate](id, opts.index) : ''}
      </div>
      `;
    }

    /**
     * @param {string} paramId The ApiParameter id.
     * @param {number=} arrayIndex When this is an array item, the index on the array.
     * @returns {TemplateResult} The template for the param remove button. 
     */
    [deleteParamTemplate](paramId, arrayIndex) {
      const { anypoint } = this;
      const title = 'Removes this parameter value.';
      return html`
      <anypoint-icon-button 
        ?compatibility="${anypoint}" 
        title="${title}" 
        data-domain-id="${paramId}"
        data-index="${ifDefined(arrayIndex)}"
        @click="${this[deleteParamHandler]}"
      >
        <arc-icon icon="removeCircleOutline"></arc-icon>
      </anypoint-icon-button>
      `;
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @param {ApiScalarShape} schema
     * @param {ShapeTemplateOptions=} opts
     * @returns {TemplateResult|string} The template for the enum input.
     */
    [enumTemplate](parameter, schema, opts={}) {
      const { anypoint } = this;
      const label = AmfSchemaProcessor.readLabelValue(parameter, schema);
      const enumValues = /** @type ApiScalarNode[] */ (schema.values || []);
      const selectedValue = this[readInputValue](parameter, schema);
      const selected = enumValues.findIndex(i => i.value === selectedValue);
      const { required, id, binding } = parameter;
      const title = parameter.description || schema.description;
      const nillables = this[nilValues];
      const nillDisabled = !!opts.nillable && nillables.includes(id);
      return html`
      <div class="form-item">
        <anypoint-dropdown-menu
          class="param-selector"
          name="${parameter.name || schema.name}"
          data-binding="${ifDefined(binding)}"
          ?compatibility="${anypoint}"
          ?required="${required}"
          title="${ifDefined(title)}"
          fitPositionTarget
          dynamicAlign
          data-domain-id="${id}"
          data-is-array="${ifDefined(opts.arrayItem)}"
          ?disabled="${nillDisabled}"
        >
          <label slot="label">${label}</label>
          <anypoint-listbox
            slot="dropdown-content"
            ?compatibility="${anypoint}"
            .selected="${selected}"
            @selected="${this[enumSelectionHandler]}"
          >
            ${enumValues.map((value) => html`<anypoint-item data-type="${value.dataType}" data-value="${value.value}">${value.value}</anypoint-item>`)}
          </anypoint-listbox>
        </anypoint-dropdown-menu>
        ${opts.nillable ? this[nillInputTemplate](parameter) : ''}
      </div>
      `;
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @param {ApiScalarShape} schema
     * @param {ShapeTemplateOptions=} opts
     * @returns {TemplateResult|string} The template for the checkbox input.
     */
    [booleanTemplate](parameter, schema, opts={}) {
      const label = AmfSchemaProcessor.readLabelValue(parameter, schema);
      const { required, id } = parameter;
      /** @type {boolean} */
      let value;
      if (opts.arrayItem) {
        value = opts.value || '';
      } else {
        value = this[readInputValue](parameter, schema);
      }
      const title = parameter.description || schema.description;
      const nillables = this[nilValues];
      const nillDisabled = !!opts.nillable && nillables.includes(id);
      return html`
      <div class="form-item">
        <anypoint-checkbox 
          name="${parameter.name || schema.name}"
          data-binding="${ifDefined(parameter.binding)}"
          ?required="${required}"
          .checked="${value}"
          title="${ifDefined(title)}"
          data-domain-id="${id}"
          data-is-array="${ifDefined(opts.arrayItem)}"
          ?disabled="${nillDisabled}"
          @change="${this[booleanHandler]}"
        >${label}</anypoint-checkbox>
        ${opts.nillable ? this[nillInputTemplate](parameter) : ''}
      </div>
      `;
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @returns {TemplateResult|string} The template for the nil checkbox input.
     */
    [nillInputTemplate](parameter) {
      return html`
      <anypoint-checkbox 
        class="nil-option"
        data-domain-id="${parameter.id}"
        data-binding="${ifDefined(parameter.binding)}"
        title="Makes the property nillable (e.g. inserts null into the schema)"
        @change="${this[nilHandler]}"
      >Nil</anypoint-checkbox>
      `;
    }

    /**
     * or now we do not support union shapes. There's no way to learn how to serialize
     * the Node shape to a string.
     * @returns {TemplateResult|string} The template for the node shape.
     */
    [nodeShapeTemplate]() {
      return '';
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @param {ApiUnionShape} schema
     * @returns {TemplateResult|string} The template for the union shape.
     */
    [unionShapeTemplate](parameter, schema) {
      const { anyOf } = schema;
      if (!anyOf || !anyOf.length) {
        return '';
      }
      const nil = anyOf.find(shape => shape.types.includes(ns.aml.vocabularies.shapes.NilShape));
      if (nil && anyOf.length === 2) {
        // this is a case where a scalar is marked as nillable instead of not required
        // (which for some reason is a common practice among RAML developers).
        const scalar = anyOf.find(shape => shape !== nil);
        return this[parameterSchemaTemplate](parameter, scalar, {
          nillable: true,
        });
      }
      const hasComplex = anyOf.some(i => !i.types.includes(ns.aml.vocabularies.shapes.ScalarShape));
      const hasScalar = anyOf.some(i => i.types.includes(ns.aml.vocabularies.shapes.ScalarShape));
      if (hasComplex && !hasScalar) {
        // We quit here as this is the same problem as with the Node shape - unclear how to serialize the types
        return '';
      }
      // at this point only scalars are possible. For that we render a regular text field 
      // and while serializing the values we figure out what type it should be giving the 
      // value provided and available types in the union.
      let opts;
      if (nil) {
        opts = { nillable: true };
      }
      return this[textInputTemplate](parameter, schema, 'text', opts);
    }

    /**
     * This situation makes not sense as there's no mechanism to describe how to 
     * put a file into a path, query, or headers.
     * @returns {TemplateResult|string} The template for the file shape.
     */
    [fileShapeTemplate]() {
      return '';
    }

    /**
     * For now we do not support union shapes. There's no way to learn how to serialize
     * the Schema shape to a string.
     * @returns {TemplateResult|string} The template for the schema shape.
     */
    [schemaShapeTemplate]() {
      return '';
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @param {ApiArrayShape} schema
     * @returns {TemplateResult|string} The template for the array shape.
     */
    [arrayShapeTemplate](parameter, schema) {
      const { items } = schema;
      if (!items) {
        return '';
      }
      const { id } = parameter;
      const label = AmfSchemaProcessor.readLabelValue(parameter, schema);
      const values = /** @type any[] */ (this[readInputValue](parameter, schema, true));
      const options = { arrayItem: true, };
      const inputs = values.map((value, index) => this[parameterSchemaTemplate](parameter, items, { ...options, value, index }));
      return html`
      <div class="array-form-item" data-param-id="${id}" data-param-label="${label}">
        <div class="array-title"><span class="label">${label}</span></div>
        ${inputs}
        ${this[addArrayItemTemplate](id)}
      </div>
      `;
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @param {ApiTupleShape} schema
     * @returns {TemplateResult|string} The template for the tuple shape.
     */
    [tupleShapeTemplate](parameter, schema) {
      const { items } = schema;
      if (!items) {
        return '';
      }
      // TODO: not sure how to process this value...
      return '';
    }

    /**
     * @param {ApiParameterRecursive} parameter
     * @param {ApiAnyShape} schema
     * @returns {TemplateResult|string} The template for the Any shape.
     */
    [anyShapeTemplate](parameter, schema) {
      return this[textInputTemplate](parameter, schema, 'text');
    }

    /**
     * @param {string} id The id of the parameter to add the value to.
     * @returns {TemplateResult} The template for the adding an array item button
     */
    [addArrayItemTemplate](id) {
      return html`
      <anypoint-button data-id="${id}" @click="${this[addArrayValueHandler]}">Add new value</anypoint-button>
      `;
    }
  }
  return AmfParameterMixin;
}

/**
 * This mixin adds support for rendering operation parameter inputs.
 * It support:
 * - rendering inputs
 * - caching user input
 * - restoring cache input.
 * 
 * @mixin
 */
export const AmfParameterMixin = dedupeMixin(mxFunction);
