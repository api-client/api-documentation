/* eslint-disable class-methods-use-this */

import { ns } from "@api-client/amf-store/worker.index.js";
import { AmfInputParser } from "./AmfInputParser.js";
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
/** @typedef {import('@api-client/amf-store').ApiExample} ApiExample */
/** @typedef {import('@api-client/amf-store').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-client/amf-store').ApiArrayNode} ApiArrayNode */

/**
 * A utility class with helper functions to process AMF schema.
 */
export class AmfSchemaProcessor {
  /**
   * Reads the value to be set on an input.
   *
   * @param {ApiParameterRecursive} parameter
   * @param {ApiScalarShape} schema
   * @returns {any} The value to set on the input. Note, it is not cast to the type.
   */
  static readInputValue(parameter, schema) {
    const { required } = parameter;
    const { defaultValueStr } = schema;
    if (!required) {
      return undefined;
    }
    if (defaultValueStr) {
      return AmfInputParser.readTypedValue(defaultValueStr, schema.dataType);
    }
    /** @type ApiExample[] */
    let examples;
    if (Array.isArray(parameter.examples) && parameter.examples.length) {
      // just in case when an ApiParameter was passed.
      examples = parameter.examples.filter(i => typeof i !== 'string');
    } else if (Array.isArray(schema.examples) && schema.examples.length) {
      examples = schema.examples;
    }
    if (!examples || !examples.length) {
      return AmfSchemaProcessor.generateDefaultValue(schema);
    }
    return AmfSchemaProcessor.inputValueFromExamples(examples);
  }

  /**
   * @param {ApiParameterRecursive} parameter
   * @param {ApiShapeUnion} schema
   * @returns {any[]}
   */
  static readArrayValues(parameter, schema) {
    if (!parameter.required) {
      // for a non required array items just skip showing example values
      // as they are not crucial to make the HTTP request.
      return [];
    }
    /** @type ApiExample[] */
    let examples;
    if (Array.isArray(parameter.examples) && parameter.examples.length) {
      // just in case when an ApiParameter was passed.
      examples = parameter.examples.filter(i => typeof i !== 'string');
    } else if (Array.isArray(schema.examples) && schema.examples.length) {
      examples = schema.examples;
    }
    return AmfSchemaProcessor.arrayValuesFromExamples(examples);
  }

  /**
   * Reads the value for the form input(s) from examples.
   * @param {ApiExample[]} examples
   * @returns {any|null|undefined} 
   */
  static inputValueFromExamples(examples) {
    if (!examples || !examples.length) {
      return undefined;
    }
    const [example] = examples;
    const { structuredValue } = example;
    if (!structuredValue) {
      return undefined;
    }
    if (structuredValue.types.includes(ns.aml.vocabularies.data.Scalar)) {
      const value = /** @type ApiScalarNode */ (structuredValue);
      return value.value;
    }
    if (structuredValue.types.includes(ns.aml.vocabularies.data.Array)) {
      const value = /** @type ApiArrayNode */ (structuredValue);
      const { members } = value;
      if (!Array.isArray(members) || !members.length) {
        return undefined;
      }
      const result = [];
      members.forEach((item) => {
        const scalar = /** @type ApiScalarNode */ (item);
        if (!scalar.value) {
          return;
        }
        const typedValue = AmfInputParser.readTypedValue(scalar.value, scalar.dataType);
        if (typeof value !== "undefined" && value !== null) {
          result.push(typedValue);
        }
      });
      return result;
    }
    return undefined;
  }

  /**
   * Reads the array value from examples.
   * @param {ApiExample[]} examples Examples set on an array item.
   * @returns {any[]} 
   */
  static arrayValuesFromExamples(examples) {
    /** @type any[] */
    const defaultReturn = [undefined];
    if (!Array.isArray(examples) || !examples.length) {
      return defaultReturn;
    }
    const [example] = examples;
    if (!example.structuredValue || !example.structuredValue.types.includes(ns.aml.vocabularies.data.Array)) {
      return defaultReturn;
    }
    const value = /** @type ApiArrayNode */ (example.structuredValue);
    const { members } = value;
    if (!Array.isArray(members) || !members.length) {
      return defaultReturn;
    }
    const result = [];
    members.forEach((item) => {
      const scalar = /** @type ApiScalarNode */ (item);
      if (!scalar.value) {
        return;
      }
      const typedValue = AmfInputParser.readTypedValue(scalar.value, scalar.dataType);
      if (typeof value !== 'undefined' && value !== null) {
        result.push(typedValue);
      }
    });
    if (!result.length) {
      result.push(undefined);
    }
    return result;
  }

  /**
   * @param {ApiParameterRecursive} parameter
   * @param {ApiShapeUnion} schema
   * @returns {string} The name to use in the input.
   */
  static readLabelValue(parameter, schema) {
    let label = schema.displayName || parameter.name ||  schema.name;
    const { required } = parameter;
    if (required) {
      label += '*';
    }
    return label;
  }

  /**
   * Generates a default value from the schema type.
   * For booleans it returns `false`, for numbers `0`, nulls `null`, etc.
   * It does not generate a value for `string` types!
   * 
   * @param {ApiScalarShape} schema
   * @returns {any}
   */
  static generateDefaultValue(schema) {
    const { dataType } = schema;
    switch (dataType) {
      case ns.w3.xmlSchema.number:
      case ns.w3.xmlSchema.integer:
      case ns.w3.xmlSchema.float:
      case ns.w3.xmlSchema.long:
      case ns.w3.xmlSchema.double: return 0;
      case ns.w3.xmlSchema.boolean: return false;
      case ns.w3.xmlSchema.nil: return null;
      case ns.w3.xmlSchema.date: return AmfInputParser.parseDateOnlyInput(new Date());
      case ns.w3.xmlSchema.time: 
        {
          const d = new Date();
          const timePart = d.toJSON().split('T')[1]; // "yyyy-MM-ddThh:mm:ss.090Z" -> "hh:mm:ss.090Z"
          const dot = timePart.indexOf('.');
          return timePart.substr(0, dot);
        };
      case ns.w3.xmlSchema.dateTime: return AmfInputParser.parseDateTimeInput(new Date(), schema.format);
      case ns.aml.vocabularies.shapes.dateTimeOnly: return AmfInputParser.parseDateTimeOnlyInput(new Date());
      default: return undefined;
    }
  }
}
