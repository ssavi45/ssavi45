const cursor=document.querySelector('.cursor'), ring=document.querySelector('.cursor-ring');
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(matchMedia('(pointer:fine)').matches&&!reducedMotion){
      let cursorFrame=0,cursorX=0,cursorY=0;
      window.addEventListener('pointermove',e=>{
        cursorX=e.clientX;cursorY=e.clientY;
        if(cursorFrame)return;
        cursorFrame=requestAnimationFrame(()=>{
          document.body.classList.add('has-custom-cursor');
          cursor.style.left=ring.style.left=cursorX+'px';cursor.style.top=ring.style.top=cursorY+'px';cursorFrame=0;
        });
      },{passive:true});
      document.querySelectorAll('a,button,summary').forEach(el=>{
        el.addEventListener('mouseenter',()=>ring.classList.add('active'));
        el.addEventListener('mouseleave',()=>ring.classList.remove('active'));
      });
    }
    const nav=document.querySelector('.site-nav');
    const updateNav=()=>nav.classList.toggle('scrolled',scrollY>20);updateNav();
    addEventListener('scroll',updateNav,{passive:true});
    const navLinks=[...document.querySelectorAll('.nav-links a')];
    const setActiveNav=id=>navLinks.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')==='#'+id));
    const trackedSections=navLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if('IntersectionObserver' in window){
      const navObserver=new IntersectionObserver(entries=>{
        const active=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top)-Math.abs(b.boundingClientRect.top))[0];
        if(active)setActiveNav(active.target.id);
      },{rootMargin:'-25% 0px -60% 0px',threshold:.01});
      trackedSections.forEach(section=>navObserver.observe(section));
    }
    navLinks.forEach(link=>link.addEventListener('click',()=>setActiveNav(link.getAttribute('href').slice(1))));
    const heroTime=document.querySelector('#heroTime');
    const updateHeroTime=()=>{
      if(!heroTime||document.hidden)return;
      try{
        const now=new Date();
        const date=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',day:'2-digit',month:'short',year:'numeric'}).format(now);
        const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
        heroTime.textContent=date+' / '+time;
      }catch(error){heroTime.textContent='Dhaka, Bangladesh';}
    };
    updateHeroTime();setInterval(updateHeroTime,30000);
    const heroInteractive=document.querySelector('.hero');if(heroInteractive&&!reducedMotion&&matchMedia('(pointer:fine)').matches){heroInteractive.addEventListener('pointermove',e=>{const box=heroInteractive.getBoundingClientRect();heroInteractive.style.setProperty('--hero-x',((e.clientX-box.left)/box.width-.5).toFixed(3));heroInteractive.style.setProperty('--hero-y',((e.clientY-box.top)/box.height-.5).toFixed(3))});heroInteractive.addEventListener('pointerleave',()=>{heroInteractive.style.setProperty('--hero-x',0);heroInteractive.style.setProperty('--hero-y',0)})}
    const mobileCapabilityNetwork=document.querySelector('#mobileCapabilityNetwork');
    if(mobileCapabilityNetwork){
      mobileCapabilityNetwork.insertAdjacentHTML('afterbegin','<svg class="brain-signal-layer" viewBox="0 0 680 680" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path class="brain-signal-route" data-route="vision" d="M368 570V145L403 116H424L455 123"/><path class="brain-signal-route" data-route="language" d="M368 570V223H431L458 197H505"/><path class="brain-signal-route" data-route="data" d="M368 570V323H429L480 273H555"/><path class="brain-signal-route" data-route="systems" d="M368 570V372H458L509 423H580"/><path class="brain-signal-route" data-route="deep" d="M368 570V473H431L458 497H531"/><path class="brain-signal-route" data-route="generative" d="M368 570V551L400 579H424L455 572"/><circle class="brain-signal-dot" r="9" cx="368" cy="570"/></svg>');
      const capabilityNodes=[...mobileCapabilityNetwork.querySelectorAll('.capability-node')],signalDot=mobileCapabilityNetwork.querySelector('.brain-signal-dot');
      let signalFrame,signalTimer;
      const closeCapability=()=>capabilityNodes.forEach(node=>node.classList.remove('is-active'));
      const sendSignal=key=>{
        const route=mobileCapabilityNetwork.querySelector(`[data-route="${key}"]`);if(!route||!signalDot)return;
        cancelAnimationFrame(signalFrame);clearTimeout(signalTimer);signalDot.style.opacity='1';
        const length=route.getTotalLength(),started=performance.now(),duration=Math.min(1250,720+length*.65),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
        const move=now=>{const progress=reduced?1:Math.min(1,(now-started)/duration),eased=1-Math.pow(1-progress,2),point=route.getPointAtLength(length*eased);signalDot.setAttribute('cx',point.x);signalDot.setAttribute('cy',point.y);if(progress<1)signalFrame=requestAnimationFrame(move);else signalTimer=setTimeout(()=>signalDot.style.opacity='0',260)};
        signalFrame=requestAnimationFrame(move);
      };
      capabilityNodes.forEach(node=>node.addEventListener('click',()=>{const wasActive=node.classList.contains('is-active'),key=node.dataset.capability;sendSignal(key);closeCapability();if(!wasActive)node.classList.add('is-active')}));
      document.addEventListener('pointerdown',event=>{if(!mobileCapabilityNetwork.contains(event.target))closeCapability()},{passive:true});
    }
    const initContact=()=>{const contactStage=document.querySelector('#contact'),contactOrbCanvas=document.querySelector('#contactOrbs'),contactParticleCanvas=document.querySelector('#contactParticles'),contactCursorDot=document.querySelector('#contactCursorDot');if(contactStage&&contactOrbCanvas&&contactParticleCanvas&&contactCursorDot&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const contactOrbCtx=contactOrbCanvas.getContext('2d'),contactParticleCtx=contactParticleCanvas.getContext('2d');if(!contactOrbCtx||!contactParticleCtx)return;let contactW=0,contactH=0,contactDpr=1,contactOrbs=[],contactParticles=[];const contactMouse={x:0,y:0,tx:0,ty:0};const makeContactScene=()=>{contactOrbs=Array.from({length:6},(_,i)=>({x:Math.random()*contactW,y:Math.random()*contactH,r:140+Math.random()*180,a:.05+Math.random()*.06,c:['239,232,216','160,150,120','90,85,75'][i%3],vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.15}));contactParticles=Array.from({length:Math.min(64,Math.max(28,Math.round(contactW*contactH/16000)))},()=>({x:Math.random()*contactW,y:Math.random()*contactH,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:.6+Math.random()*1.4,tw:Math.random()*Math.PI*2}))};const resizeContact=()=>{contactDpr=Math.min(devicePixelRatio||1,1.5);contactW=contactStage.clientWidth;contactH=contactStage.clientHeight;[contactOrbCanvas,contactParticleCanvas].forEach(c=>{c.width=contactW*contactDpr;c.height=contactH*contactDpr;c.style.width=contactW+'px';c.style.height=contactH+'px'});contactOrbCtx.setTransform(contactDpr,0,0,contactDpr,0,0);contactParticleCtx.setTransform(contactDpr,0,0,contactDpr,0,0);contactMouse.x=contactMouse.tx=contactW/2;contactMouse.y=contactMouse.ty=contactH/2;makeContactScene()};resizeContact();('ResizeObserver' in window?new ResizeObserver(resizeContact).observe(contactStage):addEventListener('resize',resizeContact,{passive:true}));contactStage.addEventListener('pointermove',e=>{const r=contactStage.getBoundingClientRect();contactMouse.tx=e.clientX-r.left;contactMouse.ty=e.clientY-r.top});contactStage.addEventListener('pointerleave',()=>{contactMouse.tx=contactW/2;contactMouse.ty=contactH/2});const drawContactOrbs=()=>{contactOrbCtx.clearRect(0,0,contactW,contactH);contactOrbCtx.globalCompositeOperation='lighter';contactOrbs.forEach(o=>{o.x+=o.vx;o.y+=o.vy;const dx=o.x-contactMouse.x,dy=o.y-contactMouse.y,d=Math.hypot(dx,dy)||1;if(d<320){const f=(1-d/320)*.6;o.x+=dx/d*f*4;o.y+=dy/d*f*4}if(o.x<-o.r)o.x=contactW+o.r;if(o.x>contactW+o.r)o.x=-o.r;if(o.y<-o.r)o.y=contactH+o.r;if(o.y>contactH+o.r)o.y=-o.r;const g=contactOrbCtx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);g.addColorStop(0,'rgba('+o.c+','+o.a+')');g.addColorStop(1,'rgba('+o.c+',0)');contactOrbCtx.fillStyle=g;contactOrbCtx.beginPath();contactOrbCtx.arc(o.x,o.y,o.r,0,Math.PI*2);contactOrbCtx.fill()});contactOrbCtx.globalCompositeOperation='source-over'};const drawContactParticles=t=>{contactParticleCtx.clearRect(0,0,contactW,contactH);contactParticles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;const dx=contactMouse.x-p.x,dy=contactMouse.y-p.y,d=Math.hypot(dx,dy)||1;if(d<150){p.x+=dx/d*.02*(1-d/150)*6;p.y+=dy/d*.02*(1-d/150)*6}if(p.x<0)p.x=contactW;if(p.x>contactW)p.x=0;if(p.y<0)p.y=contactH;if(p.y>contactH)p.y=0});for(let i=0;i<contactParticles.length;i++){const a=contactParticles[i];for(let j=i+1;j<contactParticles.length;j++){const b=contactParticles[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<130){contactParticleCtx.strokeStyle='rgba(239,232,216,'+(1-d/130)*.1+')';contactParticleCtx.beginPath();contactParticleCtx.moveTo(a.x,a.y);contactParticleCtx.lineTo(b.x,b.y);contactParticleCtx.stroke()}}const dm=Math.hypot(a.x-contactMouse.x,a.y-contactMouse.y);if(dm<190){contactParticleCtx.strokeStyle='rgba(239,232,216,'+(1-dm/190)*.22+')';contactParticleCtx.beginPath();contactParticleCtx.moveTo(a.x,a.y);contactParticleCtx.lineTo(contactMouse.x,contactMouse.y);contactParticleCtx.stroke()}}contactParticles.forEach(p=>{const dm=Math.hypot(p.x-contactMouse.x,p.y-contactMouse.y),boost=dm<190?(1-dm/190)*.6:0,alpha=Math.min(.85,(.4+Math.sin(t*.001+p.tw)*.3)*.45+boost);contactParticleCtx.fillStyle='rgba(239,232,216,'+alpha+')';contactParticleCtx.beginPath();contactParticleCtx.arc(p.x,p.y,p.r+boost*1.5,0,Math.PI*2);contactParticleCtx.fill()})};let contactVisible=true,contactFrame=0,lastContactDraw=0;
      const contactLoop=t=>{
        contactFrame=0;
        if(document.hidden||!contactVisible)return;
        if(t-lastContactDraw>=32){
          contactMouse.x+=(contactMouse.tx-contactMouse.x)*.06;
          contactMouse.y+=(contactMouse.ty-contactMouse.y)*.06;
          drawContactOrbs();drawContactParticles(t);
          contactCursorDot.style.transform='translate('+(contactMouse.x-17)+'px,'+(contactMouse.y-17)+'px)';
          lastContactDraw=t;
        }
        contactFrame=requestAnimationFrame(contactLoop);
      };
      const syncContact=()=>{
        cancelAnimationFrame(contactFrame);contactFrame=0;
        if(!document.hidden&&contactVisible)contactFrame=requestAnimationFrame(contactLoop);
      };
      if('IntersectionObserver' in window){
        new IntersectionObserver(entries=>{contactVisible=entries[0].isIntersecting;syncContact();}).observe(contactStage);
      }else{
        const checkContact=()=>{const r=contactStage.getBoundingClientRect();contactVisible=r.bottom>0&&r.top<innerHeight;syncContact();};
        addEventListener('scroll',checkContact,{passive:true});checkContact();
      }
      document.addEventListener('visibilitychange',syncContact);
      syncContact();
    }};
    const contactTarget=document.querySelector('#contact');
    if(contactTarget&&!reducedMotion){
      if('IntersectionObserver' in window){
        const lazyContact=new IntersectionObserver(entries=>{
          if(entries.some(entry=>entry.isIntersecting)){
            lazyContact.disconnect();
            try{initContact();}catch(error){/* Decorative effects must not block navigation or skill details. */}
          }
        },{rootMargin:'200px'});
        lazyContact.observe(contactTarget);
      }else{
        try{initContact();}catch(error){/* Keep the static contact background. */}
      }
    }
    if('IntersectionObserver' in window&&!reducedMotion){
      const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{
        if(e.isIntersecting){e.target.classList.remove('is-pending');e.target.classList.add('show');reveal.unobserve(e.target);}
      }),{threshold:.05});
      document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('is-pending');reveal.observe(el);});
    }
    const skillNodes=[...document.querySelectorAll('.skill-node')],skillPopover=document.querySelector('#skillPopover'),skillPopoverName=document.querySelector('#skillPopoverName'),skillPopoverText=document.querySelector('#skillPopoverText'),skillPopoverLevel=document.querySelector('#skillPopoverLevel'),skillLevelValue=document.querySelector('#skillLevelValue'),skillLevelTrack=document.querySelector('#skillLevelTrack'),skillPopoverClose=document.querySelector('.skill-popover-close');
    let selectedSkillNode=null,skillPositionFrame=0;
    const closeSkillPopover=()=>{if(skillPopover)skillPopover.hidden=true;selectedSkillNode=null;cancelAnimationFrame(skillPositionFrame);skillPositionFrame=0;};
    const positionSkillPopover=node=>{if(!skillPopover)return;const nodeBox=node.getBoundingClientRect(),popupBox=skillPopover.getBoundingClientRect(),gutter=15;let left=Math.min(Math.max(gutter,nodeBox.left+nodeBox.width/2-popupBox.width/2),innerWidth-popupBox.width-gutter),top=nodeBox.bottom+14;if(top+popupBox.height>innerHeight-gutter)top=Math.max(gutter,nodeBox.top-popupBox.height-14);skillPopover.style.left=left+'px';skillPopover.style.top=top+'px'};
    skillNodes.forEach(node=>{node.setAttribute('aria-expanded','false');node.addEventListener('click',event=>{event.stopPropagation();selectedSkillNode=node;skillNodes.forEach(item=>{const selected=item===node;item.classList.toggle('is-active',selected);item.setAttribute('aria-expanded',String(selected))});const level=node.dataset.level.toLowerCase();skillPopoverName.textContent=node.dataset.name;skillPopoverText.textContent=node.dataset.description;skillPopoverLevel.textContent=node.dataset.level+' experience';skillLevelValue.textContent=node.dataset.name+' / '+node.dataset.level;skillLevelTrack.className='skill-level-track level-'+level;skillPopover.hidden=false;requestAnimationFrame(()=>positionSkillPopover(node))})});
    if(skillPopoverClose)skillPopoverClose.addEventListener('click',closeSkillPopover);document.addEventListener('pointerdown',event=>{if(skillPopover&&!skillPopover.hidden&&!skillPopover.contains(event.target)&&!event.target.closest('.skill-node'))closeSkillPopover()});document.addEventListener('keydown',event=>{if(event.key==='Escape')closeSkillPopover()});addEventListener('resize',closeSkillPopover,{passive:true});addEventListener('scroll',()=>{
      if(!skillPopover||skillPopover.hidden||!selectedSkillNode||skillPositionFrame)return;
      skillPositionFrame=requestAnimationFrame(()=>{
        skillPositionFrame=0;if(!selectedSkillNode)return;
        const r=selectedSkillNode.getBoundingClientRect();
        if(r.bottom<0||r.top>innerHeight)closeSkillPopover();else positionSkillPopover(selectedSkillNode);
      });
    },{passive:true});
    document.querySelector('#year').textContent=new Date().getFullYear();

    const updatePageVisibility=()=>document.documentElement.classList.toggle('page-hidden',document.hidden);
    document.addEventListener('visibilitychange',updatePageVisibility);updatePageVisibility();
    if('IntersectionObserver' in window){
      const effectsObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('effects-paused',!entry.isIntersecting)));
      document.querySelectorAll('.hero,#about,#contact,.marquee').forEach(el=>effectsObserver.observe(el));
    }

