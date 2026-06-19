const clients = [
  {
    phone: '+7 900 111-22-33',
    name: 'Анна Иванова',
    cardNumber: '9000 1200 3456',
    status: 'Активна',
    loyaltyProgram: 'Бонусная программа АЗС',
    balance: 1280,
    available: 640,
    transactions: [
      {
        date: '18.06.2026',
        place: 'АЗС 12',
        title: 'Покупка топлива',
        amount: '+96',
        type: 'plus'
      },
      {
        date: '15.06.2026',
        place: 'АЗС 04',
        title: 'Списание бонусов',
        amount: '-250',
        type: 'minus'
      },
      {
        date: '11.06.2026',
        place: 'АЗС 08',
        title: 'Покупка товаров',
        amount: '+42',
        type: 'plus'
      }
    ]
  },
  {
    phone: '+7 900 222-33-44',
    name: 'Игорь Смирнов',
    cardNumber: '9000 2200 7788',
    status: 'Активна',
    loyaltyProgram: 'Премиальная программа',
    balance: 3420,
    available: 1200,
    transactions: [
      {
        date: '17.06.2026',
        place: 'АЗС 02',
        title: 'Покупка дизельного топлива',
        amount: '+180',
        type: 'plus'
      },
      {
        date: '10.06.2026',
        place: 'АЗС 09',
        title: 'Покупка топлива',
        amount: '+140',
        type: 'plus'
      }
    ]
  },
  {
    phone: '+7 900 333-44-55',
    name: 'Мария Петрова',
    cardNumber: '9000 3300 1122',
    status: 'Заблокирована',
    loyaltyProgram: 'Бонусная программа АЗС',
    balance: 215,
    available: 0,
    transactions: [
      {
        date: '08.06.2026',
        place: 'АЗС 01',
        title: 'Карта заблокирована',
        amount: '0',
        type: 'minus'
      }
    ]
  }
];

function normalizePhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');

  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    digits = `7${digits}`;
  }

  return digits;
}

function listClients() {
  return clients;
}

function findClientByPhone(phone) {
  const normalizedPhone = normalizePhone(phone);

  return clients.find((client) => normalizePhone(client.phone) === normalizedPhone) || null;
}

function bindCardToPhone(phone, cardNumber) {
  const client = findClientByPhone(phone);
  const normalizedCardNumber = String(cardNumber || '').trim();

  if (!client) {
    return {
      ok: false,
      status: 404,
      message: 'Клиент с таким телефоном не найден'
    };
  }

  if (!normalizedCardNumber) {
    return {
      ok: false,
      status: 400,
      message: 'Введите номер карты'
    };
  }

  client.cardNumber = normalizedCardNumber;

  return {
    ok: true,
    client
  };
}

function toClientSummary(client) {
  return {
    phone: client.phone,
    name: client.name,
    cardNumber: client.cardNumber,
    status: client.status,
    loyaltyProgram: client.loyaltyProgram,
    balance: client.balance,
    available: client.available
  };
}

function toCardResponse(client) {
  return {
    ...toClientSummary(client),
    transactions: client.transactions
  };
}

module.exports = {
  normalizePhone,
  listClients,
  findClientByPhone,
  bindCardToPhone,
  toClientSummary,
  toCardResponse
};
