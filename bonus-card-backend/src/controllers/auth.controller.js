const sncService = require('../services/snc.service');
const smsService = require('../services/sms.service');
const usersRepository = require('../storage/users.repository');
const sessionsRepository = require('../storage/sessions.repository');

async function requestCode(req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Укажите телефон' });
    }

    const client = sncService.findClientByPhone(phone);

    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден. Проверьте номер телефона.' });
    }

    const code = smsService.createCode(phone);
    await smsService.sendCode(phone, code);

    res.json({
      ok: true,
      message: 'Код подтверждения отправлен',
      devCode: smsService.shouldExposeDevCode() ? code : undefined
    });
  } catch (error) {
    next(error);
  }
}

async function verifyCode(req, res, next) {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Укажите телефон и код подтверждения' });
    }

    if (!smsService.verifyCode(phone, code)) {
      return res.status(401).json({ error: 'Неверный код подтверждения' });
    }

    const client = sncService.findClientByPhone(phone);

    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден. Проверьте номер телефона.' });
    }

    const user = usersRepository.upsertFromClient(client);
    const session = sessionsRepository.createSession(user.id);

    res.json({
      ok: true,
      token: session.token,
      user,
      card: sncService.toCardResponse(client)
    });
  } catch (error) {
    next(error);
  }
}

function logout(req, res, next) {
  try {
    const authHeader = req.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (token) {
      sessionsRepository.deleteSession(token);
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requestCode,
  verifyCode,
  logout
};
