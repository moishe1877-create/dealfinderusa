/* DealFinder USA — progressive motion enhancement.
   All core storefront features remain functional without this script. */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const $ = selector => document.querySelector(selector);
  const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
  const progress = $('#scrollProgress');
  const hero = $('.hero-visual');
  const cursor = $('#cursorSpotlight');
  const root = document.documentElement;
  let scrollBusy = false;

  function paintProgress() {
    const maxScroll = Math.max(1,root.scrollHeight - window.innerHeight);
    const ratio = clamp(window.scrollY / maxScroll,0,1);
    if(progress) progress.style.transform = `scaleX(${ratio})`;
    scrollBusy = false;
  }
  window.addEventListener('scroll',() => {
    if(!scrollBusy){ scrollBusy = true; requestAnimationFrame(paintProgress); }
  },{passive:true});
  window.addEventListener('resize',paintProgress,{passive:true});
  paintProgress();

  // Follow the pointer with a subtle ambient glow, without blocking interactions.
  if (finePointer.matches && !reduceMotion.matches && cursor) {
    let pointerX=-600,pointerY=-600,scheduled=false;
    window.addEventListener('pointermove',e => {
      if(e.pointerType === 'touch') return;
      pointerX=e.clientX;pointerY=e.clientY;
      if(!scheduled) {
        scheduled=true;
        requestAnimationFrame(() => {
          cursor.style.left=`${pointerX}px`;
          cursor.style.top=`${pointerY}px`;
          cursor.style.opacity='1';
          scheduled=false;
        });
      }
    },{passive:true});
    document.addEventListener('mouseout',e => {
      if(!e.relatedTarget) cursor.style.opacity='0';
    });
  }

  // Only the decorative hero item floats in response to your pointer.
  if(hero && finePointer.matches && !reduceMotion.matches){
    let busy = false;
    let nextX=0,nextY=0;
    hero.addEventListener('pointermove',e => {
      const bounds=hero.getBoundingClientRect();
      nextX=clamp(((e.clientX-bounds.left)/bounds.width-.5)*24,-14,14);
      nextY=clamp(((e.clientY-bounds.top)/bounds.height-.5)*17,-10,10);
      if(!busy){
        busy=true;
        requestAnimationFrame(()=>{
          hero.style.setProperty('--float-x',`${nextX.toFixed(1)}px`);
          hero.style.setProperty('--float-y',`${nextY.toFixed(1)}px`);
          busy=false;
        });
      }
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{
      hero.style.setProperty('--float-x','0px');
      hero.style.setProperty('--float-y','0px');
    });
  }

  // Highlight each card under the pointer; this survives the product grid being re-rendered.
  if(finePointer.matches && !reduceMotion.matches){
    let highlightBusy=false,highlightTarget=null,relativeX=50,relativeY=50;
    document.addEventListener('pointermove',e => {
      const target=e.target.closest('.category-tile,.product-card');
      if(!target) return;
      const bounds=target.getBoundingClientRect();
      highlightTarget=target;
      relativeX=clamp((e.clientX-bounds.left)/bounds.width*100,0,100);
      relativeY=clamp((e.clientY-bounds.top)/bounds.height*100,0,100);
      if(!highlightBusy){
        highlightBusy=true;
        requestAnimationFrame(()=>{
          if(highlightTarget?.isConnected){
            highlightTarget.style.setProperty('--px',relativeX.toFixed(1)+'%');
            highlightTarget.style.setProperty('--py',relativeY.toFixed(1)+'%');
          }
          highlightBusy=false;
        });
      }
    },{passive:true});
  }

  // This is a decorative rotating showcase only; it does not fetch or claim live deals.
  const consoleEl=$('#signalConsole');
  if(!consoleEl) return;
  const image=$('#signalImage');
  const heading=$('#signalName');
  const description=$('#signalDescription');
  const category=$('#signalCategory');
  const indexText=$('#signalIndex');
  const switches=Array.from(document.querySelectorAll('[data-signal-index]'));
  const entries=Array.isArray(window.DEALFINDER_PRODUCTS)?window.DEALFINDER_PRODUCTS:[];
  const featured=entries.filter(item=>item && item.featured && item.title && item.image).slice(0,3);
  while(featured.length<3){
    const next=entries.find(item=>item?.title && item?.image && !featured.includes(item));
    if(!next) break;
    featured.push(next);
  }
  if(!featured.length) return;
  let current=0;
  let changeDelay=0;
  let cycle=null;
  let inView=false;
  let isHovered=false;
  let isFocusWithin=false;
  const shouldCycle=()=>inView&&!document.hidden&&!reduceMotion.matches&&!isHovered&&!isFocusWithin&&featured.length>1;
  const safeImg=src=>{
    const value=String(src||'');
    if(/^assets\/[\w./-]+$/.test(value) && !value.includes('..')) return value;
    try {const url=new URL(value);if(url.protocol==='https:')return url.href;}catch{}
    return 'assets/headphones.svg';
  };
  function updateSlide(next,animate=true){
    clearTimeout(changeDelay);
    current=(next+featured.length)%featured.length;
    const item=featured[current];
    const refresh=()=>{
      image.src=safeImg(item.image);
      image.alt=`Illustrative featured product: ${item.title}`;
      heading.textContent=item.title;
      description.textContent=item.description||'Explore this featured find.';
      category.textContent=`${item.category||'FEATURED'} / ${item.status==='live'?'AMAZON PICK':'FEATURED CONCEPT'}`.toUpperCase();
      indexText.textContent=String(current+1).padStart(2,'0');
      switches.forEach((button,i)=>{
        const active=i===current;
        button.classList.toggle('is-active',active);
        button.setAttribute('aria-pressed',String(active));
        button.hidden=i>=featured.length;
      });
      image.classList.remove('is-changing');
    };
    if(animate&&!reduceMotion.matches){
      image.classList.add('is-changing');
      changeDelay=setTimeout(refresh,225);
    }else refresh();
  }
  function stopCycle(){if(cycle!==null){clearInterval(cycle);cycle=null;}}
  function syncCycle(){
    stopCycle();
    if(shouldCycle()) cycle=setInterval(()=>updateSlide(current+1),5200);
  }
  switches.forEach(button=>button.addEventListener('click',()=>{
    updateSlide(Number(button.dataset.signalIndex));
    syncCycle();
  }));
  consoleEl.addEventListener('pointerenter',()=>{isHovered=true;syncCycle();});
  consoleEl.addEventListener('pointerleave',()=>{isHovered=false;syncCycle();});
  consoleEl.addEventListener('focusin',()=>{isFocusWithin=true;syncCycle();});
  consoleEl.addEventListener('focusout',()=>{
    isFocusWithin=consoleEl.contains(document.activeElement);
    syncCycle();
  });
  document.addEventListener('visibilitychange',syncCycle);
  reduceMotion.addEventListener?.('change',syncCycle);
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      inView=entries[0]?.isIntersecting||false;
      syncCycle();
    },{threshold:.15});
    observer.observe(consoleEl);
  }else {inView=true;syncCycle();}
  updateSlide(0,false);
})();
