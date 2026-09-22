/* Purelane — shared section behaviour.
   Re-initialises on Shopify theme-editor section load/reorder events so
   nothing breaks while a merchant is editing. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('pl-js');

  function initReveal(root) {
    var els = (root || document).querySelectorAll('.pl-rv:not([data-pl-bound])');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(function (el) { el.classList.add('pl-in'); el.setAttribute('data-pl-bound', '1'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('pl-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach(function (el) { el.setAttribute('data-pl-bound', '1'); io.observe(el); });
  }

  function initHeroRotator(root) {
    var stage = (root || document).querySelector('[data-pl-hero-stage]:not([data-pl-bound])');
    if (!stage) return;
    stage.setAttribute('data-pl-bound', '1');
    var slides = [].slice.call(stage.querySelectorAll('.pl-hslide'));
    var dots = [].slice.call(stage.parentElement.querySelectorAll('[data-pl-hero-dot]'));
    if (slides.length < 2) return;
    var i = 0, timer = null;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('pl-on', idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle('pl-on', idx === i); d.setAttribute('aria-current', idx === i ? 'true' : 'false'); });
    }
    function play() { if (!timer && !reduce) timer = setInterval(function () { go(i + 1); }, 3800); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    dots.forEach(function (d, idx) { d.addEventListener('click', function () { stop(); go(idx); play(); }); });
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', play);
    stage.addEventListener('focusin', stop);
    stage.addEventListener('focusout', play);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? play() : stop(); }); }, { threshold: 0.2 }).observe(stage);
    } else { play(); }
  }

  function initMarquee(root) {
    // Pause the CSS-driven marquee entirely if there aren't enough cards to
    // loop cleanly (e.g. a merchant removes blocks down to 1-2 reviews).
    var rails = (root || document).querySelectorAll('[data-pl-marquee]:not([data-pl-bound])');
    rails.forEach(function (rail) {
      rail.setAttribute('data-pl-bound', '1');
      var track = rail.querySelector('.pl-revtrack');
      if (!track) return;
      var cards = track.children.length;
      if (cards < 6 || reduce) track.style.animation = 'none';
    });
  }

  function initAll(root) {
    initReveal(root);
    initHeroRotator(root);
    initMarquee(root);
  }

  document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
  document.addEventListener('shopify:section:reorder', function () { initAll(document); });
})();
