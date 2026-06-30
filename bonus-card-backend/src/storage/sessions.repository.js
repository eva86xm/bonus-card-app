const crypto = require('crypto');

const sessionsByToken = new Map();
const DEFAULT_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getSessionTtl() {
  const configuredTtl = Number(process.env.SESSION_TTL_MS);
  return Number.isFinite(configuredTtl) && configuredTtl > 0
    ? configuredTtl
    : DEFAULT_SESSION_TTL_MS;
}

function createSession(userId) {
  const session = {
    token: crypto.randomBytes(32).toString('hex'),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + getSessionTtl()
  };

  sessionsByToken.set(session.token, session);

  return session;
}

function findSession(token) {
  const session = sessionsByToken.get(token);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessionsByToken.delete(token);
    return null;
  }

  return session;
}

function deleteSession(token) {
  sessionsByToken.delete(token);
}

module.exports = {
  createSession,
  findSession,
  deleteSession
};
