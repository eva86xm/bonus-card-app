const axios = require('axios');
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

async function sncRequest(path, options = {}) {
  const baseUrl = process.env.SNC_API_URL;
  const apiKey = process.env.SNC_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('SNC_API_URL или SNC_API_KEY не настроены');
  }

  try {
    const response = await axios({
      url: `${baseUrl}${path}`,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      validateStatus: () => true
    });

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: error.message
    };
  }
}

async function ping() {
  return sncRequest('/api/auth/user');
}

function toSncPhone(phone) {
  const normalizedPhone = normalizePhone(phone);

  return normalizedPhone;
}

function isMockMode() {
  return process.env.MOCK_MODE === 'true';
}

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token'
};

const mockUser = {
  role: 'client',
  name: 'Анна Иванова',
  cards: [
    {
      cardKey: 'mock-card-key',
      graphicalNumber: '9000 1200 3456',
      state: 3,
      balance: 1280,
      isSelected: true
    }
  ]
};

const mockOwner = {
  name: 'Анна Иванова',
  organizationName: 'ИНП',
  cardInfo: {
    cardKey: 'mock-card-key',
    graphicalNumber: '9000 1200 3456',
    cardStateKey: 3,
    discountApps: [
      {
        bonusSum: 1280,
        bonusCurrent: 640,
        bonusDiscount: 0
      }
    ],
    cardStatus: {
      currentStatusName: 'Активна'
    }
  }
};

const mockTransactions = [
  {
    transactionKey: '1',
    date: '23.06.2026',
    nameAzs: 'АЗС 12',
    resourceName: 'Покупка топлива',
    bonusIn: 96,
    bonusOut: 0,
    bonusBalance: 1280
  },
  {
    transactionKey: '2',
    date: '20.06.2026',
    nameAzs: 'АЗС 04',
    resourceName: 'Списание бонусов',
    bonusIn: 0,
    bonusOut: 250,
    bonusBalance: 1184
  }
];

const mockQrCode = {
  value: '900012003456'
};

async function requestSmsPassword(phone) {
  if (isMockMode()) {
    return {
      ok: true,
      status: 200,
      data: {
        message: 'SMS-код отправлен. Для теста используйте код 123456.'
      }
    };
  }

  return sncRequest('/api/auth/sms-password', {
    method: 'POST',
    body: JSON.stringify({
      phoneNumber: toSncPhone(phone),
      flags: 2
    })
  });
}

async function registerCard(phone) {
  if (isMockMode()) {
    return {
      ok: true,
      status: 200,
      data: {
        message: 'SMS-код отправлен. Для теста используйте код 123456.'
      }
    };
  }

  return sncRequest('/api/auth/register/card', {
    method: 'POST',
    body: JSON.stringify({
      phone: toSncPhone(phone),
      bonus: 1,
      password: ''
    })
  });
}

async function confirmRegisterCard(phone, code) {
  if (isMockMode()) {
    if (String(code).trim() !== '123456') {
      return {
        ok: false,
        status: 403,
        data: 'Неверный код из SMS'
      };
    }

    return {
      ok: true,
      status: 200,
      data: {
        cardNumber: '9000 1200 3456',
        message: 'Карта зарегистрирована'
      }
    };
  }

  return sncRequest('/api/auth/register/card/confirm', {
    method: 'POST',
    body: JSON.stringify({
      phone: toSncPhone(phone),
      bonus: 1,
      password: '',
      code: String(code).trim()
    })
  });
}

function cloneRequisite(requisite, value) {
  if (!requisite || typeof requisite !== 'object') {
    return requisite;
  }

  return {
    ...requisite,
    requisiteValue: value
  };
}

function prepareRegistrationRequisites(requisites, profile = {}) {
  const prepared = {
    ...requisites
  };

  if (prepared.cellularTelephone && profile.phone) {
    prepared.cellularTelephone = cloneRequisite(prepared.cellularTelephone, toSncPhone(profile.phone));
  }

  if (prepared.familyPerson && profile.familyPerson) {
    prepared.familyPerson = cloneRequisite(prepared.familyPerson, profile.familyPerson.trim());
  }

  if (prepared.namePerson && profile.namePerson) {
    prepared.namePerson = cloneRequisite(prepared.namePerson, profile.namePerson.trim());
  }

  if (prepared.patronymicPerson && profile.patronymicPerson) {
    prepared.patronymicPerson = cloneRequisite(prepared.patronymicPerson, profile.patronymicPerson.trim());
  }

  if (prepared.graphicalNumber && profile.graphicalNumber) {
    prepared.graphicalNumber = cloneRequisite(prepared.graphicalNumber, String(profile.graphicalNumber).trim());
  }

  return prepared;
}

async function completeRegistration({ credentials, requisites, profile }) {
  if (isMockMode()) {
    return {
      ok: true,
      status: 200,
      data: {
        message: 'Регистрация завершена'
      }
    };
  }

  return sncRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      credentials: {
        username: String(credentials.username || '').trim(),
        password: credentials.password || ''
      },
      requisites: prepareRegistrationRequisites(requisites, profile)
    })
  });
}

async function login(username, password) {
  if (isMockMode()) {
    if (password !== '123456') {
      return {
        ok: false,
        status: 403,
        data: 'Неверный код'
      };
    }

    return {
      ok: true,
      status: 200,
      data: mockTokens
    };
  }

  return sncRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password
    })
  });
}

async function refreshTokens(refreshToken) {
  return sncRequest('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({
      refreshToken
    })
  });
}

async function logout(accessToken) {
  return sncRequest('/api/auth/logout', {
    method: 'POST',
    headers: withAccessToken(accessToken)
  });
}

function withAccessToken(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`
  };
}

async function getUser(accessToken) {
  if (isMockMode()) {
    return {
      ok: true,
      status: 200,
      data: mockUser
    };
  }

  return sncRequest('/api/auth/user', {
    headers: withAccessToken(accessToken)
  });
}

async function getOwner(accessToken) {
  if (isMockMode()) {
    return {
      ok: true,
      status: 200,
      data: mockOwner
    };
  }

  return sncRequest('/api/information/owner', {
    headers: withAccessToken(accessToken)
  });
}

async function getTransactions(accessToken) {
  if (isMockMode()) {
    return {
      ok: true,
      status: 200,
      data: mockTransactions
    };
  }

  return sncRequest('/api/reports/transactions', {
    headers: withAccessToken(accessToken)
  });
}

async function getQrCode(accessToken) {
  if (isMockMode()) {
    return {
      ok: true,
      status: 200,
      data: mockQrCode
    };
  }

  return sncRequest('/api/qr-code/generate', {
    headers: withAccessToken(accessToken)
  });
}

module.exports = {
  normalizePhone,
  listClients,
  findClientByPhone,
  bindCardToPhone,
  toClientSummary,
  toCardResponse,
  ping,
  requestSmsPassword,
  registerCard,
  confirmRegisterCard,
  completeRegistration,
  login,
  refreshTokens,
  logout,
  getUser,
  getOwner,
  getTransactions,
  getQrCode
};
