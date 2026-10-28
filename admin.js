(() => {
  'use strict';
  const STORAGE_KEY = 'dealfinder:studio:v1';
  const CATEGORIES = ['Tech','Home','Kitchen','Audio','Gaming','Lifestyle'];
  const $ = id => document.getElementById(id);
  const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isAmazon = raw => {try{const u = new URL(raw);return u.protocol === 'https:' && ['amazon.com','www.amazon.com','smile.amazon.com','amzn.to','a.co'].includes(u.hostname.toLowerCase());}catch{return false;}};
  const isImage = raw => {if(!raw)return true;const value=String(raw).trim();if(/^assets\/products\/[a-z0-9_./-]+\.(png|jpg|jpeg|webp|svg)$/i.test(value) && !value.includes('..'))return true;try{const u=new URL(value);return u.protocol==='https:';}catch{return false;}};
  const cleanProduct = p => ({
    id:String(p.id||'').slice(0,100)||makeId(),title:String(p.title||'').trim().slice(0,180),category:CATEGORIES.includes(p.category)?p.category:'Tech',
    description:String(p.description||'').trim().slice(0,450),why:String(p.why||'').trim().slice(0,900),
    affiliateUrl:String(p.affiliateUrl||'').trim().slice(0,1800),imageUrl:String(p.imageUrl||'').trim().slice(0,1800),
    status:p.status==='published'?'published':'draft',featured:Boolean(p.featured),addedAt:validDate(p.addedAt)
  });
  function validDate(value){const d=new Date(value||'');return Number.isNaN(d.getTime())?new Date().toISOString():d.toISOString();}
  function makeId(){return 'df-'+ (globalThis.crypto?.randomUUID?.() || String(Date.now())+'-'+Math.random().toString(36).slice(2,9));}
  const state={products:[],loaded:false,dirty:false};
  const toast = message => {const el=$('adminToast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3000);};
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,products:state.products}));$('topbarTitle').title='Workspace saved locally';return true;}catch{toast('Could not save to browser storage. Download a backup.');return false;}}
  function isValidPublished(p){return Boolean(p.title&&p.description&&isAmazon(p.affiliateUrl)&&isImage(p.imageUrl));}
  function publicProducts(){return state.products.filter(p=>p.status==='published'&&isValidPublished(p));}
  const exportPublic=()=>({version:1,updatedAt:new Date().toISOString(),products:publicProducts().map(p=>({...p}))});
  function refreshStats(){const published=publicProducts();$('statTotal').textContent=state.products.length;$('statPublished').textContent=published.length;$('statDrafts').textContent=state.products.filter(p=>p.status==='draft').length;$('statFeatured').textContent=published.filter(p=>p.featured).length;$('sideCount').textContent=state.products.length;$('exportCount').textContent=published.length;}
  const saveAll=()=>{persist();refreshStats();renderList();};
  function setTab(tab){if(!['overview','catalog','editor','publish'].includes(tab))tab='overview';document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==`panel-${tab}`);document.querySelectorAll('.side-link').forEach(a=>a.classList.toggle('active',a.dataset.tab===tab));const titles={overview:'Overview',catalog:'Product library',editor:'Product editor',publish:'Publish to GitHub'};$('topbarTitle').textContent=titles[tab];history.replaceState(null,'',`#${tab}`);$('sidebar').classList.remove('mobile-open');window.scrollTo({top:0,behavior:'instant'});if(tab==='catalog')renderList();if(tab==='publish')refreshStats();}
  function resetForm(){ $('productForm').reset();$('editId').value='';$('editorHeading').innerHTML='Add a <em>new find.</em>';$('productCategory').value='Tech';$('productStatus').value='draft';$('formError').hidden=true;updatePreview();}
  function loadForm(id){const p=state.products.find(p=>p.id===id);if(!p)return; $('editId').value=p.id;$('editorHeading').innerHTML='Edit your <em>product.</em>';
    for(const [key,field] of Object.entries({title:'productTitle',category:'productCategory',status:'productStatus',description:'productDescription',why:'productWhy',affiliateUrl:'affiliateUrl',imageUrl:'imageUrl'}))$(field).value=p[key]||'';
    $('productFeatured').checked=p.featured;$('formError').hidden=true;updatePreview();setTab('editor');}
  function validate(p){if(!p.title)return 'Enter a product name.';if(p.title.length<3)return 'Use a more descriptive product name.';if(!p.description)return 'Add your own original description.';if(p.imageUrl&&!isImage(p.imageUrl))return 'Image must use https:// or a local assets/products/photo.jpg path.';if(p.affiliateUrl&&!isAmazon(p.affiliateUrl))return 'Use a valid Amazon.com, amzn.to or a.co HTTPS affiliate link.';
    if(p.status==='published'&&!p.affiliateUrl)return 'A published product must have an Amazon affiliate link.';return '';}
  function productFromForm(){const id=$('editId').value;const existing=state.products.find(p=>p.id===id);
    return cleanProduct({id:id||makeId(),title:$('productTitle').value,category:$('productCategory').value,status:$('productStatus').value,description:$('productDescription').value,why:$('productWhy').value,affiliateUrl:$('affiliateUrl').value,imageUrl:$('imageUrl').value,featured:$('productFeatured').checked,addedAt:existing?.addedAt||new Date().toISOString()});}
  function updatePreview(){const title=$('productTitle').value.trim()||'Your next great find';const category=$('productCategory').value||'Tech';const description=$('productDescription').value.trim()||'Your original product description will appear here.';const img=$('imageUrl').value.trim();const allowed=img&&isImage(img);const isPath=allowed&&img.startsWith('assets/products/');
    $('descriptionCount').textContent=`${$('productDescription').value.length} / 450 characters`;
    $('liveCardPreview').innerHTML=`<div class="product-preview"><div class="preview-image">${allowed?`<img src="${escapeHTML(isPath?'./'+img:img)}" alt="Preview" referrerpolicy="no-referrer">`:'⌕'}</div><div class="preview-info"><span class="preview-category">${escapeHTML(category)}</span><strong>${escapeHTML(title)}</strong><p>${escapeHTML(description)}</p><span>View on Amazon ↗</span></div></div>`;
    const previewImg=$('liveCardPreview').querySelector('img');previewImg?.addEventListener('error',()=>{previewImg.parentElement.textContent='⌕';},{once:true});}
  function renderList(){const q=$('catalogSearch').value.toLowerCase().trim();const filter=$('catalogStatus').value;const arr=state.products.filter(p=>(filter==='all'||p.status===filter)&&(!q||(p.title+' '+p.category+' '+p.description).toLowerCase().includes(q)));
    $('adminProductList').innerHTML=arr.length?arr.map(p=>`<article class="library-item"><div class="library-image">${p.imageUrl&&isImage(p.imageUrl)?`<img src="${escapeHTML(p.imageUrl)}" alt="" referrerpolicy="no-referrer">`:'⌕'}</div><div class="library-body"><strong>${escapeHTML(p.title||'Untitled product')}</strong><p>${escapeHTML(p.category)} · ${escapeHTML(p.description.slice(0,95))}</p><div class="library-badges"><span class="${p.status==='published'?'published':''}">${p.status==='published'?'Published':'Draft'}</span>${p.featured?'<span class="featured">✦ Featured</span>':''}</div></div><div class="library-actions"><button type="button" data-action="edit" data-id="${escapeHTML(p.id)}">Edit</button><button type="button" data-action="duplicate" data-id="${escapeHTML(p.id)}">Duplicate</button><button type="button" data-action="up" data-id="${escapeHTML(p.id)}" aria-label="Move product up">↑</button><button type="button" data-action="down" data-id="${escapeHTML(p.id)}" aria-label="Move product down">↓</button><button type="button" data-action="remove" data-id="${escapeHTML(p.id)}" class="danger">Remove</button></div></article>`).join(''):'<div class="library-empty"><b>Nothing in this view yet.</b><p>Add a product or change your filters to see more.</p><button type="button" class="primary-btn" data-open-tab="editor" data-new-product="true">+ Add a product</button></div>';
    $('adminProductList').querySelectorAll('.library-image img').forEach(img=>img.addEventListener('error',()=>img.parentElement.textContent='⌕',{once:true}));}
  document.addEventListener('click',e=>{const btn=e.target.closest('[data-open-tab],[data-action],[data-tab]');if(!btn)return;
    if(btn.dataset.openTab){if(btn.dataset.newProduct==='true')resetForm();setTab(btn.dataset.openTab);return;}
    if(btn.dataset.tab){e.preventDefault();setTab(btn.dataset.tab);return;}
    if(btn.dataset.action){const action=btn.dataset.action;const id=btn.dataset.id;const i=state.products.findIndex(p=>p.id===id);if(i<0)return;
      if(action==='edit')return loadForm(id);
      if(action==='duplicate'){const original=state.products[i];state.products.splice(i+1,0,{...original,id:makeId(),title:original.title+' (copy)',status:'draft',featured:false,addedAt:new Date().toISOString()});saveAll();toast('Draft copy created');return;}
      if(action==='remove'){if(!confirm('Remove this product from your local workspace? Export again to update the public website.'))return;state.products.splice(i,1);saveAll();toast('Product removed from workspace');return;}
      if(action==='up'&&i>0){[state.products[i-1],state.products[i]]=[state.products[i],state.products[i-1]];saveAll();return;}
      if(action==='down'&&i<state.products.length-1){[state.products[i],state.products[i+1]]=[state.products[i+1],state.products[i]];saveAll();return;}
    }});
  $('sidebarToggle').addEventListener('click',()=> $('sidebar').classList.toggle('mobile-open'));
  $('clearForm').addEventListener('click',resetForm);
  $('catalogSearch').addEventListener('input',renderList);$('catalogStatus').addEventListener('change',renderList);
  ['productTitle','productCategory','productDescription','imageUrl','productWhy','productFeatured','affiliateUrl'].forEach(id=>$(id).addEventListener('input',updatePreview));
  $('productForm').addEventListener('submit',e=>{e.preventDefault();const p=productFromForm();const error=validate(p);$('formError').hidden=!error;if(error){$('formError').textContent=error;return;}
    const i=state.products.findIndex(x=>x.id===p.id);if(i===-1)state.products.unshift(p);else state.products[i]=p;saveAll();toast(p.status==='published'?'Product ready for your next GitHub export':'Draft saved to this browser');resetForm();setTab('catalog');});
  function downloadJSON(name,data){const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800);}
  $('downloadPublished').addEventListener('click',()=>{downloadJSON('products.json',exportPublic());toast('Published products file downloaded');});
  $('copyPublished').addEventListener('click',async()=>{const value=JSON.stringify(exportPublic(),null,2)+'\n';try{await navigator.clipboard.writeText(value);toast('JSON copied! Paste it into data/products.json on GitHub.');}catch{toast('Copy unavailable: use Download products.json instead.');}});
  $('downloadBackup').addEventListener('click',()=>{downloadJSON('dealfinder-workspace-backup.json',{version:1,kind:'dealfinder-workspace',exportedAt:new Date().toISOString(),products:state.products});toast('Workspace backup downloaded');});
  $('importBackup').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>3_000_000)throw new Error('File too large');const parsed=JSON.parse(await file.text());const rows=Array.isArray(parsed)?parsed:parsed.products;if(!Array.isArray(rows)||rows.length>1000)throw new Error('This is not a valid product list');const unique=new Set();const list=rows.map(cleanProduct).filter(p=>{if(unique.has(p.id))return false;unique.add(p.id);return true;});if(!confirm(`Replace your current workspace with ${list.length} products from this file? Download a backup of your current workspace first if you want to keep it.`))return;state.products=list;saveAll();setTab('catalog');toast('Workspace imported');}catch(err){toast('Import failed: '+err.message);}finally{e.target.value='';}});
  async function bootstrap(){let saved=false;try{const cached=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(cached&&Array.isArray(cached.products)){state.products=cached.products.slice(0,1000).map(cleanProduct);saved=true;}}catch{}
    if(!saved){try{const response=await fetch('data/products.json',{cache:'no-store'});if(!response.ok)throw new Error('Not found');const data=await response.json();const rows=Array.isArray(data)?data:data.products;if(!Array.isArray(rows))throw new Error('Invalid');state.products=rows.filter(p=>p.status==='published').slice(0,1000).map(cleanProduct);persist();}catch{state.products=[];}}
    state.loaded=true;refreshStats();renderList();resetForm();setTab(location.hash.slice(1)||'overview');}
  bootstrap();
})();
