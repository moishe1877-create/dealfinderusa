(() => {
  'use strict';
  const CATEGORIES = ['All', 'Tech', 'Home', 'Kitchen', 'Audio', 'Gaming', 'Lifestyle'];
  const productGrid = document.getElementById('productGrid');
  const state = { products: [], query: '', category: 'All', sort: 'featured', favoritesOnly: false, favorites: new Set(), loadError: false };
  const $ = (id) => document.getElementById(id);
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const searchTerms = (p) => [p.title,p.category,p.description,p.why].join(' ').toLowerCase();
  const allowedAmazonLink = (input) => { try { const u = new URL(input); return u.protocol === 'https:' && (['amazon.com','www.amazon.com','smile.amazon.com','amzn.to','a.co'].includes(u.hostname.toLowerCase())); } catch { return false; } };
  const allowedImage = (input) => { if (!input) return ''; try { const u = new URL(input, location.href); if (u.protocol !== 'https:' && u.origin !== location.origin) return ''; return u.href; } catch { return ''; } };
  const safeDate = (d) => {const n = new Date(d || 0).getTime(); return Number.isFinite(n) ? n : 0;};
  const normalize = (p) => p && typeof p === 'object' && typeof p.title === 'string' && allowedAmazonLink(p.affiliateUrl || '') && p.status === 'published' ? ({
    id: String(p.id || '').slice(0,100), title: p.title.slice(0,220), category: CATEGORIES.includes(p.category) ? p.category : 'Lifestyle',
    description: String(p.description || '').slice(0,800), why: String(p.why || '').slice(0,1200),
    affiliateUrl: p.affiliateUrl, imageUrl: allowedImage(p.imageUrl), featured: p.featured === true, addedAt: p.addedAt || ''
  }) : null;
  try { const saved = JSON.parse(localStorage.getItem('dealfinder:favorites') || '[]'); if (Array.isArray(saved)) state.favorites = new Set(saved.filter(v => typeof v === 'string').slice(0,1000)); } catch {}
  const placeholderIcon = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="13" width="44" height="38" rx="5"/><circle cx="24" cy="25" r="5"/><path d="m11 42 13-13 10 9 7-7 12 12"/></svg>`;
  const imgHtml = (p) => p.imageUrl ? `<img src="${escapeHTML(p.imageUrl)}" alt="${escapeHTML(p.title)}" loading="lazy" referrerpolicy="no-referrer">` : `<div class="product-placeholder" role="img" aria-label="Image not provided">${placeholderIcon}</div>`;
  const productCard = (p) => `<article class="product-card" data-product-id="${escapeHTML(p.id)}">
      <div class="product-image">${imgHtml(p)}${p.featured ? '<span class="product-tag">EDITOR’S PICK</span>' : ''}<button type="button" class="product-save ${state.favorites.has(p.id) ? 'is-saved' : ''}" data-favorite="${escapeHTML(p.id)}" aria-label="${state.favorites.has(p.id) ? 'Remove from' : 'Add to'} saved products" aria-pressed="${state.favorites.has(p.id)}">${state.favorites.has(p.id) ? '♥' : '♡'}</button></div>
      <div class="product-body"><div class="product-category">${escapeHTML(p.category)}</div><h3>${escapeHTML(p.title)}</h3><p class="product-description">${escapeHTML(p.description || 'Explore this hand-selected find on Amazon.')}</p><div class="product-foot"><a href="${escapeHTML(p.affiliateUrl)}" target="_blank" rel="noopener noreferrer sponsored nofollow" aria-label="View ${escapeHTML(p.title)} on Amazon">View on Amazon ↗</a><button type="button" data-details="${escapeHTML(p.id)}">Quick view →</button></div></div>
    </article>`;
  const findProduct = id => state.products.find(p => p.id === id);
  function notify(message) { const t = $('toast'); t.textContent = message; t.classList.add('show'); clearTimeout(notify.timer); notify.timer = setTimeout(() => t.classList.remove('show'), 2500); }
  function saveFavorites(){ try { localStorage.setItem('dealfinder:favorites',JSON.stringify(Array.from(state.favorites))); } catch {} $('favoriteCount').textContent = String(state.favorites.size); $('savedModalCount').textContent = String(state.favorites.size); }
  function toggleFavorite(id){if(!findProduct(id)) return; if(state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id); saveFavorites(); render(); notify(state.favorites.has(id)?'Saved to your shortlist':'Removed from saved');}
  function getFiltered(){let ps=state.products.filter(p=>(state.category==='All'||p.category===state.category)&&(!state.query||searchTerms(p).includes(state.query))&&(!state.favoritesOnly||state.favorites.has(p.id)));
    if(state.sort==='az') ps.sort((a,b)=>a.title.localeCompare(b.title)); else if(state.sort==='newest') ps.sort((a,b)=>safeDate(b.addedAt)-safeDate(a.addedAt)); else ps.sort((a,b)=>Number(b.featured)-Number(a.featured)||safeDate(b.addedAt)-safeDate(a.addedAt)); return ps;}
  function render(){const filtered=getFiltered(); const hasActive=Boolean(state.query)||state.category!=='All'||state.favoritesOnly;
    productGrid.innerHTML=filtered.map(productCard).join('');
    productGrid.querySelectorAll('.product-image img').forEach(img=>img.addEventListener('error',()=>{img.parentElement.querySelector('img')?.remove();if(!img.parentElement.querySelector('.product-placeholder'))img.parentElement.insertAdjacentHTML('afterbegin',`<div class="product-placeholder">${placeholderIcon}</div>`);},{once:true}));
    $('resultsLabel').textContent=state.loadError?'Catalog temporarily unavailable':`${filtered.length} ${filtered.length===1?'find':'finds'} ${hasActive?'match your filters':'in the collection'}`;
    $('clearFilters').hidden=!hasActive;$('favoritesToggle').setAttribute('aria-pressed',String(state.favoritesOnly));
    document.querySelectorAll('[data-filter]').forEach(b=>{const selected=b.dataset.filter===state.category;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
    const empty=$('emptyState');empty.hidden=filtered.length!==0;
    if(filtered.length===0){$('emptyTitle').textContent=hasActive?'No finds match just yet.':"We're curating the good stuff.";$('emptyMessage').textContent=hasActive?'Try another search or category to explore the rest of the collection.':'Our collection is taking shape. Check back as we add independent product recommendations.';$('resetFilters').hidden=!hasActive;}
    $('catalogError').hidden=!state.loadError;
  }
  function reset(){state.query='';state.category='All';state.favoritesOnly=false;$('globalSearch').value='';history.replaceState(null,'',location.pathname);render();}
  function selectCategory(c){state.category=CATEGORIES.includes(c)?c:'All';state.favoritesOnly=false;render();document.querySelector('#products').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
  function productDialog(id){const p=findProduct(id);if(!p)return;const d=$('detailDialog');$('detailContent').innerHTML=`<div class="detail-cover">${imgHtml(p)}<button class="icon-close" type="button" data-close-modal="detailDialog" aria-label="Close">×</button></div><div class="detail-copy"><div class="product-category">${escapeHTML(p.category)}</div><h2>${escapeHTML(p.title)}</h2><p>${escapeHTML(p.description||'Discover this product on Amazon.')}</p>${p.why?`<div class="detail-why"><strong>Why we picked it</strong><div>${escapeHTML(p.why)}</div></div>`:''}<div class="detail-buttons"><a class="button button--light" target="_blank" rel="noopener noreferrer sponsored nofollow" href="${escapeHTML(p.affiliateUrl)}">View on Amazon ↗</a><button type="button" data-favorite="${escapeHTML(p.id)}">${state.favorites.has(p.id)?'♥ Saved':'♡ Save find'}</button></div><p class="modal-note" style="font-size:10px;color:#9da7b2;margin-top:16px">Current price and availability are shown on Amazon.</p></div>`; d.showModal();}
  function openSaved(){const valid=state.products.filter(p=>state.favorites.has(p.id));$('savedList').innerHTML=valid.length?valid.map(p=>`<div class="saved-item">${p.imageUrl?`<img alt="" src="${escapeHTML(p.imageUrl)}" referrerpolicy="no-referrer">`:`<div class="product-placeholder">${placeholderIcon}</div>`}<div><strong>${escapeHTML(p.title)}</strong><small>${escapeHTML(p.category)}</small><a href="${escapeHTML(p.affiliateUrl)}" target="_blank" rel="noopener noreferrer sponsored nofollow">View on Amazon ↗</a></div><button type="button" data-favorite="${escapeHTML(p.id)}" aria-label="Remove saved product">×</button></div>`).join(''):'<div class="saved-empty"><b>Nothing saved yet.</b>Tap the heart on a product to keep it here.</div>';$('savedDialog').showModal();}
  document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;
    if(b.dataset.favorite){toggleFavorite(b.dataset.favorite); if($('savedDialog').open){$('savedDialog').close();openSaved();}if($('detailDialog').open){const p=findProduct(b.dataset.favorite);if(p)productDialogRefresh(p.id);}return;}
    if(b.dataset.details){productDialog(b.dataset.details);return;}
    if(b.dataset.closeModal){$(b.dataset.closeModal)?.close();return;}
    if(b.dataset.category){selectCategory(b.dataset.category);return;}
    if(b.dataset.categoryLink){selectCategory(b.dataset.categoryLink);const row=document.querySelector('.navrow');row.classList.remove('is-open');$('mobileNavToggle').setAttribute('aria-expanded','false');return;}
    if(b.dataset.filter){state.category=b.dataset.filter;render();}
  });
  function productDialogRefresh(id){const d=$('detailDialog'); if(!d.open)return;d.close();productDialog(id);}
  for(const d of document.querySelectorAll('dialog')){d.addEventListener('click',e=>{if(e.target===d)d.close();});}
  $('siteSearch').addEventListener('submit',e=>{e.preventDefault();state.query=$('globalSearch').value.trim().toLowerCase();render();$('products').scrollIntoView({behavior:'smooth'});});
  $('globalSearch').addEventListener('input',e=>{state.query=e.target.value.trim().toLowerCase();render();});
  $('sortSelect').addEventListener('change',e=>{state.sort=e.target.value;render();});
  $('savedOpen').addEventListener('click',openSaved);$('favoritesToggle').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;render();});
  $('clearFilters').addEventListener('click',reset);$('resetFilters').addEventListener('click',reset);
  $('mobileNavToggle').addEventListener('click',()=>{const nav=document.querySelector('.navrow');const isOpen=nav.classList.toggle('is-open');$('mobileNavToggle').setAttribute('aria-expanded',String(isOpen));});
  $('backToTop').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));addEventListener('scroll',()=>{ $('backToTop').classList.toggle('show',scrollY>500);},{passive:true});
  $('year').textContent=new Date().getFullYear();
  async function load(){try{const response=await fetch(`data/products.json?v=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();const arr=Array.isArray(data)?data:data.products;if(!Array.isArray(arr))throw new Error('Invalid catalog');const unique=new Set();state.products=arr.map(normalize).filter(p=>{if(!p||!p.id||unique.has(p.id))return false;unique.add(p.id);return true;});state.loadError=false;}catch(error){console.warn('Catalog load failed',error);state.products=[];state.loadError=true;}saveFavorites();const initial=new URLSearchParams(location.search);const category=initial.get('category');if(category&&CATEGORIES.includes(category))state.category=category;const q=initial.get('q');if(q){state.query=q.toLowerCase().slice(0,200);$('globalSearch').value=q.slice(0,200);}render();}
  load();
})();
