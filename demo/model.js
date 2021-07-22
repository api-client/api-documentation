import { generate } from '@api-client/amf-store/models.js';

/** @typedef {import('@api-client/amf-store/tasks/types').ApiConfiguration} ApiConfiguration */

/** @type {Map<string, ApiConfiguration>} */
const config = new Map();
config.set('async-api/async-api.yaml', { type: "ASYNC 2.0" });
config.set('demo-api/demo-api.raml', { type: "RAML 1.0" });
config.set('google-drive-api/google-drive-api.raml', { type: "RAML 1.0" });
config.set('oas-3-api/oas-3-api.yaml', { type: "OAS 3.0" });
config.set('streetlights/streetlights.yaml', { type: "ASYNC 2.0" });
config.set('modular-api/modular-api.raml', { type: "RAML 1.0" });
config.set('secured-api/secured-api.raml', { type: "RAML 1.0" });
config.set('oauth-pkce/oauth-pkce.raml', { type: "RAML 1.0" });
config.set('oauth-flows/oauth-flows.yaml', { type: "OAS 3.0" });
config.set('petstore/petstore.yaml', { type: "OAS 3.0" });
config.set('oas-bearer/oas-bearer.yaml', { type: "OAS 3.0" });
config.set('secured-unions/secured-unions.yaml', { type: "OAS 3.0" });

generate(config);
