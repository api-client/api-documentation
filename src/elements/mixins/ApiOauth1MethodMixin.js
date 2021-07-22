import { defaultSignatureMethods } from '@advanced-rest-client/authorization/src/Oauth1MethodMixin.js';
import { dedupeMixin } from '@open-wc/dedupe-mixin';

export const initializeOauth1Model = Symbol('initializeOauth1Model');

/** @typedef {import('@api-client/amf-store').ApiParametrizedSecuritySchemeRecursive} ApiParametrizedSecuritySchemeRecursive */
/** @typedef {import('@api-client/amf-store').ApiSecurityOAuth1Settings} ApiSecurityOAuth1Settings */
/** @typedef {import('../AmfAuthorizationMethodElement').default} AmfAuthorizationMethodElement */

/**
 * @param {AmfAuthorizationMethodElement} base
 */
const mxFunction = (base) => {
  class ApiOauth1MethodMixin extends base {
    [initializeOauth1Model]() {
      const info = /** @type ApiParametrizedSecuritySchemeRecursive */ (this.security);
      if (!info) {
        this.signatureMethods = defaultSignatureMethods;
        return;
      }
      if (!info.scheme || !info.scheme.type || info.scheme.type !== 'OAuth 1.0') {
        this.signatureMethods = defaultSignatureMethods;
        return;
      }
      const config = /** @type ApiSecurityOAuth1Settings */ (info.scheme.settings);
      if (!config) {
        this.signatureMethods = defaultSignatureMethods;
        return;
      }
      
      
      this.requestTokenUri = config.requestTokenUri;
      this.authorizationUri = config.authorizationUri;
      this.accessTokenUri = config.tokenCredentialsUri;
      const { signatures } = config;
      if (!signatures || !signatures.length) {
        this.signatureMethods = defaultSignatureMethods;
      } else {
        this.signatureMethods = signatures;
      }
      this.requestUpdate();
    }
  }
  return ApiOauth1MethodMixin;
}

/**
 * A mixin that adds support for OAuth 1 method with AMF model
 *
 * @mixin
 */
export const ApiOauth1MethodMixin = dedupeMixin(mxFunction);
