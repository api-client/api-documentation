/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { ns } from '@api-client/amf-store/worker.index.js';

/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-client/amf-store').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-client/amf-store').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-client/amf-store').ApiTupleShape} ApiTupleShape */
/** @typedef {import('@api-client/amf-store').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-client/amf-store').ApiFileShape} ApiFileShape */
/** @typedef {import('@api-client/amf-store').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('@api-client/amf-store').ApiAnyShape} ApiAnyShape */
/** @typedef {import('@api-client/amf-store').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-client/amf-store').ApiParameterRecursive} ApiParameterRecursive */
/** @typedef {import('@anypoint-web-components/anypoint-input').SupportedInputTypes} SupportedInputTypes */


/**  
 * @typedef ParametersSerializationReport
 * @property {boolean} valid
 * @property {string[]} invalid
 * @property {Record<string, any>} header
 * @property {Record<string, any>} query
 * @property {Record<string, any>} path
 * @property {Record<string, any>} cookie
 */

/**
 * A utility class with helper functions to process user input according on AMF schema.
 */
export class AmfInputParser {
  /**
   * Casts the `value` to the corresponding data type
   * @param {any} value
   * @param {string} type The w3 schema type
   * @returns {any} 
   */
  static readTypedValue(value, type) {
    const jsType = typeof value;
    if (jsType === 'undefined' || value === null) {
      return value;
    }
    switch (type) {
      case ns.w3.xmlSchema.number:
      case ns.w3.xmlSchema.integer:
      case ns.w3.xmlSchema.float:
      case ns.w3.xmlSchema.long:
      case ns.w3.xmlSchema.double: return AmfInputParser.parseNumberInput(value, 0);
      case ns.w3.xmlSchema.boolean: return AmfInputParser.parseBooleanInput(value, false);
      case ns.w3.xmlSchema.nil: 
        return null;
      default:
        return value;
    }
  }

  /**
   * @param {string} schemaType Data type encoded in the parameter schema.
   * @returns {SupportedInputTypes|'boolean'}
   */
  static readInputType(schemaType) {
    switch (schemaType) {
      case ns.w3.xmlSchema.number:
      case ns.w3.xmlSchema.integer:
      case ns.w3.xmlSchema.float:
      case ns.w3.xmlSchema.long:
      case ns.w3.xmlSchema.double: return 'number';
      case ns.w3.xmlSchema.date: return 'date';
      case ns.w3.xmlSchema.time: return 'time';
      case ns.w3.xmlSchema.dateTime:
      case ns.aml.vocabularies.shapes.dateTimeOnly: return 'datetime-local';
      case ns.w3.xmlSchema.boolean: return 'boolean';
      default: return 'text';
    }
  }

  /**
   * Parses the value read from the schema definition and returns value that is cast to it's corresponding type.
   * @param {any} value
   * @param {ApiScalarShape} schema
   * @returns {string|number|boolean|null|undefined}
   */
  static parseSchemaInput(value, schema) {
    const jsType = typeof value;
    if (jsType === 'undefined' || value === null) {
      return value;
    }
    if (!schema) {
      return String(value);
    }
    switch (schema.dataType) {
      case ns.w3.xmlSchema.number:
      case ns.w3.xmlSchema.integer:
      case ns.w3.xmlSchema.float:
      case ns.w3.xmlSchema.long:
      case ns.w3.xmlSchema.double: return AmfInputParser.parseNumberInput(value);
      case ns.w3.xmlSchema.dateTime:
      case ns.aml.vocabularies.shapes.dateTimeOnly: return AmfInputParser.parseDateTimeOnlyInput(value);
      default: return String(value);
    }
  }

  /**
   * Parses the user entered value according to the schema definition.
   * @param {any} value
   * @param {ApiShapeUnion} schema
   * @returns {string|number|boolean|null|undefined}
   */
  static parseUserInput(value, schema) {
    if (!schema || value === undefined || value === null) {
      return value;
    }
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return AmfInputParser.parseScalarInput(value, /** @type ApiScalarShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      return AmfInputParser.parseArrayInput(value, /** @type ApiArrayShape */ (schema));
    }
    return value;
  }

  /**
   * Parses the user entered value as scalar value.
   * @param {any} value
   * @param {ApiScalarShape} schema
   * @returns {string|number|boolean|null|undefined}
   */
  static parseScalarInput(value, schema) {
    // schema.format
    switch (schema.dataType) {
      case ns.w3.xmlSchema.number:
      case ns.w3.xmlSchema.integer:
      case ns.w3.xmlSchema.float:
      case ns.w3.xmlSchema.long:
      case ns.w3.xmlSchema.double: return AmfInputParser.parseNumberInput(value);
      case ns.w3.xmlSchema.boolean: return AmfInputParser.parseBooleanInput(value);
      case ns.w3.xmlSchema.date: return AmfInputParser.parseDateOnlyInput(value);
      case ns.w3.xmlSchema.time: return AmfInputParser.parseTimeOnlyInput(value);
      case ns.w3.xmlSchema.dateTime: return AmfInputParser.parseDateTimeInput(value, schema.format);
      case ns.aml.vocabularies.shapes.dateTimeOnly: return AmfInputParser.parseDateTimeOnlyInput(value);
      default: return String(value);
    }
  }

  /**
   * Processes a value that should be a number.
   * @param {any} value
   * @param {number=} [defaultValue=undefined]
   * @returns {number|undefined} 
   */
  static parseNumberInput(value, defaultValue=undefined) {
    if (typeof value === 'number') {
      return value;
    }
    const n = Number(value);
    if (Number.isNaN(n)) {
      return defaultValue;
    }
    return n;
  }

  /**
   * Processes a value that should be a number.
   * @param {any} value
   * @param {boolean=} [defaultValue=undefined]
   * @returns {boolean|undefined} 
   */
  static parseBooleanInput(value, defaultValue=undefined) {
    const type = typeof value;
    if (type === 'boolean') {
      return value;
    }
    if (type === 'string') {
      const trimmed = value.trim();
      if (trimmed === 'true') {
        return true;
      }
      if (trimmed === 'false') {
        return false;
      }
    }
    return defaultValue;
  }

  /**
   * Processes a value that should be a date formatted as yyyy-MM-dd.
   * @param {any} value
   * @returns {string|undefined} 
   */
  static parseDateOnlyInput(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return undefined;
    }
    const result = d.toJSON();
    const timeSeparator = result.indexOf('T');
    return result.substr(0, timeSeparator);
  }

  /**
   * Processes a value that should be a date formatted as hh:mm:ss.
   * @param {any} input
   * @returns {string|undefined} 
   */
  static parseTimeOnlyInput(input) {
    const value = String(input).trim();
    if (/^\d\d:\d\d$/.test(value)) {
      return `${value}:00`;
    }
    if (/^\d\d:\d\d:\d\d$/.test(value)) {
      return value;
    }
    return undefined;
  }

  /**
   * Processes a value that should be a date formatted in one of the supported formats:
   * - rfc3339 (default): 2016-02-28T16:41:41.090Z
   * - rfc2616: Sun, 28 Feb 2016 16:41:41 GMT
   * @param {any} value
   * @returns {string|undefined} 
   */
  static parseDateTimeInput(value, format='rfc3339') {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return undefined;
    }
    if (format === 'rfc2616') {
      return d.toUTCString();
    }
    if (format === 'rfc3339') {
      return d.toISOString();
    }
    return undefined;
  }

  /**
   * Processes a value that should be a date formatted as yyyy-MM-ddThh:mm
   * @param {any} value
   * @returns {string|undefined} 
   */
  static parseDateTimeOnlyInput(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return undefined;
    }
    const jsonDate = d.toJSON(); // "yyyy-MM-ddThh:mm:ss.090Z"
    const dot = jsonDate.indexOf('.');
    return jsonDate.substr(0, dot);
  }

  /**
   * Parses the the value according to array schema value.
   * @param {any} value
   * @param {ApiArrayShape} schema
   * @returns {string|number|boolean|null|undefined}
   */
  static parseArrayInput(value, schema) {
    const { items } = schema;
    if (!items) {
      return String(value);
    }
    return AmfInputParser.parseUserInput(value, items);
  }

  /**
   * Generates a report with the request data compiled from the operation input parameters (except for the body)
   * and gathered values.
   * 
   * Note, all parameter values are cast to String as all target locations of these parameters are string values
   * (headers, query parameters, path parameters). The exception here are arrays which are preserved (but with string values).
   * 
   * All optional parameters that have no value or have invalid value ar ignored.
   * 
   * @param {ApiParameterRecursive[]} parameters The input parameters for the operation
   * @param {Map<string, any>} values The collected values for all parameters.
   * @param {string[]=} [nillable=[]] The list of parameter ids that are marked as nil values.
   * @param {any=} [defaultNil=null] The nil value to insert when the parameter is in the nillable list.
   * @returns {ParametersSerializationReport}
   */
  static reportRequestInputs(parameters, values, nillable=[], defaultNil=null) {
    const report = /** @type ParametersSerializationReport */ ({
      valid: true,
      invalid: [],
      header: {},
      query: {},
      path: {},
      cookie: {},
    });

    parameters.forEach((param) => {
      const { id, required, schema, binding, name } = param;
      if (!report[binding]) {
        // for custom shapes
        report[binding] = {};
      }
      if (nillable.includes(id)) {
        report[binding][name] = defaultNil;
        return;
      }
      const value = values.get(id);
      const jsType = typeof value;
      if (jsType === 'undefined' && !required) {
        return;
      }
      if (!schema) {
        // without schema we treat it as "any". It generates string values.
        if (Array.isArray(value)) {
          // this is a huge assumption here.
          // Todo: this should be done recursively.
          report[binding][name] = value.map(i => i === undefined ? i : String(i));
        } else {
          const isScalar = jsType !== 'undefined' && jsType !== 'object' && value !== null;
          report[binding][name] = isScalar ? String(value) : value;
        }
      } else {
        const valid = AmfInputParser.addReportItem(report[binding], name, schema, value, required);
        if (!valid) {
          report.valid = false;
          report.invalid.push(id);
        }
      }
    });

    return report;
  }

  /**
   * @param {Record<string, any>} reportGroup
   * @param {string} name
   * @param {ApiShapeUnion} schema
   * @param {any} value
   * @param {boolean} required Whether the parameter is required.
   * @returns {boolean} `true` when the parameter is valid and `false` otherwise.
   */
  static addReportItem(reportGroup, name, schema, value, required) {
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return AmfInputParser.addReportScalarItem(reportGroup, name, value, /** @type ApiScalarShape */ (schema), required);
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      return AmfInputParser.addReportArrayItem(reportGroup, name, value, /** @type ApiArrayShape */ (schema), required);
    }
    if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
      return AmfInputParser.addReportUnionItem(reportGroup, name, value, /** @type ApiUnionShape */ (schema), required);
    }
    // ignored parameters are valid (from the form POV).
    return true;
  }

  /**
   * @param {Record<string, any>} reportGroup
   * @param {string} name
   * @param {any} value
   * @param {ApiScalarShape} schema
   * @param {boolean=} required Whether the parameter is required.
   * @returns {boolean} `true` when the parameter is valid and `false` otherwise.
   */
  static addReportScalarItem(reportGroup, name, value, schema, required) {
    const type = typeof value;
    const isScalar = type !== 'undefined' && type !== 'object' && value !== null;
    reportGroup[name] = isScalar ? AmfInputParser.parseScalarInput(value, schema) : value;
    return !required || !!required && reportGroup[name] !== undefined;
  }

  /**
   * @param {Record<string, any>} reportGroup
   * @param {string} name
   * @param {any} value
   * @param {ApiArrayShape} schema
   * @param {boolean} required Whether the parameter is required.
   * @returns {boolean} `true` when the parameter is valid and `false` otherwise.
   */
  static addReportArrayItem(reportGroup, name, value, schema, required) {
    if (!Array.isArray(reportGroup[name])) {
      reportGroup[name] = [];
    }
    if (!Array.isArray(value)) {
      // the value should be an array.
      return !required;
    }
    const { items } = schema;
    /** @type any[] */ (value).forEach((item) => {
      if (item === undefined) {
        // the UI generates a default input for array items. We now ignore all 
        // items that are undefined. This means the item was added but the user never provided any
        // value.
        return;
      }
      const type = typeof item;
      const isScalar = type !== 'undefined' && type !== 'object' && value !== null;
      if (isScalar) {
        const result = items ? AmfInputParser.parseUserInput(item, items) : String(item);
        if (result !== undefined) {
          reportGroup[name].push(result);
        }
      } else {
        reportGroup[name].push(item);
      }
    });
    return !required || !!required && !!reportGroup[name].length;
  }

  /**
   * @param {Record<string, any>} reportGroup
   * @param {string} name
   * @param {any} value
   * @param {ApiUnionShape} schema
   * @param {boolean} required Whether the parameter is required.
   * @returns {boolean} `true` when the parameter is valid and `false` otherwise.
   */
  static addReportUnionItem(reportGroup, name, value, schema, required) {
    const typed = /** @type ApiUnionShape */ (schema);
    const { anyOf } = typed;
    if (!anyOf || !anyOf.length) {
      return !required;
    }
    const nil = anyOf.find(shape => shape.types.includes(ns.aml.vocabularies.shapes.NilShape));
    if (nil && anyOf.length === 2) {
      // this item is not marked as nil (or we wouldn't get to this line) so use the only schema left.
      const scalar = anyOf.find(shape => shape !== nil);
      return AmfInputParser.addReportScalarItem(reportGroup, name, value, /** @type ApiScalarShape */ (scalar));
    }
    // we are iterating over each schema in the union. Ignoring non-scalar schemas it parses user input
    // for each schema and if the result is set (non-undefined) then this value is used.
    for (let i = 0, len = anyOf.length; i < len; i += 1) {
      const option = anyOf[i];
      if (!option.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
        continue;
      }
      const result = AmfInputParser.parseUserInput(value, option);
      if (result !== undefined) {
        reportGroup[name] = result;
        return true;
      }
    }
    return !required;
  }
}
