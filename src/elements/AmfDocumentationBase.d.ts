/* eslint-disable class-methods-use-this */
import { LitElement, TemplateResult } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin';

export declare const sectionToggleClickHandler: unique symbol;
export declare const sectionToggleTemplate: unique symbol;
export declare const paramsSectionTemplate: unique symbol;
export declare const schemaItemTemplate: unique symbol;
export declare const queryDebounce: unique symbol;
export declare const debounceValue: unique symbol;
export declare const queryingValue: unique symbol;
export declare const domainIdValue: unique symbol;

/**
 * A base class for the documentation components with common templates and functions.
 */
export class AmfDocumentationBase extends EventsTargetMixin(LitElement) {
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
   * The timeout after which the `queryGraph()` function is called 
   * in the debouncer.
   */
  queryDebouncerTimeout: number;
  /** 
   * Flag set when the element is querying for the data.
   */
  [queryingValue]: boolean;

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
   * A handler for the section toggle button click.
   */
  [sectionToggleClickHandler](e: Event): void;

  /**
   * @return The template for the section toggle button
   */
  [sectionToggleTemplate](ctrlProperty: string): TemplateResult;

  /**
   * @param label The section label.
   * @param openedProperty The name of the element property to be toggled when interacting with the toggle button.
   * @param content The content to render.
   * @returns The template for a toggle section with a content.
   */
  [paramsSectionTemplate](label: string, openedProperty: string, content: TemplateResult|TemplateResult[]): TemplateResult;

  /**
   * @param id Schema domain id
   * @return The template for the schema item document
   */
  [schemaItemTemplate](id: string): TemplateResult;
}
