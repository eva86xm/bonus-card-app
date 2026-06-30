# ИНП Card

Веб-приложение личного кабинета бонусной и топливной карты ИНП. Проект состоит из статического frontend и Node.js/Express backend, который безопасно проксирует запросы к API СНК.

## Возможности

- вход по номеру телефона и SMS-коду;
- регистрация и заполнение данных владельца;
- автоматическое обновление access-токена;
- отображение карты, баланса и QR-кода;
- история операций с фильтрами;
- изменение ФИО владельца;
- контакты и карта АЗС;
- адаптивный интерфейс для iOS, Android и desktop.

## Структура

```text
bonus-card-app/
  index.html              клиентское приложение
  styles.css              стили и адаптивность
  app.js                  интерфейс и сценарии
  api.js                  клиент backend API
  admin.html / admin.js   локальная mock-админка
  logo.png
  qrcode.min.js
  package.json            общие команды проверки

  bonus-card-backend/
    .env.example
    package.json
    src/
      server.js
      app.js
      routes/
      controllers/
      services/
      middleware/
      storage/
    test/
```

## Локальный запуск

1. Создать `bonus-card-backend/.env` на основе `.env.example`.
2. Установить зависимости backend:

```powershell
npm.cmd --prefix bonus-card-backend ci
```

3. Запустить backend из корня проекта:

```powershell
npm.cmd run dev:backend
```

4. Во втором терминале запустить frontend:

```powershell
python -m http.server 8080
```

5. Открыть [http://127.0.0.1:8080](http://127.0.0.1:8080).

## Проверки

```powershell
npm.cmd run check
npm.cmd test
```

`check` проверяет синтаксис frontend и backend. `test` поднимает backend на случайном локальном порту и проверяет health, CORS, защитные заголовки, валидацию телефона и mock-поток SNC.

Проверка уязвимостей зависимостей:

```powershell
npm.cmd --prefix bonus-card-backend audit --omit=dev
```

## Переменные окружения

Для production необходимы как минимум:

```env
PORT=3000
HOST=127.0.0.1
NODE_ENV=production
CLIENT_ORIGIN=https://inpcard.ru
SNC_API_URL=https://patest.sncard.ru
SNC_API_KEY=replace-with-production-key
SNC_API_TIMEOUT_MS=15000
TRUST_PROXY=1
MOCK_MODE=false
```

- `HOST=127.0.0.1` оставляет Node доступным только через Nginx.
- `CLIENT_ORIGIN` может содержать несколько адресов через запятую.
- `MOCK_MODE` в production принудительно отключён кодом.
- `.env` и `node_modules` не должны попадать в Git.

## Основные маршруты

```text
GET  /health

POST /api/snc/request-sms
POST /api/snc/login
POST /api/snc/refresh
POST /api/snc/logout

POST /api/snc/register-card
POST /api/snc/register-card/confirm
POST /api/snc/register-complete

GET  /api/snc/user
GET  /api/snc/owner
GET  /api/snc/transactions
GET  /api/snc/qr-code
PUT  /api/snc/profile/name
```

## Обновление сервера

```bash
cd /var/www/bonus-card-app
git pull --ff-only
npm --prefix bonus-card-backend ci --omit=dev
pm2 restart bonus-card-backend --update-env
pm2 save
curl http://127.0.0.1:3000/health
```

## Безопасность

- API-ключ СНК хранится только на backend.
- API-ответы не кэшируются.
- чувствительные маршруты ограничены по частоте запросов.
- backend ограничивает размер JSON и время ожидания SNC.
- пользовательские данные выводятся через `textContent`, без исполнения HTML.

Перед production-релизом необходимо заменить API-ключ, если он когда-либо попадал в историю Git. В следующей архитектурной версии рекомендуется перенести refresh-токен из `localStorage` в защищённую `HttpOnly Secure SameSite` cookie и использовать постоянное хранилище сессий.
