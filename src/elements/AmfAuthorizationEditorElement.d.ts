import { RequestAuthorization } from '@advanced-rest-client/arc-types/src/request/ArcRequest';
import { ApiParametrizedSecuritySchemeRecursive, ApiSecurityRequirementRecursive } from '@api-client/amf-store';
import { CSSResult, TemplateResult } from 'lit-element';
import { CredentialSource } from '../types.js';
import AmfAuthorizationMethodElement from './AmfAuthorizationMethodElement.js';
import { AmfEditorsBase, queryingValue } from "./AmfEditorsBase.js";

/** @typedef {import('@api-client/amf-store').ApiSecurityRequirementRecursive} ApiSecurityRequirementRecursive */
/** @typedef {import('@api-client/amf-store').ApiParametrizedSecuritySchemeRecursive} ApiParametrizedSecuritySchemeRecursive */
/** @typedef {import('@api-client/amf-store').ApiSecuritySchemeRecursive} ApiSecuritySchemeRecursive */
/** @typedef {import('@api-client/amf-store').ApiSecurityHttpSettings} ApiSecurityHttpSettings */
/** @typedef {import('./AmfAuthorizationMethodElement').default} AmfAuthorizationMethodElement */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.RequestAuthorization} RequestAuthorization */

export const querySecurity: unique symbol;
export const securityValue: unique symbol;
export const processModel: unique symbol;
export const methodsValue: unique symbol;
export const computeMethods: unique symbol;
export const listSchemeLabels: unique symbol;
export const methodTemplate: unique symbol;
export const apiKeyTemplate: unique symbol;
export const oa2AuthTemplate: unique symbol;
export const oa1AuthTemplate: unique symbol;
export const bearerAuthTemplate: unique symbol;
export const basicAuthTemplate: unique symbol;
export const digestAuthTemplate: unique symbol;
export const passThroughAuthTemplate: unique symbol;
export const ramlCustomAuthTemplate: unique symbol;
export const methodTitleTemplate: unique symbol;
export const changeHandler: unique symbol;
export const createSettings: unique symbol;

export default class AmfAuthorizationEditorElement extends AmfEditorsBase {
  static get styles(): CSSResult[];

  /**
   * Redirect URL for the OAuth2 authorization.
   * @attribute
   */
  oauth2RedirectUri: string;
  /** 
   * When set it overrides the `authorizationUri` in the authorization editor,
   * regardless to the authorization scheme applied to the request.
   * This is to be used with the mocking service.
   * @attribute
   */
  oauth2AuthorizationUri: string;
  /** 
   * When set it overrides the `authorizationUri` in the authorization editor,
   * regardless to the authorization scheme applied to the request.
   * This is to be used with the mocking service.
   * @attribute
   */
  oauth2AccessTokenUri: string;
  // Current HTTP method. Passed by digest method.
  httpMethod: string;
  // Current request URL. Passed by digest method.
  requestUrl: string;
  // Current request body. Passed by digest method.
  requestBody: any;
  /**
  * Whether or not the element is invalid. The validation state changes
  * when settings change or when the `validate()` function is called.
  */
  invalid: boolean;
  /**
    * List of credentials source
    */
  credentialsSource: Array<CredentialSource>;
  [securityValue]: ApiSecurityRequirementRecursive;

  /**
   * Queries for the security requirement.
   */
  queryGraph(): Promise<void>;

  /**
   * @param id The domain id of the security requirement.
   */
  [querySecurity](id: string): Promise<void>;

  /**
   * Reads list of authorization methods from the model.
   */
  [processModel](): void;

  /**
   * Computes list of security schemes that can be applied to the element.
   *
   * @param schemes A list of security schemes to process.
   * @returns  A list of authorization methods that can be applied to
   * the current endpoint. Each object describes the list of security types
   * that can be applied to the editor. In OAS an auth method may be an union
   * of methods.
   */
  [computeMethods](schemes: ApiParametrizedSecuritySchemeRecursive[]): any;

  /**
   * Reads authorization scheme's name and type from the AMF model.
   * @param security
   * @return First item is the type and the second is the name. May be undefined.
   */
  [listSchemeLabels](security: ApiParametrizedSecuritySchemeRecursive): string[];

  /**
   * A function called each time anything change in the editor.
   * Revalidates the component and dispatches the `change` event.
   */
  [changeHandler](): void;

  /**
   * Validates state of the editor. It sets `invalid` property when called.
   *
   * Exception: OAuth 2 form reports valid even when the `accessToken` is not
   * set. This adjust for this and reports invalid when `accessToken` for OAuth 2
   * is missing.
   *
   * @return True when the form has valid data.
   */
  validate(): boolean;

  /**
   * Creates a list of configuration by calling the `serialize()` function on each
   * currently rendered authorization form.
   *
   * @return List of authorization settings.
   */
  serialize(): RequestAuthorization[];

  /**
   * Creates an authorization settings object for passed authorization panel.
   * @param target api-authorization-method instance
   */
  [createSettings](target: AmfAuthorizationMethodElement): RequestAuthorization;

  /**
   * Calls the `authorize()` function on each rendered authorization methods.
   * Currently only `OAuth 1.0` and `OAuth 2.0` actually perform the authorization. 
   * 
   * Each method is called in order to make sure the user is not overwhelmed with 
   * dialogs or other UI elements.
   * 
   * The function rejects when at least one authorization method rejects.
   */
  authorize(): Promise<void>;

  render(): TemplateResult;

  [methodTemplate](scheme: ApiParametrizedSecuritySchemeRecursive, type: string): TemplateResult | string;

  /**
   * Renders title to be rendered above authorization method
   * @param scheme Authorization scheme to be applied to the method
   */
  [methodTitleTemplate](scheme: ApiParametrizedSecuritySchemeRecursive): TemplateResult | string;

  /**
   * Renders a template for Basic authorization.
   *
   * @param security Security scheme
   */
  [basicAuthTemplate](security: ApiParametrizedSecuritySchemeRecursive): TemplateResult;

  /**
   * Renders a template for Digest authorization.
   *
   * @param security Security scheme
   */
  [digestAuthTemplate](security: ApiParametrizedSecuritySchemeRecursive, renderTitle?: boolean): TemplateResult;

  /**
   * Renders a template for Pass through authorization.
   *
   * @param security Security scheme
   */
  [passThroughAuthTemplate](security: ApiParametrizedSecuritySchemeRecursive, renderTitle?: boolean): TemplateResult;

  /**
   * Renders a template for RAML custom authorization.
   *
   * @param security Security scheme
   */
  [ramlCustomAuthTemplate](security: ApiParametrizedSecuritySchemeRecursive): TemplateResult;

  /**
   * Renders a template for Bearer authorization (OAS).
   *
   * @param security Security scheme
   */
  [bearerAuthTemplate](security: ApiParametrizedSecuritySchemeRecursive, renderTitle?: boolean): TemplateResult;

  /**
   * Renders a template for OAuth 1 authorization.
   *
   * @param security Security scheme
   */
  [oa1AuthTemplate](security: ApiParametrizedSecuritySchemeRecursive, renderTitle?: boolean): TemplateResult;

  /**
   * Renders a template for OAuth 2 authorization.
   *
   * @param security Security scheme
   */
  [oa2AuthTemplate](security: ApiParametrizedSecuritySchemeRecursive): TemplateResult;

  /**
   * Renders a template for Api Keys authorization.
   *
   * @param security Security scheme
   */
  [apiKeyTemplate](security: ApiParametrizedSecuritySchemeRecursive): TemplateResult;
}
