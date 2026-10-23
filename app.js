/* DealFinder USA — browser-only app: filter, search, favorites, previews, sorting */
(() => {
  'use strict';
  const entries = Array.isArray(window.DEALFINDER_PRODUCTS) ? window.DEALFINDER_PRODUCTS : [];
  const products = entries.filter(p => p && typeof p.id === 'string' && p.title && p.category);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(Number(value));
  const validAffiliate = value => {
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      return url.protocol === 'https:' && (host === 'amazon.com' || host.endsWith('.amazon.com') || host === 'amzn.to') ? url.href : '';
    } catch { return ''; }
  };
  const safeImage = value => {
    const img = String(value || 'assets/headphones.svg').trim();
    if (/^(assets\/)[a-z0-9_./-]+$/i.test(img) && !img.includes('..')) return img;
    try { const url = new URL(img); return url.protocol === 'https:' ? url.href : 'assets/headphones.svg'; }
    catch { return 'assets/headphones.svg'; }
  };
  const liveUrl = p => p.status === 'live' ? validAffiliate(p.affiliateUrl) : '';
  const isLive = p => !!liveUrl(p);
  const productById = id => products.find(p => p.id === id);
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('df-usa-saved') || '[]'); if (!Array.isArray(saved)) saved = []; } catch { saved = []; }
  saved = saved.filter(id => typeof id === 'string');
  let category = 'All', search = '', sort = 'featured', savedOnly = false, layout = 'grid', toastTimer;
  const grid = $('#productGrid');

  function saveStorage() {
    try { localStorage.setItem('df-usa-saved', JSON.stringify(saved)); } catch { /* Page still usable if storage is blocked. */ }
  }
  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  }
  function updateSavedBadges() {
    const n = saved.filter(id => !!productById(id)).length;
    $('#savedCount').textContent = n;
    $('#savedDialogCount').textContent = n;
    $$('.product-card__save').forEach(el => {
      const yes = saved.includes(el.dataset.save);
      el.classList.toggle('is-saved', yes);
      el.setAttribute('aria-pressed', String(yes));
      el.setAttribute('aria-label', (yes ? 'Remove from saved: ' : 'Save: ') + (productById(el.dataset.save)?.title || 'product'));
    });
  }
  function toggleSaved(id) {
    const p = productById(id); if (!p) return;
    if (saved.includes(id)) { saved = saved.filter(x => x !== id); toast('Removed from saved finds'); }
    else { saved.push(id); toast('Saved to your favorites ♡'); }
    saveStorage(); updateSavedBadges();
    if (savedOnly) renderProducts();
    if ($('#savedDialog').open) renderSaved();
    if ($('#productDialog').open) {
      const btn = $('#dialogSave');
      if (btn && btn.dataset.id === id) btn.textContent = saved.includes(id) ? '♥ Saved' : '♡ Save this find';
    }
  }
  function productCard(p, index) {
    const published = isLive(p);
    const likes = saved.includes(p.id);
    const description = html(p.description || 'Explore this find.');
    const label = published ? 'Amazon pick' : 'DEMO PICK';
    const displayPrice = !published && Number.isFinite(Number(p.price)) && p.price !== null;
    return `<article class="product-card" style="animation-delay:${Math.min(index * 40,240)}ms">
      <div class="product-card__visual">
        <img src="${html(safeImage(p.image))}" alt="${html(p.title)} illustration or product image" loading="eager" decoding="async" width="600" height="520">
        <div class="product-card__badges"><span class="product-card__badge ${published ? 'product-card__badge--live' : ''}">${label}</span></div>
        <button type="button" class="product-card__save ${likes ? 'is-saved' : ''}" data-save="${html(p.id)}" aria-pressed="${likes}" aria-label="${likes ? 'Remove from saved:' : 'Save:'} ${html(p.title)}" title="Save this find"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.9a5.3 5.3 0 0 0-7.5 0L12 6.2l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5l8.8 8.7 8.8-8.7a5.3 5.3 0 0 0 0-7.5Z"/></svg></button>
      </div>
      <div class="product-card__content">
        <span class="product-card__category">${html(p.category)}</span>
        <h3>${html(p.title)}</h3>
        <p class="product-card__desc">${description}</p>
        ${published ? `<div class="product-card__check">Check price on Amazon ↗</div>` : displayPrice ? `<div class="product-card__price-row"><span class="product-card__price">${money(p.price)}</span>${p.originalPrice ? `<span class="product-card__was">${money(p.originalPrice)}</span>` : ''}</div><span class="product-card__price-note">Illustrative demo price · not a live offer</span>` : '<div class="product-card__check">Illustrative product</div>'}
        ${published ? `<a class="product-card__action product-card__action--live" href="${html(liveUrl(p))}" target="_blank" rel="sponsored nofollow noopener noreferrer" aria-label="View ${html(p.title)} on Amazon (paid affiliate link)"><span>View on Amazon</span><span>↗</span></a><p class="product-card__paid">Paid affiliate link · Amazon price applies</p>` : `<button class="product-card__action" type="button" data-preview="${html(p.id)}"><span>Preview this find</span><span>↗</span></button>`}
      </div>
    </article>`;
  }
  function filtered() {
    const q = search.trim().toLowerCase();
    const result = products.filter(p => (category === 'All' || p.category === category)
      && (!savedOnly || saved.includes(p.id))
      && (!q || [p.title,p.description,p.category,...(Array.isArray(p.features) ? p.features : [])].join(' ').toLowerCase().includes(q)));
    result.sort((a,b) => {
      if (sort === 'name') return a.title.localeCompare(b.title);
      if (sort === 'priceAsc' || sort === 'priceDesc') {
        // Live listings have no on-site price: keep them after demo listings.
        const va = isLive(a) || a.price == null ? Infinity : Number(a.price);
        const vb = isLive(b) || b.price == null ? Infinity : Number(b.price);
        if (va === Infinity && vb === Infinity) return 0;
        if (va === Infinity) return 1; if (vb === Infinity) return -1;
        return sort === 'priceAsc' ? va-vb : vb-va;
      }
      return Number(!!b.featured)-Number(!!a.featured);
    });
    return result;
  }
  function renderProducts() {
    const result = filtered();
    grid.innerHTML = result.map(productCard).join('');
    grid.classList.toggle('is-list', layout === 'list');
    $('#emptyState').hidden = result.length > 0;
    const suffix = result.length === 1 ? 'find' : 'finds';
    $('#resultSummary').textContent = `Showing ${result.length} ${suffix}${result.length !== products.length ? ` from ${products.length} total` : ''}`;
    $('#resetFilters').hidden = !(search || category !== 'All' || savedOnly || sort !== 'featured');
    $('#clearSearch').hidden = !search;
    $$('#filterChips [data-filter]').forEach(b => {
      const active = b.dataset.filter === category; b.classList.toggle('is-active',active); b.setAttribute('aria-pressed',String(active));
    });
    $('#savedFilter').classList.toggle('is-active',savedOnly);
    $('#savedFilter').setAttribute('aria-pressed',String(savedOnly));
    $('#gridView').classList.toggle('is-active',layout === 'grid');
    $('#listView').classList.toggle('is-active',layout === 'list');
    $('#gridView').setAttribute('aria-pressed',String(layout === 'grid'));
    $('#listView').setAttribute('aria-pressed',String(layout === 'list'));
    updateSavedBadges();
  }
  function setCategory(next, scrollIntoView = false) {
    category = next; savedOnly = false; renderProducts();
    if (scrollIntoView) $('#deals').scrollIntoView({behavior:'smooth'});
  }
  function reset() {
    category='All'; search=''; sort='featured'; savedOnly=false;
    $('#dealSearch').value = ''; $('#heroSearchInput').value = ''; $('#sortDeals').value = 'featured';
    renderProducts();
  }
  function openPreview(id) {
    const p = productById(id); if (!p) return;
    const link = liveUrl(p), published = !!link;
    const features = Array.isArray(p.features) ? p.features : [];
    $('#productDialogContent').innerHTML = `<div class="dialog__inner">
      <div class="dialog__image"><img src="${html(safeImage(p.image))}" alt="${html(p.title)} illustration or product image" width="600" height="520"></div>
      <div class="dialog__info"><p class="kicker"><span></span> ${html(p.category)} / ${published ? 'AMAZON PICK' : 'DEMO PREVIEW'}</p><h2 id="dialogTitle">${html(p.title)}</h2><p>${html(p.description)}</p>
        <div class="dialog__features">${features.map(f => `<span>${html(f)}</span>`).join('')}</div>
        ${published ? `<div class="dialog__sample"><strong>View on Amazon</strong><br>Pricing and availability are provided by Amazon, not this website.</div>` : `<div class="dialog__sample"><strong>Preview only</strong><br>This is a sample design listing, not an actual Amazon offer. Its price and artwork are illustrative. Add an approved affiliate product to activate a shopping link.</div>`}
        <div class="dialog__actions">${published ? `<a class="button button--lime" href="${html(link)}" target="_blank" rel="sponsored nofollow noopener noreferrer">View on Amazon ↗</a>` : ''}<button type="button" class="button button--outline" id="dialogSave" data-id="${html(p.id)}">${saved.includes(p.id) ? '♥ Saved' : '♡ Save this find'}</button><button type="button" class="button button--outline" id="dialogShare" data-id="${html(p.id)}">Share ↗</button></div>
        ${published ? '<p class="product-card__paid">Paid affiliate link. As an Amazon Associate I earn from qualifying purchases.</p>' : ''}
      </div><button type="button" class="dialog-close" id="closeProduct" aria-label="Close preview">×</button>
    </div>`;
    $('#productDialog').showModal();
    $('#closeProduct').focus();
  }
  function renderSaved() {
    const list = saved.map(productById).filter(Boolean);
    $('#savedItems').innerHTML = list.length ? list.map(p => `<article class="saved-item"><img src="${html(safeImage(p.image))}" alt="" loading="lazy" width="94" height="88"><div><h3>${html(p.title)}</h3><p>${html(p.category)} · ${isLive(p) ? 'Amazon pick' : 'Demo preview'}</p><div class="saved-item__actions"><button type="button" data-saved-preview="${html(p.id)}">View details ↗</button><button type="button" data-remove-saved="${html(p.id)}">Remove</button></div></div></article>`).join('')
      : '<div class="saved-empty"><span>♡</span><h3>Nothing saved. Yet.</h3><p>Found something you like? Tap the heart on any product to build your own shortlist.</p></div>';
    updateSavedBadges();
  }
  function closeMenu() { $('#navLinks').classList.remove('is-open'); $('#menuButton').setAttribute('aria-expanded','false'); $('#menuButton').setAttribute('aria-label','Open navigation'); }
  function setSearch(q) { search = q; $('#dealSearch').value = q; category='All'; savedOnly=false; renderProducts(); }
  function escapeShareUrl(id) { const url = new URL(window.location.href); url.searchParams.set('product', id); url.hash = ''; return url.toString(); }
  async function share(id) {
    const url = escapeShareUrl(id);
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url); toast('Product link copied!'); return; } }
    catch { /* fallback */ }
    window.prompt('Copy this product link:', url);
  }

  $('#footerYear').textContent = String(new Date().getFullYear());
  $('#heroSearchForm').addEventListener('submit', e => { e.preventDefault(); setSearch($('#heroSearchInput').value); $('#deals').scrollIntoView({behavior:'smooth'}); });
  $('#dealSearch').addEventListener('input', e => { search = e.target.value; renderProducts(); });
  $('#clearSearch').addEventListener('click', () => { search=''; $('#dealSearch').value=''; renderProducts(); $('#dealSearch').focus(); });
  $$('[data-search]').forEach(button => button.addEventListener('click', () => { setSearch(button.dataset.search); $('#heroSearchInput').value = button.dataset.search; $('#deals').scrollIntoView({behavior:'smooth'}); }));
  $$('[data-category]').forEach(button => button.addEventListener('click', () => setCategory(button.dataset.category,true)));
  $('#filterChips').addEventListener('click', e => { const btn=e.target.closest('[data-filter]'); if (btn) setCategory(btn.dataset.filter); });
  $('#sortDeals').addEventListener('change', e => { sort=e.target.value; renderProducts(); });
  $('#savedFilter').addEventListener('click', () => { savedOnly=!savedOnly; renderProducts(); });
  $('#gridView').addEventListener('click', () => { layout='grid'; renderProducts(); });
  $('#listView').addEventListener('click', () => { layout='list'; renderProducts(); });
  $('#resetFilters').addEventListener('click', reset);
  $('#emptyReset').addEventListener('click', reset);
  grid.addEventListener('click', e => { const savedButton=e.target.closest('[data-save]'); if (savedButton) { toggleSaved(savedButton.dataset.save); return; } const preview=e.target.closest('[data-preview]'); if (preview) openPreview(preview.dataset.preview); });
  $('#openSaved').addEventListener('click', () => { renderSaved(); $('#savedDialog').showModal(); });
  $$('[data-footer-saved]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); renderSaved(); $('#savedDialog').showModal(); }));
  $('#closeSaved').addEventListener('click', () => $('#savedDialog').close());
  $('#browseMore').addEventListener('click', () => { $('#savedDialog').close(); $('#deals').scrollIntoView({behavior:'smooth'}); });
  $('#savedItems').addEventListener('click', e => {
    const rem=e.target.closest('[data-remove-saved]'); if (rem) { toggleSaved(rem.dataset.removeSaved); return; }
    const prev=e.target.closest('[data-saved-preview]'); if (prev) { const id=prev.dataset.savedPreview; $('#savedDialog').close(); openPreview(id); }
  });
  $('#productDialogContent').addEventListener('click', e => {
    if (e.target.closest('#closeProduct')) $('#productDialog').close();
    const btnSave=e.target.closest('#dialogSave'); if (btnSave) toggleSaved(btnSave.dataset.id);
    const btnShare=e.target.closest('#dialogShare'); if (btnShare) share(btnShare.dataset.id);
  });
  [$('#productDialog'),$('#savedDialog')].forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  $$('[data-focus-search]').forEach(b => b.addEventListener('click', () => { $('#deals').scrollIntoView({behavior:'smooth'}); setTimeout(() => $('#dealSearch').focus({preventScroll:true}),500); }));
  $('#menuButton').addEventListener('click', () => { const open = $('#navLinks').classList.toggle('is-open'); $('#menuButton').setAttribute('aria-expanded',String(open)); $('#menuButton').setAttribute('aria-label',open?'Close navigation':'Open navigation'); });
  $$('#navLinks a').forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); if ((e.key === '/' || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName) && !$('#productDialog').open && !$('#savedDialog').open) { e.preventDefault(); $('#deals').scrollIntoView({behavior:'smooth'}); $('#dealSearch').focus({preventScroll:true}); } });
  $('#backToTop').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
  let ticking=false;
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(() => { const y=window.scrollY; $('.site-header').classList.toggle('is-scrolled',y>30); $('#backToTop').classList.toggle('is-visible',y>650); ticking=false; }); ticking=true; } }, {passive:true});
  if ('IntersectionObserver' in window) { const observer=new IntersectionObserver((entries,obs) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } }); }, {threshold:.12,rootMargin:'0px 0px 15px 0px'}); $$('.reveal').forEach(el => observer.observe(el)); }
  else $$('.reveal').forEach(el => el.classList.add('is-visible'));

  renderProducts();
  $('#demoNotice').hidden = !products.some(p => !isLive(p));
  const params = new URLSearchParams(location.search);
  if (params.has('q')) { setSearch(params.get('q') || ''); setTimeout(()=>$('#deals').scrollIntoView(),120); }
  if (params.has('product') && productById(params.get('product'))) setTimeout(()=>openPreview(params.get('product')),180);
})();
