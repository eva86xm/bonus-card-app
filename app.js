const loginForm = document.querySelector('#loginForm');
const phoneInput = document.querySelector('#phoneInput');
const requestSmsButton = document.querySelector('#requestSmsButton');
const azsMapFrame = document.querySelector('#azsMapFrame');
const mapLoader = document.querySelector('#mapLoader');
const smsCodeInput = document.querySelector('#smsCodeInput');
const phoneStep = document.querySelector('#phoneStep');
const smsStep = document.querySelector('#smsStep');
const transactionDateFilter = document.querySelector('#transactionDateFilter');
const clearDateFilterButton = document.querySelector('#clearDateFilterButton');

const registerStep = document.querySelector('#registerStep');
const registerPhoneStep = document.querySelector('#registerPhoneStep');
const registerCodeStep = document.querySelector('#registerCodeStep');
const registerPhoneInput = document.querySelector('#registerPhoneInput');
const registerSmsButton = document.querySelector('#registerSmsButton');
const registerCodeInput = document.querySelector('#registerCodeInput');
const confirmRegisterButton = document.querySelector('#confirmRegisterButton');
const showRegisterButton = document.querySelector('#showRegisterButton');
const backToLoginButton = document.querySelector('#backToLoginButton');

const loginMessage = document.querySelector('#loginMessage');
const loginScreen = document.querySelector('#loginScreen');
const dashboard = document.querySelector('#dashboard');
const logoutButton = document.querySelector('#logoutButton');

const tabbarItems = document.querySelectorAll('.ios-tabbar-item');

const clientName = document.querySelector('#clientName');
const cardNumber = document.querySelector('#cardNumber');
const cardStatus = document.querySelector('#cardStatus');
const loyaltyProgram = document.querySelector('#loyaltyProgram');
const cardOwner = document.querySelector('#cardOwner');
const lastOperation = document.querySelector('#lastOperation');
const bonusBalance = document.querySelector('#bonusBalance');
const availableBonus = document.querySelector('#availableBonus');

const qrBox = document.querySelector('#qrBox');
const qrModal = document.querySelector('#qrModal');
const qrModalBox = document.querySelector('#qrModalBox');
const qrModalClose = document.querySelector('#qrModalClose');

const transactionsList = document.querySelector('#transactionsList');

let currentClient = null;
let currentTransactions = [];
let currentQrValue = '';

function showDashboard(client) {
  currentClient = client;

  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  const activeDashboardTab = localStorage.getItem('activeDashboardTab') || 'mainView';
  showDashboardTab(activeDashboardTab, false);

  clientName.textContent = client.name;
  cardNumber.textContent = client.cardNumber;
  cardStatus.textContent = client.status;

  dashboard.classList.toggle('blocked-card', client.status === 'Заблокирована');

  loyaltyProgram.textContent = client.loyaltyProgram;
  cardOwner.textContent = client.name;
  lastOperation.textContent = client.transactions[0]?.date || '—';

  bonusBalance.textContent = client.balance;
  availableBonus.textContent = client.available;

  currentQrValue = client.qrValue || client.cardNumber.replace(/\s/g, '');

  renderQrCode(currentQrValue);
  renderTransactions(client.transactions);
}

function renderQrCode(value) {
  qrBox.innerHTML = '';

  new QRCode(qrBox, {
    text: value,
    width: 116,
    height: 116,
    colorDark: '#0a332e',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

function renderLargeQrCode(value) {
  qrModalBox.innerHTML = '';

  new QRCode(qrModalBox, {
    text: value,
    width: 240,
    height: 240,
    colorDark: '#0a332e',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

function openQrModal() {
  if (!currentQrValue) return;

  renderLargeQrCode(currentQrValue);
  qrModal.classList.remove('hidden');
}

function closeQrModal() {
  qrModal.classList.add('hidden');
  qrModalBox.innerHTML = '';
}

function showLogin() {
  currentClient = null;
  currentQrValue = '';

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  dashboard.classList.add('hidden');
  dashboard.classList.remove('show-contacts');
  loginScreen.classList.remove('hidden');

  phoneInput.value = '';
  smsCodeInput.value = '';
  loginMessage.textContent = '';

  hideRegisterStep();
  showPhoneStep();
}

function renderTransactions(transactions) {
  currentTransactions = transactions;
  renderFilteredTransactions();
}

function renderFilteredTransactions() {
  transactionsList.innerHTML = '';

  let transactions = currentTransactions;

  if (transactionDateFilter && transactionDateFilter.value) {
    transactions = transactions.filter(function (transaction) {
      return transaction.rawDate === transactionDateFilter.value;
    });
  }

  if (!transactions.length) {
    transactionsList.innerHTML = '<p class="empty-text">Операций за эту дату нет</p>';
    return;
  }

  transactions.forEach(function (transaction) {
    const item = document.createElement('div');
    item.className = 'transaction-item';

    item.innerHTML = `
      <div>
        <strong>${transaction.title}</strong>
        <p>${transaction.date} · ${transaction.place}</p>
      </div>
      <span class="${transaction.type}">${transaction.amount}</span>
    `;

    transactionsList.appendChild(item);
  });
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  let normalizedDigits = digits;

  if (normalizedDigits.startsWith('8')) {
    normalizedDigits = '7' + normalizedDigits.slice(1);
  }

  if (normalizedDigits && !normalizedDigits.startsWith('7')) {
    normalizedDigits = '7' + normalizedDigits;
  }

  const part1 = normalizedDigits.slice(1, 4);
  const part2 = normalizedDigits.slice(4, 7);
  const part3 = normalizedDigits.slice(7, 9);
  const part4 = normalizedDigits.slice(9, 11);

  let result = '+7';

  if (part1) result += ' ' + part1;
  if (part2) result += ' ' + part2;
  if (part3) result += '-' + part3;
  if (part4) result += '-' + part4;

  return result;
}

function showLoginMessage(message) {
  loginMessage.textContent = message;
}

function showPhoneStep() {
  phoneStep.classList.remove('hidden');
  smsStep.classList.add('hidden');
  registerStep.classList.add('hidden');
  smsCodeInput.value = '';
}

function showSmsStep() {
  phoneStep.classList.add('hidden');
  smsStep.classList.remove('hidden');
  registerStep.classList.add('hidden');
  showLoginMessage('Введите код из SMS');
}

function showRegisterStep() {
  phoneStep.classList.add('hidden');
  smsStep.classList.add('hidden');
  registerStep.classList.remove('hidden');

  registerPhoneStep.classList.remove('hidden');
  registerCodeStep.classList.add('hidden');

  registerPhoneInput.value = '';
  registerCodeInput.value = '';

  const authSwitch = showRegisterButton.closest('.auth-switch');

  if (authSwitch) {
    authSwitch.classList.add('hidden');
  }

  showLoginMessage('');
}

function hideRegisterStep() {
  registerStep.classList.add('hidden');
  registerPhoneStep.classList.remove('hidden');
  registerCodeStep.classList.add('hidden');

  registerPhoneInput.value = '';
  registerCodeInput.value = '';

  const authSwitch = showRegisterButton.closest('.auth-switch');

  if (authSwitch) {
    authSwitch.classList.remove('hidden');
  }

  showLoginMessage('');
}

async function loadSncDashboard() {
  showLoginMessage('Загружаем данные карты...');

  try {
    const [userResult, ownerResult, transactionsResult, qrResult] = await Promise.all([
      backendApi.getUser(),
      backendApi.getOwner(),
      backendApi.getTransactions(),
      backendApi.getQrCode()
    ]);

    if (!userResult.ok) {
      throw new Error('Не удалось получить пользователя');
    }

    const userData = userResult.data || {};
    const ownerData = ownerResult.ok ? ownerResult.data : {};
    const transactionsData = transactionsResult.ok && Array.isArray(transactionsResult.data)
      ? transactionsResult.data
      : [];

    const cards = Array.isArray(userData.cards) ? userData.cards : [];
    const selectedCard = cards.find(function (card) {
      return card.isSelected;
    }) || cards[0] || {};

    const sortedTransactions = transactionsData.slice().sort(function (a, b) {
      return getTransactionTime(b) - getTransactionTime(a);
    });

    const qrValue = getQrValue(qrResult, selectedCard.graphicalNumber);

    const client = {
      phone: phoneInput.value,
      name: userData.name || ownerData.name || 'Клиент',
      cardNumber: formatCardNumber(selectedCard.graphicalNumber || ownerData.cardInfo?.graphicalNumber || '0000000000000000'),
      status: ownerData.cardInfo?.cardStatus?.currentStatusName || getCardStateName(selectedCard.state),
      loyaltyProgram: 'ИНП',
      balance: formatNumber(selectedCard.balance || 0),
      available: formatNumber(selectedCard.balance || 0),
      qrValue,
      transactions: sortedTransactions.map(mapSncTransaction)
    };

    showDashboard(client);
  } catch (error) {
    backendApi.clearSession();
    showLogin();
    showLoginMessage('Сессия устарела. Войдите еще раз.');
  }
}

function getQrValue(qrResult, fallbackCardNumber) {
  if (qrResult && qrResult.ok && typeof qrResult.data === 'string') {
    return qrResult.data;
  }

  if (qrResult && qrResult.ok && qrResult.data && typeof qrResult.data.value === 'string') {
    return qrResult.data.value;
  }

  return String(fallbackCardNumber || '').replace(/\s/g, '');
}

function mapSncTransaction(transaction) {
  const bonusIn = Number(transaction.bonusIn || 0);
  const bonusOut = Number(transaction.bonusOut || 0);

  return {
    rawDate: getDateInputValue(transaction.date),
    date: formatDate(transaction.date),
    place: transaction.nameAzs || transaction.division || 'АЗС',
    title: transaction.resourceName || 'Операция по карте',
    amount: bonusOut > 0 ? `-${formatNumber(bonusOut)}` : `+${formatNumber(bonusIn)}`,
    type: bonusOut > 0 ? 'minus' : 'plus'
  };
}

function getTransactionTime(transaction) {
  if (transaction.datetime) {
    return Number(transaction.datetime);
  }

  if (transaction.date) {
    return new Date(transaction.date).getTime() / 1000;
  }

  return 0;
}

function formatDate(value) {
  if (!value) {
    return '?';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('ru-RU');
}

function getDateInputValue(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function formatNumber(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2
  }).format(number);
}

function formatCardNumber(value) {
  return String(value || '')
    .replace(/\D/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function getCardStateName(state) {
  if ([3, 4, 5, 6, 11, 14, 15].includes(Number(state))) {
    return 'Активна';
  }

  if ([10, 16].includes(Number(state))) {
    return 'Заблокирована';
  }

  return 'Активна';
}

phoneInput.addEventListener('input', function () {
  phoneInput.value = formatPhone(phoneInput.value);
  showLoginMessage('');
});

phoneInput.addEventListener('keydown', function (event) {
  if (event.key !== 'Enter') {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  requestSmsButton.click();
});

requestSmsButton.addEventListener('click', async function () {
  const phone = phoneInput.value.trim();

  if (!phone) {
    showLoginMessage('Введите номер телефона');
    return;
  }

  const normalizedPhone = sncApi.normalizePhone(phone);

  if (normalizedPhone.length !== 11) {
    showLoginMessage('Введите полный номер телефона');
    return;
  }

  requestSmsButton.disabled = true;
  requestSmsButton.textContent = 'Отправляем...';
  showLoginMessage('Отправляем SMS-код...');

  try {
    const result = await backendApi.requestSms(phone);

    if (result.ok) {
      showSmsStep();
      return;
    }

    const message = result.data?.data || result.data?.error || 'Не удалось отправить SMS';
    showLoginMessage(message);
  } catch {
    showLoginMessage('Backend не отвечает. Проверьте, запущен ли сервер.');
  } finally {
    requestSmsButton.disabled = false;
    requestSmsButton.textContent = 'Получить SMS';
  }
});

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  if (!phoneStep.classList.contains('hidden')) {
    requestSmsButton.click();
    return;
  }

  const phone = phoneInput.value.trim();
  const code = smsCodeInput.value.trim();

  if (!/^\d{6}$/.test(code)) {
    showLoginMessage('Введите 6 цифр из SMS');
    return;
  }

  showLoginMessage('Проверяем код...');

  try {
    const result = await backendApi.login(sncApi.normalizePhone(phone), code);

    if (!result.ok) {
      const message = result.data?.data || result.data?.error || 'Не удалось войти';
      showLoginMessage(message);
      return;
    }

    const accessToken = result.data.accessToken;
    const refreshToken = result.data.refreshToken;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    await loadSncDashboard();
  } catch {
    showLoginMessage('Backend не отвечает. Проверьте, запущен ли сервер.');
  }
});

logoutButton.addEventListener('click', function () {
  showLogin();
});

qrBox.addEventListener('click', openQrModal);
qrModalClose.addEventListener('click', closeQrModal);

qrModal.addEventListener('click', function (event) {
  if (event.target === qrModal) {
    closeQrModal();
  }
});

showRegisterButton.addEventListener('click', function () {
  showRegisterStep();
});

backToLoginButton.addEventListener('click', function () {
  hideRegisterStep();
  showPhoneStep();
});

registerPhoneInput.addEventListener('input', function () {
  registerPhoneInput.value = formatPhone(registerPhoneInput.value);
  showLoginMessage('');
});

registerSmsButton.addEventListener('click', async function () {
  const phone = registerPhoneInput.value.trim();

  if (!phone) {
    showLoginMessage('Введите номер телефона');
    return;
  }

  const normalizedPhone = sncApi.normalizePhone(phone);

  if (normalizedPhone.length !== 11) {
    showLoginMessage('Введите полный номер телефона');
    return;
  }

  registerSmsButton.disabled = true;
  registerSmsButton.textContent = 'Отправляем...';
  showLoginMessage('Отправляем SMS-код для регистрации...');

  try {
    const result = await backendApi.registerCard(phone);

    if (result.ok) {
      registerPhoneStep.classList.add('hidden');
      registerCodeStep.classList.remove('hidden');
      showLoginMessage('SMS отправлено. Для теста используйте код 123456.');
      return;
    }

    const message = result.data?.data || result.data?.error || 'Не удалось отправить SMS';
    showLoginMessage(message);
  } catch {
    showLoginMessage('Backend не отвечает. Проверьте, запущен ли сервер.');
  } finally {
    registerSmsButton.disabled = false;
    registerSmsButton.textContent = 'Получить SMS для регистрации';
  }
});

confirmRegisterButton.addEventListener('click', async function () {
  const phone = registerPhoneInput.value.trim();
  const code = registerCodeInput.value.trim();

  if (!/^\d{6}$/.test(code)) {
    showLoginMessage('Введите 6 цифр из SMS');
    return;
  }

  confirmRegisterButton.disabled = true;
  confirmRegisterButton.textContent = 'Регистрируем...';
  showLoginMessage('Проверяем код и регистрируем карту...');

  try {
    const result = await backendApi.confirmRegisterCard(phone, code);

    if (!result.ok) {
      const message = result.data?.data || result.data?.error || 'Не удалось зарегистрировать карту';
      showLoginMessage(message);
      return;
    }

    const cardNumber =
      result.data?.data?.cardNumber ||
      result.data?.cardNumber ||
      'номер карты получен';

    showLoginMessage(`Карта зарегистрирована: ${cardNumber}. Теперь можно войти.`);

    registerCodeInput.value = '';
  } catch {
    showLoginMessage('Backend не отвечает. Проверьте, запущен ли сервер.');
  } finally {
    confirmRegisterButton.disabled = false;
    confirmRegisterButton.textContent = 'Зарегистрировать карту';
  }
});

function showDashboardTab(target, shouldScroll = true) {
  const isContacts = target === 'contactsSection';

  dashboard.classList.toggle('show-contacts', isContacts);

  tabbarItems.forEach(function (tab) {
    tab.classList.toggle('active', tab.dataset.target === target);
  });

  localStorage.setItem('activeDashboardTab', target);

  if (isContacts && azsMapFrame && !azsMapFrame.src) {
    setTimeout(function () {
      azsMapFrame.src = azsMapFrame.dataset.src;
    }, 100);
  }

  if (shouldScroll) {
    window.scrollTo(0, 0);
  }
}

if (azsMapFrame && mapLoader) {
  azsMapFrame.addEventListener('load', function () {
    mapLoader.classList.add('hidden');
  });
}

tabbarItems.forEach(function (item) {
  item.addEventListener('click', function () {
    showDashboardTab(item.dataset.target);
  });
});

if (transactionDateFilter) {
  transactionDateFilter.addEventListener('change', renderFilteredTransactions);
}

if (clearDateFilterButton) {
  clearDateFilterButton.addEventListener('click', function () {
    transactionDateFilter.value = '';
    renderFilteredTransactions();
  });
}

async function restoreSession() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return;
  }

  try {
    const refreshed = await backendApi.refreshSession();

    if (!refreshed) {
      backendApi.clearSession();
      showPhoneStep();
      return;
    }

    await loadSncDashboard();
  } catch {
    backendApi.clearSession();
    showPhoneStep();
  }
}

restoreSession();
