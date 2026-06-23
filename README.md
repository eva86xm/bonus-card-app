# Bonus Card App

Прототип приложения для бонусных карт.

Проект состоит из двух частей:

- клиентская часть: простой личный кабинет бонусной карты
- backend: сервер-прослойка для интеграции с API СНК

## Что уже есть

### Клиентская часть

- вход по номеру телефона
- отображение бонусной карты
- QR-код карты
- баланс бонусов
- доступно к списанию
- история операций
- отдельная админ-страница
- привязка карты к телефону
- поддержка телефонов через `7` и `8`

### Backend

Backend нужен, чтобы безопасно работать с API СНК.

Через backend уже подключены маршруты:

```text
POST /api/snc/request-sms
POST /api/snc/login
POST /api/snc/refresh
POST /api/snc/logout

GET  /api/snc/user
GET  /api/snc/owner
GET  /api/snc/transactions
GET  /api/snc/qr-code
```

## Структура проекта

```text
bonus-card-app/
  index.html
  styles.css
  app.js
  api.js
  admin.html
  admin.js
  logo.png
  qrcode.min.js
  README.md

  bonus-card-backend/
    .env
    .gitignore
    package.json
    src/
      server.js
      app.js
      routes/
      controllers/
      services/
      middleware/
      storage/
```

## Запуск клиентской части

Клиентская часть пока простая, без сборки.

Можно открыть файл:

```text
index.html
```

в браузере.

Для тестового входа в прототип используется номер:

```text
+7 900 111-22-33
```

## Запуск backend

Перейти в папку backend:

```powershell
cd C:\Users\Eva\Desktop\bonus-card-app\bonus-card-backend
```

Запустить сервер:

```powershell
npm.cmd run dev
```

Если все хорошо, появится:

```text
Bonus card backend is running on http://localhost:3000
```

Этот терминал нужно оставить открытым.

## Настройки backend

В папке:

```text
bonus-card-backend
```

должен быть файл `.env`.

Пример:

```env
PORT=3000
SNC_API_URL=https://patest.sncard.ru
SNC_API_KEY=your_api_key_here
```

Файл `.env` нельзя выкладывать в GitHub, потому что там хранится ключ API.

## Проверка backend

Проверка, что сервер работает:

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/health" `
  -Method GET `
  -UseBasicParsing
```

Ожидаемый ответ:

```json
{"ok":true}
```

## Проверка связи с СНК

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/snc/ping" `
  -Method GET `
  -UseBasicParsing
```

Если приходит ответ от СНК, значит backend видит сервер СНК.

## Запрос SMS-кода

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/snc/request-sms" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"phone":"+7 999 888-77-66"}' `
  -UseBasicParsing
```

Если номер не зарегистрирован в СНК, может прийти ответ:

```text
Карта, активированная на указанный номер, отсутствует
```

Это нормальный ответ от СНК для несуществующего тестового номера.

## Логин в СНК

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/snc/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"79998887766","password":"123456"}' `
  -UseBasicParsing
```

Если логин или код неверные, СНК вернет ошибку:

```text
Неверный логин или пароль
```

Для полноценной проверки нужен реальный тестовый номер и SMS-код от СНК.

## Защищенные маршруты

Эти маршруты работают только после входа, когда есть `accessToken`.

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/snc/user" `
  -Method GET `
  -UseBasicParsing
```

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/snc/owner" `
  -Method GET `
  -UseBasicParsing
```

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/snc/transactions" `
  -Method GET `
  -UseBasicParsing
```

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/snc/qr-code" `
  -Method GET `
  -UseBasicParsing
```

Без входа ожидаемый ответ:

```json
{"error":"Нет accessToken"}
```

Это нормальное поведение.

## Обновление токенов

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/snc/refresh" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{}' `
  -UseBasicParsing
```

Без `refreshToken` ожидаемый ответ:

```json
{"error":"Нет refreshToken"}
```

## Выход

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/snc/logout" `
  -Method POST `
  -UseBasicParsing
```

Без `accessToken` ожидаемый ответ:

```json
{"error":"Нет accessToken"}
```

## Как работает авторизация СНК

Общий сценарий такой:

```text
1. Клиент вводит телефон
2. Backend отправляет запрос SMS в СНК
3. СНК отправляет клиенту SMS-код
4. Клиент вводит код
5. Backend отправляет login в СНК
6. СНК возвращает accessToken и refreshToken
7. Backend использует accessToken для запросов данных карты
8. Когда accessToken истекает, backend обновляет его через refreshToken
```

## Что нужно получить от СНК

Для полноценной интеграции нужны:

- рабочий `API Key`
- тестовый сервер
- тестовый номер телефона
- тестовая карта
- правила генерации QR-кода
- описание, какие поля использовать для баланса и истории операций
- подтверждение, какие сценарии нужны: только QR или еще регистрация, перевод бонусов, купоны, акции

## Важно

Сейчас проект находится на этапе MVP.

Клиентская часть уже показывает прототип бонусной карты.

Backend уже умеет обращаться к API СНК, но полноценная проверка возможна только после получения тестовых данных от СНК.