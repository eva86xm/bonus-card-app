const loginForm = document.querySelector('#loginForm');
const phoneInput = document.querySelector('#phoneInput');
const requestSmsButton = document.querySelector('#requestSmsButton');
const azsMapFrame = document.querySelector('#azsMapFrame');
const mapLoader = document.querySelector('#mapLoader');
const smsCodeInput = document.querySelector('#smsCodeInput');
const loginButton = document.querySelector('#loginButton');
const phoneStep = document.querySelector('#phoneStep');
const smsStep = document.querySelector('#smsStep');
const transactionDateFilter = document.querySelector('#transactionDateFilter');
const dateFilterText = document.querySelector('#dateFilterText');
const transactionTypeButtons = document.querySelectorAll('#transactionTypeFilter button');
const openHistoryButton = document.querySelector('#openHistoryButton');
const historyBackButton = document.querySelector('#historyBackButton');

const registerStep = document.querySelector('#registerStep');
const registerPhoneStep = document.querySelector('#registerPhoneStep');
const registerCodeStep = document.querySelector('#registerCodeStep');
const registerPhoneInput = document.querySelector('#registerPhoneInput');
const registerSmsButton = document.querySelector('#registerSmsButton');
const registerCodeInput = document.querySelector('#registerCodeInput');
const confirmRegisterButton = document.querySelector('#confirmRegisterButton');
const registerDetailsStep = document.querySelector('#registerDetailsStep');
const registerFamilyInput = document.querySelector('#registerFamilyInput');
const registerNameInput = document.querySelector('#registerNameInput');
const registerPatronymicInput = document.querySelector('#registerPatronymicInput');
const completeRegisterButton = document.querySelector('#completeRegisterButton');
const showRegisterButton = document.querySelector('#showRegisterButton');
const backToLoginButton = document.querySelector('#backToLoginButton');

const loginMessage = document.querySelector('#loginMessage');
const loginScreen = document.querySelector('#loginScreen');
const startupLoader = document.querySelector('#startupLoader');
const dashboard = document.querySelector('#dashboard');
const tabbarItems = document.querySelectorAll('.ios-tabbar-item');

const clientName = document.querySelector('#clientName');
const cardNumber = document.querySelector('#cardNumber');
const cardStatus = document.querySelector('#cardStatus');
const loyaltyProgram = document.querySelector('#loyaltyProgram');
const cardOwner = document.querySelector('#cardOwner');
const lastOperation = document.querySelector('#lastOperation');
const bonusBalance = document.querySelector('#bonusBalance');
const profileName = document.querySelector('#profileName');
const profileInitial = document.querySelector('#profileInitial');
const profileEditOwnerButton = document.querySelector('#profileEditOwnerButton');
const profileEditPanel = document.querySelector('#profileEditPanel');
const profileEditBackButton = document.querySelector('#profileEditBackButton');
const profileNameForm = document.querySelector('#profileNameForm');
const profileFamilyInput = document.querySelector('#profileFamilyInput');
const profileNameInput = document.querySelector('#profileNameInput');
const profilePatronymicInput = document.querySelector('#profilePatronymicInput');
const profileNameSaveButton = document.querySelector('#profileNameSaveButton');
const profileNameMessage = document.querySelector('#profileNameMessage');
const profileLogoutButton = document.querySelector('#profileLogoutButton');
const profileQrButton = document.querySelector('#profileQrButton');
const profileSessionToggle = document.querySelector('#profileSessionToggle');
const profileNotificationsToggle = document.querySelector('#profileNotificationsToggle');

const qrBox = document.querySelector('#qrBox');
const qrModal = document.querySelector('#qrModal');
const qrModalBox = document.querySelector('#qrModalBox');
const qrModalClose = document.querySelector('#qrModalClose');

const transactionsList = document.querySelector('#transactionsList');
const allTransactionsList = document.querySelector('#allTransactionsList');

let currentClient = null;
let currentTransactions = [];
let currentQrValue = '';
let currentTransactionType = 'all';
let pendingRegistration = null;

function getApiErrorMessage(result, fallbackMessage) {
  if (result && result.status === 423) {
    return 'Профиль найден. Заполните данные владельца, чтобы завершить регистрацию.';
  }

  const data = result && result.data;

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data?.data === 'string') {
    return data.data;
  }

  if (typeof data?.error === 'string') {
    return data.error;
  }

  if (typeof data?.message === 'string') {
    return data.message;
  }

  return fallbackMessage;
}

function unwrapApiData(result) {
  return result?.data?.data ?? result?.data ?? null;
}

function saveSessionTokens(tokens) {
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    return false;
  }

  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  return true;
}

function parseRegistrationRequisites(result) {
  const data = unwrapApiData(result);
  const rawRequisites = data?.requisites?.requisiteValue || data?.requisites;

  if (!rawRequisites) {
    return null;
  }

  if (typeof rawRequisites === 'object') {
    return rawRequisites;
  }

  try {
    return JSON.parse(rawRequisites);
  } catch {
    return null;
  }
}

function showRegistrationDetails(result, credentials, phone, graphicalNumber = '') {
  const requisites = parseRegistrationRequisites(result);

  if (!requisites) {
    showLoginMessage('СНК просит заполнить данные, но не вернула список реквизитов. Нужно уточнить настройки регистрации у СНК.');
    return false;
  }

  pendingRegistration = {
    credentials,
    requisites,
    profile: {
      phone,
      graphicalNumber
    }
  };

  phoneStep.classList.add('hidden');
  smsStep.classList.add('hidden');
  registerStep.classList.remove('hidden');
  registerPhoneStep.classList.add('hidden');
  registerCodeStep.classList.add('hidden');
  registerDetailsStep.classList.remove('hidden');

  showLoginMessage('Заполните данные владельца карты.');
  return true;
}

function normalizeCodeInput(input) {
  input.value = input.value.replace(/\D/g, '').slice(0, 6);
}

function showDashboard(client) {
  hideStartupLoader();

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
  profileName.textContent = client.name;
  profileInitial.textContent = getInitial(client.name);
  fillProfileNameForm(client.name);

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
    width: 300,
    height: 300,
    colorDark: '#0a332e',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

function openQrModal() {
  if (!currentQrValue) return;

  renderLargeQrCode(currentQrValue);
  qrModal.classList.remove('hidden');
  document.body.classList.add('qr-modal-open');
}

function closeQrModal() {
  qrModal.classList.add('hidden');
  qrModalBox.innerHTML = '';
  document.body.classList.remove('qr-modal-open');
}

function showLogin() {
  hideStartupLoader();

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
  renderTransactionsPreview();
  renderFilteredTransactions();
}

function getInitial(name) {
  return String(name || 'И').trim().charAt(0).toUpperCase() || 'И';
}

function fillProfileNameForm(fullName) {
  if (!profileFamilyInput || !profileNameInput || !profilePatronymicInput) {
    return;
  }

  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);

  profileFamilyInput.value = parts[0] || '';
  profileNameInput.value = parts[1] || parts[0] || '';
  profilePatronymicInput.value = parts.slice(2).join(' ');
}

function showProfileMessage(message, isError = false) {
  if (!profileNameMessage) {
    return;
  }

  profileNameMessage.textContent = message;
  profileNameMessage.classList.toggle('hidden', !message);
  profileNameMessage.classList.toggle('error', isError);
}

function showProfileEditPanel() {
  if (!profileEditPanel) {
    return;
  }

  fillProfileNameForm(currentClient?.name || profileName.textContent);
  showProfileMessage('');
  profileEditPanel.classList.remove('hidden');
  dashboard.classList.add('show-profile-edit');
  window.scrollTo(0, 0);
}

function hideProfileEditPanel() {
  if (!profileEditPanel) {
    return;
  }

  profileEditPanel.classList.add('hidden');
  dashboard.classList.remove('show-profile-edit');
  showProfileMessage('');
}

function renderFilteredTransactions() {
  let transactions = currentTransactions;

  if (transactionDateFilter && transactionDateFilter.value) {
    transactions = transactions.filter(function (transaction) {
      return transaction.rawDate === transactionDateFilter.value;
    });
  }

  if (currentTransactionType !== 'all') {
    transactions = transactions.filter(function (transaction) {
      return transaction.type === currentTransactionType;
    });
  }

  renderTransactionItems(allTransactionsList, transactions);
}

function renderTransactionItems(container, transactions) {
  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (!transactions.length) {
    const emptyState = document.createElement('div');
    const emptyTitle = document.createElement('strong');
    const emptyText = document.createElement('p');

    emptyState.className = 'empty-state';
    emptyTitle.textContent = 'Пока нет операций';
    emptyText.textContent = 'После первой покупки здесь появится история.';
    emptyState.append(emptyTitle, emptyText);
    container.appendChild(emptyState);
    return;
  }

  transactions.forEach(function (transaction) {
    const item = document.createElement('div');
    const main = document.createElement('div');
    const title = document.createElement('strong');
    const date = document.createElement('small');
    const amount = document.createElement('span');

    item.className = 'transaction-item';
    main.className = 'transaction-main';
    title.textContent = transaction.title;
    date.textContent = transaction.displayDate || transaction.date;
    amount.className = transaction.type === 'minus' ? 'minus' : 'plus';
    amount.textContent = transaction.amount;

    main.append(title, date);
    item.append(main, amount);

    container.appendChild(item);
  });
}

function renderTransactionsPreview() {
  renderTransactionItems(transactionsList, currentTransactions.slice(0, 3));
}

function showHistoryDetails() {
  dashboard.classList.add('show-history-details');
  renderFilteredTransactions();
  window.scrollTo(0, 0);
}

function hideHistoryDetails() {
  dashboard.classList.remove('show-history-details');
  window.scrollTo(0, 0);
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
  loginMessage.classList.toggle('hidden', !message);
}

function showStartupLoader() {
  if (!startupLoader) return;

  startupLoader.classList.remove('hidden');
  loginForm.classList.add('hidden');

  const authSwitch = showRegisterButton.closest('.auth-switch');

  if (authSwitch) {
    authSwitch.classList.add('hidden');
  }

  showLoginMessage('');
}

function hideStartupLoader() {
  if (!startupLoader) return;

  startupLoader.classList.add('hidden');
  loginForm.classList.remove('hidden');

  const authSwitch = showRegisterButton.closest('.auth-switch');

  if (authSwitch) {
    authSwitch.classList.remove('hidden');
  }
}

function showPhoneStep() {
  phoneStep.classList.remove('hidden');
  smsStep.classList.add('hidden');
  registerStep.classList.add('hidden');
  registerDetailsStep.classList.add('hidden');
  smsCodeInput.value = '';
}

function showSmsStep() {
  phoneStep.classList.add('hidden');
  smsStep.classList.remove('hidden');
  registerStep.classList.add('hidden');
  registerDetailsStep.classList.add('hidden');
  showLoginMessage('Введите код из SMS');
}

function showRegisterStep() {
  phoneStep.classList.add('hidden');
  smsStep.classList.add('hidden');
  registerStep.classList.remove('hidden');

  registerPhoneStep.classList.remove('hidden');
  registerCodeStep.classList.add('hidden');
  registerDetailsStep.classList.add('hidden');

  registerPhoneInput.value = '';
  registerCodeInput.value = '';
  registerFamilyInput.value = '';
  registerNameInput.value = '';
  registerPatronymicInput.value = '';
  pendingRegistration = null;

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
  registerDetailsStep.classList.add('hidden');

  registerPhoneInput.value = '';
  registerCodeInput.value = '';
  registerFamilyInput.value = '';
  registerNameInput.value = '';
  registerPatronymicInput.value = '';
  pendingRegistration = null;

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
      qrValue,
      transactions: sortedTransactions.map(mapSncTransaction)
    };

    showDashboard(client);
  } catch (error) {
    backendApi.clearSession();
    showLogin();
    showLoginMessage('Нет связи с сервером. Проверьте интернет и войдите еще раз.');
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
  const bonusChange = bonusOut > 0 ? -Math.abs(bonusOut) : bonusIn;
  const amount = bonusChange > 0
    ? `+${formatNumber(bonusChange)}`
    : (bonusChange < 0 ? `-${formatNumber(Math.abs(bonusChange))}` : '0');

  return {
    rawDate: getDateInputValue(transaction.date),
    date: formatDate(transaction.date),
    displayDate: formatFriendlyDate(transaction.date),
    place: formatStationName(transaction.nameAzs || transaction.division || 'АЗС'),
    title: transaction.resourceName || 'Операция по карте',
    amount,
    type: bonusChange < 0 ? 'minus' : 'plus'
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

function formatFriendlyDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatStationName(value) {
  const text = String(value || '').trim();
  const match = text.match(/АЗС\s*(\d+)/i);

  if (match) {
    return `АЗС №${match[1]}`;
  }

  return text || 'АЗС';
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

smsCodeInput.addEventListener('input', function () {
  normalizeCodeInput(smsCodeInput);
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

    const message = getApiErrorMessage(result, 'Не удалось отправить SMS');
    showLoginMessage(message);
  } catch {
    showLoginMessage('Нет связи с сервером. Проверьте интернет.');
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
  loginButton.disabled = true;
  loginButton.textContent = 'Входим...';

  try {
    const result = await backendApi.login(sncApi.normalizePhone(phone), code);

    if (!result.ok) {
      if (result.status === 423) {
        showRegistrationDetails(
          result,
          {
            username: sncApi.normalizePhone(phone),
            password: code
          },
          phone
        );
        return;
      }

      const message = getApiErrorMessage(result, 'Не удалось войти');
      showLoginMessage(message);
      return;
    }

    if (!saveSessionTokens(result.data)) {
      showLoginMessage('Сервер не вернул данные сессии. Попробуйте войти еще раз.');
      return;
    }

    await loadSncDashboard();
  } catch {
    showLoginMessage('Нет связи с сервером. Проверьте интернет.');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Войти';
  }
});

profileLogoutButton.addEventListener('click', async function () {
  const accessToken = localStorage.getItem('accessToken');

  profileLogoutButton.disabled = true;

  try {
    if (accessToken) {
      await backendApi.logout(accessToken);
    }
  } finally {
    profileLogoutButton.disabled = false;
    showLogin();
  }
});

if (profileEditOwnerButton) {
  profileEditOwnerButton.addEventListener('click', showProfileEditPanel);
}

if (profileEditBackButton) {
  profileEditBackButton.addEventListener('click', hideProfileEditPanel);
}

profileQrButton.addEventListener('click', openQrModal);

if (profileNameForm) {
  profileNameForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const familyPerson = profileFamilyInput.value.trim();
    const namePerson = profileNameInput.value.trim();
    const patronymicPerson = profilePatronymicInput.value.trim();

    if (!familyPerson || !namePerson) {
      showProfileMessage('Введите фамилию и имя.', true);
      return;
    }

    profileNameSaveButton.disabled = true;
    profileNameSaveButton.textContent = 'Сохраняем...';
    showProfileMessage('Сохраняем данные...');

    try {
      const result = await backendApi.updateProfileName({
        familyPerson,
        namePerson,
        patronymicPerson
      });

      if (!result.ok) {
        showProfileMessage(getApiErrorMessage(result, 'Не удалось сохранить ФИО'), true);
        return;
      }

      const nextName = [familyPerson, namePerson, patronymicPerson]
        .filter(Boolean)
        .join(' ');

      currentClient.name = nextName;
      clientName.textContent = nextName;
      cardOwner.textContent = nextName;
      profileName.textContent = nextName;
      profileInitial.textContent = getInitial(nextName);
      showProfileMessage('ФИО сохранено.');
      setTimeout(hideProfileEditPanel, 700);
    } catch {
      showProfileMessage('Нет связи с сервером. Попробуйте позже.', true);
    } finally {
      profileNameSaveButton.disabled = false;
      profileNameSaveButton.textContent = 'Сохранить ФИО';
    }
  });
}

qrBox.addEventListener('click', openQrModal);

qrBox.addEventListener('keydown', function (event) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  event.preventDefault();
  openQrModal();
});

qrModalClose.addEventListener('click', closeQrModal);

qrModal.addEventListener('click', function (event) {
  if (event.target === qrModal) {
    closeQrModal();
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !qrModal.classList.contains('hidden')) {
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

registerCodeInput.addEventListener('input', function () {
  normalizeCodeInput(registerCodeInput);
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
      showLoginMessage('SMS-код отправлен. Введите код из сообщения.');
      return;
    }

    const message = getApiErrorMessage(result, 'Не удалось отправить SMS');
    showLoginMessage(message);
  } catch {
    showLoginMessage('Нет связи с сервером. Проверьте интернет.');
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
      const message = getApiErrorMessage(result, 'Не удалось зарегистрировать карту');
      showLoginMessage(message);
      return;
    }

    const confirmData = unwrapApiData(result);
    const cardNumber =
      (typeof confirmData === 'string' && confirmData) ||
      confirmData?.cardNumber ||
      'номер карты получен';

    showLoginMessage(`Карта зарегистрирована: ${cardNumber}. Теперь можно войти.`);

    registerCodeInput.value = '';
  } catch {
    showLoginMessage('Нет связи с сервером. Проверьте интернет.');
  } finally {
    confirmRegisterButton.disabled = false;
    confirmRegisterButton.textContent = 'Зарегистрировать карту';
  }
});

completeRegisterButton.addEventListener('click', async function () {
  if (!pendingRegistration) {
    showLoginMessage('Сначала запросите SMS и попробуйте войти.');
    return;
  }

  const familyPerson = registerFamilyInput.value.trim();
  const namePerson = registerNameInput.value.trim();
  const patronymicPerson = registerPatronymicInput.value.trim();

  if (!familyPerson || !namePerson) {
    showLoginMessage('Введите фамилию и имя владельца карты.');
    return;
  }

  completeRegisterButton.disabled = true;
  completeRegisterButton.textContent = 'Сохраняем...';
  showLoginMessage('Передаем данные владельца в СНК...');

  try {
    const completeResult = await backendApi.completeRegistration({
      credentials: pendingRegistration.credentials,
      requisites: pendingRegistration.requisites,
      profile: {
        ...pendingRegistration.profile,
        familyPerson,
        namePerson,
        patronymicPerson
      }
    });

    if (!completeResult.ok) {
      const message = getApiErrorMessage(completeResult, 'Не удалось завершить регистрацию');
      showLoginMessage(message);
      return;
    }

    showLoginMessage('Регистрация завершена. Входим в кабинет...');

    const loginResult = await backendApi.login(
      pendingRegistration.credentials.username,
      pendingRegistration.credentials.password
    );

    if (!loginResult.ok) {
      const message = getApiErrorMessage(loginResult, 'Регистрация завершена. Запросите SMS и войдите еще раз.');
      showLoginMessage(message);
      return;
    }

    if (!saveSessionTokens(loginResult.data)) {
      showLoginMessage('Регистрация завершена, но сервер не вернул данные сессии. Войдите еще раз.');
      return;
    }

    pendingRegistration = null;

    await loadSncDashboard();
  } catch {
    showLoginMessage('Нет связи с сервером. Проверьте интернет.');
  } finally {
    completeRegisterButton.disabled = false;
    completeRegisterButton.textContent = 'Завершить регистрацию';
  }
});

function showDashboardTab(target, shouldScroll = true) {
  const isContacts = target === 'contactsSection';
  const isProfile = target === 'profileSection';
  const previousTab = localStorage.getItem('activeDashboardTab') || 'mainView';
  const tabOrder = ['mainView', 'contactsSection', 'profileSection'];

  if (target === previousTab && shouldScroll) {
    return;
  }

  const previousIndex = tabOrder.indexOf(previousTab);
  const targetIndex = tabOrder.indexOf(target);
  const direction = shouldScroll && previousIndex !== targetIndex
    ? (targetIndex > previousIndex ? 'slide-left' : 'slide-right')
    : '';

  dashboard.classList.remove('slide-left', 'slide-right');

  if (direction) {
    void dashboard.offsetWidth;
    dashboard.classList.add(direction);
  }
  dashboard.classList.remove('show-history-details', 'show-profile-edit');

  if (profileEditPanel) {
    profileEditPanel.classList.add('hidden');
  }

  dashboard.classList.toggle('show-contacts', isContacts);
  dashboard.classList.toggle('show-profile', isProfile);

  tabbarItems.forEach(function (tab) {
    tab.classList.toggle('active', tab.dataset.target === target);
  });

  localStorage.setItem('activeDashboardTab', target);

  if (isContacts && azsMapFrame && !azsMapFrame.src) {
    azsMapFrame.src = azsMapFrame.dataset.src;
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
    if (item.classList.contains('active')) {
      return;
    }

    showDashboardTab(item.dataset.target);
  });
});

if (openHistoryButton) {
  openHistoryButton.addEventListener('click', showHistoryDetails);
}

if (historyBackButton) {
  historyBackButton.addEventListener('click', hideHistoryDetails);
}

if (transactionDateFilter) {
  const filter = transactionDateFilter.closest('.history-filter');

  transactionDateFilter.addEventListener('change', function () {
    if (dateFilterText) {
      dateFilterText.textContent = transactionDateFilter.value
        ? formatDate(transactionDateFilter.value)
        : 'Выбрать период';
    }

    renderFilteredTransactions();
  });

  if (filter) {
    filter.addEventListener('click', function () {
      transactionDateFilter.focus();

      if (typeof transactionDateFilter.showPicker === 'function') {
        transactionDateFilter.showPicker();
        return;
      }

      transactionDateFilter.click();
    });
  }
}

transactionTypeButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    currentTransactionType = button.dataset.type || 'all';

    transactionTypeButtons.forEach(function (item) {
      item.classList.toggle('active', item === button);
    });

    renderFilteredTransactions();
  });
});

function initProfileSettings() {
  const staySignedIn = localStorage.getItem('profileStaySignedIn') !== 'false';
  const notificationsEnabled = localStorage.getItem('profileNotificationsEnabled') === 'true';

  if (profileSessionToggle) {
    profileSessionToggle.checked = staySignedIn;

    profileSessionToggle.addEventListener('change', function () {
      localStorage.setItem('profileStaySignedIn', profileSessionToggle.checked ? 'true' : 'false');
    });
  }

  if (profileNotificationsToggle) {
    profileNotificationsToggle.checked = notificationsEnabled;

    profileNotificationsToggle.addEventListener('change', function () {
      localStorage.setItem('profileNotificationsEnabled', profileNotificationsToggle.checked ? 'true' : 'false');
    });
  }
}

async function restoreSession() {
  if (localStorage.getItem('profileStaySignedIn') === 'false') {
    backendApi.clearSession();
    hideStartupLoader();
    return;
  }

  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    hideStartupLoader();
    return;
  }

  showStartupLoader();

  try {
    const refreshed = await backendApi.refreshSession();

    if (!refreshed) {
      backendApi.clearSession();
      hideStartupLoader();
      showPhoneStep();
      return;
    }

    await loadSncDashboard();
  } catch {
    backendApi.clearSession();
    hideStartupLoader();
    showPhoneStep();
  }
}

initProfileSettings();
restoreSession();
