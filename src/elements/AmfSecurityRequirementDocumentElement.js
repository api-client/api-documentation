import { html } from 'lit-element';
import { StoreEvents } from '@api-client/amf-store/worker.index.js';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import { 
  AmfDocumentationBase,
  queryingValue,
} from './AmfDocumentationBase.js';
import '../../amf-parametrized-security-scheme.js';

/** @typedef {import('@api-client/amf-store').ApiSecurityRequirement} ApiSecurityRequirement */

export const securityRequirementValue = Symbol('securityRequirementValue');
export const querySecurity = Symbol('querySecurity');

export default class AmfSecurityRequirementDocumentElement extends AmfDocumentationBase {
  constructor() {
    super();
    /**
     * @type {ApiSecurityRequirement}
     */
    this[securityRequirementValue] = undefined;
  }

  /**
   * Queries the graph store for the API security data.
   * @returns {Promise<void>}
   */
  async queryGraph() {
    if (this.querying) {
      return;
    }
    const { domainId } = this;
    this[queryingValue] = true;
    await this[querySecurity](domainId);
    this[queryingValue] = false;
    await this.requestUpdate();
  }

  /**
   * Queries for the security and sets the local value.
   * @param {string} id The domain id of the security scheme.
   */
  async [querySecurity](id) {
    this[securityRequirementValue] = undefined;
    try {
      const info = await StoreEvents.Security.getRequirement(this, id);
      this[securityRequirementValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API security data: ${e.message}`, this.localName);
    }
  }

  render() {
    const scheme = this[securityRequirementValue];
    if (!scheme || !scheme.schemes || !scheme.schemes.length) {
      return html``;
    }
    return html`
    <div class="security-requirements">
      ${scheme.schemes.map((item) => html`
        <amf-parametrized-security-scheme 
          .domainId="${item.scheme && item.scheme.id}" 
          .settingsId="${item.settings && item.settings.id}"
          settingsOpened></amf-parametrized-security-scheme>`)}
    </div>
    `;
  }
}
