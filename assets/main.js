/* CEE · comportements du site (langue, menu, apparition des sections, formulaire).
   Après modification : lancer « node outils/build.mjs » pour régénérer assets/app.min.js. */
(function () {
  'use strict';
  var CFG = window.CEE_CONFIG || {};
  var EN = window.CEE_EN || {};
  var FRM = window.CEE_FR_MSG || {};
  var doc = document.documentElement;
  var lang = 'fr';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Langue FR / EN ---------- */
  // Le français est lu dans la page au chargement, puis restauré à l'identique.
  var textNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var attrNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-attr]'));
  var frText = textNodes.map(function (n) { return n.innerHTML; });
  var frAttr = attrNodes.map(function (n) {
    return parseAttr(n).map(function (p) { return n.getAttribute(p[0]); });
  });
  var meta = document.querySelector('meta[name="description"]');
  var page = document.body.getAttribute('data-page') || 'home';
  var frTitle = document.title, frDesc = meta ? meta.content : '';
  var titleKey = { home: 'meta.title', legal: 'ml.meta', notfound: 'nf.meta' }[page];

  function parseAttr(n) {
    return n.getAttribute('data-i18n-attr').split(';').map(function (s) { return s.split(':'); });
  }

  function setLang(l, save) {
    lang = l === 'en' ? 'en' : 'fr';
    var en = lang === 'en';
    doc.lang = lang;
    textNodes.forEach(function (n, i) {
      var k = n.getAttribute('data-i18n');
      n.innerHTML = en && EN[k] != null ? EN[k] : frText[i];
    });
    attrNodes.forEach(function (n, i) {
      parseAttr(n).forEach(function (p, j) {
        n.setAttribute(p[0], en && EN[p[1]] != null ? EN[p[1]] : frAttr[i][j]);
      });
    });
    document.title = en && EN[titleKey] ? EN[titleKey] : frTitle;
    if (meta && page === 'home') meta.content = en ? EN['meta.desc'] : frDesc;
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    applyConfigLinks();
    refreshMessages();
    if (save) { try { localStorage.setItem('cee-lang', lang); } catch (e) { /* stockage indisponible */ } }
  }

  function msg(k) { return (lang === 'en' ? EN[k] : FRM[k]) || ''; }

  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
  });

  /* ---------- Liens réseaux depuis config.js ---------- */
  function applyConfigLinks() {
    document.querySelectorAll('[data-cfg]').forEach(function (a) {
      var k = a.getAttribute('data-cfg'), v = (CFG[k] || '').trim();
      if (!v) {
        a.removeAttribute('href');
        a.setAttribute('aria-disabled', 'true');
        return;
      }
      a.href = k === 'mail' ? 'mailto:' + v : v;
      if (k !== 'mail') { a.target = '_blank'; a.rel = 'noopener'; }
      var h = a.querySelector('.soc__h');
      if (h) {
        h.classList.remove('todo');
        h.textContent = v.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      }
    });
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  function setMenu(open, focusBack) {
    if (!burger || !nav) return;
    nav.classList.toggle('open', open);
    doc.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    var k = open ? 'a.menuclose' : 'a.menu';
    burger.setAttribute('aria-label', lang === 'en' ? EN[k] : (open ? 'Fermer le menu' : 'Ouvrir le menu'));
    if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    else if (focusBack) burger.focus();
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
    });
    var mq = matchMedia('(min-width: 1001px)');
    var onMq = function () { if (mq.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);
  }

  /* ---------- Section active dans le menu, apparition des sections, barre mobile ---------- */
  if ('IntersectionObserver' in window) {
    var links = {};
    document.querySelectorAll('.top__nav a[href^="#"]:not(.btn)').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        } else if (a.getAttribute('aria-current')) a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });

    if (!reduce) {
      doc.classList.add('anim');
      var rev = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); rev.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { rev.observe(el); });
    }

    // Barre « Rejoindre » sur téléphone : visible après l'accueil, masquée sur la section Rejoindre
    var bar = document.getElementById('mbar'), hero = document.getElementById('accueil'), join = document.getElementById('rejoindre');
    if (bar && hero && join) {
      var state = { hero: true, join: false };
      var upd = function () { bar.classList.toggle('on', !state.hero && !state.join); };
      new IntersectionObserver(function (e) {
        e.forEach(function (en) { state[en.target === hero ? 'hero' : 'join'] = en.isIntersecting; });
        upd();
      }, { rootMargin: '0px 0px -30% 0px' }).observe(hero);
      new IntersectionObserver(function (e) { state.join = e[0].isIntersecting; upd(); }).observe(join);
    }
  }

  /* ---------- Chiffres clés : défilement jusqu'à la valeur ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var counters = Array.prototype.slice.call(document.querySelectorAll('.fact dt:not([data-i18n])'));
    var countUp = function (el, i) {
      var target = parseInt(el.textContent, 10);
      if (!target) return;
      el.setAttribute('aria-label', String(target));
      var start = null, dur = 900, delay = 450 + i * 100;
      el.textContent = '0';
      var step = function (t) {
        if (start === null) start = t;
        var p = Math.min(1, Math.max(0, (t - start - delay) / dur));
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step); else el.removeAttribute('aria-label');
      };
      requestAnimationFrame(step);
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countUp(en.target, counters.indexOf(en.target));
        cio.unobserve(en.target);
      });
    });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Formulaire d'adhésion ---------- */
  var form = document.getElementById('joinForm');
  var out = document.getElementById('formMsg');
  var lastMsg = null, lastErrors = {};

  function showMsg(k, kind) {
    lastMsg = k ? { k: k, kind: kind } : null;
    out.className = 'form__msg' + (kind ? ' ' + kind : '');
    out.textContent = k ? msg(k) : '';
  }
  function fieldError(el, k) {
    var err = document.getElementById(el.getAttribute('aria-describedby'));
    lastErrors[el.name] = k || null;
    if (k) { el.setAttribute('aria-invalid', 'true'); if (err) err.textContent = msg(k); }
    else { el.removeAttribute('aria-invalid'); if (err) err.textContent = ''; }
  }
  function refreshMessages() {
    if (!form) return;
    if (lastMsg) out.textContent = msg(lastMsg.k);
    Object.keys(lastErrors).forEach(function (n) {
      var el = form.elements[n];
      if (el && lastErrors[n]) fieldError(el, lastErrors[n]);
    });
    var lbl = form.querySelector('.form__label');
    if (lbl && form.classList.contains('is-sending')) lbl.textContent = msg('m.sending');
    var dm = document.getElementById('doneMsg');
    if (dm && dm.getAttribute('data-k')) dm.textContent = msg(dm.getAttribute('data-k'));
  }
  function validate(el) {
    var v = el.type === 'checkbox' ? el.checked : (el.value || '').trim();
    if (!v) return el.name === 'departement' ? 'm.dept' : el.name === 'rgpd' ? 'm.consent' : 'm.req';
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'm.mail';
    return null;
  }

  if (form) {
    var fields = ['prenom', 'nom', 'email', 'departement', 'rgpd'].map(function (n) { return form.elements[n]; });
    fields.forEach(function (el) {
      var ev = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'blur';
      el.addEventListener(ev, function () { if (el.hasAttribute('aria-invalid') || ev === 'change') fieldError(el, validate(el)); });
      el.addEventListener('input', function () { if (el.hasAttribute('aria-invalid') && !validate(el)) fieldError(el, null); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.classList.contains('is-sending')) return;
      var firstBad = null;
      fields.forEach(function (el) {
        var k = validate(el);
        fieldError(el, k);
        if (k && !firstBad) firstBad = el;
      });
      if (firstBad) { showMsg('m.missing', 'err'); firstBad.focus(); return; }
      if (!CFG.formEndpoint) { showMsg('m.wait', 'info'); return; }

      var btn = form.querySelector('button[type=submit]'), lbl = form.querySelector('.form__label');
      form.classList.add('is-sending');
      form.setAttribute('aria-busy', 'true');
      btn.disabled = true;
      lbl.textContent = msg('m.sending');
      showMsg(null);

      var body = new URLSearchParams();
      ['prenom', 'nom', 'email', 'departement'].forEach(function (k) { body.append(k, form.elements[k].value.trim()); });
      body.append('langue', lang);
      body.append('date', new Date().toISOString());

      fetch(CFG.formEndpoint, { method: 'POST', mode: 'no-cors', body: body })
        .then(function () {
          var k = CFG.whatsapp ? 'm.ok' : 'm.okNoWa';
          var done = document.getElementById('formDone'), dm = document.getElementById('doneMsg');
          form.reset();
          form.hidden = true;
          dm.setAttribute('data-k', k);
          dm.textContent = msg(k);
          done.hidden = false;
          done.focus();
          if (CFG.whatsapp) setTimeout(function () { location.href = CFG.whatsapp; }, 1600);
        })
        .catch(function () { showMsg('m.err', 'err'); })
        .then(function () {
          form.classList.remove('is-sending');
          form.removeAttribute('aria-busy');
          btn.disabled = false;
          lbl.innerHTML = lang === 'en' && EN['f.send'] ? EN['f.send'] : frText[textNodes.indexOf(lbl)];
        });
    });
  }

  /* ---------- Démarrage ---------- */
  applyConfigLinks();
  var saved = null;
  try { saved = localStorage.getItem('cee-lang'); } catch (e) { /* stockage indisponible */ }
  if (saved === 'en') setLang('en', false);
})();
