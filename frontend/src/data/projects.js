export const PROJECTS = [
  {
    id: '01', title: 'RESTAURANT CHAIN // LEAD AUTOMATION', category: 'AUTOMATION / INTEGRATION', year: '2026', status: 'DEPLOYED',
    desc: 'Система принимает обращения из нескольких точек, передаёт их в работу и сохраняет единый контекст без ручного копирования.',
    schema: [
      { step: '01', label: 'ОБРАЩЕНИЕ', desc: 'Гость оставляет запрос в удобном канале.', illustrationType: 'client-shop', packet: 'PAYLOAD: { source: "restaurant", type: "lead" }', statusText: 'Запрос принят в едином контуре' },
      { step: '02', label: 'ПРОВЕРКА', desc: 'Система проверяет и собирает нужные данные.', illustrationType: 'webhook-flow', packet: 'SIGNAL: normalized and validated', statusText: 'Данные подготовлены к передаче' },
      { step: '03', label: 'МАРШРУТИЗАЦИЯ', desc: 'Запрос направляется ответственной команде.', illustrationType: 'telegram-bot', packet: 'ROUTE: assigned to responsible team', statusText: 'Команда получила контекст обращения' },
      { step: '04', label: 'УЧЁТ', desc: 'Статус и история остаются в системе.', illustrationType: 'crm-dashboard', packet: 'STORE: lead context saved', statusText: 'История доступна для дальнейшей работы' },
    ],
  },
  {
    id: '02', title: 'ALENA DERR // ART PLATFORM', url: 'https://alenaderr.art/', category: 'FULL-STACK / PLATFORM', year: '2026', status: 'DEPLOYED',
    desc: 'Платформа художницы: выбор работы, понятная заявка и связанный путь от сайта до рабочего контекста.',
    schema: [
      { step: '01', label: 'ВИТРИНА', desc: 'Посетитель изучает работы и выбирает интересующую.', illustrationType: 'client-shop', packet: 'PAYLOAD: artwork selected', statusText: 'Выбор зафиксирован на сайте' },
      { step: '02', label: 'API', desc: 'Запрос собирается в единый пакет.', illustrationType: 'webhook-flow', packet: 'SIGNAL: request prepared', statusText: 'Пакет готов к передаче' },
      { step: '03', label: 'СВЯЗЬ', desc: 'Контекст поступает в рабочий канал.', illustrationType: 'telegram-bot', packet: 'CHANNEL: context delivered', statusText: 'Команда видит детали запроса' },
      { step: '04', label: 'ПОРЯДОК', desc: 'История остаётся доступной для работы.', illustrationType: 'crm-dashboard', packet: 'STORE: request context saved', statusText: 'Контекст сохранён в системе' },
    ],
  },
  {
    id: '03', title: 'DOCUMENT PROCESSING // ESTIMATION SYSTEM', category: 'BACKEND / DATA', year: '2026', status: 'ACTIVE',
    desc: 'Внутренняя система обработки документов: от входящего файла к структурированным данным и прозрачному расчёту.',
    schema: [
      { step: '01', label: 'ДОКУМЕНТ', desc: 'Входящие материалы попадают в рабочий контур.', illustrationType: 'pos-terminal', packet: 'INPUT: document received', statusText: 'Документ принят системой' },
      { step: '02', label: 'РАЗБОР', desc: 'Система выделяет нужные данные.', illustrationType: 'daemon-sync', packet: 'PARSE: fields normalized', statusText: 'Структура документа собрана' },
      { step: '03', label: 'РАСЧЁТ', desc: 'Данные участвуют в понятной оценке.', illustrationType: 'cloud-stocks', packet: 'CALC: estimate prepared', statusText: 'Расчёт готов к проверке' },
      { step: '04', label: 'РЕЗУЛЬТАТ', desc: 'Команда получает готовый рабочий результат.', illustrationType: 'alert-bot', packet: 'OUTPUT: result available', statusText: 'Результат доступен ответственному' },
    ],
  },
]
