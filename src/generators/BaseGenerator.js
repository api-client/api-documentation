import { ns } from '@api-client/amf-store/worker.index.js';

/** @typedef {import('@api-client/amf-store').ApiObjectNode} ApiObjectNode */
/** @typedef {import('@api-client/amf-store').ApiArrayNode} ApiArrayNode */
/** @typedef {import('@api-client/amf-store').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-client/amf-store').ApiDataNode} ApiDataNode */

export class BaseGenerator {
  /**
   * @param {ApiDataNode} node
   * @returns {any}
   */
  processNode(node) {
    const { types } = node;
    if (types.includes(ns.aml.vocabularies.data.Scalar)) {
      const typed = /** @type ApiScalarNode */ (node);
      return typed.value;
    }
    if (types.includes(ns.aml.vocabularies.data.Array)) {
      const container = [];
      const typed = /** @type ApiArrayNode */ (node);
      typed.members.forEach((member) => {
        const result = this.processNode(member);
        if (typeof result !== 'undefined') {
          container.push(result);
        }
      });
      return container;
    }
    if (types.includes(ns.aml.vocabularies.data.Object)) {
      const container = {};
      const typed = /** @type ApiObjectNode */ (node);
      const { properties } = typed;
      Object.keys(properties).forEach((key) => {
        const definition = properties[key];
        const result = this.processNode(definition);
        if (typeof result !== 'undefined') {
          container[key] = result;
        }
      });
      return container;
    }
    return undefined;
  }
}
