export const PROJECTS = [
  {
    id: '01',
    title: 'ALENA DERR // ART PLATFORM',
    url: 'https://alenaderr.art/',
    category: 'FULL-STACK / CRM / BOT',
    year: '2026',
    status: 'DEPLOYED',
    desc: 'Полноценный эком-монолит с headless-архитектурой. Клиент выбирает картину → сайт мгновенно шлет данные через webhook в Telegram-бот → бот оформляет заказ и выкидывает карточку в кастомную CRM-панель.',
    schema: [
      { 
        step: '01', 
        label: 'ФРОНТЕНД (САЙТ)', 
        desc: 'Клиент выбирает картину и нажимает «Купить»', 
        illustrationType: 'client-shop',
        packet: '📦 PAYLOAD: { painting: "Sunset #9", price: "$450" }',
        statusText: 'Пользователь на сайте: транзакция инициирована'
      },
      { 
        step: '02', 
        label: 'WEBHOOK / API', 
        desc: 'Мгновенная передача зашифрованного пакета на сервер', 
        illustrationType: 'webhook-flow',
        packet: '⚡ SIGNAL: POST /api/v1/order HTTP/1.1 (14ms)',
        statusText: 'Шлюз принял пакет, проверка подписи успешна'
      },
      { 
        step: '03', 
        label: 'TELEGRAM БОТ', 
        desc: 'Уведомление мгновенно летит художнице в мессенджер', 
        illustrationType: 'telegram-bot',
        packet: '🤖 TELEGRAM API: Message sent to chat_id [-1002849...]',
        statusText: 'Бот разбудил художницу красивой карточкой заказа'
      },
      { 
        step: '04', 
        label: 'CRM ПАНЕЛЬ', 
        desc: 'Заказ падает в базу, обновляя аналитику продаж', 
        illustrationType: 'crm-dashboard',
        packet: '💾 SQLITE: INSERT INTO orders VALUES (842, "PAID");',
        statusText: 'Данные в базе, аналитика обновлена в реальном времени'
      },
    ],
  },
  {
    id: '02',
    title: 'RESTO-CHAIN iiko SYNC HUB',
    category: 'ENTERPRISE / POS / AUTOMATION',
    year: '2026',
    status: 'ACTIVE',
    desc: 'Автоматизация ресторанной сети. Касса бьет чек в iiko → локальный демон ловит событие → система сама синхронизирует остатки, а при сбое кассы шлет тревожный алерт.',
    schema: [
      { 
        step: '01', 
        label: 'iiko POS ТЕРМИНАЛ', 
        desc: 'Кассир пробивает фискальный чек на точке', 
        illustrationType: 'pos-terminal',
        packet: '🖥️ POS_EVENT: CHEQUE_CLOSED { table: 4, sum: "340,000 UZS" }',
        statusText: 'Чек закрыт на кассовом терминале'
      },
      { 
        step: '02', 
        label: 'LOCAL DAEMON', 
        desc: 'Фоновый перехват и валидация данных в системе', 
        illustrationType: 'daemon-sync',
        packet: '⚙️ DAEMON: Event intercepted. Parsing XML payload...',
        statusText: 'Локальный демон перехватил событие без задержки'
      },
      { 
        step: '03', 
        label: 'CLOUD SYNC', 
        desc: 'Обновление складов и остатков в реальном времени', 
        illustrationType: 'cloud-stocks',
        packet: '🔄 SYNC: Stock decremented for item "Ribeye Steak" (-1)',
        statusText: 'Остатки на складе автоматически пересчитаны'
      },
      { 
        step: '04', 
        label: 'ALERT BOT', 
        desc: 'Контроль сбоев и отправка отчетов менеджменту', 
        illustrationType: 'alert-bot',
        packet: '🚨 TELEGRAM: Shift report generated successfully.',
        statusText: 'Отчет улетел управляющему в закрытый чат'
      },
    ],
  },
  {
    id: '03',
    title: 'VKTECH // INFRASTRUCTURE NODE',
    category: 'DEVOPS / SECURITY / CLOUD',
    year: '2026',
    status: 'DEPLOYED',
    desc: 'Защищенный контур на VPS. Docker-контейнеры мониторят здоровье сервисов, делают бэкапы баз данных и пролонгируют SSL-сертификаты.',
    schema: [
      { 
        step: '01', 
        label: 'VPS СЕРВЕР', 
        desc: 'Изолированное окружение под управлением Linux', 
        illustrationType: 'vps-server',
        packet: '🐳 DOCKER: Container health-check active (uptime: 99.98%)',
        statusText: 'Все контейнеры работают в штатном режиме'
      },
      { 
        step: '02', 
        label: 'WATCHDOG', 
        desc: 'Автоматический перезапуск служб при сбоях', 
        illustrationType: 'watchdog-guard',
        packet: '🛡️ MONITOR: Memory usage normal (1.2GB / 8GB)',
        statusText: 'Сторожевой таймер проверяет целостность служб'
      },
      { 
        step: '03', 
        label: 'SQLITE BACKUP', 
        desc: 'Ежедневные зашифрованные дампы баз данных', 
        illustrationType: 'sqlite-backup',
        packet: '💾 TAR.GZ: Backup created -> /var/backups/db_safe.enc',
        statusText: 'Резервная копия упакована и отправлена в облако'
      },
      { 
        step: '04', 
        label: 'NGINX GATEWAY', 
        desc: 'Шифрование трафика и управление SSL-доступами', 
        illustrationType: 'nginx-ssl',
        packet: '🔒 CERTBOT: SSL auto-renewal checked (Valid for 89 days)',
        statusText: 'Защищенный контур активен, сертификаты в порядке'
      },
    ],
  },
]