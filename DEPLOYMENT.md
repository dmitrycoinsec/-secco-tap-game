# 🚀 Деплой SECCO Tap Game

## Быстрый старт

Ваша игра готова к деплою! Выберите один из способов:

### 1. 🔥 GitHub Pages (Рекомендуется)

**Шаг 1:** Создайте репозиторий на GitHub
```bash
# Инициализируйте Git репозиторий (если еще не сделано)
git init
git add .
git commit -m "Initial commit: SECCO Tap Game ready for deployment"

# Добавьте remote origin (замените YOUR_USERNAME/YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**Шаг 2:** Включите GitHub Pages
1. Зайдите в настройки репозитория на GitHub
2. Перейдите в раздел "Pages"
3. В "Source" выберите "GitHub Actions"
4. Workflow уже настроен в `.github/workflows/deploy.yml`

**Шаг 3:** Обновите конфигурацию
В файле `index.html` замените:
```javascript
window.__SECCO_CONF__ = {
  API_BASE: "/api",
  TON_RECEIVER: "UQBOxIuUPXHOu1fY0O7uGe9yIIaa0-DRcLIk2qVNa_0tZbFD",
  TON_MANIFEST: "https://YOUR_USERNAME.github.io/YOUR_REPO/tonconnect-manifest.json"
};
```

В файле `tonconnect-manifest.json`:
```json
{
  "url": "https://YOUR_USERNAME.github.io/YOUR_REPO",
  "name": "SECCO Tap",
  "iconUrl": "https://YOUR_USERNAME.github.io/YOUR_REPO/tonconnect-icon.svg"
}
```

**Результат:** Игра будет доступна по адресу `https://YOUR_USERNAME.github.io/YOUR_REPO`

---

### 2. ⚡ Vercel (Альтернатива)

**Шаг 1:** Установите Vercel CLI (опционально)
```bash
npm i -g vercel
```

**Шаг 2:** Деплой
1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Или используйте CLI: `vercel --prod`

**Шаг 3:** Обновите конфигурацию
После деплоя замените URLs в конфигурации на ваш Vercel домен.

---

### 3. 🔧 Netlify

**Шаг 1:** Перетащите папку проекта на [netlify.com/drop](https://netlify.com/drop)

**Шаг 2:** Или подключите GitHub репозиторий

**Шаг 3:** Обновите URLs в конфигурации

---

## 📱 Настройка Telegram Bot

### Создание бота
1. Напишите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям для создания бота

### Настройка Mini App
1. Отправьте `/newapp` BotFather
2. Выберите вашего бота
3. Введите название: "SECCO Tap"
4. Введите описание: "Увлекательная игра-кликер с TON интеграцией"
5. Загрузите фото (512x512 пикселей)
6. Введите URL вашего деплоя: `https://your-domain.com`

### Команды бота
Настройте команды через BotFather:
```
start - 🎮 Начать игру
help - ❓ Помощь
stats - 📊 Статистика
```

---

## 🔐 Безопасность

### TON кошелек
- Используйте свой собственный TON кошелек в `TON_RECEIVER`
- Никогда не делитесь приватными ключами
- Тестируйте транзакции с малыми суммами

### HTTPS обязательно
- TON Connect работает только с HTTPS
- GitHub Pages и Vercel предоставляют HTTPS автоматически

---

## 🧪 Тестирование

### Локальное тестирование
```bash
python -m http.server 8000
# Откройте http://localhost:8000
```

### Тестирование в Telegram
1. Откройте [@BotFather](https://t.me/BotFather)
2. Найдите вашего бота
3. Нажмите "Test your Mini App"

---

## 📊 Мониторинг

### GitHub Actions
- Проверяйте статус деплоя во вкладке "Actions"
- Логи доступны для отладки

### Analytics (опционально)
Добавьте Google Analytics или Yandex.Metrica:
```html
<!-- В index.html перед </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🐛 Отладка

### Частые проблемы

**1. TON Connect не работает**
- ✅ Проверьте HTTPS
- ✅ Проверьте правильность TON_MANIFEST URL
- ✅ Убедитесь, что файл tonconnect-manifest.json доступен

**2. Игра не загружается**
- ✅ Проверьте консоль браузера (F12)
- ✅ Убедитесь, что все файлы доступны
- ✅ Проверьте Network tab в DevTools

**3. Telegram Mini App не открывается**
- ✅ Проверьте URL в настройках бота
- ✅ Убедитесь, что сайт работает в обычном браузере
- ✅ Попробуйте очистить кеш Telegram

### Логи
Проверьте консоль браузера для ошибок:
```javascript
// Включите отладочные логи
localStorage.setItem('debug', 'true');
```

---

## 🎉 Готово!

Ваша игра готова к запуску! После деплоя:

1. ✅ Протестируйте все функции
2. ✅ Проверьте TON Connect интеграцию
3. ✅ Убедитесь в работе всех страниц
4. ✅ Поделитесь ботом с друзьями!

**Удачного деплоя! 🚀**
