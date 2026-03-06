// ── Refs ──
const C=24,COLS=21,ROWS=22;
const pacEl=document.getElementById('pac');
const ov=document.getElementById('ov');
const cells=[...document.querySelectorAll('.maze > *')];
const gEls=[0,1,2,3].map(i=>document.getElementById('g'+i));

// ── Maze data from DOM ──
const TAG=cells.map(c=>c.tagName.toLowerCase());
const live=cells.map(_=>true);

function ci(x,y){return((y+ROWS)%ROWS)*COLS+((x+COLS)%COLS)}
function isWall(x,y){return TAG[ci(x,y)]==='s'}
function pacOk(x,y,dx,dy){return !isWall(x+dx,y+dy)}
function ghostOk(x,y,dx,dy,inHouse){
  const t=TAG[ci(x+dx,y+dy)];
  return t!=='s'&&(inHouse||t!=='g');
}

// ── Audio Engine ──
let actx=null;
function getCtx(){
  if(!actx) actx=new(window.AudioContext||window.webkitAudioContext)();
  return actx;
}

function beep(freq,type,dur,vol=0.18,startTime=null){
  const ctx=getCtx();
  const t=startTime||ctx.currentTime;
  const o=ctx.createOscillator();
  const g=ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type=type; o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.start(t); o.stop(t+dur+0.01);
}

// Chomp — alternating two-tone click
let chompPhase=0;
function playChomp(){
  const ctx=getCtx();
  const freqs=[[220,180],[180,220]];
  const [f1,f2]=freqs[chompPhase%2]; chompPhase++;
  const t=ctx.currentTime;
  beep(f1,'square',0.04,0.12,t);
  beep(f2,'square',0.04,0.08,t+0.04);
}

// Power pellet — ascending arp
function playPellet(){
  const ctx=getCtx();
  const t=ctx.currentTime;
  [300,400,550,700].forEach((f,i)=>beep(f,'sine',0.1,0.2,t+i*0.07));
}

// Eat ghost — descending arp
function playEatGhost(){
  const ctx=getCtx();
  const t=ctx.currentTime;
  [800,600,400,200].forEach((f,i)=>beep(f,'square',0.08,0.25,t+i*0.06));
}

// Death — descending glide
function playDeath(){
  const ctx=getCtx();
  const o=ctx.createOscillator();
  const g=ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type='sawtooth';
  const t=ctx.currentTime;
  o.frequency.setValueAtTime(600,t);
  o.frequency.exponentialRampToValueAtTime(40,t+1.2);
  g.gain.setValueAtTime(0.3,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+1.2);
  o.start(t); o.stop(t+1.3);
}

// Win fanfare
function playWin(){
  const ctx=getCtx();
  const t=ctx.currentTime;
  [523,659,784,1047,784,1047].forEach((f,i)=>beep(f,'square',0.18,0.2,t+i*0.16));
}

// Start jingle
function playStart(){
  const ctx=getCtx();
  const t=ctx.currentTime;
  [[523,0],[659,0.18],[784,0.36],[523,0.54],[659,0.72],[880,0.9],[784,1.08]].forEach(([f,dt])=>beep(f,'square',0.15,0.2,t+dt));
}

// ── State ──
let score=0,hi=0,lives=3,running=false,fright=0,raf;
let px=10,py=16,dx=0,dy=0,nx=0,ny=0;

const GSTART=[{x:8,y:9},{x:9,y:9},{x:10,y:9},{x:11,y:9}];
let GS;

function makeGhosts(){
  return GSTART.map((s,i)=>({
    x:10,y:8,
    dx:i%2===0?1:-1,dy:0,
    out:true,outT:i*900,
    active:i===0,
    dead:false,fright:false,
    home:{x:s.x,y:s.y}
  }));
}

// ── Render ──
function draw(){
  pacEl.style.left=px*C+'px';
  pacEl.style.top=py*C+'px';
  pacEl.className='pac '+(dx===1?'r':dx===-1?'l':dy===1?'d':dy===-1?'u':'r');
  GS.forEach((g,i)=>{
    if(!g.active){gEls[i].style.display='none';return;}
    gEls[i].style.display='';
    gEls[i].style.left=g.x*C+'px';
    gEls[i].style.top=g.y*C+'px';
    gEls[i].className='ghost '+['red','pink','cyan','orange'][i]
      +(fright>0&&!g.dead?' fright'+(fright<2000?' warn':''):'')
      +(g.dead?' dead':'');
  });
  document.getElementById('sc').textContent=score;
  document.getElementById('hi').textContent=hi;
  ['l1','l2','l3'].forEach((id,i)=>document.getElementById(id).classList.toggle('gone',i>=lives));
}

// ── Game loop ──
let lt=0,pt=0,gt=[0,0,0,0],releaseT=0;

function loop(ts){
  if(!running)return;
  const dt=Math.min(ts-lt,100); lt=ts;
  if(fright>0)fright-=dt;

  releaseT+=dt;
  GS.forEach((g,i)=>{if(!g.active&&releaseT>i*2200){g.active=true;}});

  pt+=dt;
  if(pt>150){pt-=150;
    if(pacOk(px,py,nx,ny)){dx=nx;dy=ny;}
    if(pacOk(px,py,dx,dy)){
      px=(px+dx+COLS)%COLS;py=(py+dy+ROWS)%ROWS;
      playChomp();
    }
    const idx=ci(px,py),t=TAG[idx];
    if((t==='d'||t==='p')&&live[idx]){
      live[idx]=false;cells[idx].classList.add('eaten');
      score+=(t==='p'?50:10);if(score>hi)hi=score;
      if(t==='p'){fright=7000;GS.forEach(g=>{g.fright=true;});playPellet();}
      if(live.filter((_,i)=>(TAG[i]==='d'||TAG[i]==='p')&&_).length===0)end('YOU WIN 🎉');
    }
  }

  GS.forEach((g,i)=>{
    if(!g.active)return;
    gt[i]+=dt;
    const spd=g.dead?100:fright>0?280:200;
    if(gt[i]<spd)return;gt[i]-=spd;
    if(g.dead&&g.x===g.home.x&&g.y===g.home.y){g.dead=false;g.fright=false;return;}
    const inHouse=TAG[ci(g.x,g.y)]==='g';
    const dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
    const valid=dirs.filter(d=>{
      if(!g.dead&&d.x===-g.dx&&d.y===-g.dy)return false;
      return ghostOk(g.x,g.y,d.x,d.y,inHouse);
    });
    if(!valid.length)return;
    const tx=g.dead?g.home.x:px,ty=g.dead?g.home.y:py;
    const pick=fright>0&&!g.dead
      ?valid[Math.random()*valid.length|0]
      :valid.reduce((a,b)=>
          Math.hypot(g.x+b.x-tx,g.y+b.y-ty)<Math.hypot(g.x+a.x-tx,g.y+a.y-ty)?b:a);
    g.dx=pick.x;g.dy=pick.y;
    g.x=(g.x+pick.x+COLS)%COLS;
    g.y=(g.y+pick.y+ROWS)%ROWS;
    if(g.active&&!g.dead&&g.x===px&&g.y===py)hit(g);
  });

  GS.forEach(g=>{if(g.active&&!g.dead&&g.x===px&&g.y===py)hit(g);});
  draw();
  raf=requestAnimationFrame(loop);
}

function hit(g){
  if(fright>0&&!g.dead){
    g.dead=true;g.fright=false;score+=200;if(score>hi)hi=score;
    playEatGhost();
  } else {
    running=false;cancelAnimationFrame(raf);
    lives--;
    playDeath();
    if(lives<=0){setTimeout(()=>end('GAME OVER'),1300);}
    else{
      setTimeout(()=>{
        reset();running=true;lt=performance.now();
        raf=requestAnimationFrame(loop);
      },1400);
    }
  }
}

function reset(){
  px=10;py=16;dx=0;dy=0;nx=0;ny=0;
  GS=makeGhosts();fright=0;pt=0;gt.fill(0);releaseT=0;
}

function end(msg){
  running=false;cancelAnimationFrame(raf);
  if(msg.includes('WIN'))playWin();
  document.getElementById('otitle').textContent=msg;
  document.getElementById('osub').innerHTML='SCORE: '+score+'<br>HIGH: '+hi;
  document.getElementById('obtn').textContent='PLAY AGAIN';
  ov.classList.remove('off');
}

function start(){
  cells.forEach((c,i)=>{if(TAG[i]==='d'||TAG[i]==='p'){live[i]=true;c.classList.remove('eaten');}});
  score=0;lives=3;running=true;
  GS=makeGhosts();fright=0;pt=0;gt.fill(0);releaseT=0;
  ov.classList.add('off');
  lt=performance.now();
  playStart();
  raf=requestAnimationFrame(loop);
}

// ── Input ──
const KEYS={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]};
document.addEventListener('keydown',e=>{if(KEYS[e.key]){e.preventDefault();[nx,ny]=KEYS[e.key];}});
let tx0,ty0;
document.addEventListener('touchstart',e=>{tx0=e.touches[0].clientX;ty0=e.touches[0].clientY;},{passive:true});
document.addEventListener('touchend',e=>{
  const ddx=e.changedTouches[0].clientX-tx0,ddy=e.changedTouches[0].clientY-ty0;
  if(Math.abs(ddx)<10&&Math.abs(ddy)<10)return;
  Math.abs(ddx)>Math.abs(ddy)?[nx,ny]=[ddx>0?1:-1,0]:[nx,ny]=[0,ddy>0?1:-1];
},{passive:true});
document.getElementById('obtn').onclick=start;

draw();