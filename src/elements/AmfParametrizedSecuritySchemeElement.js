/* eslint-disable class-methods-use-this */
import { ns, StoreEvents } from '@api-client/amf-store/worker.index.js';
import { TelemetryEvents, ReportingEvents } from '@api-client/graph-project';
import AmfSecurityDocumentElement, {
  settingsTemplate,
  securityValue,
  apiKeySettingsTemplate,
  openIdConnectSettingsTemplate,
  oAuth2SettingsTemplate,
} from "./AmfSecurityDocumentElement.js";
import elementStyles from './styles/ParametrizedSecurityElement.js';

/** @typedef {import('@api-client/amf-store').ApiSecuritySettingsUnion} ApiSecuritySettingsUnion */
/** @typedef {import('@api-client/amf-store').ApiSecurityOAuth2Settings} ApiSecurityOAuth2Settings */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const settingsIdValue = Symbol('settingsIdValue');
export const querySettings = Symbol('querySettings');
export const settingsValue = Symbol('settingsValue');
export const mergeSettings = Symbol('mergeSettings');

export default class AmfParametrizedSecuritySchemeElement extends AmfSecurityDocumentElement {
  static get styles() {
    return [...AmfSecurityDocumentElement.styles, elementStyles];
  }

  /** 
   * @returns {string|undefined} The domain id of the settings to render.
   */
  get settingsId() {
    return this[settingsIdValue];
  }

  /** 
   * @returns {string|undefined} The domain id of the settings to render.
   */
  set settingsId(value) {
    const old = this[settingsIdValue];
    if (old === value) {
      return;
    }
    this[settingsIdValue] = value;
    this.requestUpdate('settingsId', old);
    if (value) {
      this[querySettings]();
    }
  }

  static get properties() {
    return {
      /** 
       * The security settings id.
       */
      settingsId: { type: String, reflect: true },
    };
  }

  async [querySettings]() {
    this[settingsValue] = undefined;
    const id = this.settingsId;
    if (!id) {
      this.requestUpdate();
      return;
    }
    try {
      const info = await StoreEvents.Security.getSettings(this, id);
      // console.log(info);
      this[settingsValue] = info;
      this.requestUpdate();
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API security settings data: ${e.message}`, this.localName);
    }
  }

  /**
   * @returns {TemplateResult|string} The template for the security settings, when required.
   */
  [settingsTemplate]() {
    const appliedSettings = this[settingsValue];
    if (!appliedSettings) {
      return super[settingsTemplate]();
    }
    const scheme = this[securityValue];
    const { settings } = scheme;
    if (!settings) {
      return '';
    }
    const { types } = settings;
    const mergedSettings = this[mergeSettings](appliedSettings, settings);

    if (types.includes(ns.aml.vocabularies.security.ApiKeySettings)) {
      return this[apiKeySettingsTemplate](mergedSettings);
    }
    if (types.includes(ns.aml.vocabularies.security.OpenIdConnectSettings)) {
      return this[openIdConnectSettingsTemplate](mergedSettings);
    }
    if (types.includes(ns.aml.vocabularies.security.OAuth2Settings)) {
      return this[oAuth2SettingsTemplate](/** @type ApiSecurityOAuth2Settings */ (mergedSettings));
    }
    return '';
  }

  /**
   * @param {ApiSecuritySettingsUnion} applied The settings applied to the current object
   * @param {ApiSecuritySettingsUnion} scheme The settings defined in the scheme
   * @returns {ApiSecuritySettingsUnion} The merged settings to render.
   */
  [mergeSettings](applied, scheme) {
    const result = { ...scheme };
    Object.keys(applied).forEach((key) => {
      if (['id', 'types', 'additionalProperties'].includes(key)) {
        return;
      }
      result[key] = applied[key];
    });
    return result;
  }
}
