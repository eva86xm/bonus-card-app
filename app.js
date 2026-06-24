const loginForm = document.querySelector('#loginForm');
const phoneInput = document.querySelector('#phoneInput');
const requestSmsButton = document.querySelector('#requestSmsButton');
const smsCodeInput = document.querySelector('#smsCodeInput');
const phoneStep = document.querySelector('#phoneStep');
const smsStep = document.querySelector('#smsStep');

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
  transactionsList.innerHTML = '';

  transactions.forEach(function (transaction) {
    const item = document.createElement('article');
    const textBlock = document.createElement('div');
    const title = document.createElement('p');
    const meta = document.createElement('p');
    const points = document.createElement('p');

    item.className = 'transaction';
    title.className = 'transaction-title';
    meta.className = 'transaction-meta';
    points.className = `transaction-points ${transaction.type}`;

    title.textContent = transaction.title;
    meta.textContent = `${transaction.date} · ${transaction.place}`;
    points.textContent = transaction.amount;

    textBlock.appendChild(title);
    textBlock.appendChild(meta);

    item.appendChild(textBlock);
    item.appendChild(points);

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

async function loadSncDashboard(accessToken) {
  showLoginMessage('Загружаем данные карты...');

  const userResult = await backendApi.getUser(accessToken);
  const ownerResult = await backendApi.getOwner(accessToken);
  const transactionsResult = await backendApi.getTransactions(accessToken);
  const qrResult = await backendApi.getQrCode(accessToken);

  if (!userResult.ok || !ownerResult.ok || !transactionsResult.ok || !qrResult.ok) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');

    showPhoneStep();
    showLoginMessage('Сессия устарела. Войдите еще раз.');
    return;
  }

  const user = userResult.data;
  const owner = ownerResult.data;
  const card = owner.cardInfo;
  const discount = card.discountApps?.[0] || {};
  const transactions = transactionsResult.data || [];
  const qrValue = qrResult.data?.value || card.graphicalNumber;

  const client = {
    name: owner.name || user.name || 'Клиент',
    cardNumber: card.graphicalNumber || '0000 0000 0000',
    status: card.cardStatus?.currentStatusName || 'Активна',
    loyaltyProgram: owner.organizationName || 'Бонусная программа',
    balance: discount.bonusSum || 0,
    available: discount.bonusCurrent || 0,
    qrValue,
    transactions: transactions.map(function (transaction) {
      const bonusIn = Number(transaction.bonusIn || 0);
      const bonusOut = Number(transaction.bonusOut || 0);

      return {
        date: transaction.date || '—',
        place: transaction.nameAzs || 'АЗС',
        title: transaction.resourceName || 'Операция',
        amount: bonusOut > 0 ? `-${bonusOut}` : `+${bonusIn}`,
        type: bonusOut > 0 ? 'minus' : 'plus'
      };
    })
  };

  showDashboard(client);
}

phoneInput.addEventListener('input', function () {
  phoneInput.value = formatPhone(phoneInput.value);
  showLoginMessage('');
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

  const phone = phoneInput.value.trim();
  const code = smsCodeInput.value.trim();

  if (!code) {
    showLoginMessage('Введите код из SMS');
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

    await loadSncDashboard(accessToken);
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

  if (!code) {
    showLoginMessage('Введите код из SMS');
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

 if (shouldScroll) {
  window.scrollTo(0, 0);
  }
}

tabbarItems.forEach(function (item) {
  item.addEventListener('click', function () {
    showDashboardTab(item.dataset.target);
  });
});

async function restoreSession() {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return;
  }

  try {
    await loadSncDashboard(accessToken);
  } catch {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    showPhoneStep();
  }
}

restoreSession();