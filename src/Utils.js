import { ns } from '@api-client/amf-store';

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
  return typed.substr(index + 1);
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
    return 'Object';
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
