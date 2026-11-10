/* ============================================================
   GaragePro — demo data
   ------------------------------------------------------------
   STAGES       порядок и подписи колонок доски
   MASTERS      список сотрудников для формы создания
   SEED_ORDERS  стартовые заказ-наряды (извлечены из макета)
   ------------------------------------------------------------
   Созданные пользователем заказы хранятся отдельно в
   localStorage (см. scripts/store.js) и имеют приоритет
   над SEED_ORDERS.
   ============================================================ */
(function () {
  'use strict';

  const STAGES = [
    {
      "id": "new",
      "name": "Новые заявки",
      "short": "Новые",
      "color": "#475569",
      "wip": "",
      "wipOver": false
    },
    {
      "id": "diag",
      "name": "Диагностика",
      "short": "Диагностика",
      "color": "#0ea5b7",
      "wip": "",
      "wipOver": false
    },
    {
      "id": "approval",
      "name": "Согласование",
      "short": "Согласование",
      "color": "#f59e0b",
      "wip": "",
      "wipOver": false
    },
    {
      "id": "parts",
      "name": "Заказ запчастей",
      "short": "Запчасти",
      "color": "#8b5cf6",
      "wip": "SLA 4 дня",
      "wipOver": false
    },
    {
      "id": "repair",
      "name": "Ремонт",
      "short": "Ремонт",
      "color": "#4f46e5",
      "wip": "WIP 4/4",
      "wipOver": true
    },
    {
      "id": "qc",
      "name": "Проверка качества",
      "short": "ОТК",
      "color": "#f97316",
      "wip": "ОТК",
      "wipOver": false
    },
    {
      "id": "ready",
      "name": "Готово к выдаче",
      "short": "Готово",
      "color": "#12b76a",
      "wip": "2 авто",
      "wipOver": false
    },
    {
      "id": "closed",
      "name": "Выдан / закрыт",
      "short": "Выдан",
      "color": "#cbd5e1",
      "wip": "",
      "wipOver": false
    }
  ];

  const MASTERS = [
    {
      "id": "ik",
      "initials": "ИК",
      "name": "Игорь Ковалёв",
      "role": "Мастер-приёмщик",
      "av": 1
    },
    {
      "id": "ps",
      "initials": "ПС",
      "name": "Пётр Сазонов",
      "role": "Мастер слесарного цеха",
      "av": 2
    },
    {
      "id": "ag",
      "initials": "АГ",
      "name": "Артём Гусев",
      "role": "Диагност",
      "av": 3
    },
    {
      "id": "ml",
      "initials": "МЛ",
      "name": "Марина Литвинова",
      "role": "Мастер ОТК",
      "av": 4
    },
    {
      "id": "rd",
      "initials": "РД",
      "name": "Роман Дьяков",
      "role": "Кладовщик",
      "av": 6
    }
  ];

  const SEED_ORDERS = [
    {
      "key": "ЗН-2851",
      "stage": "new",
      "priority": "high",
      "master": {
        "initials": "ИК",
        "name": "Игорь Ковалёв",
        "role": "Мастер-приёмщик",
        "av": 1
      },
      "title": "Toyota Camry 70 · 2.5 AT",
      "desc": "Стук в передней подвеске на неровностях, нужна диагностика ходовой",
      "labels": [
        {
          "text": "Ходовая",
          "tone": "blue"
        },
        {
          "text": "Гарантия",
          "tone": "green"
        }
      ],
      "plate": "JK-4821",
      "meta": "84 200 км · 2021",
      "progress": null,
      "subtasks": null,
      "client": "Дмитрий Соколов",
      "phone": "+371 26 214 087",
      "foot": [
        {
          "icon": "calendar",
          "text": "09.11, 08:40",
          "tone": "",
          "right": false
        },
        {
          "icon": "message",
          "text": "2",
          "tone": "",
          "right": false
        },
        {
          "icon": "clock",
          "text": "слот 14:00",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2852",
      "stage": "new",
      "priority": "low",
      "master": {
        "initials": "ПС",
        "name": "Пётр Сазонов",
        "role": "Мастер-приёмщик",
        "av": 2
      },
      "title": "Hyundai Creta · 1.6 AT",
      "desc": "ТО-60 000: масло ДВС, фильтры, свечи, осмотр подвески и тормозов",
      "labels": [
        {
          "text": "ТО",
          "tone": "teal"
        },
        {
          "text": "Расходники",
          "tone": "gray"
        }
      ],
      "plate": "MB-7314",
      "meta": "61 480 км · 2019",
      "progress": null,
      "subtasks": null,
      "client": "Ольга Мартынова",
      "phone": "+371 29 118 421",
      "foot": [
        {
          "icon": "calendar",
          "text": "09.11, 09:05",
          "tone": "",
          "right": false
        },
        {
          "icon": "message",
          "text": "1",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "185 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2853",
      "stage": "new",
      "priority": "med",
      "master": {
        "initials": "АГ",
        "name": "Артём Гусев",
        "role": "Диагност",
        "av": 3
      },
      "title": "Ford Focus III · 1.6 MT",
      "desc": "Кондиционер не охлаждает, при включении слышен щелчок компрессора",
      "labels": [
        {
          "text": "Электрика",
          "tone": "purple"
        },
        {
          "text": "Диагностика",
          "tone": "blue"
        }
      ],
      "plate": "GA-2057",
      "meta": "143 900 км · 2013",
      "progress": null,
      "subtasks": null,
      "client": "Артур Бегларян",
      "phone": "+371 25 640 773",
      "foot": [
        {
          "icon": "calendar",
          "text": "09.11, 09:30",
          "tone": "",
          "right": false
        },
        {
          "icon": "clock",
          "text": "срок сегодня",
          "tone": "late",
          "right": false
        },
        {
          "icon": "euro",
          "text": "30 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2844",
      "stage": "diag",
      "priority": "high",
      "master": {
        "initials": "АГ",
        "name": "Артём Гусев",
        "role": "Диагност",
        "av": 3
      },
      "title": "BMW 3 F30 · 2.0d AT",
      "desc": "Ошибка по двигателю, потеря тяги. Считаны коды P0299, P0234",
      "labels": [
        {
          "text": "Диагностика",
          "tone": "teal"
        },
        {
          "text": "Двигатель",
          "tone": "red"
        }
      ],
      "plate": "KT-3745",
      "meta": "128 700 км · 2016",
      "progress": {
        "percent": 40,
        "tone": "purple",
        "caption": "Проверка турбины",
        "value": "2 из 5 пунктов"
      },
      "subtasks": null,
      "client": "Сергей Прохоров",
      "phone": "+371 26 771 021",
      "foot": [
        {
          "icon": "calendar",
          "text": "08.11, 16:20",
          "tone": "",
          "right": false
        },
        {
          "icon": "alert",
          "text": "SLA +2 ч",
          "tone": "late",
          "right": false
        },
        {
          "icon": "message",
          "text": "5",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "40 €",
          "tone": "",
          "right": true
        }
      ],
      "late": true,
      "done": false
    },
    {
      "key": "ЗН-2846",
      "stage": "diag",
      "priority": "med",
      "master": {
        "initials": "ИК",
        "name": "Игорь Ковалёв",
        "role": "Мастер-приёмщик",
        "av": 1
      },
      "title": "Lada Vesta SW · 1.6 MT",
      "desc": "Скрип и вибрация при торможении, замерить толщину дисков",
      "labels": [
        {
          "text": "Тормоза",
          "tone": "amber"
        },
        {
          "text": "Осмотр",
          "tone": "gray"
        }
      ],
      "plate": "AD-9183",
      "meta": "47 300 км · 2022",
      "progress": {
        "percent": 60,
        "tone": "purple",
        "caption": "Замер износа",
        "value": "3 из 5 пунктов"
      },
      "subtasks": null,
      "client": "Наталья Гринько",
      "phone": "+371 28 302 554",
      "foot": [
        {
          "icon": "calendar",
          "text": "09.11, 10:15",
          "tone": "",
          "right": false
        },
        {
          "icon": "message",
          "text": "1",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "30 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2839",
      "stage": "diag",
      "priority": "high",
      "master": {
        "initials": "ПС",
        "name": "Пётр Сазонов",
        "role": "Мастер слесарного цеха",
        "av": 2
      },
      "title": "Mercedes-Benz GLC 250 · 2.0 AT",
      "desc": "Гул и рывки в АКПП 9G-Tronic, требуется углублённая диагностика",
      "labels": [
        {
          "text": "АКПП",
          "tone": "purple"
        },
        {
          "text": "Согласовано",
          "tone": "green"
        }
      ],
      "plate": "ER-5820",
      "meta": "96 800 км · 2018",
      "progress": {
        "percent": 25,
        "tone": "purple",
        "caption": "Тест-драйв с мастером",
        "value": "1 из 4 этапов"
      },
      "subtasks": null,
      "client": "Ирина Волошина",
      "phone": "+371 20 887 160",
      "foot": [
        {
          "icon": "calendar",
          "text": "09.11, 07:50",
          "tone": "",
          "right": false
        },
        {
          "icon": "message",
          "text": "8",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "60 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2821",
      "stage": "approval",
      "priority": "high",
      "master": {
        "initials": "ИК",
        "name": "Игорь Ковалёв",
        "role": "Мастер-приёмщик",
        "av": 1
      },
      "title": "Skoda Octavia A7 · 1.8 TSI DSG",
      "desc": "Замена сцепления DSG-7, смета отправлена клиенту на согласование",
      "labels": [
        {
          "text": "Смета на согласовании",
          "tone": "amber"
        },
        {
          "text": "Трансмиссия",
          "tone": "purple"
        }
      ],
      "plate": "HN-4419",
      "meta": "112 400 км · 2017",
      "progress": {
        "percent": 50,
        "tone": "amber",
        "caption": "Ждём ответа клиента",
        "value": "26 ч"
      },
      "subtasks": null,
      "client": "Виктор Лапин",
      "phone": "+371 22 008 771",
      "foot": [
        {
          "icon": "calendar",
          "text": "08.11, 12:10",
          "tone": "",
          "right": false
        },
        {
          "icon": "clock",
          "text": "просрочено",
          "tone": "late",
          "right": false
        },
        {
          "icon": "message",
          "text": "4",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "690 €",
          "tone": "",
          "right": true
        }
      ],
      "late": true,
      "done": false
    },
    {
      "key": "ЗН-2830",
      "stage": "approval",
      "priority": "high",
      "master": {
        "initials": "ПС",
        "name": "Пётр Сазонов",
        "role": "Мастер слесарного цеха",
        "av": 2
      },
      "title": "Renault Logan II · 1.6 MT",
      "desc": "Ремонт ГБЦ после перегрева: опрессовка, шлифовка, замена прокладки",
      "labels": [
        {
          "text": "Двигатель",
          "tone": "red"
        },
        {
          "text": "Доп. работы",
          "tone": "amber"
        }
      ],
      "plate": "DK-7302",
      "meta": "198 500 км · 2014",
      "progress": {
        "percent": 30,
        "tone": "amber",
        "caption": "Согласование доп. работ",
        "value": "1 из 3"
      },
      "subtasks": null,
      "client": "Мурат Джафаров",
      "phone": "+371 29 555 198",
      "foot": [
        {
          "icon": "calendar",
          "text": "09.11, 08:20",
          "tone": "",
          "right": false
        },
        {
          "icon": "message",
          "text": "6",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "430 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2814",
      "stage": "parts",
      "priority": "med",
      "master": {
        "initials": "РД",
        "name": "Роман Дьяков",
        "role": "Кладовщик",
        "av": 6
      },
      "title": "Mazda 6 GH · 2.0 AT",
      "desc": "Радиатор, патрубки и термостат — 3 позиции в заказе поставщику",
      "labels": [
        {
          "text": "Ожидание поставки",
          "tone": "purple"
        },
        {
          "text": "АвтоДеталь",
          "tone": "gray"
        }
      ],
      "plate": "PA-1586",
      "meta": "154 200 км · 2012",
      "progress": {
        "percent": 55,
        "tone": "purple",
        "caption": "Оплачено, ждём отгрузку",
        "value": "3 позиции"
      },
      "subtasks": null,
      "client": "Кирилл Ярцев",
      "phone": "+371 26 447 229",
      "foot": [
        {
          "icon": "truck",
          "text": "ETA 12.11",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "250 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2809",
      "stage": "parts",
      "priority": "low",
      "master": {
        "initials": "РД",
        "name": "Роман Дьяков",
        "role": "Кладовщик",
        "av": 6
      },
      "title": "Volkswagen Tiguan · 2.0 TSI",
      "desc": "Задние тормозные диски и колодки, поставка уже в пути",
      "labels": [
        {
          "text": "В пути",
          "tone": "purple"
        },
        {
          "text": "Тормоза",
          "tone": "amber"
        }
      ],
      "plate": "SV-9047",
      "meta": "88 600 км · 2020",
      "progress": {
        "percent": 80,
        "tone": "purple",
        "caption": "Курьер в городе",
        "value": "2 позиции"
      },
      "subtasks": null,
      "client": "Елена Шапошникова",
      "phone": "+371 25 330 884",
      "foot": [
        {
          "icon": "truck",
          "text": "сегодня, 16:00",
          "tone": "ok",
          "right": false
        },
        {
          "icon": "message",
          "text": "2",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "165 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2803",
      "stage": "parts",
      "priority": "high",
      "master": {
        "initials": "РД",
        "name": "Роман Дьяков",
        "role": "Кладовщик",
        "av": 6
      },
      "title": "Nissan X-Trail T31 · 2.0 CVT",
      "desc": "Ступичный подшипник передний правый — нет на складе, ищем аналог",
      "labels": [
        {
          "text": "Нет на складе",
          "tone": "red"
        },
        {
          "text": "Клиент ждёт",
          "tone": "amber"
        }
      ],
      "plate": "JR-6253",
      "meta": "176 900 км · 2011",
      "progress": {
        "percent": 20,
        "tone": "red",
        "caption": "Поиск поставщика",
        "value": "0 из 1"
      },
      "subtasks": null,
      "client": "Андрей Костин",
      "phone": "+371 28 771 401",
      "foot": [
        {
          "icon": "alert",
          "text": "выдача под угрозой",
          "tone": "late",
          "right": false
        },
        {
          "icon": "message",
          "text": "3",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "100 €",
          "tone": "",
          "right": true
        }
      ],
      "late": true,
      "done": false
    },
    {
      "key": "ЗН-2788",
      "stage": "repair",
      "priority": "high",
      "master": {
        "initials": "ПС",
        "name": "Пётр Сазонов",
        "role": "Мастер",
        "av": 2
      },
      "title": "Kia Sportage 4 · 2.0 AT",
      "desc": "Замена ремня ГРМ, роликов и помпы. Запчасти получены и проверены",
      "labels": [
        {
          "text": "Слесарный цех",
          "tone": "blue"
        },
        {
          "text": "Запчасти получены",
          "tone": "green"
        }
      ],
      "plate": "LM-3810",
      "meta": "132 100 км · 2018",
      "progress": {
        "percent": 60,
        "tone": "blue",
        "caption": "Этап 3 из 5 · сборка узла",
        "value": "60%"
      },
      "subtasks": {
        "done": 3,
        "total": 5
      },
      "client": "Татьяна Гордеева",
      "phone": "+371 26 508 126",
      "foot": [
        {
          "icon": "calendar",
          "text": "с 08.11",
          "tone": "",
          "right": false
        },
        {
          "icon": "clock",
          "text": "выдача 11.11",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "350 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2795",
      "stage": "repair",
      "priority": "med",
      "master": {
        "initials": "ПС",
        "name": "Пётр Сазонов",
        "role": "Мастер",
        "av": 2
      },
      "title": "Audi A4 B8 · 1.8 TFSI",
      "desc": "Замена маслосъёмных колпачков без снятия ГБЦ, повышенный расход масла",
      "labels": [
        {
          "text": "Двигатель",
          "tone": "red"
        },
        {
          "text": "Слесарный цех",
          "tone": "blue"
        }
      ],
      "plate": "NB-5472",
      "meta": "207 400 км · 2011",
      "progress": {
        "percent": 35,
        "tone": "blue",
        "caption": "Этап 2 из 4 · разборка",
        "value": "35%"
      },
      "subtasks": null,
      "client": "Павел Резник",
      "phone": "+371 20 201 705",
      "foot": [
        {
          "icon": "calendar",
          "text": "с 09.11",
          "tone": "",
          "right": false
        },
        {
          "icon": "clock",
          "text": "срок 12.11",
          "tone": "",
          "right": false
        },
        {
          "icon": "message",
          "text": "2",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "420 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2791",
      "stage": "repair",
      "priority": "high",
      "master": {
        "initials": "РД",
        "name": "Роман Дьяков",
        "role": "Мастер кузовного цеха",
        "av": 6
      },
      "title": "Toyota RAV4 XA40 · 2.0 CVT",
      "desc": "Кузовной ремонт: задняя дверь, замена бампера, покраска в 2 слоя",
      "labels": [
        {
          "text": "Кузовной цех",
          "tone": "purple"
        },
        {
          "text": "Покраска",
          "tone": "amber"
        }
      ],
      "plate": "TG-8604",
      "meta": "96 300 км · 2015",
      "progress": {
        "percent": 70,
        "tone": "blue",
        "caption": "Этап 4 из 6 · полировка",
        "value": "70%"
      },
      "subtasks": null,
      "client": "Оксана Литвин",
      "phone": "+371 25 117 632",
      "foot": [
        {
          "icon": "calendar",
          "text": "с 07.11",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "960 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2782",
      "stage": "repair",
      "priority": "med",
      "master": {
        "initials": "ПС",
        "name": "Пётр Сазонов",
        "role": "Мастер",
        "av": 2
      },
      "title": "ГАЗель Next · 2.8 дизель MT",
      "desc": "Замена сцепления и ремонт КПП, коммерческий транспорт, юрлицо",
      "labels": [
        {
          "text": "Слесарный цех",
          "tone": "blue"
        },
        {
          "text": "Юрлицо",
          "tone": "gray"
        }
      ],
      "plate": "VE-2938",
      "meta": "214 800 км · 2019",
      "progress": {
        "percent": 45,
        "tone": "blue",
        "caption": "Этап 2 из 5 · снятие КПП",
        "value": "45%"
      },
      "subtasks": null,
      "client": "SIA «Logistik Plus» · водитель Николай",
      "phone": "+371 26 447 230",
      "foot": [
        {
          "icon": "calendar",
          "text": "с 09.11",
          "tone": "",
          "right": false
        },
        {
          "icon": "clock",
          "text": "срок 13.11",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "580 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2775",
      "stage": "qc",
      "priority": "med",
      "master": {
        "initials": "МЛ",
        "name": "Марина Литвинова",
        "role": "Мастер ОТК",
        "av": 4
      },
      "title": "Volvo XC60 · 2.4d AT",
      "desc": "Замена тормозных дисков и колодок по кругу, тест-драйв и приёмка ОТК",
      "labels": [
        {
          "text": "ОТК",
          "tone": "amber"
        },
        {
          "text": "Тест-драйв",
          "tone": "teal"
        }
      ],
      "plate": "AK-7165",
      "meta": "118 900 км · 2017",
      "progress": {
        "percent": 90,
        "tone": "green",
        "caption": "Осталось: тест-драйв",
        "value": "2 из 3"
      },
      "subtasks": null,
      "client": "Максим Тарасов",
      "phone": "+371 26 890 442",
      "foot": [
        {
          "icon": "check-circle",
          "text": "2 из 3 проверок",
          "tone": "ok",
          "right": false
        },
        {
          "icon": "calendar",
          "text": "с 08.11",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "520 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2770",
      "stage": "qc",
      "priority": "low",
      "master": {
        "initials": "МЛ",
        "name": "Марина Литвинова",
        "role": "Мастер ОТК",
        "av": 4
      },
      "title": "Honda CR-V · 2.4 CVT",
      "desc": "ТО-90 000 и замена жидкости CVT, контроль регламента и чистоты",
      "labels": [
        {
          "text": "ОТК",
          "tone": "amber"
        },
        {
          "text": "ТО",
          "tone": "teal"
        }
      ],
      "plate": "CS-4091",
      "meta": "93 500 км · 2016",
      "progress": {
        "percent": 100,
        "tone": "green",
        "caption": "Чек-лист закрыт, ждём ОТК",
        "value": "18/18"
      },
      "subtasks": null,
      "client": "Галина Мещерякова",
      "phone": "+371 28 630 078",
      "foot": [
        {
          "icon": "check",
          "text": "чек-лист 18/18",
          "tone": "ok",
          "right": false
        },
        {
          "icon": "calendar",
          "text": "09.11, 15:40",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "270 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2762",
      "stage": "ready",
      "priority": "med",
      "master": {
        "initials": "ИК",
        "name": "Игорь Ковалёв",
        "role": "Мастер-приёмщик",
        "av": 1
      },
      "title": "Mercedes-Benz E200 · 2.0 AT",
      "desc": "Ремонт подвески: передние стойки, рычаги, сход-развал выполнен",
      "labels": [
        {
          "text": "Оплачено",
          "tone": "green"
        },
        {
          "text": "Выдать сегодня",
          "tone": "amber"
        }
      ],
      "plate": "DP-8523",
      "meta": "88 100 км · 2019",
      "progress": {
        "percent": 100,
        "tone": "green",
        "caption": "Авто на площадке выдачи",
        "value": "100%"
      },
      "subtasks": null,
      "client": "Станислав Юдин",
      "phone": "+371 26 402 196",
      "foot": [
        {
          "icon": "clock",
          "text": "до 19:00",
          "tone": "late",
          "right": false
        },
        {
          "icon": "message",
          "text": "SMS отправлено",
          "tone": "ok",
          "right": false
        },
        {
          "icon": "euro",
          "text": "740 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2758",
      "stage": "ready",
      "priority": "low",
      "master": {
        "initials": "РД",
        "name": "Роман Дьяков",
        "role": "Мастер кузовного цеха",
        "av": 6
      },
      "title": "Volkswagen Polo · 1.6 AT",
      "desc": "Замена лобового стекла, установка молдингов, калибровка камеры",
      "labels": [
        {
          "text": "Оплачено",
          "tone": "green"
        },
        {
          "text": "Кузовной цех",
          "tone": "purple"
        }
      ],
      "plate": "GR-1379",
      "meta": "64 700 км · 2020",
      "progress": {
        "percent": 100,
        "tone": "green",
        "caption": "Акт выполненных работ готов",
        "value": "100%"
      },
      "subtasks": null,
      "client": "Вера Антонова",
      "phone": "+371 25 244 710",
      "foot": [
        {
          "icon": "clock",
          "text": "до 18:30",
          "tone": "",
          "right": false
        },
        {
          "icon": "check",
          "text": "акт готов",
          "tone": "ok",
          "right": false
        },
        {
          "icon": "euro",
          "text": "220 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": false
    },
    {
      "key": "ЗН-2741",
      "stage": "closed",
      "priority": "low",
      "master": {
        "initials": "ИК",
        "name": "Игорь Ковалёв",
        "role": "Мастер-приёмщик",
        "av": 1
      },
      "title": "Lexus RX350 · 3.5 AT",
      "desc": "ТО-120 000: масло, фильтры, свечи, замена жидкости АКПП",
      "labels": [
        {
          "text": "Закрыт",
          "tone": "green"
        },
        {
          "text": "Гарантия 12 мес",
          "tone": "blue"
        }
      ],
      "plate": "JK-6270",
      "meta": "121 600 км · 2017",
      "progress": null,
      "subtasks": null,
      "client": "Роман Балашов",
      "phone": "+371 26 805 337",
      "foot": [
        {
          "icon": "check-circle",
          "text": "выдан 08.11",
          "tone": "ok",
          "right": false
        },
        {
          "icon": "star",
          "text": "5,0",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "285 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": true
    },
    {
      "key": "ЗН-2738",
      "stage": "closed",
      "priority": "med",
      "master": {
        "initials": "ПС",
        "name": "Пётр Сазонов",
        "role": "Мастер",
        "av": 2
      },
      "title": "Chevrolet Cruze · 1.8 AT",
      "desc": "Замена генератора и ремня навесного оборудования",
      "labels": [
        {
          "text": "Закрыт",
          "tone": "gray"
        },
        {
          "text": "Гарантия 6 мес",
          "tone": "blue"
        }
      ],
      "plate": "MB-9514",
      "meta": "187 400 км · 2012",
      "progress": null,
      "subtasks": null,
      "client": "Илья Дорохов",
      "phone": "+371 20 512 660",
      "foot": [
        {
          "icon": "check-circle",
          "text": "выдан 07.11",
          "tone": "ok",
          "right": false
        },
        {
          "icon": "star",
          "text": "5,0",
          "tone": "",
          "right": false
        },
        {
          "icon": "euro",
          "text": "160 €",
          "tone": "",
          "right": true
        }
      ],
      "late": false,
      "done": true
    }
  ];

  window.GaragePro = Object.assign(window.GaragePro || {}, {
    STAGES: STAGES,
    MASTERS: MASTERS,
    SEED_ORDERS: SEED_ORDERS
  });
})();
