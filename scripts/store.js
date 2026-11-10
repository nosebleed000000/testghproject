/* ============================================================
   GaragePro — store
   Демо-данные + сохранение изменений в localStorage.
   После любого изменения отправляется событие
   «garagepro:orders-changed» — доска перерисовывается сама.
   ============================================================ */
(function () {
  'use strict';
  const GP = window.GaragePro;
  const KEY = 'garagepro.orders.v2';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function read() {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (error) {
      /* приватный режим или отключённое хранилище — работаем в памяти */
    }
    return clone(GP.SEED_ORDERS);
  }

  let orders = read();

  function persist() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(orders));
    } catch (error) {
      /* данные останутся в памяти до перезагрузки */
    }
    document.dispatchEvent(new CustomEvent('garagepro:orders-changed'));
  }

  function all() {
    return orders;
  }

  function get(key) {
    return orders.find(function (order) { return order.key === key; }) || null;
  }

  function nextKey() {
    const max = orders.reduce(function (acc, order) {
      const match = String(order.key || '').match(/(\d+)\s*$/);
      return match ? Math.max(acc, Number(match[1])) : acc;
    }, 2800);
    return 'ЗН-' + (max + 1);
  }

  function add(order) {
    orders.unshift(order);
    persist();
    return order;
  }

  function update(key, patch) {
    const order = get(key);
    if (!order) return null;
    Object.assign(order, patch);
    persist();
    return order;
  }

  function reset() {
    orders = clone(GP.SEED_ORDERS);
    try {
      window.localStorage.removeItem(KEY);
    } catch (error) {
      /* ignore */
    }
    persist();
  }

  window.addEventListener('storage', function (event) {
    if (event.key !== KEY) return;
    orders = read();
    document.dispatchEvent(new CustomEvent('garagepro:orders-changed'));
  });

  GP.store = {
    KEY: KEY,
    all: all,
    get: get,
    nextKey: nextKey,
    add: add,
    update: update,
    reset: reset
  };
})();
