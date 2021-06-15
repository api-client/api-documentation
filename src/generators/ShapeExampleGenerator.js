/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ns } from '@api-client/amf-store';
import { ShapeJsonExampleGenerator } from './ShapeJsonExampleGenerator.js';
import { ShapeXmlExampleGenerator } from './ShapeXmlExampleGenerator.js';

/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('../types').SchemaExample} SchemaExample */
/** @typedef {import('../types').ShapeExampleGeneratorOptions} ShapeExampleGeneratorOptions */
/** @typedef {import('./ShapeExampleGeneratorBase').ShapeExampleGeneratorBase} ShapeExampleGeneratorBase */

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
    /** 
     * @type {ShapeExampleGeneratorBase}
     */
    this.generator = undefined;
    if (mime.includes('json')) {
      this.generator = new ShapeJsonExampleGenerator(value, opts);
    } else if (mime.includes('xml')) {
      this.generator = new ShapeXmlExampleGenerator(value, opts);
    }
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
   * @returns {string|null}
   */
  generate() {
    const { generator } = this;
    if (!generator) {
      return null;
    }
    return generator.generate();
  }
}
