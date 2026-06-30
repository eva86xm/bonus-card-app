const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.MOCK_MODE = 'true';
process.env.CLIENT_ORIGIN = 'http://127.0.0.1:8080';

const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server) return;

  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Origin: 'http://127.0.0.1:8080',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();
  return { response, data };
}

test('health endpoint and security headers', async () => {
  const { response, data } = await request('/health');

  assert.equal(response.status, 200);
  assert.deepEqual(data, { ok: true });
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://127.0.0.1:8080');
});

test('invalid phone is rejected', async () => {
  const { response } = await request('/api/snc/request-sms', {
    method: 'POST',
    body: JSON.stringify({ phone: '+7 900' })
  });

  assert.equal(response.status, 400);
});

test('mock login and card data flow', async () => {
  const login = await request('/api/snc/login', {
    method: 'POST',
    body: JSON.stringify({ username: '79001112233', password: '123456' })
  });

  assert.equal(login.response.status, 200);
  assert.equal(login.data.ok, true);
  assert.ok(login.data.data.accessToken);

  const authorization = `Bearer ${login.data.data.accessToken}`;
  const paths = ['/api/snc/user', '/api/snc/owner', '/api/snc/transactions', '/api/snc/qr-code'];

  for (const path of paths) {
    const result = await request(path, {
      headers: { Authorization: authorization }
    });

    assert.equal(result.response.status, 200, path);
    assert.equal(result.data.ok, true, path);
  }
});

test('unknown routes return JSON 404', async () => {
  const { response, data } = await request('/missing');

  assert.equal(response.status, 404);
  assert.equal(typeof data.error, 'string');
});

