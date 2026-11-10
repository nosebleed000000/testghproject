/* ============================================================
   GaragePro — modals
   Создание и просмотр заказ-наряда, продвижение по этапам.
   ============================================================ */
(function () {
  'use strict';
  const GP = window.GaragePro;
  const ui = GP.ui;
  const store = GP.store;
  const STAGES = GP.STAGES;
  const MASTERS = GP.MASTERS;

  const createDialog = document.getElementById('create-dialog');
  const createForm = document.getElementById('create-form');
  const stageSelect = document.getElementById('f-stage');
  const masterSelect = document.getElementById('f-master');
  const phoneInput = document.getElementById('f-phone');
  const plateInput = document.getElementById('f-plate');
  const dueInput = document.getElementById('f-due');
  const clientInput = document.getElementById('f-client');
  const viewDialog = document.getElementById('view-dialog');
  const viewKey = document.getElementById('view-key');
  const viewTitle = document.getElementById('view-title');
  const viewBody = document.getElementById('view-body');
  const viewPrice = document.getElementById('view-price');
  const viewAdvance = document.getElementById('view-advance');
  const viewAdvanceLabel = document.getElementById('view-advance-label');

  let currentKey = null;

  const RULES = [
    { name: 'client', test: function (value) { return value.trim().length >= 2; } },
    { name: 'phone', test: function (value) { return ui.isValidPhone(value); } },
    { name: 'title', test: function (value) { return value.trim().length >= 2; } },
    { name: 'plate', optional: true, test: function (value) { return /^[A-Z]{2}-\d{4}$/.test(value.trim().toUpperCase()); } },
    { name: 'desc', test: function (value) { return value.trim().length >= 3; } }
  ];

  function fillSelects() {
    if (stageSelect.options.length || masterSelect.options.length) return;
    STAGES.forEach(function (stage) {
      stageSelect.add(new Option(stage.name, stage.id));
    });
    MASTERS.forEach(function (master) {
      masterSelect.add(new Option(master.name + ' — ' + master.role, master.id));
    });
  }

  function clearErrors() {
    createForm.querySelectorAll('.field.has-error').forEach(function (field) {
      field.classList.remove('has-error');
    });
    createForm.querySelectorAll('[aria-invalid]').forEach(function (input) {
      input.removeAttribute('aria-invalid');
    });
  }

  function resetForm() {
    createForm.reset();
    clearErrors();
    dueInput.value = ui.toISODate(ui.addDays(new Date(), 2));
    dueInput.min = ui.toISODate(new Date());
  }

  function setHash(hash) {
    try { window.history.replaceState(null, '', hash); } catch (error) { /* file:// */ }
  }

  function clearHash() {
    if (!window.location.hash) return;
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (error) { /* ignore */ }
  }

  function clearCreateHash() {
    if (window.location.hash === '#/new') clearHash();
  }

  function clearViewHash() {
    if (window.location.hash.indexOf('#/order/') === 0) clearHash();
  }

  function openCreate(stageId) {
    fillSelects();
    resetForm();
    if (viewDialog.open) viewDialog.close();
    const requested = STAGES.some(function (stage) { return stage.id === stageId; }) ? stageId : 'new';
    stageSelect.value = requested;
    if (!createDialog.open) createDialog.showModal();
    setHash('#/new');
    if (window.matchMedia('(min-width: 641px)').matches) {
      window.requestAnimationFrame(function () { clientInput.focus(); });
    }
  }

  function validate() {
    let firstInvalid = null;
    RULES.forEach(function (rule) {
      const input = createForm.elements.namedItem(rule.name);
      const field = createForm.querySelector('[data-field="' + rule.name + '"]');
      const value = input ? input.value : '';
      const valid = input && (rule.optional && !value.trim() ? true : rule.test(value));
      if (!field || !input) return;
      field.classList.toggle('has-error', !valid);
      if (valid) {
        input.removeAttribute('aria-invalid');
      } else {
        input.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = input;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    return true;
  }

  function collectOrder() {
    const data = new FormData(createForm);
    const stageId = String(data.get('stage') || 'new');
    const stage = STAGES.find(function (item) { return item.id === stageId; }) || STAGES[0];
    const master = MASTERS.find(function (item) { return item.id === data.get('master'); }) || MASTERS[0];
    const typeSelect = document.getElementById('f-type');
    const typeOption = typeSelect.options[typeSelect.selectedIndex];
    const price = Math.max(0, Number(data.get('price')) || 0);
    const mileage = String(data.get('mileage') || '').trim();
    const year = String(data.get('year') || '').trim();
    const dueISO = String(data.get('due') || '');
    const phone = ui.formatPhone(String(data.get('phone') || ''));
    const created = ui.createdAtLabel(new Date());

    const metaParts = [];
    if (mileage) metaParts.push(ui.formatNumber(mileage) + ' км');
    if (year) metaParts.push(year);

    const foot = [{ icon: 'calendar', text: created, tone: '', right: false }];
    if (dueISO) foot.push({ icon: 'clock', text: 'срок ' + ui.shortDate(dueISO), tone: '', right: false });
    if (price > 0) foot.push({ icon: 'euro', text: ui.formatMoney(price), tone: '', right: true });

    return {
      key: store.nextKey(),
      stage: stage.id,
      priority: String(data.get('priority') || 'med'),
      master: {
        initials: master.initials,
        name: master.name,
        role: master.role,
        av: master.av
      },
      title: String(data.get('title') || '').trim(),
      desc: String(data.get('desc') || '').trim(),
      labels: [{
        text: typeOption ? typeOption.value : 'Другое',
        tone: typeOption ? typeOption.dataset.tone || 'gray' : 'gray'
      }],
      plate: String(data.get('plate') || '').trim().toUpperCase(),
      meta: metaParts.join(' · '),
      progress: null,
      subtasks: null,
      client: String(data.get('client') || '').trim(),
      phone: phone,
      foot: foot,
      late: false,
      done: stage.id === 'closed',
      dueISO: dueISO
    };
  }


  function subtasksHtml(subtasks) {
    if (!subtasks || !subtasks.total) return '';
    let minis = '';
    for (let i = 0; i < subtasks.total; i += 1) {
      minis += '<span class="mini' + (i < subtasks.done ? ' is-done' : '') + '"></span>';
    }
    return '<div class="subtasks">' + minis + '<span class="cap">' +
      subtasks.done + '/' + subtasks.total + '</span></div>';
  }

  function renderView(order, resetScroll) {
    const stageIndex = STAGES.findIndex(function (stage) { return stage.id === order.stage; });
    const stage = STAGES[stageIndex] || STAGES[0];
    const priority = order.priority || 'med';
    const master = order.master || { initials: '—', name: 'Не назначен', role: 'Мастер', av: 9 };
    const createdFoot = (order.foot || []).find(function (item) { return item.icon === 'calendar'; });
    const dueFoot = (order.foot || []).find(function (item) { return item.icon === 'clock'; });
    const priceFoot = (order.foot || []).find(function (item) { return item.icon === 'euro'; });
    const nextStage = STAGES[stageIndex + 1];
    const isLate = order.late || (GP.board && GP.board.isLate(order));

    viewKey.textContent = order.key;
    viewTitle.textContent = order.title;
    viewPrice.textContent = priceFoot ? priceFoot.text : 'Не рассчитана';
    viewAdvance.hidden = !nextStage || order.done;
    if (nextStage && !order.done) {
      viewAdvanceLabel.textContent = 'Дальше: ' + nextStage.short;
      viewAdvance.title = 'Перейти в «' + nextStage.name + '»';
    }

    const phoneHtml = order.phone
      ? (ui.isPhoneLike(order.phone)
        ? '<a href="' + ui.escapeHtml(ui.telHref(order.phone)) + '">' + ui.escapeHtml(order.phone) + '</a>'
        : ui.escapeHtml(order.phone))
      : '—';
    const phoneLabel = ui.isPhoneLike(order.phone) ? 'Телефон' : 'Контакт';

    const labels = (order.labels || []).length
      ? '<div class="labels">' + order.labels.map(function (label) {
        return '<span class="label label--' + ui.escapeHtml(label.tone) + '">' + ui.escapeHtml(label.text) + '</span>';
      }).join('') + '</div>'
      : '';

    const steps = STAGES.map(function (item, index) {
      return '<span class="flow-step' + (index < stageIndex ? ' is-done' : '') +
        (index === stageIndex ? ' is-current' : '') + '" title="' + ui.escapeHtml(item.name) + '"></span>';
    }).join('');

    let progressPanel = '';
    if (order.progress) {
      const tone = order.progress.tone && order.progress.tone !== 'blue'
        ? ' progress--' + order.progress.tone
        : '';
      progressPanel =
        '<section class="order-panel order-panel--wide">' +
        '<h3 class="order-panel-title">Ход работ</h3>' +
        '<div class="order-progress">' +
        '<div class="order-progress-head"><span>' + ui.escapeHtml(order.progress.caption) + '</span><b>' + ui.escapeHtml(order.progress.value) + '</b></div>' +
        '<div class="progress' + tone + '"><span style="width:' + Math.max(0, Math.min(100, order.progress.percent)) + '%"></span></div>' +
        subtasksHtml(order.subtasks) +
        '</div></section>';
    } else if (order.subtasks && order.subtasks.total) {
      progressPanel =
        '<section class="order-panel order-panel--wide">' +
        '<h3 class="order-panel-title">Ход работ</h3>' +
        '<div class="order-progress">' + subtasksHtml(order.subtasks) + '</div>' +
        '</section>';
    }


    viewBody.innerHTML =
      '<div class="order-hero">' +
      '<div class="order-hero-top">' +
      '<span class="status-pill"><span class="status-dot" style="background:' + ui.escapeHtml(stage.color) + '"></span>' + ui.escapeHtml(stage.name) + '</span>' +
      '<span class="priority-pill priority-pill--' + priority + '">' + ui.icon('prio-' + priority, 'ico--fill') + ui.priorityLabel(priority) + ' приоритет</span>' +
      (isLate ? '<span class="label label--red">Просрочен</span>' : '') +
      (order.done ? '<span class="label label--green">Закрыт</span>' : '') +
      '</div>' +
      '<div class="order-meta">' +
      (order.plate ? '<span class="plate">' + ui.escapeHtml(order.plate) + '</span>' : '') +
      (order.meta ? '<span class="order-meta-text">' + ui.escapeHtml(order.meta) + '</span>' : '') +
      '</div>' +
      '<div class="order-flow">' + steps + '</div>' +
      '<p class="order-flow-caption">Этап ' + (stageIndex + 1) + ' из ' + STAGES.length + ' · <b>' + ui.escapeHtml(stage.name) + '</b></p>' +
      '</div>' +
      '<div class="order-grid">' +
      '<section class="order-panel">' +
      '<h3 class="order-panel-title">Клиент</h3>' +
      '<dl class="detail-list">' +
      '<div class="detail"><dt>Имя</dt><dd>' + ui.escapeHtml(order.client || '—') + '</dd></div>' +
      '<div class="detail"><dt>' + phoneLabel + '</dt><dd>' + phoneHtml + '</dd></div>' +
      '<div class="detail"><dt>Мастер</dt><dd><span class="person"><span class="avatar av-' + (master.av || 9) + '">' + ui.escapeHtml(master.initials) + '</span><span class="person-text">' + ui.escapeHtml(master.name) + '<small>' + ui.escapeHtml(master.role) + '</small></span></span></dd></div>' +
      '</dl></section>' +
      '<section class="order-panel">' +
      '<h3 class="order-panel-title">Автомобиль</h3>' +
      '<dl class="detail-list">' +
      '<div class="detail"><dt>Госномер</dt><dd>' + (order.plate ? '<span class="plate">' + ui.escapeHtml(order.plate) + '</span>' : '—') + '</dd></div>' +
      '<div class="detail"><dt>Пробег и год</dt><dd>' + ui.escapeHtml(order.meta || '—') + '</dd></div>' +
      '<div class="detail"><dt>Создан</dt><dd>' + ui.escapeHtml(createdFoot ? createdFoot.text : '—') + '</dd></div>' +
      '<div class="detail"><dt>Срок</dt><dd>' + ui.escapeHtml(dueFoot ? dueFoot.text.replace(/^(срок|выдача)\s+/i, '') : '—') + '</dd></div>' +
      '</dl></section>' +
      '<section class="order-panel order-panel--wide">' +
      '<h3 class="order-panel-title">Описание работ</h3>' +
      '<p class="order-desc">' + ui.escapeHtml(order.desc) + '</p>' +
      labels +
      '</section>' +
      progressPanel +
      '</div>';

    if (resetScroll) viewBody.scrollTop = 0;
  }


  function openView(key) {
    const order = store.get(key);
    if (!order) {
      ui.toast('Заказ-наряд не найден');
      return;
    }
    currentKey = key;
    renderView(order, true);
    if (createDialog.open) createDialog.close();
    if (!viewDialog.open) viewDialog.showModal();
    setHash('#/order/' + encodeURIComponent(key));
  }

  function advance() {
    if (!currentKey) return;
    const order = store.get(currentKey);
    if (!order) return;
    const index = STAGES.findIndex(function (stage) { return stage.id === order.stage; });
    const next = STAGES[index + 1];
    if (!next || order.done) return;
    store.update(currentKey, { stage: next.id, done: next.id === 'closed' });
    renderView(store.get(currentKey), false);
    ui.toast('Заказ-наряд ' + order.key + ' → ' + next.name);
  }

  function init() {
    fillSelects();

    createForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validate()) return;
      const order = collectOrder();
      GP.board.setHighlight(order.key);
      store.add(order);
      createDialog.close();
      ui.toast('Заказ-наряд ' + order.key + ' создан');
    });

    createForm.addEventListener('input', function (event) {
      const field = event.target.closest('[data-field]');
      if (!field) return;
      field.classList.remove('has-error');
      const input = field.querySelector('input,select,textarea');
      if (input) input.removeAttribute('aria-invalid');
    });

    phoneInput.addEventListener('input', function () {
      phoneInput.value = ui.formatPhone(phoneInput.value);
    });

    /* латвийский формат AB-1234, кириллические похожие буквы приводим к латинице */
    plateInput.addEventListener('input', function () {
      const translit = {
        'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
        'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X'
      };
      const normalized = plateInput.value.toUpperCase()
        .replace(/[А-ЯЁ]/g, function (letter) { return translit[letter] || ''; })
        .replace(/[^A-Z0-9]/g, '');
      const letters = normalized.replace(/[^A-Z]/g, '').slice(0, 2);
      const digits = normalized.replace(/\D/g, '').slice(0, 4);
      plateInput.value = letters ? letters + (digits ? '-' + digits : '') : '';
    });

    document.querySelectorAll('[data-close]').forEach(function (button) {
      button.addEventListener('click', function () {
        const dialog = button.closest('dialog');
        if (dialog) dialog.close();
      });
    });

    [createDialog, viewDialog].forEach(function (dialog) {
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
      });
    });

    createDialog.addEventListener('close', clearCreateHash);
    viewDialog.addEventListener('close', function () {
      currentKey = null;
      clearViewHash();
    });

    viewAdvance.addEventListener('click', advance);
  }

  GP.modals = {
    init: init,
    openCreate: openCreate,
    openView: openView
  };
})();
