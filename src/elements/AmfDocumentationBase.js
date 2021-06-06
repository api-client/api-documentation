/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const sectionToggleClickHandler = Symbol('sectionToggleClickHandler');
export const sectionToggleTemplate = Symbol('sectionToggleTemplate');
export const paramsSectionTemplate = Symbol('paramsSectionTemplate');
export const schemaItemTemplate = Symbol('schemaItemTemplate');
export const queryDebounce = Symbol('queryDebounce');
export const debounceValue = Symbol('debounceValue');
export const queryingValue = Symbol('queryingValue');
export const domainIdValue = Symbol('domainIdValue');

/**
 * A base class for the documentation components with common templates and functions.
 */
export class AmfDocumentationBase extends EventsTargetMixin(LitElement) {
  /** 
   * @returns {boolean} When true then the element is currently querying for the graph data.
   */
  get querying() {
    return this[queryingValue] || false;
  }

  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  get domainId() {
    return this[domainIdValue];
  }

  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  set domainId(value) {
    const old = this[domainIdValue];
    if (old === value) {
      return;
    }
    this[domainIdValue] = value;
    this.requestUpdate('domainId', old);
    if (value) {
      this[queryDebounce]();
    }
  }

  static get properties() {
    return {
      /** 
       * The domain id of the object to render.
       */
      domainId: { type: String, reflect: true },
    };
  }

  constructor() {
    super();
    /** 
     * The timeout after which the `queryGraph()` function is called 
     * in the debouncer.
     */
    this.queryDebouncerTimeout = 2;
    /** 
     * Flag set when the element is querying for the data.
     */
    this[queryingValue] = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.domainId) {
      this[queryDebounce]();
    }
  }

  /**
   * Calls the `queryGraph()` function in a debouncer.
   */
  [queryDebounce]() {
    if (this[debounceValue]) {
      clearTimeout(this[debounceValue]);
    }
    this[debounceValue] = setTimeout(() => {
      this[debounceValue] = undefined;
      this.queryGraph();
    }, this.queryDebouncerTimeout);
  }

  /**
   * The main function to use to query the graph for the model being rendered.
   * To be implemented by the child classes.
   */
  queryGraph() {
    // ...
  }

  /**
   * A handler for the section toggle button click.
   * @param {Event} e
   */
  [sectionToggleClickHandler](e) {
    const button = /** @type HTMLElement */ (e.currentTarget);
    const { ctrlProperty } = button.dataset;
    if (!ctrlProperty) {
      return;
    }
    this[ctrlProperty] = !this[ctrlProperty];
  }

  /**
   * @param {string} ctrlProperty
   * @return {TemplateResult|string} The template for the section toggle button
   */
  [sectionToggleTemplate](ctrlProperty) {
    const label = this[ctrlProperty] ? 'Hide' : 'Show';
    const classes = {
      'section-toggle': true,
      opened: this[ctrlProperty],
    };
    return html`
    <anypoint-button 
      data-ctrl-property="${ctrlProperty}" 
      class="${classMap(classes)}"
      @click="${this[sectionToggleClickHandler]}"
    >
      ${label} <arc-icon icon="keyboardArrowDown" class="toggle-icon"></arc-icon>
    </anypoint-button>
    `;
  }

  /**
   * @param {string} label The section label.
   * @param {string} openedProperty The name of the element property to be toggled when interacting with the toggle button.
   * @param {TemplateResult|TemplateResult[]} content The content to render.
   * @returns {TemplateResult} The template for a toggle section with a content.
   */
  [paramsSectionTemplate](label, openedProperty, content) {
    const opened = this[openedProperty];
    return html`
    <div class="params-section">
      <div class="params-title">
        <span class="label">${label}</span>
        ${this[sectionToggleTemplate](openedProperty)}
      </div>
      <anypoint-collapse .opened="${opened}">
        ${content}
      </anypoint-collapse>
    </div>
    `;
  }

  /**
   * @param {string} id Schema domain id
   * @return {TemplateResult} The template for the schema item document
   */
  [schemaItemTemplate](id) {
    return html`
    <amf-parameter-document .domainId="${id}" class="property-item"></amf-parameter-document>
    `;
  }
}
