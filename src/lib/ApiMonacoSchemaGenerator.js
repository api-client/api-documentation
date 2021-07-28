/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-client/amf-store').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */

import { ns } from '@api-client/amf-store/worker.index.js';

/**
 * A class to generate JSON schema from an ApiShapeUnion declaration.
 */
export class ApiMonacoSchemaGenerator {
  /**
   * @param {ApiShapeUnion} schema
   * @param {string} parentUri The URI for the fileMatch property.
   */
  generate(schema, parentUri) {
    this.schemas = [];
    if (!schema) {
      return [];
    }
    const { types } = schema;
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this.fromNodeShape(/** @type ApiNodeShape */ (schema), parentUri);
    }
    return [];
  }

  /**
   * @param {ApiNodeShape} schema
   * @param {string=} parentUri The URI for the fileMatch property.
   */
  fromNodeShape(schema, parentUri) {
    const { properties, id, displayName, name } = schema;
    const content = {
      title: displayName || name,
      type: "object",
      properties: {},
      required: [],
    };
    const result = {
      uri: id,
      schema: content,
    };
    if (parentUri) {
      result.fileMatch = [parentUri];
    }
    this.schemas.push(result);
    if (!Array.isArray(properties) || !properties.length) {
      return this.schemas;
    }
    properties.forEach(property => this.appendSchemaProperty(content, property));
    return this.schemas;
  }

  /**
   * @param {*} content
   * @param {ApiPropertyShape} property
   */
  appendSchemaProperty(content, property) {
    const { name, range, minCount } = property;
    const value = this.rangeToPropertySchema(range);
    if (value) {
      content.properties[name] = value;
      if (minCount === 1) {
        content.required.push(name);
      }
    }
  }

  /**
   * @param {ApiShapeUnion} range
   */
  rangeToPropertySchema(range) {
    const { types } = range;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this.scalarRangeToPropertySchema(/** @type ApiScalarShape */ (range));
    }
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this.nodeShapeRangeToPropertySchema(/** @type ApiNodeShape */ (range));
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
      return this.arrayShapeRangeToPropertySchema(/** @type ApiArrayShape */ (range));
    }
    return undefined;
  }

  /**
   * @param {ApiScalarShape} schema
   * @returns {any}
   */
  scalarRangeToPropertySchema(schema) {
    const { values, description, name, displayName, defaultValueStr, exclusiveMaximum, exclusiveMinimum, minimum, maximum, minLength, maxLength, id, multipleOf, pattern, readOnly, writeOnly } = schema;
    const type = this.schemaTypeToJsonDataType(schema.dataType);
    const result = {
      '$id': id,
      type,
      title: displayName || name,
    };
    if (description) {
      result.description = description;
    }
    if (defaultValueStr) {
      result.default = defaultValueStr;
    }
    if (typeof exclusiveMaximum === 'boolean') {
      result.exclusiveMaximum = exclusiveMaximum;
    }
    if (typeof exclusiveMinimum === 'boolean') {
      result.exclusiveMinimum = exclusiveMinimum;
    }
    if (typeof maxLength === 'number') {
      result.maxLength = maxLength;
    }
    if (typeof minLength === 'number') {
      result.minLength = minLength;
    }
    if (typeof minimum === 'number') {
      result.minimum = minimum;
    }
    if (typeof maximum === 'number') {
      result.maximum = maximum;
    }
    if (typeof multipleOf === 'number') {
      result.multipleOf = multipleOf;
    }
    if (typeof pattern === 'string') {
      result.pattern = pattern;
    }
    if (typeof readOnly === 'boolean') {
      result.readOnly = readOnly;
    }
    if (typeof writeOnly === 'boolean') {
      result.writeOnly = writeOnly;
    }
    if (Array.isArray(values) && values.length) {
      // enum properties
      result.enum = [];
      values.forEach((value) => {
        const { types } = value;
        if (types.includes(ns.aml.vocabularies.data.Scalar)) {
          const typed = /** @type ApiScalarNode */ (value);
          if (typed.value) {
            result.enum.push(typed.value);
          }
        }
      });
    }
    return result;
  }

  /**
   * Translates AMF data type to JSON schema data type.
   * @param {string} schemaType
   * @return {string} 
   */
  schemaTypeToJsonDataType(schemaType) {
    switch (schemaType) {
      case ns.w3.xmlSchema.number:
      case ns.w3.xmlSchema.integer:
      case ns.w3.xmlSchema.float:
      case ns.w3.xmlSchema.long:
      case ns.w3.xmlSchema.double: return 'number';
      case ns.w3.xmlSchema.boolean: return 'boolean';
      case ns.w3.xmlSchema.nil: return 'null';
      default: return 'string';
    }
  }

  /**
   * @param {ApiNodeShape} schema
   * @returns {any}
   */
  nodeShapeRangeToPropertySchema(schema) {
    const { description, name, displayName, id, readOnly, writeOnly, properties } = schema;
    const result = {
      '$id': id,
      type: 'object',
      title: displayName || name,
      properties: {},
      required: [],
    };
    if (description) {
      result.description = description;
    }
    if (typeof readOnly === 'boolean') {
      result.readOnly = readOnly;
    }
    if (typeof writeOnly === 'boolean') {
      result.writeOnly = writeOnly;
    }
    properties.forEach(property => this.appendSchemaProperty(result, property));
    return result;
  }

  /**
   * @param {ApiArrayShape} schema
   * @returns {any}
   */
  arrayShapeRangeToPropertySchema(schema) {
    const { description, name, displayName, id, readOnly, writeOnly, items } = schema;
    const result = {
      '$id': id,
      type: 'array',
      title: displayName || name,
      items: {
        anyOf: [],
      },
      required: [],
      additionalItems: false,
    };
    if (description) {
      result.description = description;
    }
    if (typeof readOnly === 'boolean') {
      result.readOnly = readOnly;
    }
    if (typeof writeOnly === 'boolean') {
      result.writeOnly = writeOnly;
    }
    if (items) {
      const value = this.rangeToPropertySchema(items);
      if (value) {
        result.items.anyOf.push(value);
      }
    }
    return result;
  }
}
