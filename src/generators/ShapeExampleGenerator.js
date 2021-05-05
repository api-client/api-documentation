/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ns } from '@api-components/amf-helper-mixin/src/Namespace';
import { ApiExampleGenerator } from '../ApiExampleGenerator.js';
import { JsonExampleGenerator } from './JsonExampleGenerator.js';
import { dateExample, dateTimeExample, dateTimeOnlyExample, timeExample, toXml } from './Utils.js';

/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-client/amf-store').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-client/amf-store').ApiFileShape} ApiFileShape */
/** @typedef {import('@api-client/amf-store').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiTupleShape} ApiTupleShape */
/** @typedef {import('@api-client/amf-store').ApiAnyShape} ApiAnyShape */
/** @typedef {import('@api-client/amf-store').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('@api-client/amf-store').ApiExample} ApiExample */
/** @typedef {import('../types').SchemaExample} SchemaExample */
/** @typedef {import('../types').ShapeExampleGeneratorOptions} ShapeExampleGeneratorOptions */

const scalarShapeObject = Symbol('scalarShapeObject');
const nodeShapeObject = Symbol('nodeShapeObject');
const unionShapeObject = Symbol('unionShapeObject');
const fileShapeObject = Symbol('fileShapeObject');
const schemaShapeObject = Symbol('schemaShapeObject');
const arrayShapeObject = Symbol('arrayShapeObject');
const tupleShapeObject = Symbol('tupleShapeObject');
const anyShapeObject = Symbol('anyShapeObject');
const propertyShapeObject = Symbol('propertyShapeObject');
const exampleToObject = Symbol('exampleToObject');

/**
 * A class that processes AMF's Shape to generate an example.
 */
export class ShapeExampleGenerator {
  /**
   * @param {ApiShapeUnion} value The Shape definition
   * @param {string} mime The example mime type to format the generated example.
   * @param {ShapeExampleGeneratorOptions=} opts
   */
  constructor(value, mime, opts={}) {
    this.type = value;
    this.mime = mime;
    this.opts = opts;
  }

  /**
   * @param {ApiShapeUnion} schema
   * @param {string} mime The mime type for the value.
   * @param {ShapeExampleGeneratorOptions=} opts
   * @returns {SchemaExample|null}
   */
  static fromSchema(schema, mime, opts) {
    const generator = new ShapeExampleGenerator(schema, mime, opts);
    const value = generator.generate();
    if (!value) {
      return null;
    }
    return {
      id: undefined,
      strict: true,
      types: [ns.aml.vocabularies.apiContract.Example],
      renderValue: value,
    };
  }

  /**
   * Generates a JSON example from the structured value.
   * @returns {string}
   */
  generate() {
    const { type } = this;
    const result = this.toObject(type);
    if (typeof result === 'object') {
      return this.serialize(result);
    }
    return result;
  }

  /**
   * Processes the Shape definition and returns a JavaScript object or array.
   * @param {ApiShapeUnion} schema
   * @returns {any}
   */
  toObject(schema) {
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeObject](/** @type ApiScalarShape */ (schema));
    }
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this[nodeShapeObject](/** @type ApiNodeShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
      return this[unionShapeObject](/** @type ApiUnionShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
      return this[fileShapeObject](/** @type ApiFileShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.SchemaShape)) {
      return this[schemaShapeObject](/** @type ApiSchemaShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      return this[arrayShapeObject](/** @type ApiArrayShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.TupleShape)) {
      return this[tupleShapeObject](/** @type ApiTupleShape */ (schema));
    }
    return this[anyShapeObject](/** @type ApiAnyShape */ (schema));
  }

  /**
   * Serializes generated JS value according to the mime type.
   * @param {any} value
   * @returns {string|undefined} 
   */
  serialize(value) {
    const { mime } = this;
    if (mime.includes('json')) {
      return JSON.stringify(value, null, 2);
    }
    if (mime.includes('xml')) {
      return toXml(value);
    }
    return undefined;
  }

  /**
   * @param {ApiScalarShape} schema
   * @returns {any|undefined}
   */
  [scalarShapeObject](schema) {
    const { defaultValueStr, examples, dataType, format } = schema;
    if (defaultValueStr) {
      return defaultValueStr;
    }
    if (examples && examples.length) {
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (typeof value !== 'undefined') {
        return value;
      }
    }
    switch (dataType) {
      case ns.w3.xmlSchema.string: return '';
      case ns.w3.xmlSchema.number: 
      case ns.w3.xmlSchema.float: 
      case ns.w3.xmlSchema.double: 
      case ns.w3.xmlSchema.integer: 
      case ns.w3.xmlSchema.long: 
      return 0;
      case ns.w3.xmlSchema.boolean: return false;
      case ns.w3.xmlSchema.nil: return null;
      case ns.w3.xmlSchema.date: return dateExample();
      case ns.w3.xmlSchema.dateTime: return dateTimeExample(format);
      case ns.aml.vocabularies.shapes.dateTimeOnly: return dateTimeOnlyExample();
      case ns.w3.xmlSchema.time: return timeExample();
      case ns.w3.xmlSchema.base64Binary: return '';
      default: return undefined;
    }
  }

  /**
   * @param {ApiNodeShape} schema
   * @returns {object}
   */
  [nodeShapeObject](schema) {
    const result = {};
    const { properties } = schema;
    properties.forEach((property) => {
      const { name } = property;
      const value = this[propertyShapeObject](property);
      if (typeof value !== 'undefined') {
        result[name] = value;
      }
    });
    return result;
  }

  /**
   * @param {ApiUnionShape} schema
   * @returns {any}
   */
  [unionShapeObject](schema) {
    const { anyOf } = schema;
    const { opts } = this;
    if (Array.isArray(anyOf) && anyOf.length) {
      const { selectedUnions } = opts;
      let renderedItem = /** @type ApiShapeUnion */ (null);
      if (selectedUnions && selectedUnions.length) {
        renderedItem = anyOf.find((item) => selectedUnions.includes(item.id));
      } else {
        [renderedItem] = anyOf;
      }
      if (renderedItem) {
        return this.toObject(renderedItem);
      }
    }
    return undefined;
  }

  /**
   * @param {ApiFileShape} schema
   * @returns {any}
   */
  [fileShapeObject](schema) {
    return null;
  }

  /**
   * @param {ApiSchemaShape} schema
   * @returns {any}
   */
  [schemaShapeObject](schema) {
    // TODO???
    return undefined;
  }

  /**
   * @param {ApiArrayShape} schema
   * @returns {array}
   */
  [arrayShapeObject](schema) {
    const result = [];
    const { items } = schema;
    const { defaultValueStr, examples } = items;
    if (schema.defaultValueStr) {
      result.push(schema.defaultValueStr);
    } else if (defaultValueStr) {
      result.push(defaultValueStr);
    } else if (examples && examples.length) {
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (typeof value !== 'undefined') {
        result.push(value);
      }
    } else {
      const value = this.toObject(items);
      if (typeof value !== 'undefined') {
        result.push(value);
      }
    }
    return result;
  }

  /**
   * @param {ApiTupleShape} schema
   * @returns {any}
   */
  [tupleShapeObject](schema) {
    const result = [];
    const { items, examples } = schema;
    if (schema.defaultValueStr) {
      result.push(schema.defaultValueStr);
    } else if (examples && examples.length) {
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (typeof value !== 'undefined') {
        result.push(value);
      }
    } else if (items.length) {
      items.forEach((i) => {
        const value = this.toObject(i);
        if (typeof value !== 'undefined') {
          result.push(value);
        }
      });
    }
    return result;
  }

  /**
   * @param {ApiAnyShape} schema
   * @returns {any}
   */
  [anyShapeObject](schema) {
    return this[scalarShapeObject](schema);
  }

  /**
   * @param {ApiPropertyShape} schema
   * @returns {any}
   */
  [propertyShapeObject](schema) {
    const { range, defaultValueStr } = schema;
    const { types } = range;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      if (defaultValueStr) {
        return defaultValueStr;
      }
      return this[scalarShapeObject](range);
    }
    return this.toObject(range);
  }

  /**
   * @param {ApiExample} example The example to turn into a JS object
   * @returns {any}
   */
  [exampleToObject](example) {
    if (example && example.structuredValue) {
      const jsonGenerator = new JsonExampleGenerator(example.structuredValue);
      return jsonGenerator.processNode(example.structuredValue);
    }
    return undefined;
  }
}
