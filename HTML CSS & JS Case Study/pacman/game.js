```javascript
// ===== REFERENCES =====
const C=24,COLS=21,ROWS=22;

const pacEl=document.getElementById("pac");
const ov=document.getElementById("ov");
const cells=[...document.querySelectorAll(".maze > *")];
const gEls=[0,1,2,3].map(i=>document.getElementById("g"+i));

const scoreEl=document.getElementById("sc");
const hiEl=document.getElementById("hi");

// ===== MAZE DATA =====
const TAG=cells.map(c=>c.tagName.toLowerCase());
const live=cells.map(()=>true);

function ci(x,y){
 return ((y+ROWS)%ROWS)*COLS+((x+COLS)%COLS);
}

function isWall(x,y){
 return TAG[ci(x,y)]==="s";
}

function pacOk(x,y,dx,dy){
 return !isWall(x+dx,y+dy);
}

function ghostOk(x,y,dx,dy){
 const t=TAG[ci(x+dx,y+dy)];
 return t!=="s";
}

// ===== DOT COUNTER =====
let totalDots=TAG.filter(t=>t==="d"||t==="p").length;

// ===== GAME STATE =====
let score=0,hi=0,lives=3;
let running=false,raf;

let px=10,py=16;
let dx=0,dy=0;
let nx=0,ny=0;

// ===== GHOST SETUP =====
const GSTART=[
 {x:8,y:9},
 {x:9,y:9},
 {x:10,y:9},
 {x:11,y:9}
];

let GS;

function makeGhosts(){
 return GSTART.map((s,i)=>({
  x:s.x,
  y:s.y,
  dx:i%2===0?1:-1,
  dy:0
 }));
}

// ===== DRAW =====
function draw(){

 pacEl.style.left=px*C+"px";
 pacEl.style.top=py*C+"px";

 pacEl.className="pac "+(dx===1?"r":dx===-1?"l":dy===1?"d":dy===-1?"u":"r");

 GS.forEach((g,i)=>{
  gEls[i].style.left=g.x*C+"px";
  gEls[i].style.top=g.y*C+"px";
 });

 scoreEl.textContent=score;
 hiEl.textContent=hi;
}

// ===== LOOP =====
let last=0;
let pacTimer=0;
let ghostTimer=0;

function loop(ts){

 if(!running)return;

 const dt=ts-last;
 last=ts;

 pacTimer+=dt;
 ghostTimer+=dt;

 // ===== PACMAN MOVE =====
 if(pacTimer>150){

  pacTimer=0;

  if(pacOk(px,py,nx,ny)){
   dx=nx;dy=ny;
  }

  if(pacOk(px,py,dx,dy)){
   px=(px+dx+COLS)%COLS;
   py=(py+dy+ROWS)%ROWS;
  }

  const idx=ci(px,py);
  const t=TAG[idx];

  if((t==="d"||t==="p")&&live[idx]){

   live[idx]=false;
   cells[idx].classList.add("eaten");

   score+=(t==="p"?50:10);
   if(score>hi)hi=score;

   totalDots--;

   if(totalDots===0){
    end("YOU WIN 🎉");
   }
  }
 }

 // ===== GHOST MOVE =====
 if(ghostTimer>200){

  ghostTimer=0;

  GS.forEach(g=>{

   const dirs=[
    {x:1,y:0},
    {x:-1,y:0},
    {x:0,y:1},
    {x:0,y:-1}
   ];

   const valid=dirs.filter(d=>{
    if(d.x===-g.dx && d.y===-g.dy)return false;
    return ghostOk(g.x,g.y,d.x,d.y);
   });

   if(!valid.length)return;

   const pick=valid.reduce((best,dir)=>{
    const d1=Math.hypot(g.x+dir.x-px,g.y+dir.y-py);
    const d2=Math.hypot(g.x+best.x-px,g.y+best.y-py);
    return d1<d2?dir:best;
   });

   g.dx=pick.x;
   g.dy=pick.y;

   g.x=(g.x+pick.x+COLS)%COLS;
   g.y=(g.y+pick.y+ROWS)%ROWS;

   if(g.x===px && g.y===py){
    end("GAME OVER");
   }

  });
 }

 draw();

 raf=requestAnimationFrame(loop);
}

// ===== END GAME =====
function end(msg){

 running=false;
 cancelAnimationFrame(raf);

 document.getElementById("otitle").textContent=msg;

 document.getElementById("osub").innerHTML=
 "SCORE: "+score+"<br>HIGH: "+hi;

 document.getElementById("obtn").textContent="PLAY AGAIN";

 ov.classList.remove("off");
}

// ===== RESET =====
function reset(){

 px=10;py=16;
 dx=0;dy=0;
 nx=0;ny=0;

 score=0;

 GS=makeGhosts();

 totalDots=TAG.filter(t=>t==="d"||t==="p").length;

 cells.forEach((c,i)=>{
  if(TAG[i]==="d"||TAG[i]==="p"){
   live[i]=true;
   c.classList.remove("eaten");
  }
 });

}

// ===== START =====
function start(){

 reset();

 running=true;

 ov.classList.add("off");

 last=performance.now();

 raf=requestAnimationFrame(loop);
}

// ===== INPUT =====
const KEYS={
 ArrowRight:[1,0],
 ArrowLeft:[-1,0],
 ArrowDown:[0,1],
 ArrowUp:[0,-1]
};

document.addEventListener("keydown",e=>{
 if(KEYS[e.key]){
  e.preventDefault();
  [nx,ny]=KEYS[e.key];
 }
});

document.getElementById("obtn").onclick=start;

GS=makeGhosts();
draw();
```
