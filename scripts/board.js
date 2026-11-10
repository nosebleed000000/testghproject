/* ============================================================
   GaragePro — board
   Рендер колонок и карточек, поиск по доске, фильтры.
   ============================================================ */
(function () {
  'use strict';
  const GP = window.GaragePro;
  const STAGES = GP.STAGES;
  const ui = GP.ui;

  const boardEl = document.getElementById('board');
  const totalEl = document.getElementById('board-total');
  const sidebarCountEl = document.getElementById('sidebar-board-count');
  const overdueEl = document.getElementById('sidebar-overdue-count');
  const filterSummaryEl = document.getElementById('filter-summary');

  const state = {
    query: '',
    priorities: new Set(),
    overdue: false,
    highlight: null
  };

  function isLate(order) {
    return ui.isOrderLate(order);
  }

  function matches(order) {
    if (state.priorities.size && !state.priorities.has(order.priority)) return false;
    if (state.overdue && !isLate(order)) return false;
    if (state.query) {
      const haystack = [
        order.key, order.title, order.desc, order.client, order.phone,
        order.plate, order.plate ? order.plate.replace(/-/g, '') : '', order.meta,
        (order.labels || []).map(function (label) { return label.text; }).join(' ')
      ].join(' ').toLowerCase();
      if (haystack.indexOf(state.query) === -1) return false;
    }
    return true;
  }

  function footHtml(item) {
    const classes = 'foot' + (item.tone ? ' foot--' + item.tone : '') + (item.right ? ' right' : '');
    return '<span class="' + classes + '">' + ui.icon(item.icon) + ui.escapeHtml(item.text) + '</span>';
  }

  function cardHtml(order) {
    const master = order.master || { initials: '—', name: '', role: 'Мастер', av: 9 };
    const priority = order.priority || 'med';
    const classes = ['card'];
    if (order.late) classes.push('card--late');
    if (order.done) classes.push('card--done');

    const labels = (order.labels || []).length
      ? '<div class="labels">' + order.labels.map(function (label) {
        return '<span class="label label--' + ui.escapeHtml(label.tone) + '">' + ui.escapeHtml(label.text) + '</span>';
      }).join('') + '</div>'
      : '';

    const car = (order.plate || order.meta)
      ? '<div class="car">' +
        (order.plate ? '<span class="plate">' + ui.escapeHtml(order.plate) + '</span>' : '') +
        (order.meta ? '<span class="car-meta">' + ui.escapeHtml(order.meta) + '</span>' : '') +
        '</div>'
      : '';

    let progress = '';
    if (order.progress) {
      const tone = order.progress.tone && order.progress.tone !== 'blue'
        ? ' progress--' + order.progress.tone
        : '';
      progress =
        '<div class="progress' + tone + '"><span style="width:' + Math.max(0, Math.min(100, order.progress.percent)) + '%"></span></div>' +
        '<div class="progress-cap"><span>' + ui.escapeHtml(order.progress.caption) + '</span><b>' + ui.escapeHtml(order.progress.value) + '</b></div>';
    }

    let subtasks = '';
    if (order.subtasks && order.subtasks.total) {
      let minis = '';
      for (let i = 0; i < order.subtasks.total; i += 1) {
        minis += '<span class="mini' + (i < order.subtasks.done ? ' is-done' : '') + '"></span>';
      }
      subtasks = '<div class="subtasks">' + minis + '<span class="cap">' +
        order.subtasks.done + '/' + order.subtasks.total + '</span></div>';
    }

    const client = order.client
      ? '<div class="client">' + ui.icon('user') + '<span>' + ui.escapeHtml(order.client) +
        (order.phone ? ' · ' + ui.escapeHtml(order.phone) : '') + '</span></div>'
      : '';

    const foot = (order.foot || []).map(footHtml).join('');

    return '<article class="' + classes.join(' ') + '" data-key="' + ui.escapeHtml(order.key) + '" tabindex="0" role="button" ' +
      'aria-label="Открыть заказ-наряд ' + ui.escapeHtml(order.key + ': ' + order.title) + '">' +
      '<div class="card-top">' +
      '<span class="prio prio--' + priority + '" title="Приоритет: ' + ui.priorityLabel(priority).toLowerCase() + '">' +
      ui.icon('prio-' + priority, 'ico--fill') + '</span>' +
      '<span class="card-key">' + ui.escapeHtml(order.key) + '</span>' +
      '<span class="avatar av-' + (master.av || 9) + '" title="' + ui.escapeHtml(master.role + ': ' + master.name) + '">' +
      ui.escapeHtml(master.initials) + '</span>' +
      '</div>' +
      '<h3 class="card-title">' + ui.escapeHtml(order.title) + '</h3>' +
      '<p class="card-desc">' + ui.escapeHtml(order.desc) + '</p>' +
      labels + car + progress + subtasks + client +
      '<div class="card-foot">' + foot + '</div>' +
      '</article>';
  }

  function columnHtml(stage, allCount, cards) {
    const emptyText = allCount === 0 ? 'Пока нет заказов' : 'Ничего не найдено';
    return '<section class="col" data-stage="' + ui.escapeHtml(stage.id) + '">' +
      '<header class="col-head">' +
      '<span class="col-dot" style="background:' + ui.escapeHtml(stage.color) + '"></span>' +
      '<span class="col-name">' + ui.escapeHtml(stage.name) + '</span>' +
      '<span class="col-count">' + cards.length + '</span>' +
      (stage.wip ? '<span class="col-wip' + (stage.wipOver ? ' is-over' : '') + '">' + ui.escapeHtml(stage.wip) + '</span>' : '') +
      '</header>' +
      '<div class="col-body">' +
      cards.map(cardHtml).join('') +
      (cards.length ? '' : '<div class="col-empty">' + emptyText + '</div>') +
      '<button class="col-add" type="button" data-stage="' + ui.escapeHtml(stage.id) + '">' +
      ui.icon('plus') + 'Добавить заказ-наряд</button>' +
      '</div></section>';
  }

  function updateSummary(allOrders, visibleOrders) {
    totalEl.textContent = visibleOrders.length;
    totalEl.title = visibleOrders.length === allOrders.length
      ? 'Всего заказ-нарядов: ' + allOrders.length
      : visibleOrders.length + ' из ' + allOrders.length;
    if (sidebarCountEl) sidebarCountEl.textContent = visibleOrders.length;
    if (overdueEl) overdueEl.textContent = allOrders.filter(isLate).length;
    if (filterSummaryEl) {
      const active = state.priorities.size + (state.overdue ? 1 : 0);
      filterSummaryEl.textContent = active ? visibleOrders.length + ' из ' + allOrders.length : '';
    }
  }

  function render() {
    const scrollLeft = boardEl.scrollLeft;
    const allOrders = GP.store.all();
    const visibleOrders = [];
    let html = '';

    STAGES.forEach(function (stage) {
      const inStage = allOrders.filter(function (order) { return order.stage === stage.id; });
      const shown = inStage.filter(matches);
      visibleOrders.push.apply(visibleOrders, shown);
      html += columnHtml(stage, inStage.length, shown);
    });

    boardEl.innerHTML = html;
    boardEl.scrollLeft = scrollLeft;
    updateSummary(allOrders, visibleOrders);

    if (state.highlight) {
      const key = state.highlight;
      state.highlight = null;
      const card = Array.prototype.find.call(boardEl.querySelectorAll('.card'), function (node) {
        return node.dataset.key === key;
      });
      if (card) {
        card.classList.add('card--flash');
        window.setTimeout(function () { card.classList.remove('card--flash'); }, 1800);
      }
    }
  }


  function setQuery(value) {
    state.query = String(value || '').trim().toLowerCase();
    render();
  }

  function setPriority(priority, enabled) {
    if (enabled) state.priorities.add(priority);
    else state.priorities.delete(priority);
    render();
  }

  function setOverdue(enabled) {
    state.overdue = Boolean(enabled);
    render();
  }

  function resetFilters() {
    state.priorities.clear();
    state.overdue = false;
    render();
  }

  function activeFilterCount() {
    return state.priorities.size + (state.overdue ? 1 : 0);
  }

  boardEl.addEventListener('click', function (event) {
    const card = event.target.closest('.card');
    if (card) {
      document.dispatchEvent(new CustomEvent('garagepro:order-open', { detail: { key: card.dataset.key } }));
      return;
    }
    const addButton = event.target.closest('.col-add');
    if (addButton) {
      document.dispatchEvent(new CustomEvent('garagepro:order-create', { detail: { stage: addButton.dataset.stage } }));
    }
  });

  boardEl.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.card');
    if (!card) return;
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('garagepro:order-open', { detail: { key: card.dataset.key } }));
  });

  GP.board = {
    render: render,
    setQuery: setQuery,
    setPriority: setPriority,
    setOverdue: setOverdue,
    resetFilters: resetFilters,
    activeFilterCount: activeFilterCount,
    setHighlight: function (key) { state.highlight = key; },
    isLate: isLate
  };
})();
