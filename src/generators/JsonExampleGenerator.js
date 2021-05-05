/* eslint-disable class-methods-use-this */
import { BaseGenerator } from './BaseGenerator.js';

/** @typedef {import('@api-client/amf-store').ApiDataNode} ApiDataNode */

/**
 * A class that processes AMF's `structuredValue` into a JSON example.
 */
export class JsonExampleGenerator extends BaseGenerator {
  /**
   * @param {ApiDataNode} value The structured value of the example
   */
  constructor(value) {
    super();
    this.structure = value;
  }

  /**
   * Generates a JSON example from the structured value.
   * @returns {string}
   */
  generate() {
    const { structure } = this;
    const result = this.processNode(structure);
    return JSON.stringify(result, null, 2);
  }
}
