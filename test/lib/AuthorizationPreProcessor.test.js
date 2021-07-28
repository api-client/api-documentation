import { ArcMock } from '@advanced-rest-client/arc-data-generator';
import { assert } from '@open-wc/testing';
import { AuthorizationPreProcessor } from "../../src/lib/AuthorizationPreProcessor.js";

/** @typedef {import('@advanced-rest-client/arc-types').Authorization.BasicAuthorization} BasicAuthorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.PassThroughAuthorization} PassThroughAuthorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.RamlCustomAuthorization} RamlCustomAuthorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.OAuth2Authorization} OAuth2Authorization */
/** @typedef {import('@advanced-rest-client/arc-types').Authorization.ApiKeyAuthorization} ApiKeyAuthorization */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.RequestAuthorization} RequestAuthorization */

describe('AuthorizationPreProcessor', () => {
  const factory = new AuthorizationPreProcessor();
  const mock = new ArcMock();

  describe('basic auth', () => {
    /** @type Readonly<RequestAuthorization> */
    const cnf = Object.freeze({
      type: 'basic',
      valid: true,
      enabled: true,
      config: /** @type BasicAuthorization */ ({
        password: 'test',
        username: 'test',
      }),
    });

    it('adds basic auth', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.equal(result.headers, 'Authorization: Basic dGVzdDp0ZXN0');
    });

    it('keeps the authorization config', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('removes the authorization object from the copy', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request, { removeProcessed: true });
      assert.deepEqual(result.authorization, [], 'copy has not authorization');
      assert.lengthOf(request.authorization, 1, 'original object has authorization');
    });

    it('ignores invalid items by default', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true });
      assert.equal(result.headers, '', 'copy has the headers');
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('processes invalid on demand', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true, processInvalid: true });
      assert.equal(result.headers, 'Authorization: Basic dGVzdDp0ZXN0');
      assert.lengthOf(result.authorization, 0, 'copy has no authorization');
    });

    it('ignores disabled items', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].enabled = false;
      const result = factory.apply(request, { removeProcessed: true });
      assert.equal(result.headers, '', 'copy has the headers');
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });
  });

  describe('pass through', () => {
    /** @type Readonly<RequestAuthorization> */
    const cnf = Object.freeze({
      type: 'pass through',
      valid: true,
      enabled: true,
      config: /** @type PassThroughAuthorization */ ({
        header: {
          'header-key': 'header-value'
        },
        query: {
          'query-key': 'query value',
        }
      }),
    });

    it('adds the header value', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.equal(result.headers, 'header-key: header-value');
    });

    it('adds the query value', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.include(result.url, 'query-key=query+value');
    });

    it('keeps the authorization config', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('removes the authorization object from the copy', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request, { removeProcessed: true });
      assert.deepEqual(result.authorization, [], 'copy has not authorization');
      assert.lengthOf(request.authorization, 1, 'original object has authorization');
    });

    it('ignores invalid items by default', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true });
      assert.equal(result.headers, '', 'copy has the headers');
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('processes invalid on demand', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true, processInvalid: true });
      assert.equal(result.headers, 'header-key: header-value');
      assert.lengthOf(result.authorization, 0, 'copy has no authorization');
    });
  });

  describe('custom', () => {
    /** @type Readonly<RequestAuthorization> */
    const cnf = Object.freeze({
      type: 'custom',
      valid: true,
      enabled: true,
      config: /** @type RamlCustomAuthorization */ ({
        header: {
          'header-key': 'header-value'
        },
        query: {
          'query-key': 'query value',
        }
      }),
    });

    it('adds the header value', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.equal(result.headers, 'header-key: header-value');
    });

    it('adds the query value', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.include(result.url, 'query-key=query+value');
    });

    it('keeps the authorization config', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('removes the authorization object from the copy', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request, { removeProcessed: true });
      assert.deepEqual(result.authorization, [], 'copy has not authorization');
      assert.lengthOf(request.authorization, 1, 'original object has authorization');
    });

    it('ignores invalid items by default', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true });
      assert.equal(result.headers, '', 'copy has the headers');
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('processes invalid on demand', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true, processInvalid: true });
      assert.equal(result.headers, 'header-key: header-value');
      assert.lengthOf(result.authorization, 0, 'copy has no authorization');
    });
  });

  describe('api key', () => {
    /** @type Readonly<RequestAuthorization> */
    const cnf = Object.freeze({
      type: 'api key',
      valid: true,
      enabled: true,
      config: /** @type ApiKeyAuthorization */ ({
        header: {
          'header-key': 'header-value'
        },
        query: {
          'query-key': 'query value',
        },
      }),
    });

    it('adds the header value', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.equal(result.headers, 'header-key: header-value');
    });

    it('adds the cookie value', () => {
      const request = mock.http.history();
      request.headers = '';
      const cp = /** @type RequestAuthorization */ ({ ...cnf });
      const local = /** @type ApiKeyAuthorization */ ({ ...cp.config });
      local.cookie = {
        user: '1',
      };
      cp.config = local;
      request.authorization = [cp];
      const result = factory.apply(request);
      assert.equal(result.headers, 'header-key: header-value\ncookie: user=1');
    });

    it('adds the query value', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.include(result.url, 'query-key=query+value');
    });

    it('keeps the authorization config', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('removes the authorization object from the copy', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request, { removeProcessed: true });
      assert.deepEqual(result.authorization, [], 'copy has not authorization');
      assert.lengthOf(request.authorization, 1, 'original object has authorization');
    });

    it('ignores invalid items by default', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true });
      assert.equal(result.headers, '', 'copy has the headers');
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('processes invalid on demand', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true, processInvalid: true });
      assert.equal(result.headers, 'header-key: header-value');
      assert.lengthOf(result.authorization, 0, 'copy has no authorization');
    });
  });

  describe('oauth 2', () => {
    /** @type Readonly<RequestAuthorization> */
    const cnf = Object.freeze({
      type: 'oauth 2',
      valid: true,
      enabled: true,
      config: /** @type OAuth2Authorization */ ({
        accessToken: 'test-123',
      }),
    });

    it('adds the header value', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.equal(result.headers, 'Authorization: Bearer test-123');
    });

    it('respects the deliveryMethod', () => {
      const cp = /** @type RequestAuthorization */ ({ ...cnf });
      const local = /** @type OAuth2Authorization */ ({ ...cp.config });
      local.deliveryMethod = 'query';
      cp.config = local;
      const request = mock.http.history();
      request.authorization = [cp];
      const result = factory.apply(request);
      assert.include(result.url, 'Authorization=test-123');
    });

    it('respects the deliveryName', () => {
      const cp = /** @type RequestAuthorization */ ({ ...cnf });
      const local = /** @type OAuth2Authorization */ ({ ...cp.config });
      local.deliveryMethod = 'query';
      local.deliveryName = 'auth';
      cp.config = local;
      const request = mock.http.history();
      request.authorization = [cp];
      const result = factory.apply(request);
      assert.include(result.url, 'auth=test-123');
    });

    it('keeps the authorization config', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request);
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('removes the authorization object from the copy', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request, { removeProcessed: true });
      assert.deepEqual(result.authorization, [], 'copy has not authorization');
      assert.lengthOf(request.authorization, 1, 'original object has authorization');
    });

    it('ignores invalid items by default', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true });
      assert.equal(result.headers, '', 'copy has the headers');
      assert.lengthOf(result.authorization, 1, 'copy has the authorization');
    });

    it('processes invalid on demand', () => {
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [{ ...cnf }];
      request.authorization[0].valid = false;
      const result = factory.apply(request, { removeProcessed: true, processInvalid: true });
      assert.equal(result.headers, 'Authorization: Bearer test-123');
      assert.lengthOf(result.authorization, 0, 'copy has no authorization');
    });

    it('ignores when no access token', () => {
      const cp = /** @type RequestAuthorization */ ({ ...cnf });
      const local = /** @type OAuth2Authorization */ ({ ...cp.config });
      local.accessToken = undefined;
      cp.config = local;
      const request = mock.http.history();
      request.headers = '';
      request.authorization = [cp];
      const result = factory.apply(request, { removeProcessed: true });
      assert.equal(result.headers, '', 'copy has the headers');
    });
  });

  describe('other', () => {
    /** @type Readonly<RequestAuthorization> */
    const cnf = Object.freeze({
      type: 'not supported',
      valid: true,
      enabled: true,
      config: /** @type OAuth2Authorization */ ({
        accessToken: 'test-123',
      }),
    });

    it('ignores unsupported methods', () => {
      const request = mock.http.history();
      request.authorization = [{ ...cnf }];
      const result = factory.apply(request, { removeProcessed: true, processInvalid: true, });
      assert.lengthOf(result.authorization, 1);
    });
  });
});
