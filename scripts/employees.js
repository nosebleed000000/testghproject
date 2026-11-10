/* ============================================================
   GaragePro — employees & session
   Аккаунты сотрудников хранятся в localStorage и используются
   страницей регистрации и админ-дашбордом.
   ============================================================ */
(function () {
  'use strict';
  const GP = window.GaragePro;
  const KEY = 'garagepro.employees.v1';
  const SESSION_KEY = 'garagepro.session';
  const MASTER_META = {
    ik: { email: 'igor.kovalev@garazapro.lv', phone: '+371 26 000 011', status: 'online' },
    ps: { email: 'petr.sazonov@garazapro.lv', phone: '+371 26 000 012', status: 'online' },
    ag: { email: 'artem.gusev@garazapro.lv', phone: '+371 26 000 013', status: 'shift' },
    ml: { email: 'marina.litvinova@garazapro.lv', phone: '+371 26 000 014', status: 'online' },
    rd: { email: 'roman.dyakov@garazapro.lv', phone: '+371 26 000 015', status: 'off' }
  };

  function seedEmployees() {
    const list = [{
      id: 'admin',
      name: 'Сергей Ильин',
      initials: 'СИ',
      role: 'Администратор',
      roleId: 'admin',
      email: 'admin@garazapro.lv',
      phone: '+371 26 000 001',
      av: 9,
      status: 'online'
    }];
    (GP.MASTERS || []).forEach(function (master) {
      const meta = MASTER_META[master.id] || {
        email: master.id + '@garazapro.lv',
        phone: '+371 26 000 000',
        status: 'off'
      };
      list.push({
        id: 'master-' + master.id,
        name: master.name,
        initials: master.initials,
        role: master.role,
        roleId: 'master',
        email: meta.email,
        phone: meta.phone,
        av: master.av,
        status: meta.status
      });
    });
    return list;
  }

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
    } catch (error) { /* ignore */ }
    return clone(seedEmployees());
  }

  let employees = read();

  function persist() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(employees));
    } catch (error) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('garagepro:employees-changed'));
  }

  function all() {
    return employees;
  }

  function findByEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    return employees.find(function (employee) {
      return String(employee.email || '').toLowerCase() === normalized;
    }) || null;
  }

  function add(data) {
    if (!data || findByEmail(data.email)) return null;
    const employee = {
      id: 'emp-' + Date.now(),
      name: data.name,
      initials: data.initials,
      role: data.role,
      roleId: data.roleId || 'master',
      email: String(data.email || '').trim().toLowerCase(),
      phone: data.phone || '',
      av: data.av || 1 + Math.floor(Math.random() * 8),
      status: data.status || 'online',
      createdAt: new Date().toISOString()
    };
    employees.unshift(employee);
    persist();
    return employee;
  }

  function remove(id) {
    const index = employees.findIndex(function (employee) { return employee.id === id; });
    if (index === -1 || employees[index].roleId === 'admin') return false;
    employees.splice(index, 1);
    persist();
    return true;
  }

  function reset() {
    employees = clone(seedEmployees());
    try { window.localStorage.removeItem(KEY); } catch (error) { /* ignore */ }
    persist();
  }

  function getSession() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) { return null; }
  }

  function setSession(session) {
    try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (error) { /* ignore */ }
  }

  function clearSession() {
    try { window.localStorage.removeItem(SESSION_KEY); } catch (error) { /* ignore */ }
  }

  window.addEventListener('storage', function (event) {
    if (event.key !== KEY) return;
    employees = read();
    document.dispatchEvent(new CustomEvent('garagepro:employees-changed'));
  });

  GP.employees = {
    KEY: KEY,
    all: all,
    add: add,
    remove: remove,
    findByEmail: findByEmail,
    reset: reset,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession
  };
})();
