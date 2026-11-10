/* ============================================================
   GaragePro — auth
   Вход и создание аккаунта сотрудника. Демо-режим без бэкенда.
   ============================================================ */
(function () {
  'use strict';
  const GP = window.GaragePro;
  const ui = GP.ui;
  const employees = GP.employees;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const INVITE_CODE = 'GARAGE-2026';
  const ROLE_LABELS = {
    master: 'Мастер-приёмщик',
    mechanic: 'Мастер слесарного цеха',
    diagnost: 'Диагност',
    warehouse: 'Кладовщик',
    manager: 'Менеджер',
    admin: 'Администратор'
  };

  function field(name) {
    return document.querySelector('[data-field="' + name + '"]');
  }

  function setError(name, message) {
    const wrapper = field(name);
    if (!wrapper) return;
    wrapper.classList.add('has-error');
    const input = wrapper.querySelector('input,select,textarea');
    if (input) input.setAttribute('aria-invalid', 'true');
    const error = wrapper.querySelector('.field-error');
    if (error && message) error.textContent = message;
  }

  function clearError(name) {
    const wrapper = field(name);
    if (!wrapper) return;
    wrapper.classList.remove('has-error');
    const input = wrapper.querySelector('input,select,textarea');
    if (input) input.removeAttribute('aria-invalid');
  }

  function bindClear(form) {
    function handler(event) {
      const wrapper = event.target.closest('[data-field]');
      if (wrapper) clearError(wrapper.dataset.field);
    }
    form.addEventListener('input', handler);
    form.addEventListener('change', handler);
  }

  function validate(rules) {
    let firstInvalid = null;
    rules.forEach(function (rule) {
      const wrapper = field(rule.name);
      if (!wrapper) return;
      const input = wrapper.querySelector('input,select,textarea');
      const value = input
        ? (input.type === 'checkbox' ? input.checked : input.value)
        : '';
      const isValid = rule.test(value);
      if (isValid) {
        clearError(rule.name);
      } else {
        setError(rule.name, typeof rule.message === 'function' ? rule.message() : rule.message);
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

  function initPasswordToggles() {
    document.querySelectorAll('[data-password-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        const input = document.getElementById(button.dataset.passwordToggle);
        if (!input) return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        button.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
        const use = button.querySelector('use');
        if (use) use.setAttribute('href', show ? '#i-eye-off' : '#i-eye');
      });
    });
  }

  function initDemoLinks() {
    document.querySelectorAll('[data-demo-link]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        ui.toast('Раздел с правилами доступа появится позже');
      });
    });
  }

  function initLogin() {
    const form = document.getElementById('login-form');
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    const remember = document.getElementById('login-remember');
    const alertBox = document.getElementById('login-alert');
    const alertText = document.getElementById('login-alert-text');
    const submit = document.getElementById('login-submit');

    bindClear(form);
    try {
      const lastEmail = window.localStorage.getItem('garagepro.lastEmail');
      if (lastEmail) {
        email.value = lastEmail;
        remember.checked = true;
      }
    } catch (error) { /* ignore */ }

    document.getElementById('fill-demo').addEventListener('click', function () {
      email.value = 'admin@garazapro.lv';
      password.value = 'admin123';
      clearError('email');
      clearError('password');
      alertBox.hidden = true;
      password.focus();
    });

    document.getElementById('forgot-password').addEventListener('click', function () {
      const value = email.value.trim();
      if (!EMAIL_RE.test(value)) {
        setError('email', 'Сначала укажите рабочий e-mail');
        email.focus();
        return;
      }
      ui.toast('Ссылка для восстановления отправлена на ' + value);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      alertBox.hidden = true;
      const valid = validate([
        { name: 'email', test: function (value) { return EMAIL_RE.test(value.trim()); }, message: 'Введите корректный e-mail' },
        { name: 'password', test: function (value) { return value.length >= 6; }, message: 'Введите пароль (минимум 6 символов)' }
      ]);
      if (!valid) return;

      const emailValue = email.value.trim().toLowerCase();
      const employee = employees.findByEmail(emailValue);
      if (!employee) {
        alertText.innerHTML = 'Аккаунт с таким e-mail не найден. <a href="register.html">Создать аккаунт сотрудника</a>.';
        alertBox.hidden = false;
        return;
      }

      if (remember.checked) {
        try { window.localStorage.setItem('garagepro.lastEmail', emailValue); } catch (error) { /* ignore */ }
      } else {
        try { window.localStorage.removeItem('garagepro.lastEmail'); } catch (error) { /* ignore */ }
      }

      employees.setSession({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        roleId: employee.roleId,
        initials: employee.initials,
        av: employee.av
      });

      submit.disabled = true;
      submit.querySelector('span').textContent = 'Входим…';
      window.setTimeout(function () {
        window.location.href = employee.roleId === 'admin' ? 'admin.html' : 'index.html';
      }, 320);
    });
  }

  function passwordScore(value) {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-ZА-Я]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-zА-Яа-я0-9]/.test(value)) score += 1;
    return score;
  }

  function updateLiveEmployees() {
    document.querySelectorAll('[data-live-employees]').forEach(function (node) {
      node.textContent = employees.all().length;
    });
  }

  function initRegister() {
    const form = document.getElementById('register-form');
    const head = document.getElementById('register-head');
    const switchRow = document.getElementById('register-switch');
    const success = document.getElementById('register-success');
    const successText = document.getElementById('success-text');
    const successAvatar = document.getElementById('success-avatar');
    const successName = document.getElementById('success-name');
    const successRole = document.getElementById('success-role');
    const firstName = document.getElementById('reg-first-name');
    const lastName = document.getElementById('reg-last-name');
    const email = document.getElementById('reg-email');
    const phone = document.getElementById('reg-phone');
    const role = document.getElementById('reg-role');
    const invite = document.getElementById('reg-invite');
    const password = document.getElementById('reg-password');
    const confirm = document.getElementById('reg-confirm');
    const meter = document.getElementById('pw-meter');
    const meterSegments = Array.prototype.slice.call(meter.querySelectorAll('span'));
    const meterHint = document.getElementById('pw-hint');

    bindClear(form);

    phone.addEventListener('input', function () {
      phone.value = ui.formatPhone(phone.value);
    });

    invite.addEventListener('input', function () {
      invite.value = invite.value.toUpperCase().replace(/\s+/g, '');
      clearError('invite');
    });

    function updateMeter() {
      const score = passwordScore(password.value);
      meter.dataset.score = score;
      meterSegments.forEach(function (segment, index) {
        segment.classList.toggle('is-on', index < score);
      });
      if (!password.value) meterHint.textContent = 'Минимум 8 символов, заглавные буквы и цифры';
      else if (score <= 2) meterHint.textContent = 'Добавьте заглавные буквы, цифры или символы';
      else if (score === 3) meterHint.textContent = 'Хороший пароль';
      else meterHint.textContent = 'Надёжный пароль';
    }
    password.addEventListener('input', updateMeter);

    function resetRegister() {
      form.reset();
      ['firstName', 'lastName', 'email', 'phone', 'role', 'invite', 'password', 'confirm', 'terms'].forEach(clearError);
      updateMeter();
      head.hidden = false;
      form.hidden = false;
      switchRow.hidden = false;
      success.hidden = true;
      firstName.focus();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const valid = validate([
        { name: 'firstName', test: function (value) { return value.trim().length >= 2; }, message: 'Укажите имя' },
        { name: 'lastName', test: function (value) { return value.trim().length >= 2; }, message: 'Укажите фамилию' },
        { name: 'email', test: function (value) { return EMAIL_RE.test(value.trim()); }, message: 'Введите корректный e-mail' },
        { name: 'phone', test: function (value) { return ui.isValidPhone(value); }, message: 'Введите номер в формате +371 26 123 456' },
        { name: 'role', test: function (value) { return Boolean(ROLE_LABELS[value]); }, message: 'Выберите роль' },
        { name: 'invite', test: function (value) { return value.trim().toUpperCase() === INVITE_CODE; }, message: 'Неверный код приглашения' },
        { name: 'password', test: function (value) { return value.length >= 8 && /[A-ZА-Я]/.test(value) && /\d/.test(value); }, message: 'Минимум 8 символов, заглавная буква и цифра' },
        { name: 'confirm', test: function (value) { return value.length >= 8 && value === password.value; }, message: 'Пароли не совпадают' },
        { name: 'terms', test: function (value) { return value === true; }, message: 'Подтвердите согласие' }
      ]);
      if (!valid) return;

      const emailValue = email.value.trim().toLowerCase();
      if (employees.findByEmail(emailValue)) {
        setError('email', 'Сотрудник с таким e-mail уже есть');
        email.focus();
        return;
      }

      const first = firstName.value.trim();
      const last = lastName.value.trim();
      const roleId = role.value;
      const employee = employees.add({
        name: first + ' ' + last,
        initials: (first.charAt(0) + last.charAt(0)).toUpperCase(),
        role: ROLE_LABELS[roleId],
        roleId: roleId,
        email: emailValue,
        phone: ui.formatPhone(phone.value),
        status: 'online'
      });
      if (!employee) {
        setError('email', 'Не удалось создать аккаунт с таким e-mail');
        return;
      }

      employees.setSession({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        roleId: employee.roleId,
        initials: employee.initials,
        av: employee.av
      });

      successText.textContent = 'Аккаунт ' + employee.name + ' создан. Сотрудник сможет войти с корпоративным e-mail.';
      successAvatar.className = 'avatar av-' + employee.av;
      successAvatar.textContent = employee.initials;
      successName.textContent = employee.name;
      successRole.textContent = employee.role + ' · ' + employee.email;
      const action = document.getElementById('success-action');
      if (action) {
        action.href = employee.roleId === 'admin' ? 'admin.html' : 'index.html';
        action.textContent = employee.roleId === 'admin' ? 'В админ-панель' : 'На доску';
      }
      head.hidden = true;
      form.hidden = true;
      switchRow.hidden = true;
      success.hidden = false;
      updateLiveEmployees();
      success.scrollIntoView({ block: 'center', behavior: 'smooth' });
      ui.toast('Аккаунт ' + employee.name + ' создан');
    });

    document.getElementById('create-another').addEventListener('click', resetRegister);
  }

  initPasswordToggles();
  initDemoLinks();
  updateLiveEmployees();
  ui.initTheme();
  if (document.body.dataset.page === 'login') initLogin();
  if (document.body.dataset.page === 'register') initRegister();
})();
