/* ============================================================
   GaragePro — UI helpers
   Экранирование, форматирование, иконки, toast.
   Зависимостей нет: работает как обычный classic script.
   ============================================================ */
(function () {
  'use strict';
  const GP = window.GaragePro = window.GaragePro || {};

  const PRIORITY_LABEL = { high: 'Высокий', med: 'Средний', low: 'Низкий' };
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function icon(name, extraClass) {
    return '<svg class="ico' + (extraClass ? ' ' + extraClass : '') +
      '" aria-hidden="true"><use href="#i-' + escapeHtml(name) + '"/></svg>';
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatMoney(value) {
    const number = Number(value) || 0;
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(number);
  }

  function formatNumber(value) {
    const number = Number(value) || 0;
    return new Intl.NumberFormat('lv-LV').format(number);
  }

  /* Латвия: +371 и 8 цифр национального номера (мобильные — 2xx xx xxx) */
  function normalizePhone(value) {
    let digits = String(value || '').replace(/\D/g, '');
    const hasCountryCode = digits.indexOf('371') === 0;
    if (digits.indexOf('00371') === 0) digits = digits.slice(5);
    else if (hasCountryCode && digits.length > 8) digits = digits.slice(3);
    if (hasCountryCode && digits.length > 8) digits = digits.slice(0, 8);
    return digits;
  }

  function formatPhone(value) {
    const digits = normalizePhone(value);
    if (!digits) return '';
    if (digits.length > 8) return '+' + digits;
    let out = '+371';
    if (digits.length) out += ' ' + digits.slice(0, 2);
    if (digits.length > 2) out += ' ' + digits.slice(2, 5);
    if (digits.length > 5) out += ' ' + digits.slice(5, 8);
    return out;
  }

  function isValidPhone(value) {
    return normalizePhone(value).length === 8;
  }

  function isPhoneLike(value) {
    const text = String(value || '').trim();
    if (!text) return false;
    return /^[+\d\s()\-]+$/.test(text) && text.replace(/\D/g, '').length >= 8;
  }

  function telHref(value) {
    const digits = normalizePhone(value);
    return digits.length === 8 ? 'tel:+371' + digits : '';
  }

  function toISODate(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function addDays(date, days) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  function shortDate(isoDate) {
    const parts = String(isoDate || '').split('-');
    if (parts.length !== 3) return '';
    return parts[2] + '.' + parts[1];
  }

  function createdAtLabel(date) {
    const d = date || new Date();
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function longDate(date) {
    const d = date || new Date();
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function priorityLabel(priority) {
    return PRIORITY_LABEL[priority] || PRIORITY_LABEL.med;
  }

  function isOrderLate(order) {
    if (!order || order.done || order.stage === 'closed') return false;
    if (order.late) return true;
    if (order.dueISO) {
      const parts = order.dueISO.split('-').map(Number);
      if (parts.length === 3) {
        const due = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
        return due < new Date();
      }
    }
    return false;
  }

  function orderPrice(order) {
    const price = (order && order.foot || []).find(function (item) { return item.icon === 'euro'; });
    return price ? Number(String(price.text).replace(/[^\d]/g, '')) || 0 : 0;
  }

  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle || toggle.dataset.themeReady === '1') return;
    toggle.dataset.themeReady = '1';
    let saved = null;
    try { saved = window.localStorage.getItem('garagepro.theme'); } catch (error) { /* ignore */ }
    toggle.checked = document.documentElement.getAttribute('data-theme') === 'dark' || saved === 'dark';
    toggle.addEventListener('change', function () {
      const dark = toggle.checked;
      if (dark) document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      try {
        window.localStorage.setItem('garagepro.theme', dark ? 'dark' : 'light');
      } catch (error) { /* ignore */ }
    });
  }

  function toast(message) {
    const region = document.getElementById('toast-region');
    if (!region) return;
    if (typeof region.showPopover === 'function') {
      try {
        if (!region.matches(':popover-open')) region.showPopover();
      } catch (error) { /* popover API недоступен */ }
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon('check-circle') + '<span>' + escapeHtml(message) + '</span>';
    region.appendChild(el);
    window.setTimeout(function () {
      el.remove();
      if (region.children.length || typeof region.hidePopover !== 'function') return;
      try { region.hidePopover(); } catch (error) { /* уже закрыт */ }
    }, 3600);
  }

  GP.ui = {
    escapeHtml: escapeHtml,
    icon: icon,
    formatMoney: formatMoney,
    formatNumber: formatNumber,
    normalizePhone: normalizePhone,
    formatPhone: formatPhone,
    isValidPhone: isValidPhone,
    isPhoneLike: isPhoneLike,
    telHref: telHref,
    toISODate: toISODate,
    addDays: addDays,
    shortDate: shortDate,
    createdAtLabel: createdAtLabel,
    longDate: longDate,
    priorityLabel: priorityLabel,
    isOrderLate: isOrderLate,
    orderPrice: orderPrice,
    initTheme: initTheme,
    toast: toast
  };
})();
