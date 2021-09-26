import { TemplateResult } from "lit-html";
import { OAuth2Authorization, OAuth2CustomParameter } from "@advanced-rest-client/arc-types/src/authorization/Authorization";
import {
  oauth2CustomPropertiesTemplate,
  serializeOauth2Auth,
  GrantType,
} from '@advanced-rest-client/authorization/src/Oauth2MethodMixin';

export declare const initializeOauth2Model: unique symbol;
export declare const setupOAuthDeliveryMethod: unique symbol;
export declare const getOauth2DeliveryMethod: unique symbol;
export declare const updateGrantTypes: unique symbol;
export declare const preFillAmfData: unique symbol;
export declare const preFillFlowData: unique symbol;
export declare const readSecurityScopes: unique symbol;
export declare const computeGrantList: unique symbol;
export declare const flowForType: unique symbol;
export declare const readFlowScopes: unique symbol;
export declare const readFlowsTypes: unique symbol;
export declare const applyFlow: unique symbol;
export declare const isRamlFlow: unique symbol;
export declare const readPkceValue: unique symbol;

declare function ApiOauth2MethodMixin<T extends new (...args: any[]) => {}>(base: T): T & ApiOauth2MethodMixinConstructor;
export declare interface ApiOauth2MethodMixinConstructor {
  new(...args: any[]): ApiOauth2MethodMixin;
}


export declare interface ApiOauth2MethodMixin {
  [initializeOauth2Model](): void;

  [serializeOauth2Auth](): OAuth2Authorization;

  [setupOAuthDeliveryMethod](scheme: any): void;

  /**
   * Determines placement of OAuth authorization token location.
   * It can be either query parameter or header. This function
   * reads API spec to get this information or provides default if
   * not specifies.
   *
   * @param info Security AMF model
   */
  [getOauth2DeliveryMethod](info: any): any;

  /**
   * Updates list of OAuth grant types supported by current endpoint.
   * The information should be available in RAML file.
   *
   * @param supportedTypes List of supported types. If empty
   * or not set then all available types will be displayed.
   */
  [updateGrantTypes](supportedTypes?: string[]): void;

  /**
   * Computes list of grant types to render in the form.
   *
   * @param allowed List of types allowed by the
   * component configuration or API spec applied to this element. If empty
   * or not set then all OAuth 2.0 default types are returned.
   */
  [computeGrantList](allowed?: string): GrantType[];

  /**
   * It's quite a bit naive approach to determine whether given model is RAML's
   * or OAS'. There is a significant difference of how to treat grant types
   * (in OAS it is called flows). While in OAS it is mandatory to define a grant type
   * (a flow) RAML has no such requirement. By default this component assumes that
   * all standard (OAuth 2 defined) grant types are supported when grant types are not
   * defined. So it is possible to not define them and the component will work.
   * However, in the AMF model there's always at least one grant type (a flow) whether
   * it's RAML's or OAS' and whether grant type is defined or not.
   *
   * To apply correct settings this component needs to know how to process the data.
   * If it's OAS then when changing grant type it also changes current settings
   * (like scopes, auth uri, etc). If the model is RAML's then change in current grant type
   * won't trigger settings setup.
   *
   * Note, this function returns true when there's no flows whatsoever. It's not
   * really what it means but it is consistent with component's logic.
   *
   * Current method is deterministic and when AMF model change this most probably stop
   * working. It tests whether there's a single grant type and this grant type
   * has no AMF's `security:flow` property.
   *
   * @param flows List of current flows loaded with the AMF model.
   * @returns True if current model should be treated as RAML's model.
   */
  [isRamlFlow](flows): boolean;

  /**
   * Reads API security definition and applies in to the view as predefined
   * values.
   *
   * @param model AMF model describing settings of the security scheme
   */
  [preFillAmfData](model: object): void;

  /**
   * Pre-fills authorization data with OAS' definition of a grant type
   * which they call a flow. This method populates form with the information
   * find in the model.
   *
   * It tries to match a flow to currently selected `grantType`. When no match
   * then it takes first flow.
   *
   * Note, flow data are applied when `grantType` change.
   *
   * @param flows List of flows in the authorization description.
   */
  [preFillFlowData](flows: any[]): void;

  /**
   * Searches for a flow in the list of flows for given name.
   *
   * @param flows List of flows to search in.
   * @param type Grant type
   */
  [flowForType](flows: any[], type?: string): any|undefined;

  /**
   * Reads list of scopes from a flow.
   *
   * @param flow A flow to process.
   * @returns List of scopes required by an endpoint / API.
   */
  [readFlowScopes](flow: any): string[];

  /**
   * Reads list of grant types from the list of flows.
   *
   * @param flows List of flows to process.
   * @returns Grant types supported by this authorization.
   */
  [readFlowsTypes](flows: any[]): string[];

  /**
   * Applies settings from a flow to current properties.
   * OAS' flows may define different configuration for each flow.
   * This function is called each time a grant type change. If current settings
   * does not contain flows then this is ignored.
   *
   * @param name The set grant type
   */
  [applyFlow](name?: string): void;

  /**
   * Extracts scopes list from the security definition
   */
  [readSecurityScopes](model: any): string[]|undefined;
  /**
   * Checks whether the security scheme is annotated with the `pkce` annotation.
   * This annotation is published at https://github.com/raml-org/raml-annotations/tree/master/annotations/security-schemes
   * @param model Model for the security settings
   * @returns True if the security settings are annotated with PKCE extension
   */
  [readPkceValue](model: any): boolean|undefined;

  [oauth2CustomPropertiesTemplate](): TemplateResult|string;
}
