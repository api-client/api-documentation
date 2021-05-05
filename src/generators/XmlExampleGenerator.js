/* eslint-disable class-methods-use-this */
import { BaseGenerator } from './BaseGenerator.js';
import { toXml } from './Utils.js';

/** @typedef {import('@api-client/amf-store').ApiDataNode} ApiDataNode */

/**
 * A class that processes AMF's `structuredValue` into an XML example.
 */
export class XmlExampleGenerator extends BaseGenerator {
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
    return toXml(result);
  }
}
