/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
import { html } from 'lit-element';
import { notifyChange, } from '@advanced-rest-client/authorization/src/Utils.js';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { AmfParameterMixin, parametersValue, nilValues, parameterTemplate } from './AmfParameterMixin.js';
import * as InputCache from '../../lib/InputCache.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiParametrizedSecuritySchemeRecursive} ApiParametrizedSecuritySchemeRecursive */
/** @typedef {import('@api-client/amf-store').ApiSecurityApiKeySettings} ApiSecurityApiKeySettings */
/** @typedef {import('../AmfAuthorizationMethodElement').default} AmfAuthorizationMethodElement */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.ApiKeyAuthorization} ApiKeyAuthorization */

const titleTemplate = Symbol('titleTemplate');
const headersTemplate = Symbol('headersTemplate');
const queryTemplate = Symbol('queryTemplate');
const cookieTemplate = Symbol('cookieTemplate');
const restoreModelValue = Symbol('restoreModelValue');
export const restoreApiKey = Symbol('restoreApiKey');
export const serializeApiKey = Symbol('serializeApiKey');
export const validateApiKey = Symbol('validateApiKey');
export const initializeApiKeyModel = Symbol('initializeApiKeyModel');
export const renderApiKey = Symbol('renderApiKey');
export const updateQueryParameterApiKey = Symbol('updateQueryParameterApiKey');
export const updateHeaderApiKey = Symbol('updateHeaderApiKey');
export const updateCookieApiKey = Symbol('updateCookieApiKey');
export const clearApiKey = Symbol('clearApiKey');

/**
 * @param {AmfAuthorizationMethodElement} base
 */
const mxFunction = (base) => {
  class ApiKeyMethodMixinImpl extends AmfParameterMixin(base) {
    constructor() {
      super();
      /** @type ApiParametrizedSecuritySchemeRecursive */
      this.security = undefined;
    }
    
    /**
     * Clears previously set values in the cache storage.
     */
    clearApiKeyCache() {
      const params = this[parametersValue];
      (params || []).forEach((param) => {
        InputCache.remove(this, param.paramId, this.globalCache)
      });
    }

    /**
     * Updates query parameter value, if defined in the model.
     * @param {string} name
     * @param {string} newValue
     */
    [updateQueryParameterApiKey](name, newValue) {
      const param = this[parametersValue].find(i => i.binding === 'query' && i.parameter.name === name);
      if (param) {
        InputCache.set(this, param.paramId, newValue, this.globalCache);
      }
    }

    /**
     * Updates header value, if defined in the model.
     * @param {string} name
     * @param {string} newValue
     */
    [updateHeaderApiKey](name, newValue) {
      const param = this[parametersValue].find(i => i.binding === 'header' && i.parameter.name === name);
      if (param) {
        InputCache.set(this, param.paramId, newValue, this.globalCache);
      }
    }

    /**
     * Updates cookie value, if defined in the model.
     * @param {string} name
     * @param {string} newValue
     */
    [updateCookieApiKey](name, newValue) {
      const param = this[parametersValue].find(i => i.binding === 'cookie' && i.parameter.name === name);
      if (param) {
        InputCache.set(this, param.paramId, newValue, this.globalCache);
      }
    }

    /**
     * Restores previously serialized values
     * @param {ApiKeyAuthorization} settings
     */
    [restoreApiKey](settings) {
      if (!settings) {
        return;
      }
      this[restoreModelValue]('header', settings.header);
      this[restoreModelValue]('query', settings.query);
      this[restoreModelValue]('cookie', settings.cookie);
      this.requestUpdate();
    }

    /**
     * Restores previously serialized values on a model
     * @param {string} binding The model to add values to
     * @param {Record<string, string>} restored Previously serialized values
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

    /**
     * Serializes current values to a settings object
     * @return {ApiKeyAuthorization}
     */
    [serializeApiKey]() {
      const params = this[parametersValue];
      const result = /** @type ApiKeyAuthorization */ ({});
      (params || []).forEach((param) => {
        if (!result[param.binding]) {
          result[param.binding] = {};
        }
        result[param.binding][param.parameter.name] = InputCache.get(this, param.paramId, this.globalCache);
      });
      return /** @type ApiKeyAuthorization */ (result);
    }

    [clearApiKey]() {
      const params = this[parametersValue];
      (params || []).forEach((param) => {
        InputCache.set(this, param.paramId, '', this.globalCache)
      });
    }

    /**
     * Performs a validation of current form.
     * By calling this function invalid field are going to be marked as invalid.
     *
     * In the implementation it calls `validate()` function on each input element
     * that is inserted into the DOM.
     *
     * @return {boolean} validation
     */
    [validateApiKey]() {
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

    /**
     * Processes AMF model and generates the view.
     *
     * Note, this function clears previously set parameters.
     *
     * @return {Promise<void>}
     */
    async [initializeApiKeyModel]() {
      const info = /** @type ApiParametrizedSecuritySchemeRecursive */ (this.security);
      if (!info) {
        return;
      }
      if (!info.scheme || !info.scheme.type || !info.scheme.type.startsWith('Api Key')) {
        return;
      }
      const config = /** @type ApiSecurityApiKeySettings */ (info.scheme.settings);
      if (!config) {
        return;
      }
      const { in: binding, id } = config;
      if (!InputCache.has(this, id, this.globalCache)) {
        InputCache.set(this, id, '', this.globalCache);
      }
      const params = this[parametersValue];
      params.push({
        binding,
        paramId: id,
        parameter: { ... /** @type any */ (config), binding },
        source: 'settings',
        schemaId: info.scheme.id,
        schema: /** @type any */ (info.scheme),
      });
      
      this.requestUpdate();
      await this.updateComplete;
      notifyChange(this);
    }


    /**
     * Method that renders the view for Api Key security scheme
     *
     * @return {TemplateResult}
     */
    [renderApiKey]() {
      const { styles } = this;
      return html`
      <style>${styles}</style>
      ${this[titleTemplate]()}
      <form autocomplete="on" class="custom-auth">
        ${this[headersTemplate]()}
        ${this[queryTemplate]()}
        ${this[cookieTemplate]()}
      </form>
      `;
    }

    /**
     * Method that renders scheme's title
     *
     * @return {TemplateResult}
     */
    [titleTemplate]() {
      return html`
      <div class="subtitle">
        <span>Scheme: Api Key</span>
      </div>`;
    }

    /**
     * Method that renders headers, if any
     *
     * @return {TemplateResult|string} Empty string is returned when the section
     * should not be rendered, as documented in `lit-html` library.
     */
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

    /**
     * Method that renders query parameters, if any
     *
     * @return {TemplateResult|string} Empty string is returned when the section
     * should not be rendered, as documented in `lit-html` library.
     */
    [queryTemplate]() {
      const headers = this[parametersValue].filter(item => item.binding === 'query');
      if (!headers.length) {
        return '';
      }
      return html`
      <section class="params-section">
        <div class="section-title"><span class="label">Query parameters</span></div>
        ${headers.map(param => this[parameterTemplate](param))}
      </section>
      `;
    }

    /**
     * Method that renders cookies, if any
     *
     * @return {TemplateResult|string} Empty string is returned when the section
     * should not be rendered, as documented in `lit-html` library.
     */
    [cookieTemplate]() {
      const headers = this[parametersValue].filter(item => item.binding === 'cookie');
      if (!headers.length) {
        return '';
      }
      return html`
      <section class="params-section">
        <div class="section-title"><span class="label">Cookies</span></div>
        ${headers.map(param => this[parameterTemplate](param))}
      </section>
      `;
    }
  }
  return ApiKeyMethodMixinImpl;
}
/**
 * A mixin that adds support for API keys method with AMF model
 *
 * @mixin
 */
export const ApiKeyMethodMixin = dedupeMixin(mxFunction);
