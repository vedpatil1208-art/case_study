// ===== REFERENCES =====

// Size of each grid cell
const C=24,COLS=21,ROWS=22;

// Pac-Man element
const pacEl=document.getElementById("pac");

// Overlay screen (game over / win screen)
const ov=document.getElementById("ov");

// All maze cells
const cells=[...document.querySelectorAll(".maze > *")];

// Ghost elements
const gEls=[0,1,2,3].map(i=>document.getElementById("g"+i));

// Score display
const scoreEl=document.getElementById("sc");

// High score display
const hiEl=document.getElementById("hi");


// ===== MAZE DATA =====

// Store the type of each maze cell (wall, dot, power pellet)
const TAG=cells.map(c=>c.tagName.toLowerCase());

// Track whether a dot/pellet is still present
const live=cells.map(()=>true);

// Convert x,y coordinates into cell index
function ci(x,y){
 return ((y+ROWS)%ROWS)*COLS+((x+COLS)%COLS);
}

// Check if a cell is a wall
function isWall(x,y){
 return TAG[ci(x,y)]==="s";
}

// Check if Pac-Man can move in a direction
function pacOk(x,y,dx,dy){
 return !isWall(x+dx,y+dy);
}

// Check if ghost can move in a direction
function ghostOk(x,y,dx,dy){
 const t=TAG[ci(x+dx,y+dy)];
 return t!=="s";
}


// ===== DOT COUNTER =====

// Count total dots and power pellets
let totalDots=TAG.filter(t=>t==="d"||t==="p").length;


// ===== GAME STATE =====

// Score, high score, and lives
let score=0,hi=0,lives=3;

// Game running state
let running=false,raf;

// Pac-Man position
let px=10,py=16;

// Current movement direction
let dx=0,dy=0;

// Next movement direction (from keyboard input)
let nx=0,ny=0;


// ===== GHOST SETUP =====

// Initial positions of ghosts
const GSTART=[
 {x:8,y:9},
 {x:9,y:9},
 {x:10,y:9},
 {x:11,y:9}
];

let GS;

// Create ghost objects with starting positions and directions
function makeGhosts(){
 return GSTART.map((s,i)=>({
  x:s.x,
  y:s.y,
  dx:i%2===0?1:-1,
  dy:0
 }));
}


// ===== DRAW =====

// Update all visual positions in the game
function draw(){

 // Move Pac-Man on screen
 pacEl.style.left=px*C+"px";
 pacEl.style.top=py*C+"px";

 // Change Pac-Man direction animation
 pacEl.className="pac "+(dx===1?"r":dx===-1?"l":dy===1?"d":dy===-1?"u":"r");

 // Move ghosts on screen
 GS.forEach((g,i)=>{
  gEls[i].style.left=g.x*C+"px";
  gEls[i].style.top=g.y*C+"px";
 });

 // Update score display
 scoreEl.textContent=score;
 hiEl.textContent=hi;
}


// ===== LOOP =====

// Game timing variables
let last=0;
let pacTimer=0;
let ghostTimer=0;

// Main game loop
function loop(ts){

 if(!running)return;

 const dt=ts-last;
 last=ts;

 pacTimer+=dt;
 ghostTimer+=dt;

 // ===== PACMAN MOVE =====
 if(pacTimer>150){

  pacTimer=0;

  // Change direction if possible
  if(pacOk(px,py,nx,ny)){
   dx=nx;dy=ny;
  }

  // Move Pac-Man if path is clear
  if(pacOk(px,py,dx,dy)){
   px=(px+dx+COLS)%COLS;
   py=(py+dy+ROWS)%ROWS;
  }

  const idx=ci(px,py);
  const t=TAG[idx];

  // Eat dot or power pellet
  if((t==="d"||t==="p")&&live[idx]){

   live[idx]=false;
   cells[idx].classList.add("eaten");

   // Add score
   score+=(t==="p"?50:10);
   if(score>hi)hi=score;

   // Reduce remaining dots
   totalDots--;

   // Win condition
   if(totalDots===0){
    end("YOU WIN 🎉");
   }
  }
 }

 // ===== GHOST MOVE =====
 if(ghostTimer>200){

  ghostTimer=0;

  GS.forEach(g=>{

   // Possible movement directions
   const dirs=[
    {x:1,y:0},
    {x:-1,y:0},
    {x:0,y:1},
    {x:0,y:-1}
   ];

   // Filter valid directions
   const valid=dirs.filter(d=>{
    if(d.x===-g.dx && d.y===-g.dy)return false;
    return ghostOk(g.x,g.y,d.x,d.y);
   });

   if(!valid.length)return;

   // Choose direction closest to Pac-Man
   const pick=valid.reduce((best,dir)=>{
    const d1=Math.hypot(g.x+dir.x-px,g.y+dir.y-py);
    const d2=Math.hypot(g.x+best.x-px,g.y+best.y-py);
    return d1<d2?dir:best;
   });

   g.dx=pick.x;
   g.dy=pick.y;

   // Move ghost
   g.x=(g.x+pick.x+COLS)%COLS;
   g.y=(g.y+pick.y+ROWS)%ROWS;

   // Collision detection
   if(g.x===px && g.y===py){
    end("GAME OVER");
   }

  });
 }

 draw();

 // Continue animation
 raf=requestAnimationFrame(loop);
}


// ===== END GAME =====

// Stop the game and show result
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

// Reset game state for restart
function reset(){

 px=10;py=16;
 dx=0;dy=0;
 nx=0;ny=0;

 score=0;

 GS=makeGhosts();

 // Recount dots
 totalDots=TAG.filter(t=>t==="d"||t==="p").length;

 // Restore dots visually
 cells.forEach((c,i)=>{
  if(TAG[i]==="d"||TAG[i]==="p"){
   live[i]=true;
   c.classList.remove("eaten");
  }
 });

}


// ===== START =====

// Start the game
function start(){

 reset();

 running=true;

 ov.classList.add("off");

 last=performance.now();

 raf=requestAnimationFrame(loop);
}


// ===== INPUT =====

// Arrow key controls
const KEYS={
 ArrowRight:[1,0],
 ArrowLeft:[-1,0],
 ArrowDown:[0,1],
 ArrowUp:[0,-1]
};

// Detect keyboard input
document.addEventListener("keydown",e=>{
 if(KEYS[e.key]){
  e.preventDefault();
  [nx,ny]=KEYS[e.key];
 }
});

// Play again button
document.getElementById("obtn").onclick=start;

// Initialize ghosts
GS=makeGhosts();

// Draw initial state
draw();
