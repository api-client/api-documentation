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

/**
 * A base class for the documentation components with common templates and functions.
 */
export class AmfDocumentationBase extends EventsTargetMixin(LitElement) {
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
    <amf-parameter-document .parameterId="${id}" class="property-item"></amf-parameter-document>
    `;
  }
}
