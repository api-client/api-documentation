import { html, fixture, assert, nextFrame, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import { TestHelper } from "../TestHelper.js";
import '../../amf-authorization-editor.js';
import { methodsValue } from '../../src/elements/AmfAuthorizationEditorElement.js';

/** @typedef {import('../../index').AmfAuthorizationEditorElement} AmfAuthorizationEditorElement */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.BasicAuthorization} BasicAuthorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.OAuth1Authorization} OAuth1Authorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.DigestAuthorization} DigestAuthorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.BearerAuthorization} BearerAuthorization */
/** @typedef {import('@api-client/amf-store/worker.index').AmfStoreService} AmfStoreService */
/** @typedef {import('@api-client/amf-store/worker.index').ApiSecurityRequirementRecursive} ApiSecurityRequirementRecursive */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.ApiKeyAuthorization} ApiKeyAuthorization */

describe('AmfAuthorizationEditorElement OAS tests', () => {
  /**
   * @param {string} domainId
   * @returns {Promise<AmfAuthorizationEditorElement>} 
   */
  async function basicFixture(domainId) {
    const element = /** @type AmfAuthorizationEditorElement */ (await fixture(html`<amf-authorization-editor
      .domainId="${domainId}"
    ></amf-authorization-editor>`));
    await oneEvent(element, 'ready');
    return element;
  }

  /** @type AmfStoreService */
  let store;
  before(async () => {
    store = await TestHelper.initStore();
  });

  after(async () => {
    store.worker.terminate();
  });

  /**
   * @param {string} path
   * @param {string} method
   * @returns {Promise<ApiSecurityRequirementRecursive>} 
   */
  async function getSecurityRequirement(path, method) {
    const operation = await store.getOperationRecursive(method, path);
    return operation.security[0];
  }

  describe('Single vs multiple', () => {
    before(async () => {
      const model = await TestHelper.getGraph('secured-unions');
      await store.loadGraph(model, 'OAS 3.0');
    });

    describe(`Single method`, () => {
      /** @type AmfAuthorizationEditorElement */
      let element;
      
      beforeEach(async () => {
        const security = await getSecurityRequirement('/single', 'get');
        element = await basicFixture(security.id);
      });

      it('has a single method definition', () => {
        const methods = element[methodsValue];
        assert.lengthOf(methods.types, 1);
      });

      it('renders a single method', () => {
        const nodes = element.shadowRoot.querySelectorAll('amf-authorization-method');
        assert.lengthOf(nodes, 1);
      });
    });

    describe(`Multiple methods`, () => {
      /** @type AmfAuthorizationEditorElement */
      let element;

      beforeEach(async () => {
        const security = await getSecurityRequirement('/and-and-or-union', 'get');
        element = await basicFixture(security.id);
      });

      it('has all methods definitions', () => {
        const methods = element[methodsValue];
        assert.lengthOf(methods.types, 2);
      });

      it('renders editors for each method', () => {
        const nodes = element.shadowRoot.querySelectorAll('amf-authorization-method');
        assert.lengthOf(nodes, 2);
      });
    });
  });

  describe('Api Key method', () => {
    before(async () => {
      const model = await TestHelper.getGraph('api-keys');
      await store.loadGraph(model, 'OAS 3.0');
    });

    describe(`Basic tests`, () => {
      /** @type AmfAuthorizationEditorElement */
      let element;
      
      beforeEach(async () => {
        const security = await getSecurityRequirement('/query', 'get');
        element = await basicFixture(security.id);
      });

      it('has "types" in the authorization object', () => {
        const methods = element[methodsValue];
        const { types } = methods;
        assert.deepEqual(types, ['Api Key']);
      });

      it('has "schemes" in the authorization object', () => {
        const methods = element[methodsValue];
        const { schemes } = methods;
        assert.typeOf(schemes[0], 'object');
      });

      it('notifies changes when panel value change', () => {
        const form = element.shadowRoot.querySelector('amf-authorization-method');
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        form.updateQueryParameter('client_id', 'test')
        form.dispatchEvent(new CustomEvent('change'));
        assert.isTrue(spy.called);
      });

      // it.only('element is not invalid without required values', () => {
      //   const result = element.validate();
      //   assert.isFalse(result, 'validation result is false');
      //   console.log(element.serialize()[0].config);
      //   assert.isNotTrue(element.invalid, 'is not invalid');
      // });

      it('element is valid with required values', async () => {
        const form = element.shadowRoot.querySelector('amf-authorization-method');
        form.updateQueryParameter('client_id', 'test');
        form.dispatchEvent(new CustomEvent('change'));
        await nextFrame();
        const result = element.validate();
        assert.isTrue(result, 'validation result is true');
        assert.isFalse(element.invalid, 'is not invalid');
      });

      it('serializes the settings', async () => {
        const form = element.shadowRoot.querySelector('amf-authorization-method');
        form.updateQueryParameter('client_id', 'test');
        form.dispatchEvent(new CustomEvent('change'));
        await nextFrame();
        const auth = element.serialize();
        const [result] = auth;
        assert.equal(result.type, 'api key', 'auth has type');
        assert.equal(result.valid, true, 'auth is valid');
        assert.equal(result.enabled, true, 'auth is enabled');
        assert.typeOf(result.config, 'object', 'has auth config');
        const cnf = /** @type ApiKeyAuthorization */ (result.config);
        assert.equal(cnf.query.client_id, 'test', 'has config.query.client_id');
      });
    });
  });

  // due to an issue with AMF the http methods don't work when importing a graph model.
  describe.skip('Bearer method', () => {
    before(async () => {
      const model = await TestHelper.getGraph('oas-bearer');
      await store.loadGraph(model, 'OAS 3.0');
    });

    describe(`Basic tests`, () => {
      /** @type AmfAuthorizationEditorElement */
      let element;
      
      beforeEach(async () => {
        const security = await getSecurityRequirement('/bearer', 'get');
        element = await basicFixture(security.id);
      });

      it('has "types" in the authorization object', () => {
        const methods = element[methodsValue];
        const { types } = methods;
        assert.deepEqual(types, ['bearer']);
      });

      it('has "schemes" in the authorization object', () => {
        const methods = element[methodsValue];
        const { schemes } = methods;
        assert.typeOf(schemes[0], 'object');
      });

      it('notifies changes when panel value change', () => {
        const form = element.shadowRoot.querySelector('amf-authorization-method');
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        form.token = 'test';
        form.dispatchEvent(new CustomEvent('change'));
        assert.isTrue(spy.called);
      });

      it('element is invalid without required values', () => {
        const result = element.validate();
        assert.isFalse(result, 'validation result is false');
        assert.isTrue(element.invalid, 'is invalid');
      });

      it('element is valid with required values', async () => {
        const form = element.shadowRoot.querySelector('amf-authorization-method');
        form.token = 'test';
        form.dispatchEvent(new CustomEvent('change'));
        await nextFrame();
        const result = element.validate();
        assert.isTrue(result, 'validation result is true');
        assert.isFalse(element.invalid, 'is not invalid');
      });

      it('creates params with serialize()', async () => {
        const form = element.shadowRoot.querySelector('amf-authorization-method');
        form.token = 'test';
        form.dispatchEvent(new CustomEvent('change'));
        await nextFrame();
        const [result] = element.serialize();
        const cnf = /** @type ApiKeyAuthorization */ (result.config)
        assert.deepEqual(cnf.header, {
          authorization: 'Bearer test',
        }, 'has headers');
        assert.deepEqual(cnf.query, {}, 'has no params');
        assert.deepEqual(cnf.cookie, {}, 'has no cookies');
      });
    });
  });
});
