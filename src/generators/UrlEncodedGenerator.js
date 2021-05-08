/* eslint-disable class-methods-use-this */
import { BaseGenerator } from './BaseGenerator.js';

/** @typedef {import('@api-client/amf-store').ApiDataNode} ApiDataNode */

export class UrlEncodedGenerator extends BaseGenerator {
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
    return this.createUrlEncoded(result);
  }

  /**
   * @param {any} obj
   * @returns {string} 
   */
  createUrlEncoded(obj) {
    if (typeof obj !== 'object') {
      return String(obj);
    }
    const parts = Object.keys(obj).map((key) => {
      let value = obj[key];
      if (typeof value === 'object') {
        value = this.createUrlEncoded(value);
      } else {
        value = encodeURIComponent(value);
      }
      return `${key}=${value}`;
    });
    return parts.join('&');
  }
}
