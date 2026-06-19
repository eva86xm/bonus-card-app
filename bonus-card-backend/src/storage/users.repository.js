const crypto = require('crypto');
const sncService = require('../services/snc.service');

const usersById = new Map();
const userIdsByPhone = new Map();

function upsertFromClient(client) {
  const normalizedPhone = sncService.normalizePhone(client.phone);
  const existingUserId = userIdsByPhone.get(normalizedPhone);

  if (existingUserId) {
    const existingUser = usersById.get(existingUserId);
    existingUser.name = client.name;
    existingUser.phone = client.phone;
    return existingUser;
  }

  const user = {
    id: crypto.randomUUID(),
    phone: client.phone,
    name: client.name,
    role: 'client',
    createdAt: new Date().toISOString()
  };

  usersById.set(user.id, user);
  userIdsByPhone.set(normalizedPhone, user.id);

  return user;
}

function findById(id) {
  return usersById.get(id) || null;
}

module.exports = {
  upsertFromClient,
  findById
};
