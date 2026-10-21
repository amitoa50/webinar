/* Webinar page: form validation + submit, sticky mobile button. */
(function () {
  var W = window.WEBINAR || {};

  function normalizePhone(v) {
    var d = String(v).replace(/[^\d+]/g, '');
    if (d.indexOf('+972') === 0) d = '0' + d.slice(4);
    else if (d.indexOf('972') === 0) d = '0' + d.slice(3);
    return d;
  }
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var MOBILE = /^05\d{8}$/;

  function setInvalid(input, bad) {
    if (input.type === 'checkbox') input.closest('.check').classList.toggle('is-invalid', bad);
    else input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  function validate(form) {
    var name = form.elements.name, email = form.elements.email, phone = form.elements.phone, consent = form.elements.consent;
    var msgs = [];
    var first = null;
    function check(input, ok, msg) {
      setInvalid(input, !ok);
      if (!ok) { msgs.push(msg); first = first || input; }
    }
    check(name, name.value.trim().length >= 2, 'נא למלא שם מלא.');
    check(email, EMAIL.test(email.value.trim()), 'נא למלא כתובת מייל תקינה.');
    check(phone, MOBILE.test(normalizePhone(phone.value)), 'נא למלא מספר נייד תקין, למשל 050-1234567.');
    check(consent, consent.checked, 'כדי לקבל את לינק ההדרכה, נא לאשר קבלת הודעות.');
    return { ok: msgs.length === 0, msg: msgs.join(' '), first: first };
  }

  function encode(data) {
    return Object.keys(data).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');
  }

  document.querySelectorAll('form[name="webinar"]').forEach(function (form) {
    var err = form.querySelector('.form__error');
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.textContent;

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true' || e.target.type === 'checkbox') setInvalid(e.target, false);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.company.value) return; // honeypot
      var v = validate(form);
      if (!v.ok) { err.textContent = v.msg; v.first.focus(); return; }
      err.textContent = '';

      var data = {
        'form-name': 'webinar',
        source: form.elements.source.value,
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: normalizePhone(form.elements.phone.value),
        consent: 'yes',
        webinar: (W.date || '') + ' ' + (W.time || ''),
      };
      btn.disabled = true;
      btn.textContent = 'שומרים לכם מקום...';

      var jobs = [fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(data),
      }).then(function (r) { if (!r.ok) throw new Error('netlify ' + r.status); })];
      if (W.webhookUrl) {
        jobs.push(fetch(W.webhookUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) }).catch(function () {}));
      }

      Promise.all(jobs).then(function () {
        try { sessionStorage.setItem('webinar-name', data.name.split(' ')[0]); } catch (x) {}
        if (window.fbq) window.fbq('track', 'Lead');
        location.href = '/thank-you.html';
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = label;
        err.textContent = 'ההרשמה לא נשלחה, כנראה בגלל בעיית חיבור. נסו שוב בעוד רגע.';
      });
    });
  });

  /* sticky mobile button: after the hero, hidden while a form is on screen */
  var sticky = document.querySelector('.sticky');
  var hero = document.querySelector('.hero');
  if (sticky && hero && 'IntersectionObserver' in window) {
    var heroGone = false, formsOn = 0;
    function render() { sticky.classList.toggle('is-on', heroGone && formsOn === 0); }
    new IntersectionObserver(function (es) {
      heroGone = !es[0].isIntersecting; render();
    }).observe(hero);
    var fo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { formsOn += e.isIntersecting ? 1 : -1; });
      formsOn = Math.max(0, formsOn); render();
    });
    document.querySelectorAll('form[name="webinar"]').forEach(function (f) { fo.observe(f); });
  }
})();
