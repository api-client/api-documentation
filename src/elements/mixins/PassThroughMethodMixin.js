/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import { notifyChange } from '@advanced-rest-client/authorization/src/Utils.js';
import { ns } from '@api-client/amf-store/worker.index.js';
import { AmfParameterMixin, parametersValue, nilValues, parameterTemplate } from './AmfParameterMixin.js';
import * as InputCache from '../../lib/InputCache.js';

export const headersTemplate = Symbol('headersTemplate');
export const queryTemplate = Symbol('queryTemplate');
export const toggleDocumentation = Symbol('toggleDocumentation');
export const formItemHelpButtonTemplate = Symbol('formItemHelpButtonTemplate');
export const formItemHelpTemplate = Symbol('formItemHelpTemplate');
export const titleTemplate = Symbol('titleTemplate');
export const updateModelValue = Symbol('updateModelValue');
export const restoreModelValue = Symbol('restoreModelValue');
export const restorePassThrough = Symbol('restorePassThrough');
export const serializePassThrough = Symbol('serializePassThrough');
export const validatePassThrough = Symbol('validatePassThrough');
export const initializePassThroughModel = Symbol('initializePassThroughModel');
export const renderPassThrough = Symbol('renderPassThrough');
export const updateQueryParameterPassThrough = Symbol('updateQueryParameterPassThrough');
export const updateHeaderPassThrough = Symbol('updateHeaderPassThrough');
export const clearPassThrough = Symbol('clearPassThrough');
export const appendQueryString = Symbol('appendQueryString');
const appendToParams = Symbol('appendToParams');

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiParametrizedSecuritySchemeRecursive} ApiParametrizedSecuritySchemeRecursive */
/** @typedef {import('@api-client/amf-store').ApiSecuritySettings} ApiSecurityApiKeySettings */
/** @typedef {import('@api-client/amf-store').ApiParameterRecursive} ApiParameterRecursive */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.PassThroughAuthorization} PassThroughAuthorization */
/** @typedef {import('../AmfAuthorizationMethodElement').default} AmfAuthorizationMethodElement */
/** @typedef {import('../../types').OperationParameter} OperationParameter */

/**
 * @param {AmfAuthorizationMethodElement} base
 */
const mxFunction = (base) => {
  class PassThroughMethodMixin extends AmfParameterMixin(base) {
    constructor() {
      super();
      /** @type ApiParametrizedSecuritySchemeRecursive */
      this.security = undefined;
    }

    /**
     * Updates query parameter value, if defined in the model.
     * @param {string} name
     * @param {string} newValue
     */
    [updateQueryParameterPassThrough](name, newValue) {
      this[updateModelValue]('query', name, newValue);
    }

    /**
     * Updates header value, if defined in the model.
     * @param {string} name
     * @param {string} newValue
     */
    [updateHeaderPassThrough](name, newValue) {
      this[updateModelValue]('header', name, newValue);
    }

    /**
     * Updates header or query parameters value, if defined in the model.
     * @param {string} binding
     * @param {string} name
     * @param {string} newValue
     */
    [updateModelValue](binding, name, newValue) {
      const list = /** @type OperationParameter[] */ (this[parametersValue]);
      const param = list.find(i => i.binding === binding && i.parameter.name === name);
      if (param) {
        InputCache.set(this, param.paramId, newValue, this.globalCache);
      }
      this.requestUpdate();
    }

    /**
     * Restores previously serialized values
     * @param {PassThroughAuthorization} settings
     */
    [restorePassThrough](settings) {
      if (!settings) {
        return;
      }
      this[restoreModelValue]('header', settings.header);
      this[restoreModelValue]('query', settings.query);
      this.requestUpdate();
    }

    /**
     * Restores previously serialized values on a model
     * @param {string} binding 
     * @param {Record<string, string>} restored 
     */
    [restoreModelValue](binding, restored) {
      if (!restored) {
        return;
      }
      const params = /** @type OperationParameter[] */ (this[parametersValue]).filter(i => i.binding === binding);
      if (!params) {
        return;
      }
      Object.keys(restored).forEach((name) => {
        const param = params.find(i => i.parameter.name === name);
        if (param) {
          InputCache.set(this, param.paramId, restored[name], this.globalCache);
        }
      });
    }

    /**
     * @returns {PassThroughAuthorization}
     */
    [serializePassThrough]() {
      const params = /** @type OperationParameter[] */ (this[parametersValue]);
      const result = /** @type PassThroughAuthorization */ ({});
      (params || []).forEach((param) => {
        if (!result[param.binding]) {
          result[param.binding] = {};
        }
        let value = InputCache.get(this, param.paramId, this.globalCache);
        if (value === '' || value === undefined) {
          if (param.parameter.required === false) {
            return;
          }
          value = '';
        }
        if (value === false && param.parameter.required === false) {
          return;
        }
        if (value === null) {
          value = '';
        }
        result[param.binding][param.parameter.name] = value;
      });
      return result;
    }

    [clearPassThrough]() {
      const params = /** @type OperationParameter[] */ (this[parametersValue]);
      (params || []).forEach((param) => {
        InputCache.set(this, param.paramId, '', this.globalCache)
      });
    }

    [validatePassThrough]() {
      const nils = this[nilValues];
      const params = /** @type OperationParameter[] */ (this[parametersValue]);
      const hasInvalid = params.some((param) => {
        if (nils.includes(param.paramId)) {
          return false;
        }
        const value = InputCache.get(this, param.paramId, this.globalCache);
        if (!value && !param.parameter.required) {
          return false;
        }
        return !value;
      });
      return !hasInvalid;
    }

    [initializePassThroughModel]() {
      const { security } = this;
      this[parametersValue] = /** @type OperationParameter[] */ ([]);
      if (!security || !security.types.includes(ns.aml.vocabularies.security.ParametrizedSecurityScheme)) {
        return;
      }
      const { scheme } = security;
      if (!scheme) {
        return;
      }
      if (!scheme.type || !String(scheme.type).startsWith('Pass Through')) {
        return;
      }
      const { headers, queryParameters, queryString } = scheme;
      this[appendToParams](headers, 'header', true);
      this[appendToParams](queryParameters, 'query', true);
      if (queryString && (!queryParameters || !queryParameters.length)) {
        this[appendQueryString](queryString);
      }
      this.schemeName = security.name;
      this.schemeDescription = scheme.description;
      notifyChange(this);
      this.requestUpdate();
    }

    /**
     * @param {ApiShapeUnion} queryString
     */
    [appendQueryString](queryString) {
      const object = /** @type ApiNodeShape */ (queryString);
      if (!object.properties || !object.properties.length) {
        return;
      }
      const list = object.properties.map((item) => {
        const { id, range, name, minCount } = item;
        return /** @type ApiParameterRecursive */ ({
          id,
          binding: 'query',
          schema: range,
          name,
          examples: [],
          payloads: [],
          types: [ns.aml.vocabularies.apiContract.Parameter],
          required: minCount > 0,
        });
      });
      this[appendToParams](list, 'query', true);
    }

    /**
     * Appends a list of parameters to the list of rendered parameters.
     * @param {ApiParameterRecursive[]} list
     * @param {string} source
     * @param {boolean=} clear When set it clears the previously set parameters
     */
    [appendToParams](list, source, clear=false) {
      let params = this[parametersValue];
      if (clear) {
        params = params.filter(p => p.source !== source);
      }
      if (Array.isArray(list)) {
        list.forEach((param) => {
          params.push({
            paramId: param.id,
            parameter: param,
            binding: param.binding,
            source,
            schema: param.schema,
            schemaId: param.schema && param.schema.id ? param.schema.id : undefined,
          });
        });
      }
      this[parametersValue] = params;
    }

    [renderPassThrough]() {
      const { styles, } = this;
      return html`
      <style>${styles}</style>
      ${this[titleTemplate]()}
      <form autocomplete="on" class="passthrough-auth">
        ${this[headersTemplate]()}
        ${this[queryTemplate]()}
      </form>
      `;
    }

    [titleTemplate]() {
      const {
        schemeName,
        schemeDescription,
        compatibility,
        descriptionOpened,
      } = this;
      if (!schemeName) {
        return '';
      }
      return html`
      <div class="subtitle">
        <span>Scheme: ${schemeName}</span>
        ${schemeDescription ? html`<anypoint-icon-button
          class="hint-icon"
          title="Toggle description"
          aria-label="Activate to toggle the description"
          ?compatibility="${compatibility}"
          @click="${this.toggleDescription}"
        >
          <arc-icon icon="help"></arc-icon>
        </anypoint-icon-button>` : ''}
      </div>
      ${schemeDescription && descriptionOpened ? html`<div class="docs-container">
        <arc-marked .markdown="${schemeDescription}" sanitize>
          <div slot="markdown-html" class="markdown-body"></div>
        </arc-marked>
      </div>` : ''}`;
    }

    [headersTemplate]() {
      const params = /** @type OperationParameter[] */ (this[parametersValue]);
      const items = params.filter(p => p.binding === 'header');
      if (!items.length) {
        return '';
      }
      return html`
      <section class="params-section">
        <div class="section-title"><span class="label">Headers</span></div>
        ${items.map(param => this[parameterTemplate](param))}
      </section>
      `;
    }

    [queryTemplate]() {
      const params = /** @type OperationParameter[] */ (this[parametersValue]);
      const items = params.filter(p => p.binding === 'query');
      if (!items.length) {
        return '';
      }
      return html`
      <section class="params-section">
        <div class="section-title"><span class="label">Query parameters</span></div>
        ${items.map(param => this[parameterTemplate](param))}
      </section>
      `;
    }
  }
  return PassThroughMethodMixin;
}

/**
 * A mixin that adds support for PassThrough method with AMF model
 *
 * @mixin
 */
export const PassThroughMethodMixin = dedupeMixin(mxFunction);
