/* Ставит тему до первой отрисовки, чтобы не было вспышки светлой темы. */
(function () {
  'use strict';
  try {
    if (window.localStorage.getItem('garagepro.theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (error) { /* хранилище недоступно */ }
})();
