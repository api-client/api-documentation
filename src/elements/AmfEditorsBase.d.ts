import { LitElement } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin';
import { ApiEndPoint, ApiOperationRecursive, ApiServer } from '@api-client/amf-store/worker.index.js';

export const queryDebounce: unique symbol;
export const debounceValue: unique symbol;
export const queryingValue: unique symbol;
export const domainIdValue: unique symbol;
export const queryEndpoint: unique symbol;
export const queryOperation: unique symbol;
export const queryServers: unique symbol;
export const operationValue: unique symbol;
export const endpointValue: unique symbol;
export const serversValue: unique symbol;

export declare class AmfEditorsBase extends EventsTargetMixin(LitElement) {
  /** 
   * @returns When true then the element is currently querying for the graph data.
   */
  get querying(): boolean;

  /** 
  * The domain id of the object to render.
  * @attribute
  */
  domainId: string;
  /** 
  * Enabled compatibility with the Anypoint platform.
  * @attribute
  */
  anypoint: boolean;
  /** 
   * The timeout after which the `queryGraph()` function is called 
   * in the debouncer.
   */
  queryDebouncerTimeout: number;
  /** 
   * Flag set when the element is querying for the data.
   */
  [queryingValue]: boolean;
  [operationValue]: ApiOperationRecursive;
  [serversValue]: ApiServer[];
  [endpointValue]: ApiEndPoint;

  constructor();

  connectedCallback(): void;

  /**
   * Calls the `queryGraph()` function in a debouncer.
   */
  [queryDebounce](): void;

  /**
   * The main function to use to query the graph for the model being rendered.
   * To be implemented by the child classes.
   */
  queryGraph(): Promise<void>;

  /**
   * Queries for the API operation data.
   * @param operationId The operation ID to read.
   */
  [queryOperation](operationId: string): Promise<void>;

  /**
   * Queries for the API operation's endpoint data.
   * @param operationId The operation ID.
   */
  [queryEndpoint](operationId: string): Promise<void>;

  /**
   * Queries for the current servers value.
   */
  [queryServers](): Promise<void>;
}
