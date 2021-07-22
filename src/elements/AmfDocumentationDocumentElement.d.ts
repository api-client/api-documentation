/* eslint-disable class-methods-use-this */
import { CSSResult, html, TemplateResult } from 'lit-element';
import { ApiDocumentation, ApiStoreStateUpdateEvent } from '@api-client/amf-store/worker.index.js';
import {
  AmfDocumentationBase,
} from './AmfDocumentationBase.js';
import { DescriptionEditMixin, updateDescription } from './mixins/DescriptionEditMixin.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiDocumentation} ApiDocumentation */
/** @typedef {import('@api-client/amf-store').ApiStoreStateUpdateEvent} ApiStoreStateUpdateEvent */

export const documentationValue: unique symbol;
export const titleTemplate: unique symbol;
export const documentationUpdatedHandler: unique symbol;

/**
 * A web component that renders the documentation page for an API documentation (like in RAML documentations) built from 
 * the AMF graph model.
 */
export default class AmfDocumentationDocumentElement extends DescriptionEditMixin(AmfDocumentationBase) {
  static get styles(): CSSResult[];
  [documentationValue]: ApiDocumentation;
  constructor();
  _attachListeners(node: EventTarget): void;
  _detachListeners(node: EventTarget): void;

  /**
   * Queries the graph store for the API Documentation data.
   */
  queryGraph(): Promise<void>;

  [documentationUpdatedHandler](e: ApiStoreStateUpdateEvent<ApiDocumentation>): void;

  /**
   * Updates the description of the operation.
   * @param markdown The new markdown to set.
   */
  [updateDescription](markdown: string): Promise<void>;

  render(): TemplateResult;

  /**
   * @returns The template for the Documentation title.
   */
  [titleTemplate](): TemplateResult;
}
