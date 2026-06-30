const sncService = require('../services/snc.service');

async function ping(req, res, next) {
  try {
    const result = await sncService.ping();

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

function getSafeStatus(status) {
  if (status === 0) {
    return 502;
  }

  return Number.isInteger(status) && status >= 100 && status <= 599
    ? status
    : 500;
}

function sendSncResult(res, result) {
  return res.status(getSafeStatus(result.status)).json(result);
}

async function requestSms(req, res, next) {
  try {
    const { phone } = req.body;

    if (sncService.normalizePhone(phone).length !== 11) {
      return res.status(400).json({ error: 'Укажите телефон' });
    }

    const result = await sncService.requestSmsPassword(phone);

    return sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}
async function registerCard(req, res, next) {
  try {
    const { phone } = req.body;

    if (sncService.normalizePhone(phone).length !== 11) {
      return res.status(400).json({ error: 'Укажите телефон' });
    }

    const result = await sncService.registerCard(phone);

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

async function confirmRegisterCard(req, res, next) {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Укажите телефон и код из SMS' });
    }

    const result = await sncService.confirmRegisterCard(phone, code);

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

async function completeRegistration(req, res, next) {
  try {
    const { credentials, requisites, profile } = req.body;

    if (!credentials?.username || !requisites) {
      return res.status(400).json({ error: 'Укажите данные регистрации' });
    }

    const result = await sncService.completeRegistration({
      credentials,
      requisites,
      profile
    });

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Укажите username и password' });
    }

    const result = await sncService.login(username, password);

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

async function refreshTokens(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Нет refreshToken' });
    }

    const result = await sncService.refreshTokens(refreshToken);

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({ error: 'Нет accessToken' });
    }

    const result = await sncService.logout(accessToken);

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

function getAccessToken(req) {
  const header = req.headers.authorization || '';

  return header.replace(/^Bearer\s+/i, '').trim();
}

async function getUser(req, res, next) {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({ error: 'Нет accessToken' });
    }

    const result = await sncService.getUser(accessToken);

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

async function updateProfileName(req, res, next) {
  try {
    const accessToken = getAccessToken(req);
    const { familyPerson, namePerson, patronymicPerson = '' } = req.body;

    if (!accessToken) {
      return res.status(401).json({ error: 'Нет accessToken' });
    }

    if (!familyPerson || !namePerson) {
      return res.status(400).json({ error: 'Укажите фамилию и имя' });
    }

    if ([familyPerson, namePerson, patronymicPerson].some((value) => String(value).trim().length > 100)) {
      return res.status(400).json({ error: 'ФИО содержит слишком длинное значение' });
    }

    const result = await sncService.updateProfileName(accessToken, {
      familyPerson,
      namePerson,
      patronymicPerson
    });

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

async function getOwner(req, res, next) {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({ error: 'Нет accessToken' });
    }

    const result = await sncService.getOwner(accessToken);

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

async function getTransactions(req, res, next) {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({ error: 'Нет accessToken' });
    }

    const result = await sncService.getTransactions(accessToken);

    sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

async function getQrCode(req, res, next) {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({ error: 'Нет accessToken' });
    }

    const result = await sncService.getQrCode(accessToken);

    if (result.status === 412) {
      return res.status(200).json(result);
    }

    return sendSncResult(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ping,
  requestSms,
  registerCard,
  confirmRegisterCard,
  completeRegistration,
  login,
  refreshTokens,
  logout,
  getUser,
  updateProfileName,
  getOwner,
  getTransactions,
  getQrCode
};
