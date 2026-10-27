/* DealFinder USA — card upgrade. Loads after app.js; no other file needs rewriting. */
(() => {
  'use strict';
  // 1) Put your Amazon Associates tracking ID between the quotes, e.g. 'yourname-20'
  const TAG = 'dealfinderu0a-20';

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'cards.css';
  document.head.appendChild(css);

  const list = Array.isArray(window.DEALFINDER_PRODUCTS) ? window.DEALFINDER_PRODUCTS : [];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Adds your tag to every amazon.com link (amzn.to short links already carry the tag they were made with).
  const tagged = href => {
    if (!TAG) return href;
    try {
      const u = new URL(href);
      if (u.hostname === 'amazon.com' || u.hostname.endsWith('.amazon.com')) { u.searchParams.set('tag', TAG); return u.href; }
    } catch {}
    return href;
  };

  function enhance() {
    document.querySelectorAll('a[rel~="sponsored"]').forEach(a => { const h = tagged(a.href); if (h !== a.href) a.href = h; });
    document.querySelectorAll('.product-card:not([data-pc])').forEach(card => {
      card.dataset.pc = '1';
      const id = card.querySelector('[data-view]')?.dataset.view;
      const p = list.find(x => x.id === id);
      if (!p) return;
      const feats = Array.isArray(p.features) ? p.features.slice(0, 3) : [];
      const bottom = card.querySelector('.product-card__bottom');
      if (feats.length && bottom) bottom.insertAdjacentHTML('beforebegin', `<ul class="pc-features">${feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`);
      const live = card.querySelector('.product-card__cta--live');
      if (live) {
        card.classList.add('is-live');
        live.insertAdjacentHTML('afterend', '<small class="pc-note">See current price and availability on Amazon. Affiliate link.</small>');
      }
    });
  }

  new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true });
  enhance();
})();
