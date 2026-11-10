/* ============================================================
   GaragePro — main
   Инициализация страницы и связка модулей.
   ============================================================ */
(function () {
  'use strict';
  const GP = window.GaragePro;
  const ui = GP.ui;

  function init() {
    const searchInput = document.getElementById('global-search');
    const createButton = document.getElementById('create-order-btn');
    const filterButton = document.getElementById('filter-btn');
    const filterPop = document.getElementById('filter-pop');
    const filterCount = document.getElementById('filter-count');
    const filterOverdue = document.getElementById('filter-overdue');
    const filterReset = document.getElementById('filter-reset');
    const priorityInputs = Array.prototype.slice.call(document.querySelectorAll('[data-priority]'));
    const dateLabel = document.getElementById('workspace-date');

    ui.initTheme();

    const session = GP.employees ? GP.employees.getSession() : null;
    const currentAvatar = document.getElementById('current-avatar');
    if (session && currentAvatar) {
      currentAvatar.textContent = session.initials || 'СИ';
      currentAvatar.className = 'avatar av-' + (session.av || 9);
      currentAvatar.title = session.role + ': ' + session.name;
      currentAvatar.href = session.roleId === 'admin' ? 'admin.html' : 'index.html';
    }

    GP.modals.init();
    GP.board.render();

    if (dateLabel) dateLabel.textContent = 'Сервис-центр «Рига» · ' + ui.longDate(new Date());

    /* ---------- создание из шапки ---------- */
    createButton.addEventListener('click', function () { GP.modals.openCreate('new'); });

    /* ---------- события доски ---------- */
    document.addEventListener('garagepro:order-open', function (event) {
      GP.modals.openView(event.detail.key);
    });
    document.addEventListener('garagepro:order-create', function (event) {
      GP.modals.openCreate(event.detail.stage);
    });
    document.addEventListener('garagepro:orders-changed', function () {
      GP.board.render();
    });

    /* ---------- поиск ---------- */
    searchInput.addEventListener('input', function () {
      GP.board.setQuery(searchInput.value);
    });
    searchInput.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !searchInput.value) return;
      searchInput.value = '';
      GP.board.setQuery('');
      event.stopPropagation();
    });

    /* ---------- фильтры ---------- */
    function openFilter(open) {
      filterPop.hidden = !open;
      filterButton.setAttribute('aria-expanded', String(open));
    }

    function syncFilterUi() {
      const active = GP.board.activeFilterCount();
      filterCount.hidden = active === 0;
      filterCount.textContent = active;
      filterButton.classList.toggle('is-active', active > 0);
      filterButton.setAttribute('aria-label', active ? 'Фильтры, активно: ' + active : 'Фильтры');
    }

    filterButton.addEventListener('click', function () {
      openFilter(filterPop.hidden);
    });

    priorityInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        GP.board.setPriority(input.value, input.checked);
        syncFilterUi();
      });
    });

    filterOverdue.addEventListener('change', function () {
      GP.board.setOverdue(filterOverdue.checked);
      syncFilterUi();
    });

    filterReset.addEventListener('click', function () {
      priorityInputs.forEach(function (input) { input.checked = false; });
      filterOverdue.checked = false;
      GP.board.resetFilters();
      syncFilterUi();
    });

    document.addEventListener('click', function (event) {
      if (filterPop.hidden || event.target.closest('.filter-wrap')) return;
      openFilter(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || filterPop.hidden) return;
      openFilter(false);
      filterButton.focus();
    });

    syncFilterUi();

    /* ---------- демо-ссылки без переходов ---------- */
    document.addEventListener('click', function (event) {
      const link = event.target.closest('a[href="#"]');
      if (link) event.preventDefault();
    });

    const bell = document.querySelector('.topbar [aria-label="Уведомления"]');
    if (bell) {
      bell.addEventListener('click', function () { ui.toast('Новых уведомлений нет'); });
    }

    /* ---------- deep links: #/new и #/order/ЗН-2851 ---------- */
    function handleHash() {
      const hash = window.location.hash || '';
      if (hash === '#/new') {
        GP.modals.openCreate('new');
        return;
      }
      const match = hash.match(/^#\/order\/(.+)$/);
      if (!match) return;
      try {
        GP.modals.openView(decodeURIComponent(match[1]));
      } catch (error) {
        /* некорректный адрес — просто остаёмся на доске */
      }
    }

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
