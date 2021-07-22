/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import { notifyChange } from '@advanced-rest-client/authorization/src/Utils.js';
import { AmfParameterMixin, parametersValue, nilValues, parameterTemplate } from './AmfParameterMixin.js';
import * as InputCache from '../../lib/InputCache.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiParametrizedSecuritySchemeRecursive} ApiParametrizedSecuritySchemeRecursive */
/** @typedef {import('@api-client/amf-store').ApiSecuritySettings} ApiSecurityApiKeySettings */
/** @typedef {import('@api-client/amf-store').ApiNodeShape} ApiNodeShape */
/** @typedef {import('../AmfAuthorizationMethodElement').default} AmfAuthorizationMethodElement */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.RamlCustomAuthorization} RamlCustomAuthorization */
/** @typedef {import('../../types').OperationParameter} OperationParameter */

export const initializeCustomModel = Symbol('initializeCustomModel');
export const renderCustom = Symbol('renderCustom');
export const validateCustom = Symbol('validateCustom');
export const serializeCustom = Symbol('serializeCustom');
export const restoreCustom = Symbol('restoreCustom');
export const updateQueryParameterCustom = Symbol('updateQueryParameterCustom');
export const updateHeaderCustom = Symbol('updateHeaderCustom');
export const clearCustom = Symbol('clearCustom');
export const createViewModel = Symbol('createViewModel');
export const readParamsProperties = Symbol('readParamsProperties');
export const headersTemplate = Symbol('headersTemplate');
export const queryTemplate = Symbol('queryTemplate');
export const inputHandler = Symbol('inputHandler');
export const headersParam = Symbol('headersParam');
export const queryParametersParam = Symbol('queryParametersParam');
export const titleTemplate = Symbol('titleTemplate');
export const restoreModelValue = Symbol('restoreModelValue');

/**
 * @param {AmfAuthorizationMethodElement} base
 */
const mxFunction = (base) => {
  class CustomMethodMixin extends AmfParameterMixin(base) {
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
    [updateQueryParameterCustom](name, newValue) {
      const list = /** @type OperationParameter[] */ (this[parametersValue]);
      const param = list.find(i => i.binding === 'query' && i.parameter.name === name);
      if (param) {
        InputCache.set(this, param.paramId, newValue, this.globalCache);
      }
    }

    /**
     * Updates header value, if defined in the model.
     * @param {string} name
     * @param {string} newValue
     */
    [updateHeaderCustom](name, newValue) {
      const list = /** @type OperationParameter[] */ (this[parametersValue]);
      const param = list.find(i => i.binding === 'header' && i.parameter.name === name);
      if (param) {
        InputCache.set(this, param.paramId, newValue, this.globalCache);
      }
    }

    /**
     * Restores previously serialized values
     * @param {RamlCustomAuthorization} settings
     */
    [restoreCustom](settings) {
      if (!settings) {
        return;
      }
      this[restoreModelValue]('header', settings.header);
      this[restoreModelValue]('query', settings.query);
      this.requestUpdate();
    }

    /**
     * @param {string} binding 
     * @param {RamlCustomAuthorization} restored 
     */
    [restoreModelValue](binding, restored) {
      if (!restored) {
        return;
      }
      const params = this[parametersValue].filter(i => i.binding === binding);
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

    [clearCustom]() {
      const params = this[parametersValue];
      (params || []).forEach((param) => {
        InputCache.set(this, param.paramId, '', this.globalCache)
      });
    }

    /**
     * @returns {RamlCustomAuthorization}
     */
    [serializeCustom]() {
      const params = this[parametersValue];
      const result = /** @type RamlCustomAuthorization */ ({});
      (params || []).forEach((param) => {
        if (!result[param.binding]) {
          result[param.binding] = {};
        }
        result[param.binding][param.parameter.name] = InputCache.get(this, param.paramId, this.globalCache);
      });
      return /** @type RamlCustomAuthorization */ (result);
    }

    /**
     * @returns {boolean}
     */
    [validateCustom]() {
      const nils = this[nilValues];
      const params = this[parametersValue];
      return !params.some((param) => {
        if (nils.includes(param.paramId)) {
          return true;
        }
        const value = InputCache.get(this, param.paramId, this.globalCache);
        return !value;
      });
    }

    [initializeCustomModel]() {
      const source = 'settings';
      this.schemeName = undefined;
      this.schemeDescription = undefined;
      this[parametersValue] = this[parametersValue].filter(item => item.source !== source);
      const info = /** @type ApiParametrizedSecuritySchemeRecursive */ (this.security);
      if (!info) {
        return;
      }
      if (!info.scheme || !info.scheme.type || !info.scheme.type.startsWith('x-')) {
        return;
      }
      const params = this[parametersValue];
      const { headers, queryParameters, queryString } = info.scheme;
      if (Array.isArray(headers)) {
        headers.forEach((p) => {
          params.push({
            binding: p.binding,
            paramId: p.id,
            parameter: p,
            source,
            schemaId: p.schema && p.schema.id,
            schema: p.schema,
          });
        });
      }
      if (Array.isArray(queryParameters)) {
        queryParameters.forEach((p) => {
          params.push({
            binding: p.binding,
            paramId: p.id,
            parameter: p,
            source,
            schemaId: p.schema && p.schema.id,
            schema: p.schema,
          });
        });
      }
      if (queryString) {
        const shape = /** @type ApiNodeShape */ (queryString);
        const { properties } = shape;
        properties.forEach((property) => {
          params.push({
            binding: 'query',
            paramId: queryString.id,
            parameter: queryString,
            source,
            schemaId: property.id,
            schema: property,
          });
        })
      }
      this.schemeName = info.scheme.name;
      this.schemeDescription = info.scheme.description;
      this.requestUpdate();
      notifyChange(this);
    }

    [renderCustom]() {
      const { styles } = this;
      return html`
      <style>${styles}</style>
      ${this[titleTemplate]()}
      <form autocomplete="on" class="custom-auth">
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
      const headers = this[parametersValue].filter(item => item.binding === 'header');
      if (!headers.length) {
        return '';
      }
      return html`
      <section class="params-section">
        <div class="section-title"><span class="label">Headers</span></div>
        ${headers.map(param => this[parameterTemplate](param))}
      </section>
      `;
    }

    [queryTemplate]() {
      const params = this[parametersValue].filter(item => item.binding === 'query');
      if (!params.length) {
        return '';
      }
      return html`
      <section class="params-section">
        <div class="section-title"><span class="label">Query parameters</span></div>
        ${params.map(param => this[parameterTemplate](param))}
      </section>
      `;
    }
  }
  return CustomMethodMixin;
}

/**
 * A mixin that adds support for RAML custom method.
 *
 * @mixin
 */
export const CustomMethodMixin = dedupeMixin(mxFunction);
