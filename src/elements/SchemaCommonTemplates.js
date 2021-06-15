import { html } from "lit-element";
import { ns } from '@api-client/amf-store';
import { classMap } from "lit-html/directives/class-map";

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-client/amf-store').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-client/amf-store').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-client/amf-store').ApiFileShape} ApiFileShape */

/**
 * @param {string} label The label to render.
 * @param {string} title The value of the title attribute
 * @param {string[]=} [css=[]] The list of class names to add
 * @return {TemplateResult} The template for a pill visualization object
 */
export function pillTemplate(label, title, css=[]) {
  const classes = {
    'param-pill': true,
    'pill': true,
  };
  css.forEach((item) => { classes[item] = true });
  return html`
  <span class="${classMap(classes)}" title="${title}">
    ${label}
  </span>`;
}

/**
 * @param {TemplateResult[]} pills The pills to render
 * @returns {TemplateResult|string}
 */
function pillsLine(pills) {
  if (!pills.length) {
    return '';
  }
  return html`
  <div class="param-pills">
    ${pills}
  </div>
  `;
}

/**
 * @param {TemplateResult[]} pills The pills to render
 * @param {TemplateResult[]} items The table properties to render.
 * @returns {TemplateResult}
 */
function pillsAndTable(pills, items) {
  return html`
    ${pillsLine(pills)}
    ${items.length ? html`<div class="param-properties">${items}</div>` : ''}
  `;
}

/**
 * @param {string} name The name of the parameter
 * @param {boolean=} required Whether the parameter is required
 * @param {boolean=} deprecated Whether the parameter is deprecated
 * @return {TemplateResult} The template for the property name value. 
 */
export function paramNameTemplate(name, required=false, deprecated=false) {
  let label = String(name||'');
  if (required) {
    label += '*';
  }
  const classes = {
    'param-name': true,
    required,
    deprecated,
  };
  return html`
  <div class="${classMap(classes)}">
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
    <div class="schema-property-value code-value inline">${value}</div>
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
  const { examples=[], values=[], defaultValueStr, format, maxLength, maximum, minLength, minimum, multipleOf, pattern, readOnly, writeOnly, deprecated } = schema;
  const result = [];
  const pills = [];
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
    pills.push(pillTemplate('Read only', 'This property is read only.'));
    // result.push(tablePropertyTemplate('Read only', 'yes'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
    // result.push(tablePropertyTemplate('Write only', 'yes'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
    // result.push(html`
    // <div class="schema-property-item">
    //   <div class="schema-property-label">Deprecated:</div>
    //   <div class="schema-property-value">This property is deprecated</div>
    // </div>
    // `)
  }
  if (values.length) {
    result[result.length] = html`
    <div class="schema-property-item">
    <div class="schema-property-label">Enum:</div>
      <ul class="enum-items">
        ${values.map((item) => html`<li class="code-value inline">${/** @type ApiScalarNode */ (item).value}</li>`)}
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
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiNodeShape} schema
 * @return {TemplateResult|string} The template for the details of the Node schema
 */
function nodeDetailsTemplate(schema) {
  const { examples, maxProperties, minProperties, readOnly, writeOnly, deprecated } = schema;
  const result = [];
  const pills = [];
  if (typeof minProperties === 'number') {
    result.push(tablePropertyTemplate('Minimum properties', String(minProperties)));
  }
  if (typeof maxProperties === 'number') {
    result.push(tablePropertyTemplate('Maximum properties', String(maxProperties)));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
    // result.push(tablePropertyTemplate('Read only', 'yes'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
    // result.push(tablePropertyTemplate('Write only', 'yes'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
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
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiArrayShape} schema
 * @return {TemplateResult|string} The template for the details of the Array schema
 */
function arrayDetailsTemplate(schema) {
  const { examples, readOnly, writeOnly, uniqueItems, defaultValueStr, deprecated } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (uniqueItems) {
    result.push(tablePropertyTemplate('Unique items', 'true'));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
    // result.push(tablePropertyTemplate('Read only', 'yes'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
    // result.push(tablePropertyTemplate('Write only', 'yes'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
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
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiUnionShape} schema
 * @return {TemplateResult|string} The template for the details of the Union schema
 */
export function unionDetailsTemplate(schema) {
  const { examples, readOnly, writeOnly, defaultValueStr, deprecated } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
    // result.push(tablePropertyTemplate('Read only', 'yes'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
    // result.push(tablePropertyTemplate('Write only', 'yes'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
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
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiFileShape} schema
 * @return {TemplateResult|string} The template for the details of the File schema
 */
export function fileDetailsTemplate(schema) {
  const { examples=[], values=[], defaultValueStr, format, maxLength, maximum, minLength, minimum, multipleOf, pattern, readOnly, writeOnly, fileTypes, deprecated } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (fileTypes && fileTypes.length) {
    result.push(tablePropertyTemplate('File types', fileTypes.join(', ')));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
    // result.push(tablePropertyTemplate('Read only', 'yes'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
    // result.push(tablePropertyTemplate('Write only', 'yes'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
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
        ${values.map((item) => html`<li class="code-value inline">${/** @type ApiScalarNode */ (item).value}</li>`)}
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
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
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
