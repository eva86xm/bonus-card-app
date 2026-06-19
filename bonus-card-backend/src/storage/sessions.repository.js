const crypto = require('crypto');

const sessionsByToken = new Map();

function createSession(userId) {
  const session = {
    token: crypto.randomBytes(32).toString('hex'),
    userId,
    createdAt: new Date().toISOString()
  };

  sessionsByToken.set(session.token, session);

  return session;
}

function findSession(token) {
  return sessionsByToken.get(token) || null;
}

function deleteSession(token) {
  sessionsByToken.delete(token);
}

module.exports = {
  createSession,
  findSession,
  deleteSession
};
