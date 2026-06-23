const sncService = require('../services/snc.service');

async function ping(req, res, next) {
  try {
    const result = await sncService.ping();

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function requestSms(req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Укажите телефон' });
    }

    const result = await sncService.requestSmsPassword(phone);

    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
}

async function registerCard(req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Укажите телефон' });
    }

    const result = await sncService.registerCard(phone);

    res.status(result.status).json(result);
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

    res.status(result.status).json(result);
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

    res.status(result.status).json(result);
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

    res.status(result.status).json(result);
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

    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
}

function getAccessToken(req) {
  const header = req.headers.authorization || '';

  return header.replace('Bearer ', '').trim();
}

async function getUser(req, res, next) {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({ error: 'Нет accessToken' });
    }

    const result = await sncService.getUser(accessToken);

    res.status(result.status).json(result);
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

    res.status(result.status).json(result);
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

    res.status(result.status).json(result);
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

    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ping,
  requestSms,
  registerCard,
  confirmRegisterCard,
  login,
  refreshTokens,
  logout,
  getUser,
  getOwner,
  getTransactions,
  getQrCode
};

