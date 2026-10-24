# GREEN-API Chat

Веб-чат на React и TypeScript для отправки и получения текстовых сообщений WhatsApp через GREEN-API.

## Запуск

Требуются Node.js 22.12+ и npm.

```bash
npm install
npm run dev
```

Откройте адрес Vite, обычно `http://localhost:5173`.

Для входа нужны `apiUrl`, `idInstance` и `apiTokenInstance` из [консоли GREEN-API](https://console.green-api.com). Инстанс должен быть подключён к WhatsApp.

Чтобы получать ответы в чате, в настройках инстанса включите «Получать уведомления о входящих сообщениях и файлах». Для получения через HTTP API поле `webhookUrl` должно быть пустым.

Сборка проекта: `npm run build`.
