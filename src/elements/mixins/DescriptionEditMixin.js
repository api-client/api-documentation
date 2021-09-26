/* eslint-disable class-methods-use-this */
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { html } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
// eslint-disable-next-line no-unused-vars
import { AmfDocumentationBase } from '../AmfDocumentationBase.js';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@advanced-rest-client/highlight/markdown-editor.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('./DescriptionEditMixin').DescriptionTemplateOptions} DescriptionTemplateOptions */

export const descriptionFocusHandler = Symbol('descriptionFocusHandler');
export const descriptionEditor = Symbol('descriptionEditor');
export const descriptionBlurHandler = Symbol('descriptionBlurHandler');
export const descriptionInputHandler = Symbol('descriptionInputHandler');
export const updateDescription = Symbol('updateDescription');
export const descriptionEditorTemplate = Symbol('descriptionEditorTemplate');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const descriptionEmptyTemplate = Symbol('descriptionEmptyTemplate');
export const descriptionWrapper = Symbol('descriptionWrapper');
export const focusMarkdownEditor = Symbol('focusMarkdownEditor');

/**
 * @param {typeof AmfDocumentationBase} base
 */
const mxFunction = base => {
  class DescriptionEditMixin extends base {
    constructor() {
      super();
      /**
       * @type {boolean}
       */
      this[descriptionEditor] = undefined;
    }

    /**
     * Enables the description markdown editor.
     * @return {Promise<void>} 
     */
    async [descriptionFocusHandler]() {
      if (!this.edit) {
        return;
      }
      this[descriptionEditor] = true;
      await this.requestUpdate();
      this[focusMarkdownEditor]();
    }

    /**
     * Focuses on the markdown editor.
     */
    [focusMarkdownEditor]() {
      const content = this.shadowRoot.querySelector('markdown-editor');
      const focusNode = /** @type HTMLElement */ (content.children[0].childNodes[0]);
      content.editor.editor.focusFirstAvailable(focusNode);
    }

    /**
     * Updates the description on the editor blur.
     * @return {Promise<void>} 
     */
    async [descriptionBlurHandler]() {
      if (!this.edit) {
        return;
      }
      const content = this.shadowRoot.querySelector('markdown-editor');
      const { dataset } = content;
      if (dataset.dirty === 'true') {
        const md = content.toMarkdown();
        dataset.dirty = 'false';
        let opts;
        if (dataset.domainId || dataset.target) {
          opts = {
            domainId: dataset.domainId,
            target: dataset.target,
          };
        }
        await this[updateDescription](md, opts);
      }
      this[descriptionEditor] = false;
      await this.requestUpdate();
    }

    /**
     * Marks markdown editor as dirty.
     * @param {Event} e
     */
    [descriptionInputHandler](e) {
      const editor = /** @type HTMLElement */ (e.target)
      if (!editor.hasAttribute('data-dirty')) {
        editor.setAttribute('data-dirty', 'true');
      }
    }

    /**
     * Updates the description of the edited object.
     * @param {string} md The new markdown to set.
     * @param {DescriptionTemplateOptions=} opts Deserialized template options, if any.
     */
    // eslint-disable-next-line no-unused-vars
    async [updateDescription](md, opts) {
      // to be implemented by the child class.
    }

    /**
     * @param {string=} description The description to render.
     * @param {DescriptionTemplateOptions=} opts Optional rendering options.
     * @returns {TemplateResult|string} The template for the markdown description.
     */
    [descriptionTemplate](description, opts={}) {
      const { edit } = this;
      if (edit && this[descriptionEditor]) {
        return this[descriptionEditorTemplate](description, opts);
      }
      if (!description) {
        return this[descriptionEmptyTemplate](opts);
      }
      const focusHandler = edit ? this[descriptionFocusHandler] : undefined;
      const tabIndex = edit ? '0' : '-1';
      return this[descriptionWrapper](html`
      <arc-marked 
        .markdown="${description}" 
        sanitize 
        @focus="${focusHandler}" 
        tabindex="${tabIndex}"
        data-domain-id="${ifDefined(opts.domainId)}"
        data-target="${ifDefined(opts.target)}"
      >
        <div slot="markdown-html" class="markdown-body"></div>
      </arc-marked>
      `);
    }

    /**
     * @param {string=} description The description to render.
     * @param {DescriptionTemplateOptions=} opts Optional rendering options.
     * @returns {TemplateResult|string} The template for the markdown editor for the description.
     */
    [descriptionEditorTemplate](description='', opts={}) {
      return this[descriptionWrapper](html`
      <markdown-editor 
        .markdown="${description||'&nbsp;'}" 
        .document="${this.shadowRoot}" 
        contextToolbarEnabled 
        @input="${this[descriptionInputHandler]}" 
        @blur="${this[descriptionBlurHandler]}"
        data-domain-id="${ifDefined(opts.domainId)}"
        data-target="${ifDefined(opts.target)}"
      >
        <div slot="markdown-html" class="markdown-body"></div>
      </markdown-editor>
      `);
    }

    /**
     * @param {DescriptionTemplateOptions=} opts Optional rendering options.
     * @return {TemplateResult|string} The template used when the description is missing.
     */
    [descriptionEmptyTemplate](opts={}) {
      const { edit } = this;
      if (!edit) {
        return '';
      }
      return this[descriptionWrapper](
        html`<p 
          class="empty-info" 
          tabindex="0" 
          @focus="${this[descriptionFocusHandler]}"
          data-domain-id="${ifDefined(opts.domainId)}"
          data-target="${ifDefined(opts.target)}"
        >Add description</p>`
      );
    }

    /**
     * @param {TemplateResult|TemplateResult[]} content The content to insert.
     * @return {TemplateResult} The template for the description container.
     */
    [descriptionWrapper](content) {
      return html`
      <div class="api-description">${content}</div>
      `;
    }
  }
  return DescriptionEditMixin;
};

/**
 * This mixin adds editable description area to the element.
 * Extend the `[updateDescription](markdown)` function to update the markdown value on the object
 * 
 * @mixin
 */
export const DescriptionEditMixin = dedupeMixin(mxFunction);
