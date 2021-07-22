/* eslint-disable class-methods-use-this */
import { JsonExampleGenerator } from '../generators/JsonExampleGenerator.js';
import { XmlExampleGenerator } from '../generators/XmlExampleGenerator.js';
import { UrlEncodedGenerator } from '../generators/UrlEncodedGenerator.js';

/** @typedef {import('@api-client/amf-store').ApiExample} ApiExample */
/** @typedef {import('@api-client/amf-store').ApiDataNode} ApiDataNode */
/** @typedef {import('@api-client/amf-store').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('../types').SchemaExample} SchemaExample */

/**
 * A class that processes AMF's Example object to read the example value
 * or to generate the example for the given media type.
 */
export class ApiExampleGenerator {
  /**
   * Reads or generates the example.
   * When the `mime` is set then it tries to "guess" whether the mime type corresponds to the value.
   * If it doesn't then it generates the example from the structured value, when possible.
   * @param {ApiExample} example The structured value of the example
   * @param {string=} mime The optional mime type of the example. When not set it won't generate example from the structured value.
   * @returns {string|null} The read or generated example.
   */
  read(example, mime) {
    const { value, structuredValue } = example;
    if (!value && !structuredValue) {
      return null;
    }
    if (!value && mime) {
      return this.fromStructuredValue(mime, structuredValue);
    }
    if (!mime) {
      return value;
    }
    if (this.mimeMatches(mime, value)) {
      return value;
    }
    return this.fromStructuredValue(mime, structuredValue);
  }

  /**
   * Employs some basic heuristics to determine whether the given mime type patches the content.
   * @param {string} mime The mime type for the value.
   * @param {string} value The value.
   * @returns {boolean} True when the value matches the mime type.
   */
  mimeMatches(mime, value) {
    const trimmed = value.trim();
    if (mime.includes('json')) {
      // JSON string has to start with either of these characters
      return trimmed[0] === '{' || trimmed[0] === '[';
    }
    if (mime.includes('xml')) {
      return trimmed.startsWith('<');
    }
    if (mime.includes('x-www-form-urlencoded')) {
      return mime.includes('=');
    }
    return true;
  }

  /**
   * Generates the example for the given structured value and the media type.
   * @param {string} mime The mime type for the value.
   * @param {ApiDataNode} structuredValue The structuredValue of the example.
   * @returns {string|null} The generated example or null if couldn't process the data.
   */
  fromStructuredValue(mime, structuredValue) {
    if (mime.includes('json')) {
      const generator = new JsonExampleGenerator(structuredValue);
      return generator.generate();
    }
    if (mime.includes('xml')) {
      const generator = new XmlExampleGenerator(structuredValue);
      return generator.generate();
    }
    if (mime.includes('x-www-form-urlencoded')) {
      const generator = new UrlEncodedGenerator(structuredValue);
      return generator.generate();
    }
    return null;
  }
}
