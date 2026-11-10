/* ============================================================
   GaragePro — admin dashboard
   Показатели берутся из общей доски (scripts/data.js + store.js).
   ============================================================ */
(function () {
  'use strict';
  const GP = window.GaragePro;
  const ui = GP.ui;
  const store = GP.store;
  const employees = GP.employees;
  const STAGES = GP.STAGES;
  const state = { query: '' };

  const STATUS_LABELS = {
    online: { text: 'В сети', className: 'team-status--online' },
    shift: { text: 'В смене', className: 'team-status--shift' },
    off: { text: 'Не в сети', className: '' }
  };

  ui.initTheme();

  function escape(value) {
    return ui.escapeHtml(value);
  }

  function footText(order, icon) {
    const item = (order.foot || []).find(function (entry) { return entry.icon === icon; });
    return item ? item.text : '';
  }

  function orderUrl(order) {
    return 'index.html#/order/' + encodeURIComponent(order.key);
  }

  function numericKey(key) {
    const match = String(key || '').match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  function currentUser() {
    const session = employees.getSession();
    if (session) return session;
    return employees.findByEmail('admin@garazapro.lv') || {
      name: 'Сергей Ильин', initials: 'СИ', role: 'Администратор', roleId: 'admin', av: 9
    };
  }

  function applyUser(user) {
    const initials = user.initials || 'СИ';
    const av = user.av || 9;
    const greeting = document.getElementById('admin-greeting');
    const avatar = document.getElementById('admin-avatar');
    const sideAvatar = document.getElementById('side-avatar');
    const sideName = document.getElementById('side-name');
    const sideRole = document.getElementById('side-role');
    const firstName = String(user.name || 'Сергей').split(' ')[0];
    const hour = new Date().getHours();
    const phrase = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

    greeting.textContent = phrase + ', ' + firstName;
    avatar.textContent = initials;
    avatar.className = 'avatar av-' + av;
    avatar.title = user.role + ': ' + user.name;
    sideAvatar.textContent = initials;
    sideAvatar.className = 'avatar av-' + av;
    sideName.textContent = user.name;
    sideRole.textContent = user.role;
  }

  function renderStats() {
    const orders = store.all();
    const total = orders.length;
    const active = orders.filter(function (order) { return order.stage !== 'closed'; }).length;
    const late = orders.filter(function (order) { return ui.isOrderLate(order); }).length;
    const revenue = orders.reduce(function (sum, order) { return sum + ui.orderPrice(order); }, 0);
    const newCount = orders.filter(function (order) { return order.stage === 'new'; }).length;
    const repairCount = orders.filter(function (order) { return order.stage === 'repair'; }).length;
    const closed = orders.filter(function (order) { return order.stage === 'closed'; }).length;

    document.getElementById('stat-orders').textContent = total;
    document.getElementById('stat-orders-foot').textContent = newCount + ' в новых заявках · ' + closed + ' закрыто';
    document.getElementById('stat-active').textContent = active;
    document.getElementById('stat-active-foot').textContent = repairCount + ' сейчас в ремонте';
    document.getElementById('stat-late').textContent = late;
    document.getElementById('stat-late-foot').innerHTML = late
      ? '<span class="warn">Нужно связаться с клиентами</span>'
      : 'Просрочек нет';
    document.getElementById('stat-revenue').textContent = ui.formatMoney(revenue);
    document.getElementById('stat-revenue-foot').textContent = 'По ' + total + ' заказ-нарядам';

    document.getElementById('nav-orders-count').textContent = total;
    document.getElementById('overdue-count').textContent = late;
    document.getElementById('admin-date').textContent = 'Показатели сервис-центра · ' + ui.longDate(new Date());
  }

  function renderStageChart() {
    const orders = store.all();
    const counts = STAGES.map(function (stage) {
      return {
        stage: stage,
        count: orders.filter(function (order) { return order.stage === stage.id; }).length
      };
    });
    const max = Math.max.apply(null, counts.map(function (item) { return item.count; }).concat([1]));
    document.getElementById('stage-chart').innerHTML = counts.map(function (item) {
      const width = item.count ? Math.max(6, Math.round(item.count / max * 100)) : 0;
      return '<div class="stage-row">' +
        '<span class="stage-name"><span class="stage-dot" style="background:' + escape(item.stage.color) + '"></span>' + escape(item.stage.name) + '</span>' +
        '<span class="stage-track"><span class="stage-fill" style="width:' + width + '%;background:' + escape(item.stage.color) + '"></span></span>' +
        '<span class="stage-count">' + item.count + '</span>' +
        '</div>';
    }).join('');

  }

  function renderOverdue() {
    const overdue = store.all().filter(function (order) { return ui.isOrderLate(order); });
    const list = document.getElementById('overdue-list');
    document.getElementById('overdue-count').textContent = overdue.length;
    if (!overdue.length) {
      list.innerHTML = '<div class="issue-empty">Просроченных заказ-нарядов нет</div>';
      return;
    }
    list.innerHTML = overdue.map(function (order) {
      const due = footText(order, 'clock').replace(/^(срок|выдача)\s+/i, '');
      return '<a class="issue-row" href="' + orderUrl(order) + '">' +
        '<span class="issue-icon"><svg class="ico" aria-hidden="true"><use href="#i-alert"/></svg></span>' +
        '<span class="issue-body">' +
        '<span class="issue-key">' + escape(order.key) + '</span>' +
        '<span class="issue-title">' + escape(order.title) + '</span>' +
        '<span class="issue-meta">' + escape(order.client) + (due ? ' · ' + escape(due) : '') + '</span>' +
        '</span></a>';
    }).join('');
  }

  function matchesQuery(order) {
    if (!state.query) return true;
    return [
      order.key, order.title, order.client, order.phone, order.plate, order.meta,
      (order.master || {}).name
    ].join(' ').toLowerCase().indexOf(state.query) !== -1;
  }

  function renderRecent() {
    const body = document.getElementById('recent-orders-body');
    const orders = store.all().filter(matchesQuery).sort(function (a, b) {
      return numericKey(b.key) - numericKey(a.key);
    }).slice(0, 6);

    if (!orders.length) {
      body.innerHTML = '<tr><td colspan="5" class="table-empty">Ничего не найдено</td></tr>';
      return;
    }

    body.innerHTML = orders.map(function (order) {
      const stage = STAGES.find(function (item) { return item.id === order.stage; }) || STAGES[0];
      const price = footText(order, 'euro') || '—';
      return '<tr>' +
        '<td><a class="table-key" href="' + orderUrl(order) + '">' + escape(order.key) + '</a></td>' +
        '<td><div class="table-car"><b>' + escape(order.title) + '</b><span>' + escape(order.plate || '') + '</span></div></td>' +
        '<td class="muted-cell">' + escape(order.client) + '</td>' +
        '<td><span class="status-pill"><span class="status-dot" style="background:' + escape(stage.color) + '"></span>' + escape(stage.name) + '</span></td>' +
        '<td class="num">' + escape(price) + '</td>' +
        '</tr>';
    }).join('');
  }

  function matchesEmployee(employee) {
    if (!state.query) return true;
    return [employee.name, employee.role, employee.email]
      .join(' ').toLowerCase().indexOf(state.query) !== -1;
  }

  function renderTeam() {
    const list = document.getElementById('team-list');
    const all = employees.all();
    const visible = all.filter(matchesEmployee);
    document.getElementById('nav-employees-count').textContent = all.length;

    if (!visible.length) {
      list.innerHTML = '<div class="issue-empty">Сотрудники не найдены</div>';
      return;
    }

    list.innerHTML = visible.map(function (employee) {
      const status = STATUS_LABELS[employee.status] || STATUS_LABELS.off;
      return '<div class="team-row">' +
        '<span class="avatar av-' + (employee.av || 9) + '">' + escape(employee.initials || '—') + '</span>' +
        '<span class="team-info"><b>' + escape(employee.name) + '</b><span>' + escape(employee.role) + ' · ' + escape(employee.email) + '</span></span>' +
        '<span class="team-status ' + status.className + '"><span class="dot"></span>' + status.text + '</span>' +
        '</div>';
    }).join('');
  }

  function initMenu() {
    const side = document.getElementById('admin-side');
    const overlay = document.getElementById('admin-overlay');
    const menuBtn = document.getElementById('admin-menu-btn');
    const closeBtn = document.getElementById('admin-close');
    if (!side || !overlay || !menuBtn) return;

    function setMenu(open) {
      side.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      overlay.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
    }

    menuBtn.addEventListener('click', function () { setMenu(!side.classList.contains('is-open')); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
    overlay.addEventListener('click', function () { setMenu(false); });
    side.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && side.classList.contains('is-open')) setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && side.classList.contains('is-open')) setMenu(false);
    });
  }

  function initSearch() {
    const input = document.getElementById('global-search');
    if (!input) return;
    input.addEventListener('input', function () {
      state.query = input.value.trim().toLowerCase();
      renderRecent();
      renderTeam();
    });
    input.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !input.value) return;
      input.value = '';
      state.query = '';
      renderRecent();
      renderTeam();
      event.stopPropagation();
    });
  }

  function initLinks() {
    document.querySelectorAll('[data-demo]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        ui.toast('Раздел появится в следующей версии');
      });
    });
    const bell = document.getElementById('admin-bell');
    if (bell) bell.addEventListener('click', function () { ui.toast('Новых уведомлений нет'); });
    const logout = document.getElementById('logout-btn');
    if (logout) {
      logout.addEventListener('click', function (event) {
        event.preventDefault();
        employees.clearSession();
        window.location.href = 'login.html';
      });
    }
  }

  function renderAll() {
    renderStats();
    renderStageChart();
    renderOverdue();
    renderRecent();
    renderTeam();
  }

  function init() {
    const session = employees.getSession();
    if (session && session.roleId !== 'admin') {
      window.location.replace('index.html');
      return;
    }
    applyUser(currentUser());
    initMenu();
    initSearch();
    initLinks();
    renderAll();
    document.addEventListener('garagepro:orders-changed', renderAll);
    document.addEventListener('garagepro:employees-changed', function () {
      renderTeam();
      document.getElementById('nav-employees-count').textContent = employees.all().length;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
