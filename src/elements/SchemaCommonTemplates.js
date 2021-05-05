import { html } from "lit-element";
import { ns } from '@api-components/amf-helper-mixin/src/Namespace.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-client/amf-store').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-client/amf-store').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-client/amf-store').ApiFileShape} ApiFileShape */

/**
 * @param {string} name The name of the parameter
 * @param {boolean} required Whether the parameter is required
 * @return {TemplateResult} The template for the property name value. 
 */
export function paramNameTemplate(name, required) {
  let label = String(name||'');
  if (required) {
    label += '*';
  }
  return html`
  <div class="param-name">
    ${label}
  </div>
  `;
}

/**
 * @param {string} type The parameter type label to render.
 * @return {TemplateResult|string} The template for the parameter data type. 
 */
export function typeValueTemplate(type) {
  if (!type) {
    return '';
  }
  return html`
  <div class="param-type">
    ${type}
  </div>
  `;
}

/**
 * @param {string} description The description to render.
 * @return {TemplateResult|string} The template for the markdown description
 */
export function descriptionValueTemplate(description) {
  if (!description) {
    return '';
  }
  return html`
  <div class="api-description">
    <arc-marked .markdown="${description}" sanitize>
      <div slot="markdown-html" class="markdown-body"></div>
    </arc-marked>
  </div>
  `;
}

/**
 * @param {string} label
 * @param {string} value
 * @return {TemplateResult}
 */
function tablePropertyTemplate(label, value) {
  return html`
  <div class="schema-property-item">
    <div class="schema-property-label">${label}:</div>
    <div class="schema-property-value code-value">${value}</div>
  </div>
  `;
}


function detailSectionTemplate(items) {
  return html`
  <details class="property-details">
    <summary><span class="label">Details</span></summary>
    <div class="details-content">
      ${items}
    </div>
  </details>
  `;
}

/**
 * @param {ApiScalarShape} schema
 * @param {boolean=} noDetail When true it always render all properties, without the detail element.
 * @return {TemplateResult|string} The template for the details of the scalar schema
 */
export function scalarDetailsTemplate(schema, noDetail) {
  const { examples=[], values=[], defaultValueStr, format, maxLength, maximum, minLength, minimum, multipleOf, pattern, readOnly, writeOnly } = schema;
  const result = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (format) {
    result.push(tablePropertyTemplate('Format', format));
  }
  if (pattern) {
    result.push(tablePropertyTemplate('Pattern', pattern));
  }
  if (typeof minimum === 'number') {
    result.push(tablePropertyTemplate('Minimum', String(minimum)));
  }
  if (typeof maximum === 'number') {
    result.push(tablePropertyTemplate('Maximum', String(maximum)));
  }
  if (typeof minLength === 'number') {
    result.push(tablePropertyTemplate('Minimum length', String(minLength)));
  }
  if (typeof maxLength === 'number') {
    result.push(tablePropertyTemplate('Maximum length', String(maxLength)));
  }
  if (typeof multipleOf === 'number') {
    result.push(tablePropertyTemplate('Multiple of', String(multipleOf)));
  }
  if (readOnly) {
    result.push(tablePropertyTemplate('Read only', 'yes'));
  }
  if (writeOnly) {
    result.push(tablePropertyTemplate('Write only', 'yes'));
  }
  if (values.length) {
    result[result.length] = html`
    <div class="schema-property-item">
    <div class="schema-property-label">Enum:</div>
      <ul class="enum-items">
        ${values.map((item) => html`<li class="code-value">${/** @type ApiScalarNode */ (item).value}</li>`)}
      </ul>
    </div>
    `;
  }
  if (examples.length) {
    result[result.length] = html`
    <div class="schema-property-item">
      <div class="schema-property-label example">Examples:</div>
      <ul class="example-items">
        ${examples.map((item) => html`<li>${item.value}</li>`)}
      </ul>
    </div>
    `;
  }
  if (noDetail && result.length) {
    return html`${result}`;
  }
  if (result.length && result.length < 3) {
    return html`${result}`;
  }
  if (result.length) {
    return detailSectionTemplate(result);
  }
  return '';
}

/**
 * @param {ApiNodeShape} schema
 * @return {TemplateResult|string} The template for the details of the Node schema
 */
function nodeDetailsTemplate(schema) {
  const { examples, maxProperties, minProperties, readOnly, writeOnly} = schema;
  const result = [];
  if (typeof minProperties === 'number') {
    result.push(tablePropertyTemplate('Minimum properties', String(minProperties)));
  }
  if (typeof maxProperties === 'number') {
    result.push(tablePropertyTemplate('Maximum properties', String(maxProperties)));
  }
  if (readOnly) {
    result.push(tablePropertyTemplate('Read only', 'true'));
  }
  if (writeOnly) {
    result.push(tablePropertyTemplate('Write only', 'true'));
  }
  if (examples.length) {
    result[result.length] = html`
    <div class="schema-property-item">
      <div class="schema-property-label example">Examples:</div>
      <ul class="example-items">
        ${examples.map((item) => html`<li>${item.value}</li>`)}
      </ul>
    </div>
    `;
  }
  if (result.length && result.length < 3) {
    return html`${result}`;
  }
  if (result.length) {
    return detailSectionTemplate(result);
  }
  return '';
}

/**
 * @param {ApiArrayShape} schema
 * @return {TemplateResult|string} The template for the details of the Array schema
 */
function arrayDetailsTemplate(schema) {
  const { examples, readOnly, writeOnly, uniqueItems, defaultValueStr } = schema;
  const result = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (uniqueItems) {
    result.push(tablePropertyTemplate('Unique items', 'true'));
  }
  if (readOnly) {
    result.push(tablePropertyTemplate('Read only', 'true'));
  }
  if (writeOnly) {
    result.push(tablePropertyTemplate('Write only', 'true'));
  }
  if (examples.length) {
    result[result.length] = html`
    <div class="schema-property-item">
      <div class="schema-property-label example">Examples:</div>
      <ul class="example-items">
        ${examples.map((item) => html`<li>${item.value}</li>`)}
      </ul>
    </div>
    `;
  }
  if (result.length && result.length < 3) {
    return html`${result}`;
  }
  if (result.length) {
    return detailSectionTemplate(result);
  }
  return '';
}

/**
 * @param {ApiUnionShape} schema
 * @return {TemplateResult|string} The template for the details of the Union schema
 */
export function unionDetailsTemplate(schema) {
  const { examples, readOnly, writeOnly, defaultValueStr } = schema;
  const result = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (readOnly) {
    result.push(tablePropertyTemplate('Read only', 'true'));
  }
  if (writeOnly) {
    result.push(tablePropertyTemplate('Write only', 'true'));
  }
  if (examples.length) {
    result[result.length] = html`
    <div class="schema-property-item">
      <div class="schema-property-label example">Examples:</div>
      <ul class="example-items">
        ${examples.map((item) => html`<li>${item.value}</li>`)}
      </ul>
    </div>
    `;
  }
  if (result.length && result.length < 3) {
    return html`${result}`;
  }
  if (result.length) {
    return detailSectionTemplate(result);
  }
  return '';
}

/**
 * @param {ApiFileShape} schema
 * @return {TemplateResult|string} The template for the details of the File schema
 */
export function fileDetailsTemplate(schema) {
  const { examples=[], values=[], defaultValueStr, format, maxLength, maximum, minLength, minimum, multipleOf, pattern, readOnly, writeOnly, fileTypes, } = schema;
  const result = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (fileTypes && fileTypes.length) {
    result.push(tablePropertyTemplate('File types', fileTypes.join(', ')));
  }
  if (readOnly) {
    result.push(tablePropertyTemplate('Read only', 'true'));
  }
  if (writeOnly) {
    result.push(tablePropertyTemplate('Write only', 'true'));
  }
  if (format) {
    result.push(tablePropertyTemplate('Format', format));
  }
  if (pattern) {
    result.push(tablePropertyTemplate('Name pattern', pattern));
  }
  if (typeof minimum === 'number') {
    result.push(tablePropertyTemplate('Minimum size', String(minimum)));
  }
  if (typeof maximum === 'number') {
    result.push(tablePropertyTemplate('Maximum size', String(maximum)));
  }
  if (typeof minLength === 'number') {
    result.push(tablePropertyTemplate('Minimum length', String(minLength)));
  }
  if (typeof maxLength === 'number') {
    result.push(tablePropertyTemplate('Maximum length', String(maxLength)));
  }
  if (typeof multipleOf === 'number') {
    result.push(tablePropertyTemplate('Multiple of', String(multipleOf)));
  }
  if (values.length) {
    result[result.length] = html`
    <div class="schema-property-item">
    <div class="schema-property-label">Enum:</div>
      <ul class="enum-items">
        ${values.map((item) => html`<li class="code-value">${/** @type ApiScalarNode */ (item).value}</li>`)}
      </ul>
    </div>
    `;
  }
  if (examples.length) {
    result[result.length] = html`
    <div class="schema-property-item">
      <div class="schema-property-label example">Examples:</div>
      <ul class="example-items">
        ${examples.map((item) => html`<li>${item.value}</li>`)}
      </ul>
    </div>
    `;
  }
  if (result.length && result.length < 3) {
    return html`${result}`;
  }
  if (result.length) {
    return detailSectionTemplate(result);
  }
  return '';
}

/**
 * @param {ApiShapeUnion} schema The schema definition.
 * @return {TemplateResult|string} The template for the property details.
 */
export function detailsTemplate(schema) {
  if (!schema) {
    return '';
  }
  const { types } = schema;
  if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
    return scalarDetailsTemplate(schema);
  }
  if (types.includes(ns.w3.shacl.NodeShape)) {
    return nodeDetailsTemplate(/** @type ApiNodeShape */ (schema));
  }
  if (types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
    return arrayDetailsTemplate(/** @type ApiArrayShape */ (schema));
  }
  if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
    return unionDetailsTemplate(/** @type ApiUnionShape */ (schema));
  }
  if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
    return fileDetailsTemplate(/** @type ApiFileShape */ (schema));
  }
  return ''
}
