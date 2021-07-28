/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ns } from '@api-client/amf-store/worker.index.js';
import { dateExample, dateTimeExample, dateTimeOnlyExample, timeExample } from './Utils.js';

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
/** @typedef {import('../types').ShapeExampleGeneratorOptions} ShapeExampleGeneratorOptions */

export const scalarShapeObject = Symbol('scalarShapeObject');
export const nodeShapeObject = Symbol('nodeShapeObject');
export const unionShapeObject = Symbol('unionShapeObject');
export const fileShapeObject = Symbol('fileShapeObject');
export const schemaShapeObject = Symbol('schemaShapeObject');
export const arrayShapeObject = Symbol('arrayShapeObject');
export const tupleShapeObject = Symbol('tupleShapeObject');
export const anyShapeObject = Symbol('anyShapeObject');
export const propertyShapeObject = Symbol('propertyShapeObject');
export const exampleToObject = Symbol('exampleToObject');
export const dataTypeToExample = Symbol('dataTypeToExample');
export const scalarExampleValue = Symbol('scalarExampleValue');

export class ShapeExampleGeneratorBase {
  /**
   * @param {ApiShapeUnion} value The Shape definition
   * @param {ShapeExampleGeneratorOptions=} opts
   */
  constructor(value, opts={}) {
    this.type = value;
    this.opts = opts;
  }

  /**
   * Generates an example from a schema definition.
   * @abstract
   * @returns {string|undefined} The generated example
   */
  generate() {
    return undefined;
  }

  /**
   * Serializes generated values into the final mime type related form.
   * @abstract
   * @param {any} value
   * @returns {string|undefined} The generated example
   */
  serialize(value) {
    return undefined;
  }

  /**
   * Transforms a scalar data type to a corresponding default example value.
   * @param {string} dataType The data type namespace value
   * @param {string=} format The data format
   * @return {string|number|boolean} 
   */
  [dataTypeToExample](dataType, format) {
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
   * @param {ApiScalarShape} schema
   * @returns {string|number|boolean}
   */
  [scalarExampleValue](schema) {
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
    return this[dataTypeToExample](dataType, format);
  }

  /**
   * @abstract
   * @param {ApiExample} example The example to turn into a JS object
   * @returns {any}
   */
  [exampleToObject](example) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiScalarShape} schema
   * @returns {any}
   */
  [scalarShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiNodeShape} schema
   * @returns {any}
   */
  [nodeShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiUnionShape} schema
   * @returns {any}
   */
  [unionShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiFileShape} schema
   * @returns {any}
   */
  [fileShapeObject](schema) {
    return null;
  }

  /**
   * @abstract
   * @param {ApiSchemaShape} schema
   * @returns {any}
   */
  [schemaShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiArrayShape} schema
   * @returns {any}
   */
  [arrayShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiTupleShape} schema
   * @returns {any}
   */
  [tupleShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiAnyShape} schema
   * @returns {any}
   */
  [anyShapeObject](schema) {
    return undefined;
  }

  /**
   * @abstract
   * @param {ApiPropertyShape} schema
   * @returns {any}
   */
  [propertyShapeObject](schema) {
    return undefined;
  }
}
