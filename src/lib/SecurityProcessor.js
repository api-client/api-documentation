/** @typedef {import('@api-client/amf-store').ApiSecurityRequirementRecursive} ApiSecurityRequirementRecursive */
/** @typedef {import('../types').SecuritySelectorListItem} SecuritySelectorListItem */

export class SecurityProcessor {
  /**
   * @param {ApiSecurityRequirementRecursive[]} security
   * @returns {SecuritySelectorListItem[]}
   */
  static readSecurityList(security) {
    const result = /** @type SecuritySelectorListItem[] */ ([]);
    if (!Array.isArray(security) || !security.length) {
      return result;
    }
    security.forEach((item) => {
      const { schemes } = item;
      if (!Array.isArray(schemes)) {
        return;
      }
      result.push(SecurityProcessor.readSecurityListItem(item));
    });
    return result;
  }

  /**
   * @param {ApiSecurityRequirementRecursive} item
   * @returns {SecuritySelectorListItem}
   */
  static readSecurityListItem(item) {
    const { schemes } = item;
    const result = /** @type SecuritySelectorListItem */ ({
      types: [],
      labels: [],
      security: item,
    });
    schemes.forEach((scheme) => {
      const { name, scheme: settings } = scheme;
      if (name === 'null') {
        // RAML allows to define a "null" scheme. This means that the authorization
        // for this endpoint is optional.
        result.types.push(undefined);
        result.labels.push('No authorization');
        return;
      }
      const label = name || settings && settings.name;
      const type = settings && settings.type;
      result.types.push(type);
      result.labels.push(label);
    });
    return result;
  }
}
