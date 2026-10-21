/* Webinar details: the only file to edit for the next broadcast.
   Every element with data-w="<key>" on the pages gets its text from here. */
window.WEBINAR = {
  day: 'יום שלישי',
  dayShort: 'שלישי',
  date: '10.11.2026',
  dateShort: '10.11',
  time: '18:30',
  duration: 'כשעה',
  // ISO start in Israel time; the calendar links are built from it
  startISO: '2026-11-10T18:30:00+02:00',
  durationMinutes: 60,
  seats: 100,
  // WhatsApp group of this broadcast (thank-you page button)
  whatsappUrl: '',
  // Optional: webhook that also receives each sign-up (Zapier / Make → רב מסר)
  webhookUrl: '',
};

(function () {
  var w = window.WEBINAR;
  function fill() {
    document.querySelectorAll('[data-w]').forEach(function (el) {
      var v = w[el.getAttribute('data-w')];
      if (v !== undefined && v !== '') el.textContent = v;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill);
  else fill();
})();
