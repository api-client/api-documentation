import { ns } from '@api-client/amf-store/worker.index.js';
import { HeadersParser } from '@advanced-rest-client/arc-headers';

/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiUnionShape} ApiUnionShape */

/**
 * Builds full type name for `@type` value of scalar values.
 * @param {string} type The name of the type: integer, string, and so on
 * @return {string} XML schema type definition.
 */
export function typeToSchema(type) {
  const lower = type.toLowerCase();
  return `${ns.w3.xmlSchema.key}#${lower}`;
}

/**
 * @param {string} value The value from the graph model to use to read the value from
 */
export function schemaToType(value) {
  const typed = String(value);
  let index = typed.lastIndexOf('#');
  if (index === -1) {
    index = typed.lastIndexOf('/');
  }
  let v = typed.substr(index + 1);
  if (v) {
    v = `${v[0].toUpperCase()}${v.substr(1)}`
  }
  return v;
}

/**
 * Reads the label for a data type for a shape union.
 * @param {ApiShapeUnion} schema
 * @returns {string|undefined} Computed label for a shape.
 */
export function readPropertyTypeLabel(schema) {
  if (!schema) {
    return undefined;
  }
  const { types } = schema;
  if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
    const scalar = /** @type ApiScalarShape */ (schema);
    return schemaToType(scalar.dataType || '');
  }
  if (types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
    const array = /** @type ApiArrayShape */ (schema);
    if (!array.items) {
      return undefined;
    }
    const label = readPropertyTypeLabel(array.items);
    return `List of ${label}`;
  }
  if (types.includes(ns.w3.shacl.NodeShape)) {
    let { name } = schema;
    if (name === 'type') {
      // AMF seems to put `type` value into a property that is declared inline (?).
      name = undefined;
    }
    return name || 'Object';
  }
  if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
    const union = /** @type ApiUnionShape */ (schema);
    const items = union.anyOf.map(readPropertyTypeLabel);
    return items.join(' or ');
  }
  if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
    return 'File';
  }
  return 'Unknown';
}

/**
 * @param {Record<string, any>} params
 * @returns {string}
 */
export function generateHeaders(params) {
  if (typeof params !== 'object') {
    return '';
  }
  const lines = Object.keys(params).map((name) => {
    let value = params[name];
    if (value === undefined) {
      value = '';
    } else if (Array.isArray(value)) {
      value = value.join(',');
    } else {
      value = String(value);
    }
    let result = `${name}: `;
    value = value.split('\n').join(' ');
    result += value;
    return result;
  });
  return lines.join('\n');
}

/**
 * Ensures the headers have content type header.
 * @param {string} headers The generated headers string
 * @param {string} mime The expected by the selected payload media type. If not set then it does nothing.
 */
export function ensureContentType(headers, mime) {
  if (!mime) {
    return headers;
  }
  const list = HeadersParser.toJSON(headers);
  const current = HeadersParser.contentType(list);
  if (!current && mime) {
    list.push({ name: 'content-type', value: mime, enabled: true });
  }
  return HeadersParser.toString(list);
}
