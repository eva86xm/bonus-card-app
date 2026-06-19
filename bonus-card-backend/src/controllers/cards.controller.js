const sncService = require('../services/snc.service');

function getMyCard(req, res, next) {
  try {
    const client = sncService.findClientByPhone(req.user.phone);

    if (!client) {
      return res.status(404).json({ error: 'Карта клиента не найдена' });
    }

    res.json(sncService.toCardResponse(client));
  } catch (error) {
    next(error);
  }
}

function getMyTransactions(req, res, next) {
  try {
    const client = sncService.findClientByPhone(req.user.phone);

    if (!client) {
      return res.status(404).json({ error: 'Карта клиента не найдена' });
    }

    res.json({ transactions: client.transactions });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyCard,
  getMyTransactions
};
