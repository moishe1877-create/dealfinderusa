/* DealFinder USA — marketplace edition. Static, privacy-friendly shopping discovery. */
(() => {
  'use strict';
  const data = Array.isArray(window.DEALFINDER_PRODUCTS) ? window.DEALFINDER_PRODUCTS : [];
  const products = data.filter(p => p && typeof p.id === 'string' && p.title && p.category);
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const escapeHTML = input => String(input ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => Number.isFinite(Number(n)) ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)) : '';
  const imageURL = value => {
    const raw = String(value || 'assets/headphones.svg').trim();
    if (/^assets\/[a-z0-9/_-]+\.(?:svg|png|webp|jpg|jpeg)$/i.test(raw) && !raw.includes('..')) return raw;
    try { const u = new URL(raw); return u.protocol === 'https:' ? u.href : 'assets/headphones.svg'; } catch { return 'assets/headphones.svg'; }
  };
  const amazonURL = value => {
    try { const u = new URL(String(value)); const host = u.hostname.toLowerCase(); return u.protocol === 'https:' && (host === 'amazon.com' || host.endsWith('.amazon.com') || host === 'amzn.to') ? u.href : ''; } catch { return ''; }
  };
  const liveURL = p => p.status === 'live' ? amazonURL(p.affiliateUrl) : '';
  const isLive = p => !!liveURL(p);
  const byId = id => products.find(p => p.id === id);
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('df-usa-saved') || '[]'); if (!Array.isArray(saved)) saved = []; } catch { saved=[]; }
  saved = saved.filter(id => typeof id === 'string');
  let category='All', query='', order='featured', savedOnly=false, toastTimer;
  const grid = $('#productsGrid');
  const productDialog = $('#productDialog');
  const savedDialog = $('#savedDialog');
  const saveData = () => { try { localStorage.setItem('df-usa-saved',JSON.stringify(saved)); } catch {} };
  function toast(message){ const node=$('#toast'); node.textContent=message; node.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove('show'),2500); }
  function updateCount(){ const n = saved.filter(id=>!!byId(id)).length; $('#savedCount').textContent=n; $('#savedDialogCount').textContent=n; $$('.product-card__save').forEach(btn=>{const active=saved.includes(btn.dataset.id);btn.classList.toggle('is-saved',active);btn.setAttribute('aria-pressed',String(active));btn.textContent=active?'♥':'♡';}); }
  function toggleSave(id){ const p=byId(id); if(!p) return; if(saved.includes(id)){saved=saved.filter(x=>x!==id);toast('Removed from favorites');} else{saved.push(id);toast('Added to favorites ♡');} saveData(); updateCount(); if(savedOnly)renderProducts(); if(savedDialog.open)renderSaved(); const detailBtn=$('#detailSave'); if(productDialog.open&&detailBtn?.dataset.id===id)detailBtn.textContent=saved.includes(id)?'♥ Saved':'♡ Save for later'; }
  function card(p,i){
    const live=isLive(p),price = !live && p.price!=null && Number.isFinite(Number(p.price));
    const before = price && p.originalPrice!=null && Number(p.originalPrice)>Number(p.price) ? Number(p.originalPrice) : null;
    const savings = before ? Math.round((1-Number(p.price)/before)*100) : null;
    return `<article class="product-card" style="animation-delay:${Math.min(i*30,180)}ms">
      <button class="product-card__image" type="button" data-view="${escapeHTML(p.id)}" aria-label="Preview ${escapeHTML(p.title)}"><img src="${escapeHTML(imageURL(p.image))}" width="600" height="520" loading="lazy" decoding="async" alt="${escapeHTML(p.title)} ${live?'product image':'concept illustration'}"><span class="product-card__pill ${live?'product-card__pill--live':''}">${live?'AMAZON PICK':'DEMO PICK'}</span></button>
      <button class="product-card__save ${saved.includes(p.id)?'is-saved':''}" type="button" data-id="${escapeHTML(p.id)}" data-save="true" aria-label="Save ${escapeHTML(p.title)}" aria-pressed="${saved.includes(p.id)}">${saved.includes(p.id)?'♥':'♡'}</button>
      <div class="product-card__body"><span class="product-card__category">${escapeHTML(p.category).toUpperCase()}</span><h3 class="product-card__title">${escapeHTML(p.title)}</h3><p class="product-card__description">${escapeHTML(p.description||'Discover this product.')}</p><div class="product-card__bottom">
      ${price ? `<div class="product-card__price"><strong>${money(p.price)}</strong>${before?`<del>${money(before)}</del>`:''}</div>${savings?`<p class="product-card__saving">${savings}% off · sample savings</p>`:''}<span class="product-card__example">Illustrative price · not a live offer</span>`:`<p class="product-card__live">${live?'Check current price on Amazon':'Concept preview'}</p>`}
      ${live ? `<a class="product-card__cta product-card__cta--live" href="${escapeHTML(liveURL(p))}" target="_blank" rel="noopener noreferrer sponsored">View on Amazon ↗</a>` : `<button class="product-card__cta" type="button" data-view="${escapeHTML(p.id)}">View product preview →</button>`}
      </div></div></article>`;
  }
  function filtered(){
    let list=products.filter(p => (category==='All'||p.category===category)&&(!savedOnly||saved.includes(p.id))&&(!query||[p.title,p.description,p.category,...(Array.isArray(p.features)?p.features:[])].join(' ').toLowerCase().includes(query)));
    if(order==='priceLow')list.sort((a,b)=>(Number(a.price)||Infinity)-(Number(b.price)||Infinity));
    else if(order==='priceHigh')list.sort((a,b)=>(Number(b.price)||-1)-(Number(a.price)||-1));
    else if(order==='name')list.sort((a,b)=>a.title.localeCompare(b.title));
    else list.sort((a,b)=>Number(!!b.featured)-Number(!!a.featured));
    return list;
  }
  function renderProducts(){
    const list=filtered(); grid.innerHTML=list.map(card).join(''); $('#emptyResults').hidden=list.length!==0;
    $('#resultsText').textContent=`${list.length} ${list.length===1?'product':'products'} ${query?`matching “${query}”`:category!=='All'?`in ${category}`:'to explore'}`;
    $$('#filterChips button').forEach(btn=>{const active=btn.dataset.filter===category;btn.classList.toggle('is-active',active);btn.setAttribute('aria-pressed',String(active));});
    $('#savedOnly').classList.toggle('is-active',savedOnly);$('#savedOnly').setAttribute('aria-pressed',String(savedOnly));
    $('#resetAll').hidden=category==='All'&&!query&&!savedOnly&&order==='featured';
    updateCount();
  }
  function chooseCategory(value){ category=value||'All';savedOnly=false;renderProducts(); document.getElementById('deals').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }
  function searchProducts(value){ query=String(value||'').trim().toLowerCase().slice(0,100);$('#searchInput').value=value.trim();savedOnly=false;renderProducts();document.getElementById('deals').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }
  function reset(){category='All';query='';savedOnly=false;order='featured';$('#searchInput').value='';$('#sortSelect').value='featured';renderProducts();}
  function detail(p){const live=isLive(p),example=!live&&p.price!=null,features=Array.isArray(p.features)?p.features:[];
    $('#productDetails').innerHTML=`<div class="detail-wrap"><div class="detail-image"><img src="${escapeHTML(imageURL(p.image))}" alt="${escapeHTML(p.title)}" width="600" height="520"></div><div class="detail-content"><button type="button" class="dialog-close" data-close="productDialog" aria-label="Close product details">×</button><small>${escapeHTML(p.category).toUpperCase()} · ${live?'AMAZON PICK':'DEMO PREVIEW'}</small><h2>${escapeHTML(p.title)}</h2><p>${escapeHTML(p.description||'')}</p>${features.length?`<ul>${features.map(feature=>`<li>${escapeHTML(feature)}</li>`).join('')}</ul>`:''}<div class="detail-content__prices">${example?`<strong>${money(p.price)}</strong>${p.originalPrice?`<del>${money(p.originalPrice)}</del>`:''}<span>Example price only; not a current offer</span>`:`<p>${live?'Current price & availability shown on Amazon':'Illustrative product preview'}</p>`}</div><div class="detail-actions">${live?`<a href="${escapeHTML(liveURL(p))}" rel="noopener noreferrer sponsored" target="_blank" class="btn btn--dark">View on Amazon ↗</a>`:''}<button type="button" class="detail-save" id="detailSave" data-id="${escapeHTML(p.id)}">${saved.includes(p.id)?'♥ Saved':'♡ Save for later'}</button></div></div></div>`;
    productDialog.showModal();
  }
  function renderSaved(){const picks=saved.map(byId).filter(Boolean);$('#savedDialogCount').textContent=picks.length;$('#savedItems').innerHTML=picks.length?picks.map(p=>`<article class="saved-item"><img src="${escapeHTML(imageURL(p.image))}" width="92" height="86" alt=""><div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.category)} · ${isLive(p)?'Published pick':'Demo pick'}</p><button type="button" data-saved-view="${escapeHTML(p.id)}">View details</button><button type="button" data-saved-remove="${escapeHTML(p.id)}">Remove</button></div></article>`).join(''):'<div class="saved-empty"><strong>No favorites yet</strong>Tap the heart on a product to keep it here.</div>'}
  function openSaved(){renderSaved();savedDialog.showModal();}
  $('#headerSearch').addEventListener('submit', e=>{e.preventDefault();searchProducts($('#searchInput').value);});
  $('#filterChips').addEventListener('click',e=>{const btn=e.target.closest('[data-filter]');if(btn)chooseCategory(btn.dataset.filter);});
  $('#sortSelect').addEventListener('change',e=>{order=e.target.value;renderProducts();});
  $('#savedOnly').addEventListener('click',()=>{savedOnly=!savedOnly;renderProducts();});
  $('#resetAll').addEventListener('click',reset);$('#emptyReset').addEventListener('click',reset);
  $('#savedButton').addEventListener('click',openSaved);$('#footerSaved').addEventListener('click',openSaved);
  $('#continueBrowsing').addEventListener('click',()=>{savedDialog.close();$('#deals').scrollIntoView({behavior:'smooth'});});
  $('#productsGrid').addEventListener('click',e=>{const saver=e.target.closest('[data-save]');if(saver){toggleSave(saver.dataset.id);return;}const view=e.target.closest('[data-view]');if(view){const p=byId(view.dataset.view);if(p)detail(p);}});
  $('#productDialog').addEventListener('click',e=>{const close=e.target.closest('[data-close]');if(close){productDialog.close();return;}const saver=e.target.closest('#detailSave');if(saver)toggleSave(saver.dataset.id);});
  $('#savedDialog').addEventListener('click',e=>{const close=e.target.closest('[data-close]');if(close){savedDialog.close();return;}const view=e.target.closest('[data-saved-view]');if(view){savedDialog.close();const p=byId(view.dataset.savedView);if(p)detail(p);return;}const remove=e.target.closest('[data-saved-remove]');if(remove)toggleSave(remove.dataset.savedRemove);});
  for(const dialog of [productDialog,savedDialog])dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  document.addEventListener('click',e=>{
    const categoryBtn=e.target.closest('[data-category],[data-feature-category],[data-hero-category],[data-nav-filter]');
    if(categoryBtn){e.preventDefault();chooseCategory(categoryBtn.dataset.category||categoryBtn.dataset.featureCategory||categoryBtn.dataset.heroCategory||categoryBtn.dataset.navFilter);$('#navItems').classList.remove('is-open');$('#menuToggle').setAttribute('aria-expanded','false');}
    const navLink=e.target.closest('.nav-items a');if(navLink){$('#navItems').classList.remove('is-open');$('#menuToggle').setAttribute('aria-expanded','false');}
  });
  $('#menuToggle').addEventListener('click',()=>{const items=$('#navItems');const state=items.classList.toggle('is-open');$('#menuToggle').setAttribute('aria-expanded',String(state));});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!productDialog.open&&!savedDialog.open){e.preventDefault();$('#searchInput').focus();}});
  const back=$('#backToTop'); window.addEventListener('scroll',()=>back.classList.toggle('show',window.scrollY>750),{passive:true});back.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  $('#year').textContent=String(new Date().getFullYear());
  // Motion is focused, lightweight, and pauses while the browser tab is hidden.
  const slides=$$('.hero-slide'),dots=$$('[data-go-slide]');let active=0;
  function goSlide(n){active=(n+slides.length)%slides.length;slides.forEach((s,i)=>{s.classList.toggle('is-active',i===active);s.setAttribute('aria-hidden',String(i!==active));s.querySelectorAll('a,button').forEach(control=>{control.tabIndex=i===active?0:-1;});});dots.forEach((d,i)=>{d.classList.toggle('is-active',i===active);d.setAttribute('aria-current',String(i===active));});}
  $('#slidePrev').addEventListener('click',()=>goSlide(active-1));$('#slideNext').addEventListener('click',()=>goSlide(active+1));dots.forEach(d=>d.addEventListener('click',()=>goSlide(Number(d.dataset.goSlide))));
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const autoplay=reduced?null:setInterval(()=>{if(!document.hidden&&!document.querySelector('.hero__main:hover')&&!document.querySelector('.hero__main:focus-within'))goSlide(active+1);},7200);
  if(autoplay)window.addEventListener('pagehide',()=>clearInterval(autoplay),{once:true});goSlide(0);
  renderProducts();
})();
