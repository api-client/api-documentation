/* eslint-disable class-methods-use-this */
import { ns } from '@api-client/amf-store/worker.index.js';
import { 
  ShapeExampleGeneratorBase,
  scalarShapeObject,
  nodeShapeObject,
  unionShapeObject,
  fileShapeObject,
  schemaShapeObject,
  arrayShapeObject,
  tupleShapeObject,
  anyShapeObject,
  scalarExampleValue,
  propertyShapeObject,
  exampleToObject,
} from './ShapeExampleGeneratorBase.js';
import { XmlExampleGenerator } from './XmlExampleGenerator.js';

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
/** 
 * @typedef ProcessNodeOptions 
 * @property {string=} forceName
 * @property {number=} indent
 */

/**
 * Normalizes given name to a value that can be accepted by `createElement`
 * function on a document object.
 * @param {String} name A name to process
 * @return {String} Normalized name
 */
export const normalizeXmlTagName = name => name.replace(/[^a-zA-Z0-9-_.]/g, '');
const UNKNOWN_TYPE = 'unknown-type';

export const collectProperties = Symbol('collectProperties');

/**
 * @param {ApiAnyShape} shape
 */
export function shapeToXmlTagName(shape) {
  const { name, xmlSerialization, inherits=[] } = shape;
  let label = xmlSerialization && xmlSerialization.name ? xmlSerialization.name : name || UNKNOWN_TYPE;
  if (label === 'schema' && inherits.length) {
    const n = inherits.find(i => i.name && i.name !== 'schema');
    if (n) {
      label = n.name === 'type' ? n.displayName || n.name : n.name;
    }
  }
  return normalizeXmlTagName(label);
}

export class ShapeXmlExampleGenerator extends ShapeExampleGeneratorBase {
  /**
   * Generates a XML example from the structured value.
   * @returns {string}
   */
  generate() {
    const { type } = this;
    const value = this.processNode(type);
    return value;
  }

  /**
   * Processes the Shape definition and returns a JavaScript object or array.
   * @param {ApiShapeUnion} schema
   * @param {ProcessNodeOptions=} options
   * @returns {string}
   */
  processNode(schema, options={}) {
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeObject](/** @type ApiScalarShape */ (schema));
    }
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this[nodeShapeObject](/** @type ApiNodeShape */ (schema), options);
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
      return this[arrayShapeObject](/** @type ApiArrayShape */ (schema), options);
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
    return value;
  }

  /**
   * @param {ApiNodeShape} schema
   * @returns {ApiPropertyShape[]}
   */
  [collectProperties](schema) {
    let result = [];
    const { properties, inherits } = schema;
    if (properties.length) {
      result = [...properties];
    }
    if (Array.isArray(inherits)) {
      inherits.forEach((s) => {
        const p = /** @type ApiNodeShape */ (s).properties;
        if (Array.isArray(p) && p.length) {
          result = [...result, ...p];
        }
      });
    }

    return result;
  }

  /**
   * @param {ApiNodeShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {string}
   */
  [nodeShapeObject](schema, options={}) {
    // const { properties, inherits } = schema;
    const label = options.forceName || shapeToXmlTagName(schema);
    const attributes = [];
    const parts = [];
    const currentIndent = (options.indent || 0);
    const properties = this[collectProperties](schema);
    properties.forEach((property) => {
      const { range } = property;
      if (range.xmlSerialization) {
        // Adds to the parent attributes list.
        if (range.xmlSerialization.attribute) {
          const aLabel = normalizeXmlTagName(range.xmlSerialization.name ? range.xmlSerialization.name : property.name || range.name || UNKNOWN_TYPE);
          const value = this[scalarExampleValue](range);
          attributes.push(`${aLabel}="${value}"`);
          return;
        }
      }
      const indent = currentIndent + 1;
      const value = this[propertyShapeObject](property, { indent });
      if (typeof value !== 'undefined') {
        const fill = new Array(currentIndent*2 + 2).fill(' ').join('');
        parts.push(`${fill}${value}`);
      }
    });

    let opening = `<${label}`;
    if (attributes.length) {
      opening += ' ';
      opening += attributes.join(' ');
    }
    parts.unshift(`${opening}>`);
    const fill = new Array(currentIndent*2).fill(' ').join('');
    parts.push(`${fill}</${label}>`);
    return parts.join('\n');
  }

  /**
   * @param {ApiScalarShape} schema
   * @returns {any|undefined}
   */
  [scalarShapeObject](schema) {
    const content = this[scalarExampleValue](schema);
    const label = shapeToXmlTagName(schema);
    return `<${label}>${content}</${label}>`;
  }

  /**
   * @param {ApiPropertyShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {string}
   */
  [propertyShapeObject](schema, options) {
    const { range } = schema;
    const { types } = range;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeObject](range);
    }
    return this.processNode(range, options);
  }

  /**
   * @param {ApiArrayShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {string}
   */
  [arrayShapeObject](schema, options={}) {
    const { items } = schema;
    const label = shapeToXmlTagName(schema);
    const { defaultValueStr, examples } = items;
    const currentIndent = (options.indent || 0);
    const parts = [
      `<${label}>`
    ];
    if (schema.defaultValueStr) {
      parts.push(schema.defaultValueStr);
    } else if (defaultValueStr) {
      parts.push(defaultValueStr);
    } else if (examples && examples.length) {
      const example = examples.find((item) => !!item.value);
      const value = this[exampleToObject](example);
      if (typeof value !== 'undefined') {
        parts.push(value);
      }
    } else {
      let itemName = '';
      // https://github.com/plurals/pluralize/issues/171
      if (label.endsWith('es')) {
        itemName = label.substr(0, label.length - 2);
      } else if (label.endsWith('s')) {
        itemName = label.substr(0, label.length - 1);
      }
      const opts = {
        forceName: itemName,
        indent: currentIndent + 1,
      };
      const value = this.processNode(items, opts);
      if (typeof value !== 'undefined') {
        parts.push(value);
      }
    }
    const fill = new Array(currentIndent*2).fill(' ').join('');
    parts.push(`${fill}</${label}>`);
    return parts.join('\n');
  }

  /**
   * @param {ApiExample} example The example to turn into a JS object
   * @returns {any}
   */
  [exampleToObject](example) {
    if (example && example.structuredValue) {
      const generator = new XmlExampleGenerator(example.structuredValue);
      return generator.processNode(example.structuredValue);
    }
    return undefined;
  }

  /**
   * @param {ApiUnionShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {any}
   */
  [unionShapeObject](schema, options) {
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
        return this.processNode(renderedItem, options);
      }
    }
    return undefined;
  }
}
