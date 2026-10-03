/* ==========================================================
   Termoconversor — lógica de conversión e interacción
   JavaScript puro, sin dependencias.
   ========================================================== */
(function () {
  'use strict';

  /* ---------- Definición de escalas ---------- */
  var SCALES = {
    C: { name: 'Celsius', symbol: '°C', min: -273.15 },
    K: { name: 'Kelvin', symbol: 'K', min: 0 },
    F: { name: 'Fahrenheit', symbol: '°F', min: -459.67 },
    R: { name: 'Rankine', symbol: '°R', min: 0 }
  };

  /* ---------- Fórmulas directas (lo que se calcula es lo que se muestra) ----------
     text: fórmula general · sub: expresión con el valor sustituido · fn: cálculo */
  var FORMULAS = {
    'C>K': { text: 'K = °C + 273.15',            sub: function (v) { return v + ' + 273.15'; },              fn: function (v) { return v + 273.15; } },
    'K>C': { text: '°C = K − 273.15',            sub: function (v) { return v + ' − 273.15'; },              fn: function (v) { return v - 273.15; } },
    'C>F': { text: '°F = (°C × 9/5) + 32',       sub: function (v) { return '(' + v + ' × 9/5) + 32'; },     fn: function (v) { return (v * 9 / 5) + 32; } },
    'F>C': { text: '°C = (°F − 32) × 5/9',       sub: function (v) { return '(' + v + ' − 32) × 5/9'; },     fn: function (v) { return (v - 32) * 5 / 9; } },
    'C>R': { text: '°R = (°C + 273.15) × 9/5',   sub: function (v) { return '(' + v + ' + 273.15) × 9/5'; }, fn: function (v) { return (v + 273.15) * 9 / 5; } },
    'R>C': { text: '°C = (°R × 5/9) − 273.15',   sub: function (v) { return '(' + v + ' × 5/9) − 273.15'; }, fn: function (v) { return (v * 5 / 9) - 273.15; } },
    'K>R': { text: '°R = K × 9/5',               sub: function (v) { return v + ' × 9/5'; },                 fn: function (v) { return v * 9 / 5; } },
    'R>K': { text: 'K = °R × 5/9',               sub: function (v) { return v + ' × 5/9'; },                 fn: function (v) { return v * 5 / 9; } },
    'F>K': { text: 'K = (°F + 459.67) × 5/9',    sub: function (v) { return '(' + v + ' + 459.67) × 5/9'; }, fn: function (v) { return (v + 459.67) * 5 / 9; } },
    'K>F': { text: '°F = (K × 9/5) − 459.67',    sub: function (v) { return '(' + v + ' × 9/5) − 459.67'; }, fn: function (v) { return (v * 9 / 5) - 459.67; } },
    'F>R': { text: '°R = °F + 459.67',           sub: function (v) { return v + ' + 459.67'; },              fn: function (v) { return v + 459.67; } },
    'R>F': { text: '°F = °R − 459.67',           sub: function (v) { return v + ' − 459.67'; },              fn: function (v) { return v - 459.67; } }
  };

  var EPSILON = 1e-9;
  var MAX_ABS = 1e9;
  var MAX_HISTORY = 10;
  var AUTO_SAVE_MS = 1500;

  /* ---------- Funciones de conversión (puras) ---------- */
  function convert(value, from, to) {
    if (from === to) return value;
    var result = FORMULAS[from + '>' + to].fn(value);
    // Corrige ruido de coma flotante muy cerca del cero absoluto (ej.: -1e-14 K)
    var min = SCALES[to].min;
    if (result < min && result > min - EPSILON) result = min;
    if (Math.abs(result) < EPSILON) result = 0;
    return result;
  }

  function formulaText(from, to) {
    if (from === to) return SCALES[to].symbol + ' = ' + SCALES[from].symbol + '  (misma escala, sin cambio)';
    return FORMULAS[from + '>' + to].text;
  }

  function formulaSubstitution(value, from, to) {
    var v = value < 0 ? '(' + formatPlain(value) + ')' : formatPlain(value);
    if (from === to) return SCALES[to].symbol + ' = ' + v;
    return SCALES[to].symbol + ' = ' + FORMULAS[from + '>' + to].sub(v);
  }

  /* Número con hasta 6 decimales, sin ceros sobrantes (para la sustitución) */
  function formatPlain(n) {
    var s = Number(n.toFixed(6)).toString();
    return s.replace('-', '−');
  }

  /* Número con decimales fijos, evitando "-0.00" */
  function formatFixed(n, decimals) {
    var s = n.toFixed(decimals);
    if (/^-0(\.0+)?$/.test(s)) s = s.slice(1);
    return s.replace('-', '−');
  }

  function withUnit(text, scale) {
    return text + ' ' + SCALES[scale].symbol;
  }

  /* ---------- Color y categoría según temperatura (en °C) ---------- */
  var COLOR_STOPS = [
    { c: -100, rgb: [52, 72, 170] },
    { c: -20,  rgb: [47, 111, 214] },
    { c: 5,    rgb: [58, 160, 224] },
    { c: 18,   rgb: [26, 158, 143] },
    { c: 27,   rgb: [224, 154, 28] },
    { c: 45,   rgb: [232, 104, 40] },
    { c: 100,  rgb: [214, 64, 43] },
    { c: 400,  rgb: [168, 30, 50] }
  ];

  function colorFor(celsius) {
    if (celsius <= COLOR_STOPS[0].c) return COLOR_STOPS[0].rgb;
    var last = COLOR_STOPS[COLOR_STOPS.length - 1];
    if (celsius >= last.c) return last.rgb;
    for (var i = 0; i < COLOR_STOPS.length - 1; i++) {
      var a = COLOR_STOPS[i], b = COLOR_STOPS[i + 1];
      if (celsius >= a.c && celsius <= b.c) {
        var t = (celsius - a.c) / (b.c - a.c);
        return [0, 1, 2].map(function (k) { return Math.round(a.rgb[k] + (b.rgb[k] - a.rgb[k]) * t); });
      }
    }
    return last.rgb;
  }

  function categoryFor(celsius) {
    if (celsius < -100) return 'Criogénico';
    if (celsius < 0) return 'Bajo cero';
    if (celsius < 15) return 'Frío';
    if (celsius < 25) return 'Templado';
    if (celsius < 40) return 'Cálido';
    if (celsius < 100) return 'Caliente';
    return 'Muy caliente';
  }

  var REFERENCES = [
    { c: -273.15, label: 'el cero absoluto' },
    { c: -196, label: 'el nitrógeno líquido (−196 °C)' },
    { c: -78.5, label: 'el hielo seco (−78.5 °C)' },
    { c: -18, label: 'un congelador doméstico (−18 °C)' },
    { c: 0, label: 'el punto de congelación del agua (0 °C)' },
    { c: 22, label: 'la temperatura ambiente de un salón (≈22 °C)' },
    { c: 37, label: 'la temperatura del cuerpo humano (≈37 °C)' },
    { c: 60, label: 'el agua caliente de una ducha muy caliente (≈60 °C)' },
    { c: 100, label: 'el punto de ebullición del agua (100 °C)' },
    { c: 180, label: 'un horno de cocina (≈180 °C)' },
    { c: 1538, label: 'la fusión del hierro (≈1538 °C)' },
    { c: 5500, label: 'la superficie del Sol (≈5500 °C)' }
  ];

  function nearestReference(celsius) {
    var best = REFERENCES[0];
    for (var i = 1; i < REFERENCES.length; i++) {
      if (Math.abs(REFERENCES[i].c - celsius) < Math.abs(best.c - celsius)) best = REFERENCES[i];
    }
    return best;
  }

  /* Altura del termómetro: mapea −50 °C … 150 °C a 6 % … 100 % */
  function fillPercent(celsius) {
    var p = (celsius + 50) / 200;
    p = Math.max(0, Math.min(1, p));
    return 6 + p * 94;
  }

  /* ---------- Referencias al DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var form = $('convertForm');
  var input = $('tempInput');
  var fromSel = $('fromScale');
  var toSel = $('toScale');
  var decSel = $('decimals');
  var inputUnit = $('inputUnit');
  var inputHelp = $('inputHelp');
  var inputError = $('inputError');
  var swapBtn = $('swapBtn');
  var clearBtn = $('clearBtn');
  var copyBtn = $('copyBtn');
  var resultCard = $('resultCard');
  var resultValue = $('resultValue');
  var resultDetail = $('resultDetail');
  var thermoFill = $('thermoFill');
  var tempBadgeText = $('tempBadgeText');
  var tempReference = $('tempReference');
  var formulaEl = $('formulaText');
  var stepsEl = $('formulaSteps');
  var eqGrid = $('eqGrid');
  var historyList = $('historyList');
  var historyEmpty = $('historyEmpty');
  var clearHistoryBtn = $('clearHistoryBtn');
  var themeToggle = $('themeToggle');
  var toast = $('toast');
  var tryExampleBtn = $('tryExampleBtn');

  var NEUTRAL_RGB = '120, 132, 150';
  var DEFAULT_REFERENCE = tempReference.textContent;
  var history = [];
  var lastResult = null;
  var autoSaveTimer = null;
  var toastTimer = null;

  /* ---------- Lectura y validación de la entrada ---------- */
  function readInput() {
    var from = fromSel.value;
    var raw = input.value.trim();

    if (input.validity && input.validity.badInput) {
      return { state: 'error', msg: 'El valor ingresado no es un número válido. Usa dígitos, el signo menos (−) y el punto como separador decimal.' };
    }
    if (raw === '') return { state: 'empty' };

    var value = Number(raw);
    if (!Number.isFinite(value)) {
      return { state: 'error', msg: 'El valor ingresado no es un número válido.' };
    }
    if (Math.abs(value) > MAX_ABS) {
      return { state: 'error', msg: 'El valor está fuera del rango admitido (máximo ±1 000 000 000).' };
    }
    var min = SCALES[from].min;
    if (value < min - EPSILON) {
      return {
        state: 'error',
        msg: 'Ese valor está por debajo del cero absoluto. En ' + SCALES[from].name + ' el mínimo posible es ' +
             withUnit(formatPlain(min), from) + '.'
      };
    }
    return { state: 'ok', value: value };
  }

  /* ---------- Renderizado ---------- */
  function setTempColor(rgbString) {
    document.documentElement.style.setProperty('--temp-rgb', rgbString);
  }

  function updateScaleHints() {
    var from = fromSel.value;
    inputUnit.textContent = SCALES[from].symbol;
    inputHelp.textContent = 'Mínimo permitido: ' + withUnit(formatPlain(SCALES[from].min), from) + ' (cero absoluto).';
    input.setAttribute('min', String(SCALES[from].min));
  }

  function showError(msg) {
    inputError.textContent = msg;
    inputError.hidden = false;
    input.setAttribute('aria-invalid', 'true');
  }

  function hideError() {
    inputError.hidden = true;
    inputError.textContent = '';
    input.removeAttribute('aria-invalid');
  }

  function resetResultArea(detail, state) {
    resultCard.setAttribute('data-state', state);
    resultValue.textContent = '—';
    resultDetail.textContent = detail;
    copyBtn.disabled = true;
    lastResult = null;
    setTempColor(NEUTRAL_RGB);
    thermoFill.style.height = '6%';
    tempBadgeText.textContent = 'Sin dato';
    tempReference.textContent = DEFAULT_REFERENCE;
    stepsEl.textContent = 'Sustitución: ingresa un valor para ver el cálculo paso a paso.';
    var items = eqGrid.querySelectorAll('.eq-item');
    for (var i = 0; i < items.length; i++) {
      items[i].querySelector('.eq-value').textContent = '—';
      items[i].classList.toggle('is-target', items[i].getAttribute('data-scale') === toSel.value);
    }
  }

  function animatePop(el) {
    el.classList.remove('pop');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('pop');
  }

  function render() {
    var from = fromSel.value;
    var to = toSel.value;
    var decimals = parseInt(decSel.value, 10);

    updateScaleHints();
    formulaEl.textContent = formulaText(from, to);

    var data = readInput();

    if (data.state === 'empty') {
      hideError();
      resetResultArea('Ingresa una temperatura para comenzar.', 'empty');
      return null;
    }
    if (data.state === 'error') {
      showError(data.msg);
      resetResultArea('Corrige el valor de entrada para ver el resultado.', 'error');
      return null;
    }

    hideError();
    var value = data.value;
    var result = convert(value, from, to);
    var celsius = convert(value, from, 'C');
    var resultText = withUnit(formatFixed(result, decimals), to);
    var previous = resultValue.textContent;

    resultCard.setAttribute('data-state', 'ok');
    resultValue.textContent = resultText;
    if (previous !== resultText) animatePop(resultValue);

    resultDetail.textContent = withUnit(formatPlain(value), from) + ' equivalen a ' + resultText +
      (from === to ? ' (origen y destino son la misma escala).' : '.');

    stepsEl.textContent = 'Sustitución: ' + formulaSubstitution(value, from, to) + ' = ' + formatFixed(result, decimals);

    // Indicador visual
    var rgb = colorFor(celsius);
    setTempColor(rgb.join(', '));
    thermoFill.style.height = fillPercent(celsius).toFixed(1) + '%';
    tempBadgeText.textContent = categoryFor(celsius) + ' · ' + withUnit(formatFixed(celsius, decimals), 'C');
    tempReference.textContent = 'Referencia cercana: ' + nearestReference(celsius).label + '.';

    // Equivalencias
    var items = eqGrid.querySelectorAll('.eq-item');
    for (var i = 0; i < items.length; i++) {
      var sc = items[i].getAttribute('data-scale');
      items[i].querySelector('.eq-value').textContent = withUnit(formatFixed(convert(value, from, sc), decimals), sc);
      items[i].classList.toggle('is-target', sc === to);
    }

    copyBtn.disabled = false;
    lastResult = {
      value: value, from: from, to: to, result: result, decimals: decimals,
      text: withUnit(formatPlain(value), from) + ' → ' + resultText,
      resultText: resultText,
      rgb: rgb.join(', ')
    };
    return lastResult;
  }

  /* ---------- Historial ---------- */
  function addToHistory(entry) {
    if (!entry) return;
    var top = history[0];
    if (top && top.value === entry.value && top.from === entry.from && top.to === entry.to && top.decimals === entry.decimals) {
      return; // evita duplicados consecutivos
    }
    history.unshift({
      value: entry.value, from: entry.from, to: entry.to, decimals: entry.decimals,
      text: entry.text, rgb: entry.rgb,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    renderHistory();
  }

  function renderHistory() {
    historyList.textContent = '';
    historyEmpty.hidden = history.length > 0;
    clearHistoryBtn.disabled = history.length === 0;

    history.forEach(function (h, index) {
      var li = document.createElement('li');
      li.className = 'history-item';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.style.setProperty('--item-color', 'rgb(' + h.rgb + ')');
      btn.setAttribute('aria-label', 'Cargar conversión: ' + h.text + ', realizada a las ' + h.time);

      var wrap = document.createElement('span');
      wrap.className = 'history-text';
      var conv = document.createElement('span');
      conv.className = 'history-conv';
      conv.textContent = h.text;
      var meta = document.createElement('span');
      meta.className = 'history-meta';
      meta.textContent = '#' + (history.length - index) + ' · ' + SCALES[h.from].name + ' → ' + SCALES[h.to].name + ' · ' + h.time;

      wrap.appendChild(conv);
      wrap.appendChild(meta);
      btn.appendChild(wrap);
      btn.addEventListener('click', function () { loadEntry(h); });
      li.appendChild(btn);
      historyList.appendChild(li);
    });
  }

  function loadEntry(h) {
    input.value = String(h.value);
    fromSel.value = h.from;
    toSel.value = h.to;
    decSel.value = String(h.decimals);
    clearTimeout(autoSaveTimer);
    render();
    input.focus();
    showToast('Conversión cargada desde el historial');
  }

  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function () {
      if (lastResult) addToHistory(lastResult);
    }, AUTO_SAVE_MS);
  }

  /* ---------- Acciones ---------- */
  function doConvert() {
    clearTimeout(autoSaveTimer);
    var r = render();
    if (r) {
      addToHistory(r);
    } else if (input.value.trim() === '' && !(input.validity && input.validity.badInput)) {
      showError('Escribe una temperatura antes de convertir.');
      resultCard.setAttribute('data-state', 'error');
      input.focus();
    } else {
      input.focus();
    }
  }

  function swapScales() {
    var a = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = a;

    // Si hay un resultado válido, se usa como nuevo valor de entrada (conversión inversa)
    if (lastResult) {
      // 6 decimales: evita perder precisión al ir y volver entre escalas
      var newValue = Number(lastResult.result.toFixed(6));
      var min = SCALES[fromSel.value].min;
      if (newValue < min) newValue = min;
      input.value = String(newValue);
    }

    swapBtn.classList.toggle('spin');
    render();
    scheduleAutoSave();
    showToast('Escalas intercambiadas');
  }

  function clearAll() {
    clearTimeout(autoSaveTimer);
    input.value = '';
    hideError();
    render();
    input.focus();
  }

  function copyResult() {
    if (!lastResult) return;
    var text = lastResult.resultText;
    var done = function () { showToast('Resultado copiado: ' + text); };
    var fail = function () { showToast('No se pudo copiar. Selecciona el resultado y cópialo manualmente.'); };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text) ? done() : fail();
      });
    } else {
      fallbackCopy(text) ? done() : fail();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    copyBtn.focus();
    return ok;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  /* ---------- Tema claro / oscuro ---------- */
  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* almacenamiento no disponible */ }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var dark = theme === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
    themeToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0e141d' : '#1f3a5f');
  }

  function initTheme() {
    var saved = storageGet('termoconversor-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light'));
  }

  /* ---------- Eventos ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    doConvert();
  });

  input.addEventListener('input', function () {
    render();
    scheduleAutoSave();
  });

  [fromSel, toSel, decSel].forEach(function (sel) {
    sel.addEventListener('change', function () {
      render();
      scheduleAutoSave();
    });
  });

  swapBtn.addEventListener('click', swapScales);
  clearBtn.addEventListener('click', clearAll);
  copyBtn.addEventListener('click', copyResult);

  clearHistoryBtn.addEventListener('click', function () {
    history = [];
    renderHistory();
    showToast('Historial borrado');
    input.focus();
  });

  themeToggle.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storageSet('termoconversor-theme', next);
  });

  tryExampleBtn.addEventListener('click', function () {
    input.value = '30';
    fromSel.value = 'C';
    toSel.value = 'F';
    doConvert();
    document.getElementById('conversor').scrollIntoView({ behavior: 'smooth', block: 'start' });
    input.focus({ preventScroll: true });
  });

  // Atajos de teclado globales
  document.addEventListener('keydown', function (e) {
    if (e.altKey && (e.key === 'i' || e.key === 'I' || e.code === 'KeyI')) {
      e.preventDefault();
      swapScales();
    } else if (e.key === 'Escape' && form.contains(document.activeElement)) {
      e.preventDefault();
      clearAll();
    }
  });

  /* ---------- Inicio ---------- */
  initTheme();
  render();
  renderHistory();

  // Exposición mínima para pruebas desde la consola
  window.Termoconversor = { convert: convert, SCALES: SCALES };
})();
