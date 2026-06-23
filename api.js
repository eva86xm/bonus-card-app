const sncApi = {
  clients: [
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
  ],

  normalizePhone(phone) {
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }

  if (digits.length === 10) {
    digits = '7' + digits;
  }

  return digits;
},

  findClientByPhone(phone) {
    const normalizedPhone = this.normalizePhone(phone);

    return this.clients.find((client) => {
      return this.normalizePhone(client.phone) === normalizedPhone;
    }) || null;
  },

  bindCardToPhone(phone, cardNumber) {
    const client = this.findClientByPhone(phone);

    if (!client) {
      return {
        ok: false,
        message: 'Клиент с таким телефоном не найден'
      };
    }

    if (!cardNumber.trim()) {
      return {
        ok: false,
        message: 'Введите номер карты'
      };
    }

    client.cardNumber = cardNumber.trim();
      this.saveClients();


    return {
      ok: true,
      message: 'Карта привязана к клиенту'
    };
  }
};

const savedClients = localStorage.getItem('sncClients');

if (savedClients) {
  sncApi.clients = JSON.parse(savedClients);
}

sncApi.saveClients = function () {
  localStorage.setItem('sncClients', JSON.stringify(this.clients));
};

const backendApi = {
  baseUrl: 'http://localhost:3000',

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data
      };
    }

    return data;
  },

  requestSms(phone) {
    return this.request('/api/snc/request-sms', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  login(username, password) {
    return this.request('/api/snc/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  getUser(accessToken) {
    return this.request('/api/snc/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },

  getOwner(accessToken) {
    return this.request('/api/snc/owner', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },

  getTransactions(accessToken) {
    return this.request('/api/snc/transactions', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },

  getQrCode(accessToken) {
    return this.request('/api/snc/qr-code', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },

  refresh(refreshToken) {
    return this.request('/api/snc/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  },

  logout(accessToken) {
    return this.request('/api/snc/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
};