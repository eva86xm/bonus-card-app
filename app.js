const loginForm = document.querySelector('#loginForm');
const phoneInput = document.querySelector('#phoneInput');
const loginMessage = document.querySelector('#loginMessage');
const loginScreen = document.querySelector('#loginScreen');
const dashboard = document.querySelector('#dashboard');
const logoutButton = document.querySelector('#logoutButton');

const clientName = document.querySelector('#clientName');
const cardNumber = document.querySelector('#cardNumber');
const cardStatus = document.querySelector('#cardStatus');
const loyaltyProgram = document.querySelector('#loyaltyProgram');
const cardOwner = document.querySelector('#cardOwner');
const lastOperation = document.querySelector('#lastOperation');
const bonusBalance = document.querySelector('#bonusBalance');
const availableBonus = document.querySelector('#availableBonus');
const qrBox = document.querySelector('#qrBox');
const transactionsList = document.querySelector('#transactionsList');

const bindCardForm = document.querySelector('#bindCardForm');
const adminPhoneInput = document.querySelector('#adminPhoneInput');
const adminCardInput = document.querySelector('#adminCardInput');
const adminMessage = document.querySelector('#adminMessage');

let currentClient = null;

function showDashboard(client) {
  currentClient = client;

  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');

  clientName.textContent = client.name;
  cardNumber.textContent = client.cardNumber;
  cardStatus.textContent = client.status;
  dashboard.classList.toggle('blocked-card', client.status === 'Заблокирована');

  loyaltyProgram.textContent = client.loyaltyProgram;
  cardOwner.textContent = client.name;
  lastOperation.textContent = client.transactions[0].date;

  bonusBalance.textContent = client.balance;
  availableBonus.textContent = client.available;

  renderQrCode(client.cardNumber.replace(/\s/g, ''));
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

function showLogin() {
  currentClient = null;

  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');

  phoneInput.value = '';
  loginMessage.textContent = '';
  adminMessage.textContent = '';
}

function renderTransactions(transactions) {
  transactionsList.innerHTML = '';

  transactions.forEach(function (transaction) {
    const item = document.createElement('article');
    item.className = 'transaction';

    item.innerHTML = `
      <div>
        <p class="transaction-title">${transaction.title}</p>
        <p class="transaction-meta">${transaction.date} · ${transaction.place}</p>
      </div>
      <p class="transaction-points ${transaction.type}">
        ${transaction.amount}
      </p>
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

  if (!normalizedDigits.startsWith('7')) {
    normalizedDigits = '7' + normalizedDigits;
  }

  const part1 = normalizedDigits.slice(1, 4);
  const part2 = normalizedDigits.slice(4, 7);
  const part3 = normalizedDigits.slice(7, 9);
  const part4 = normalizedDigits.slice(9, 11);

  let result = '+7';

  if (part1) {
    result += ' ' + part1;
  }

  if (part2) {
    result += ' ' + part2;
  }

  if (part3) {
    result += '-' + part3;
  }

  if (part4) {
    result += '-' + part4;
  }

  return result;
}

phoneInput.addEventListener('input', function () {
  phoneInput.value = formatPhone(phoneInput.value);
  loginMessage.textContent = '';
});

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();

  loginMessage.textContent = '';

  const client = sncApi.findClientByPhone(phoneInput.value);

  if (!client) {
    loginMessage.textContent = 'Клиент не найден. Проверьте номер телефона.';
    return;
  }

  showDashboard(client);
});

logoutButton.addEventListener('click', function () {
  showLogin();
});

bindCardForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const result = sncApi.bindCardToPhone(
    adminPhoneInput.value,
    adminCardInput.value
  );

  adminMessage.textContent = result.message;

  if (result.ok && currentClient) {
    showDashboard(currentClient);
  }
});