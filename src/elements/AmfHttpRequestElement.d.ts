import { ArcBaseRequest } from "@advanced-rest-client/arc-types/src/request/ArcRequest";
import { CredentialSource } from "@advanced-rest-client/authorization/src/AuthorizationMethodElement";
import { ApiEndPoint, ApiParameterRecursive, ApiPayload, ApiPayloadRecursive, ApiServer, ApiStoreStateCreateEvent, ApiStoreStateDeleteEvent, ApiStoreStateUpdateEvent } from "@api-client/amf-store";
import { TemplateResult, CSSResult } from "lit-element";
import { OperationParameter, SecuritySelectorListItem } from "../types.js";
import { AmfEditorsBase } from './AmfEditorsBase.js';
import { ApiOperation } from "./AmfOperationDocumentElement.js";
import { AmfParameterMixin } from './mixins/AmfParameterMixin.js';

export declare const serverIdValue: unique symbol;
export declare const computeUrlValue: unique symbol;
export declare const processOperation: unique symbol;
export declare const operationUpdatedHandler: unique symbol;
export declare const endpointUpdatedHandler: unique symbol;
export declare const serverCreatedHandler: unique symbol;
export declare const serverUpdatedHandler: unique symbol;
export declare const serverDeletedHandler: unique symbol;
export declare const payloadCreatedHandler: unique symbol;
export declare const payloadDeletedHandler: unique symbol;
export declare const mediaTypeSelectHandler: unique symbol;
export declare const urlValue: unique symbol;
export declare const preselectServer: unique symbol;
export declare const serversSectionTemplate: unique symbol;
export declare const serverItemTemplate: unique symbol;
export declare const serverChangeHandler: unique symbol;
export declare const queryParameters: unique symbol;
export declare const updateServerParameters: unique symbol;
export declare const updateEndpointParameters: unique symbol;
export declare const parametersTemplate: unique symbol;
export declare const headersTemplate: unique symbol;
export declare const appendToParams: unique symbol;
export declare const mainActionTemplate: unique symbol;
export declare const sendClickHandler: unique symbol;
export declare const bodyTemplate: unique symbol;
export declare const mediaTypeSelectorTemplate: unique symbol;
export declare const rawBodyChangeHandler: unique symbol;
export declare const modelBodyEditorChangeHandler: unique symbol;
export declare const formDataEditorTemplate: unique symbol;
export declare const multipartEditorTemplate: unique symbol;
export declare const rawEditorTemplate: unique symbol;
export declare const authorizationTemplate: unique symbol;
export declare const authorizationSelectorTemplate: unique symbol;
export declare const processSecurity: unique symbol;
export declare const securityList: unique symbol;
export declare const selectedSecurity: unique symbol;
export declare const authorizationSelectorItemTemplate: unique symbol;
export declare const authSelectorHandler: unique symbol;
export declare const internalSendHandler: unique symbol;

/**
 * A class that creates an editor for for an HTTP request based on the AMF entry.
 */
export default class AmfHttpRequestElement extends AmfParameterMixin(AmfEditorsBase) {
  static get styles(): CSSResult;

  serverId: string;

  /**
   * The currently rendered payload, if any.
   */
  get payload(): ApiPayloadRecursive | undefined;

  get payloads(): ApiPayloadRecursive[] | undefined;

  /** 
   * The currently selected media type for the payloads.
   */
  mimeType: string;
  /**
  * OAuth2 redirect URI.
  * This value **must** be set in order for OAuth 1/2 to work properly.
  */
  oauth2RedirectUri: string;
  /** 
   * When set it overrides the `authorizationUri` in the authorization editor,
   * regardless to the authorization scheme applied to the request.
   * This is to be used with the mocking service.
   */
  oauth2AuthorizationUri: string;
  /** 
   * When set it overrides the `authorizationUri` in the authorization editor,
   * regardless to the authorization scheme applied to the request.
   * This is to be used with the mocking service.
   */
  oauth2AccessTokenUri: string;
  /**
  * List of credentials source
  */
  credentialsSource: CredentialSource[];
  [urlValue]: string;
  [selectedSecurity]: number;

  constructor();

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node: EventTarget): void;

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node: EventTarget): void;

  /**
   * The main function to use to query the graph for the model being rendered.
   * To be implemented by the child classes.
   */
  queryGraph(): Promise<void>;

  /**
   * Collects operations input parameters into a single object.
   */
  [processOperation](): void;

  /**
   * Processes security information for the UI.
   */
  [processSecurity](): void;

  /**
   * Appends a list of parameters to the list of rendered parameters
   */
  [appendToParams](list: ApiParameterRecursive[], source: string): void;

  /**
   * Queries for parameters in bulk
   */
  [queryParameters](ids: string[], source: string): Promise<OperationParameter[]>;

  /**
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue](): void;

  /**
   * Called when anything server related changed to check whether there is 
   * a valid sever selection and whether a server should be selected.
   */
  [preselectServer](): void;

  /**
   * Checks if the current server has variables and requests them when needed.
   */
  [updateServerParameters](): Promise<void>;

  /**
   * Checks if the current endpoint has variables and requests them when needed.
   */
  [updateEndpointParameters](): Promise<void>;
  [operationUpdatedHandler](e: ApiStoreStateUpdateEvent<ApiOperation>): Promise<void>;
  [endpointUpdatedHandler](e: ApiStoreStateUpdateEvent<ApiEndPoint>): Promise<void>;
  [serverCreatedHandler](e: ApiStoreStateCreateEvent<ApiServer>): Promise<void>;
  [serverUpdatedHandler](e: ApiStoreStateUpdateEvent<ApiServer>): Promise<void>;
  [serverDeletedHandler](e: ApiStoreStateDeleteEvent): Promise<void>;
  [payloadCreatedHandler](e: ApiStoreStateCreateEvent<ApiPayload>): Promise<void>;
  [payloadDeletedHandler](e: ApiStoreStateDeleteEvent): void;
  [mediaTypeSelectHandler](e: Event): void;
  [serverChangeHandler](e: Event): void;

  /**
   * Handler for the send button click.
   */
  [sendClickHandler](): void;

  /**
   * A handler for the change event dispatched by the `raw` editor.
   */
  [rawBodyChangeHandler](e: Event): void;

  /**
   * A handler for the change event dispatched by the 
   * `urlEncode` editor.
   * Updated the local value, model, and notifies the change.
   */
  [modelBodyEditorChangeHandler](e: Event): void;
  [authSelectorHandler](e: Event): void;
  [internalSendHandler](e: Event): void;

  /**
   * Serializes the request to the EditorRequest object with the `ArcBaseRequest` request on it.
   */
  serialize(): ArcBaseRequest;

  /**
   * Executes the current request.
   * This dispatches the send event with request details and the hosting application
   * should decide what to do with it.
   */
  send(): void;

  render(): TemplateResult;

  /**
   * @returns The template for a server selector.
   */
  [serversSectionTemplate](): TemplateResult | string;

  /**
   * @param server The API server to process.
   * @returns The template for a server list item. 
   */
  [serverItemTemplate](server: ApiServer): TemplateResult;

  [parametersTemplate](): TemplateResult | string;

  [headersTemplate](): TemplateResult | string;

  /**
   * @returns The template for the main CTA
   */
  [mainActionTemplate](): TemplateResult;

  [mediaTypeSelectorTemplate](): TemplateResult | string;

  /**
   * @returns The template for the body editor. 
   */
  [bodyTemplate](): TemplateResult | string;

  /**
   * @returns The template for the editor that specializes in the URL encoded form data
   */
  [formDataEditorTemplate](info: any, id: string): TemplateResult;

  /**
   * @returns The template for the editor that specializes in the multipart form data
   */
  [multipartEditorTemplate](info: any, id: string): TemplateResult;

  /**
   * @returns The template for the editor that specializes in any text data
   */
  [rawEditorTemplate](info: any, id: string, mimeType: string): TemplateResult;

  [authorizationTemplate](): TemplateResult | string;

  /**
   * @returns The template for the security drop down selector.
   */
  [authorizationSelectorTemplate](security: SecuritySelectorListItem, selected: number): TemplateResult;

  /**
   * @param {SecuritySelectorListItem} info
   * @returns The template for the security drop down selector list item.
   */
  [authorizationSelectorItemTemplate](info: SecuritySelectorListItem): TemplateResult;
}
