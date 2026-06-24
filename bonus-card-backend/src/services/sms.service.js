const sncService = require('./snc.service');

const codesByPhone = new Map();

function createCode(phone) {
  const normalizedPhone = sncService.normalizePhone(phone);
  const code = process.env.DEV_AUTH_CODE || String(Math.floor(100000 + Math.random() * 900000));

  codesByPhone.set(normalizedPhone, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  return code;
}

async function sendCode(phone, code) {
  if (shouldExposeDevCode()) {
    console.log(`SMS code for ${phone}: ${code}`);
  }
}

function verifyCode(phone, code) {
  const normalizedPhone = sncService.normalizePhone(phone);
  const savedCode = codesByPhone.get(normalizedPhone);

  if (!savedCode || savedCode.expiresAt < Date.now()) {
    codesByPhone.delete(normalizedPhone);
    return false;
  }

  const isValid = savedCode.code === String(code).trim();

  if (isValid) {
    codesByPhone.delete(normalizedPhone);
  }

  return isValid;
}

function shouldExposeDevCode() {
  return process.env.NODE_ENV !== 'production';
}

module.exports = {
  createCode,
  sendCode,
  verifyCode,
  shouldExposeDevCode
};
