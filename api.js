const sncApi = {
  clients: [
    {
      phone: '+7 900 111-22-33',
      name: 'Анна Иванова',
      cardNumber: '9000 1200 3456',
      status: 'Активна',
      loyaltyProgram: 'Бонусная программа АЗС',
      balance: 1280,
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
    let digits = String(phone || '').replace(/\D/g, '');

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

const API_REQUEST_TIMEOUT = 15000;
const API_REFRESH_TIMEOUT = 25000;

function parseResponseText(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      data: text,
      error: text
    };
  }
}

function createRequestError(error) {
  const isTimeout = error && error.name === 'AbortError';

  return {
    ok: false,
    status: 0,
    data: {
      error: isTimeout
        ? 'Сервер долго не отвечает. Попробуйте еще раз.'
        : 'Нет связи с сервером. Проверьте интернет.'
    }
  };
}

const backendApi = {
  baseUrl: ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:3000'
    : '',

  refreshPromise: null,

  async request(path, options = {}, shouldRetry = true) {
    const {
      timeout = API_REQUEST_TIMEOUT,
      headers = {},
      ...fetchOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(function () {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });

      const responseText = await response.text();
      const parsedData = parseResponseText(responseText);

      const result = response.ok
        ? (parsedData || { ok: true, status: response.status, data: null })
        : {
            ok: false,
            status: response.status,
            data: parsedData
          };

      const status = result.status || response.status;

      if (shouldRetry && status === 401) {
        const refreshed = await this.refreshSessionOnce();

        if (refreshed) {
          const retryOptions = {
            ...options,
            headers: {
              ...headers
            }
          };

          if (retryOptions.headers.Authorization) {
            retryOptions.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
          }

          return this.request(path, retryOptions, false);
        }

        this.clearSession();

        return {
          ok: false,
          status: 401,
          data: {
            error: 'Сессия устарела. Войдите заново.'
          }
        };
      }

      return result;
    } catch (error) {
      return createRequestError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async refreshSession() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return false;
    }

    try {
      const result = await this.request('/api/snc/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        timeout: API_REFRESH_TIMEOUT
      }, false);

      if (!result.ok) {
        return false;
      }

      const tokens = result.data;

      if (!tokens.accessToken || !tokens.refreshToken) {
        return false;
      }

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      return true;
    } catch {
      return false;
    }
  },

  async refreshSessionOnce() {
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshSession().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  },

  clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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

  getUser() {
    return this.request('/api/snc/user', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
  },

  getOwner() {
    return this.request('/api/snc/owner', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
  },

  getTransactions() {
    return this.request('/api/snc/transactions', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
  },

  getQrCode() {
    return this.request('/api/snc/qr-code', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
  },

  registerCard(phone) {
    return this.request('/api/snc/register-card', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  confirmRegisterCard(phone, code) {
    return this.request('/api/snc/register-card/confirm', {
      method: 'POST',
      body: JSON.stringify({ phone, code })
    });
  },

  completeRegistration(payload) {
    return this.request('/api/snc/register-complete', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateProfileName(fullname) {
    return this.request('/api/snc/profile/name', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(fullname)
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
