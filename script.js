// Canvas particles + theme toggle + header blur on scroll
(function(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let w=0,h=0,particles=[];
  const settings = {count:80, maxR:3, speed:0.25}
  const mouse = {x:null,y:null,down:false}

  function resize(){
    DPR = Math.max(1, window.devicePixelRatio || 1);
    w = canvas.width = Math.floor(canvas.clientWidth * DPR);
    h = canvas.height = Math.floor(canvas.clientHeight * DPR);
    ctx.scale(DPR, DPR);
  }

  function rand(min,max){return Math.random()*(max-min)+min}

  function initParticles(){
    particles = [];
    for(let i=0;i<settings.count;i++){
      particles.push({
        x:rand(0,canvas.clientWidth),
        y:rand(0,canvas.clientHeight),
        vx:rand(-settings.speed,settings.speed),
        vy:rand(-settings.speed,settings.speed),
        r:rand(0.8,settings.maxR),
        hue: rand(180,280)
      });
    }
  }

  function update(){
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      // wrap
      if(p.x < -10) p.x = canvas.clientWidth + 10;
      if(p.x > canvas.clientWidth + 10) p.x = -10;
      if(p.y < -10) p.y = canvas.clientHeight + 10;
      if(p.y > canvas.clientHeight + 10) p.y = -10;

      // mouse repulsion
      if(mouse.x !== null){
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const minDist = 80;
        if(dist < minDist && dist > 0){
          const force = (minDist - dist) / minDist * 0.6;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // slow down
      p.vx *= 0.995; p.vy *= 0.995;
    }
  }

  function draw(){
    ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
    for(const p of particles){
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},90%,60%,0.92)`;
      ctx.shadowBlur = 14; ctx.shadowColor = `hsla(${p.hue},90%,60%,0.9)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    // subtle connecting lines
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y; const d2 = dx*dx+dy*dy;
        if(d2 < 9000){
          const alpha = 0.018 * (1 - d2/9000);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(120,110,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }

  // events
  window.addEventListener('resize', ()=>{ resize(); initParticles(); });
  canvas.addEventListener('mousemove', (e)=>{
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left);
    mouse.y = (e.clientY - rect.top);
  });
  canvas.addEventListener('mouseleave', ()=>{ mouse.x = null; mouse.y = null; });
  canvas.addEventListener('touchmove', (e)=>{ const t = e.touches[0]; const r = canvas.getBoundingClientRect(); mouse.x = t.clientX - r.left; mouse.y = t.clientY - r.top; }, {passive:true});
  canvas.addEventListener('touchend', ()=>{ mouse.x=null; mouse.y=null });

  // theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  function applyTheme(t){
    if(t==='light') document.documentElement.setAttribute('data-theme','light');
    else document.documentElement.removeAttribute('data-theme');
  }
  const stored = localStorage.getItem('site-theme');
  if(stored) applyTheme(stored);
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) applyTheme('light');

  themeBtn.addEventListener('click', ()=>{
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    applyTheme(isLight ? 'dark' : 'light');
    localStorage.setItem('site-theme', isLight ? 'dark' : 'light');
  });

  // header blur on scroll
  const header = document.querySelector('.site-header');
  function onScroll(){
    if(window.scrollY > 10) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // init
  function start(){ resize(); initParticles(); loop(); }
  // wait for fonts/paint
  window.requestAnimationFrame(start);
})();
