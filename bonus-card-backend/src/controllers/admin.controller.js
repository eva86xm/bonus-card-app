const sncService = require('../services/snc.service');

function listClients(req, res, next) {
  try {
    res.json({ clients: sncService.listClients().map(sncService.toClientSummary) });
  } catch (error) {
    next(error);
  }
}

function searchClient(req, res, next) {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Укажите телефон' });
    }

    const client = sncService.findClientByPhone(phone);

    if (!client) {
      return res.status(404).json({ error: 'Клиент с таким телефоном не найден' });
    }

    res.json({ client: sncService.toClientSummary(client) });
  } catch (error) {
    next(error);
  }
}

function bindCard(req, res, next) {
  try {
    const { phone, cardNumber } = req.body;

    if (!phone || !cardNumber) {
      return res.status(400).json({ error: 'Укажите телефон и номер карты' });
    }

    const result = sncService.bindCardToPhone(phone, cardNumber);

    if (!result.ok) {
      return res.status(result.status || 400).json({ error: result.message });
    }

    res.json({
      ok: true,
      message: 'Карта привязана к клиенту',
      client: sncService.toClientSummary(result.client)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listClients,
  searchClient,
  bindCard
};
