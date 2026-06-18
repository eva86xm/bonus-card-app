const adminBindCardForm = document.querySelector('#adminBindCardForm');
const adminPagePhoneInput = document.querySelector('#adminPagePhoneInput');
const adminPageCardInput = document.querySelector('#adminPageCardInput');
const adminPageMessage = document.querySelector('#adminPageMessage');
const adminClientsList = document.querySelector('#adminClientsList');
const adminSearchInput = document.querySelector('#adminSearchInput');
const adminSearchButton = document.querySelector('#adminSearchButton');
const adminResetSearchButton = document.querySelector('#adminResetSearchButton');
const adminSearchMessage = document.querySelector('#adminSearchMessage');

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

adminPagePhoneInput.addEventListener('input', function () {
  adminPagePhoneInput.value = formatPhone(adminPagePhoneInput.value);
  adminPageMessage.textContent = '';
});

adminSearchInput.addEventListener('input', function () {
  adminSearchInput.value = formatPhone(adminSearchInput.value);
  adminSearchMessage.textContent = '';
});

adminSearchButton.addEventListener('click', function () {
  const client = sncApi.findClientByPhone(adminSearchInput.value);

  if (!client) {
    adminSearchMessage.textContent = 'Клиент с таким телефоном не найден';
    renderAdminClients();
    return;
  }

  adminSearchMessage.textContent = '';
  renderAdminClients([client]);
});

adminResetSearchButton.addEventListener('click', function () {
  adminSearchInput.value = '';
  adminSearchMessage.textContent = '';
  renderAdminClients();
});

function renderAdminClients(clients = sncApi.clients) {
  adminClientsList.innerHTML = '';

  clients.forEach(function (client) {
    const item = document.createElement('article');
    item.className = 'admin-client';

    item.innerHTML = `
      <div>
        <strong>${client.name}</strong>
        <p>${client.phone}</p>
      </div>
      <div>
        <strong>${client.cardNumber}</strong>
        <p>${client.status}</p>
      </div>
    `;

    adminClientsList.appendChild(item);
  });
}

adminBindCardForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const result = sncApi.bindCardToPhone(
    adminPagePhoneInput.value,
    adminPageCardInput.value
  );

  adminPageMessage.textContent = result.message;

  if (result.ok) {
    renderAdminClients();
    adminPageCardInput.value = '';
  }
});

renderAdminClients();