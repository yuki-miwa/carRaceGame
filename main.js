"use strict";
(function(){
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // Size & DPR handling
  const baseWidth = canvas.width;  // 480
  const baseHeight = canvas.height; // 640
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  function resizeCanvas(){
    const displayWidth = baseWidth;
    const displayHeight = baseHeight;
    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Elements
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const overlay = document.getElementById("overlay");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");

  // Game constants
  const lanes = 3;
  const laneWidth = baseWidth / lanes; // 160
  const roadPadding = 16;
  const car = {
    lane: 1, // 0..2
    w: 52,
    h: 96,
    color: "#10b981"
  };

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    speed: 180, // px/sec base
    speedIncrease: 0.04, // per second
    obstacleInterval: 1100, // ms
    lastSpawn: 0,
    obstacles: [],
    score: 0,
    best: Number(localStorage.getItem("carRace.bestScore") || 0),
    lastTime: 0
  };
  bestEl.textContent = state.best;

  function laneCenter(l){
    return l * laneWidth + laneWidth/2;
  }
  function carRect(){
    const cx = laneCenter(car.lane);
    return { x: cx - car.w/2, y: baseHeight - car.h - 24, w: car.w, h: car.h };
  }

  function spawnObstacle(){
    // choose a lane different from previous top obstacle to avoid impossible walls
    const lane = Math.floor(Math.random()*lanes);
    const w = 56, h = 56;
    const x = laneCenter(lane) - w/2;
    const y = -h;
    const color = "#ef4444";
    state.obstacles.push({x, y, w, h, lane, color});
  }

  function reset(){
    state.running = false;
    state.paused = false;
    state.gameOver = false;
    state.speed = 180;
    state.obstacleInterval = 1100;
    state.lastSpawn = 0;
    state.obstacles = [];
    state.score = 0;
    state.lastTime = 0;
    car.lane = 1;
    updateHUD();
  }

  function start(){
    if(state.running && !state.gameOver) return;
    reset();
    state.running = true;
    overlay.style.display = "none";
    requestAnimationFrame(loop);
  }

  function pauseToggle(){
    if(!state.running || state.gameOver) return;
    state.paused = !state.paused;
    pauseBtn.setAttribute("aria-pressed", String(state.paused));
    overlay.style.display = state.paused ? "flex" : "none";
    if(!state.paused){
      state.lastTime = 0; // resync delta
      requestAnimationFrame(loop);
    }
  }

  function gameOver(){
    state.gameOver = true;
    state.running = false;
    overlay.style.display = "flex";
    // Show result in overlay panel by updating title/subtitle if present
    const title = document.getElementById("overlayTitle");
    if(title){ title.textContent = "Game Over"; }
    const subtitle = overlay.querySelector(".subtitle");
    if(subtitle){ subtitle.textContent = `Score: ${Math.floor(state.score)}  /  Best: ${state.best}`; }
  }

  function updateHUD(){
    scoreEl.textContent = Math.floor(state.score);
    bestEl.textContent = state.best;
  }

  function rectsOverlap(a,b){
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function drawRoad(){
    // background road
    ctx.fillStyle = "#1f2937"; // gray-800
    ctx.fillRect(0,0,baseWidth,baseHeight);

    // side borders
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0,0,roadPadding,baseHeight);
    ctx.fillRect(baseWidth-roadPadding,0,roadPadding,baseHeight);

    // lane lines
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.setLineDash([14, 14]);
    for(let i=1;i<lanes;i++){
      const x = i*laneWidth;
      ctx.beginPath();
      ctx.moveTo(x,0);
      ctx.lineTo(x,baseHeight);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawCar(){
    const r = carRect();
    // body
    ctx.fillStyle = car.color;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    // windows
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(r.x+10, r.y+12, r.w-20, 18);
    ctx.fillRect(r.x+10, r.y+r.h-30, r.w-20, 18);
    // wheels
    ctx.fillStyle = "#111827";
    ctx.fillRect(r.x-6, r.y+14, 6, 18);
    ctx.fillRect(r.x+r.w, r.y+14, 6, 18);
    ctx.fillRect(r.x-6, r.y+r.h-32, 6, 18);
    ctx.fillRect(r.x+r.w, r.y+r.h-32, 6, 18);
  }

  function drawObstacles(){
    for(const o of state.obstacles){
      ctx.fillStyle = o.color;
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
  }

  function update(dt){
    // speed up over time
    state.speed += state.speedIncrease * dt;
    state.score += dt * 0.05; // time-based scoring

    // spawn obstacles
    state.lastSpawn += dt;
    if(state.lastSpawn >= state.obstacleInterval){
      state.lastSpawn = 0;
      spawnObstacle();
      // gradually tighten spawn interval but clamp
      state.obstacleInterval = Math.max(450, state.obstacleInterval - 12);
    }

    // move obstacles
    const dy = state.speed * (dt/1000);
    for(const o of state.obstacles){ o.y += dy; }

    // remove off-screen and add points
    const before = state.obstacles.length;
    state.obstacles = state.obstacles.filter(o => o.y < baseHeight + 80);
    const removed = before - state.obstacles.length;
    if(removed > 0){ state.score += removed * 5; }

    // collisions
    const r = carRect();
    for(const o of state.obstacles){
      if(rectsOverlap(r,o)){
        if(state.score > state.best){
          state.best = Math.floor(state.score);
          localStorage.setItem("carRace.bestScore", String(state.best));
        }
        gameOver();
        break;
      }
    }

    updateHUD();
  }

  function render(){
    ctx.clearRect(0,0,baseWidth,baseHeight);
    drawRoad();
    drawObstacles();
    drawCar();
  }

  function loop(ts){
    if(state.gameOver || state.paused) return;
    if(!state.lastTime) state.lastTime = ts;
    const dt = Math.min(50, ts - state.lastTime); // clamp delta for stability
    state.lastTime = ts;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function moveLeft(){ car.lane = Math.max(0, car.lane - 1); }
  function moveRight(){ car.lane = Math.min(lanes-1, car.lane + 1); }

  // Controls - keyboard
  window.addEventListener("keydown", (e) => {
    if(e.repeat) return;
    const key = e.key.toLowerCase();
    if(key === "arrowleft" || key === "a"){ e.preventDefault(); moveLeft(); }
    else if(key === "arrowright" || key === "d"){ e.preventDefault(); moveRight(); }
    else if(key === "p"){ e.preventDefault(); pauseToggle(); }
    else if(key === " "){ e.preventDefault(); if(state.gameOver || !state.running) start(); }
  });

  // Buttons / touch
  startBtn?.addEventListener("click", start);
  pauseBtn?.addEventListener("click", pauseToggle);
  leftBtn?.addEventListener("click", moveLeft);
  rightBtn?.addEventListener("click", moveRight);

  // Prevent iOS double-tap zoom on control buttons
  for(const el of [leftBtn,rightBtn,startBtn,pauseBtn]){
    if(!el) continue;
    el.addEventListener("touchstart", (e)=>{ e.preventDefault(); }, {passive:false});
  }

  // Show initial overlay
  overlay.style.display = "flex";
})();