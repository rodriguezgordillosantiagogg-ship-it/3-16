const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const carruselDiv = document.getElementById('carrusel');
const uploadFotos = document.getElementById('uploadFotos');
const audioFinal = document.getElementById('audioFinal');
const introOverlay = document.getElementById('introOverlay');
const caja = document.getElementById('caja');
const arrow = document.getElementById('arrow');
const introText = document.getElementById('introText');

let Y_PISO;
let fotos = [];
let showStarted = false;
let carruselSpeed = 0;

// --- Sprites ---
const assets = {
  lit: new Image(),
  fondo: new Image(),
  cofre: new Image()
};
assets.lit.src = 'lit_killah_master.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.cofre.src = 'bafle_anim.png';

// Lit Killah
let lit = { x:100, y:0, baseW:120, baseH:120, w:60, h:60, alpha:0.1 };
let gameFinished = false;

// --- Resize ---
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  Y_PISO = canvas.height - 100;
  lit.y = Y_PISO - lit.h;
}
window.addEventListener('resize', resize);
resize();

// --- Subida de fotos ---
uploadFotos.addEventListener('change', (e)=>{
  Array.from(e.target.files).forEach(file=>{
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    carruselDiv.appendChild(img);
    fotos.push(img);
  });

  if(fotos.length>0 && !showStarted){
    // Animación de cierre de caja
    caja.style.transform = "scaleY(0.1)";
    caja.style.transition = "transform 1s";
    introOverlay.style.opacity = 0;
    setTimeout(()=>introOverlay.style.display="none",1000);
    showStarted = true;
  }
});

// --- Partículas ---
let particles = [];
function createParticles(){
  for(let i=0;i<5;i++){
    particles.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, alpha:0.2+Math.random()*0.3, size:2+Math.random()*3});
  }
}

// --- Loop principal ---
function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(showStarted){
    // Fondo
    if(assets.fondo.complete){
      ctx.drawImage(assets.fondo,0,0,canvas.width,canvas.height);
    }

    // Carrusel
    carruselSpeed = fotos.length*0.5 + 2;
    fotos.forEach((img,i)=>{
      let offset = (Date.now()/100*carruselSpeed + i*220) % (carruselDiv.clientWidth*2);
      img.style.transform = `translateX(${-offset}px)`;
    });

    // Luz y overlay cálido
    let lightAlpha = Math.min(1, 0.1 + carruselSpeed/10);
    ctx.fillStyle = `rgba(0,0,0,${1-lightAlpha})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = `rgba(255,200,150,${lightAlpha*0.1})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Partículas
    if(particles.length===0) createParticles();
    particles.forEach(p=>{
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fill();
      p.y += 0.1;
      if(p.y>canvas.height) p.y=0;
    });

    // Crecimiento Lit
    let minScale = 0.5;
    let maxScale = 1;
    let growthFactor = Math.min(1,carruselSpeed/10);
    lit.w = lit.baseW * (minScale + growthFactor*(maxScale-minScale));
    lit.h = lit.baseH * (minScale + growthFactor*(maxScale-minScale));
    lit.y = Y_PISO - lit.h;

    // Lit alpha fade-in
    if(assets.lit.complete){
      lit.alpha = Math.min(1, lit.alpha + 0.01*carruselSpeed);
      ctx.globalAlpha = lit.alpha;
      // Sombra
      ctx.fillStyle = `rgba(0,0,0,0.3)`;
      ctx.beginPath();
      ctx.ellipse(lit.x + lit.w/2, Y_PISO, lit.w/2, 10, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.drawImage(assets.lit,0,0,384,512, lit.x, lit.y, lit.w, lit.h);
      ctx.globalAlpha = 1;
    }

    // Lit camina automáticamente
    if(lit.alpha>0.3 && !gameFinished){
      lit.x += 2 + carruselSpeed*0.1;
    }

    // Cofre
    let cofreX = canvas.width-200;
    ctx.drawImage(assets.cofre,0,0,assets.cofre.width,assets.cofre.height,cofreX,Y_PISO-80,80,80);

    // Llegada al cofre
    if(lit.x + lit.w > cofreX && !gameFinished){
      gameFinished = true;
      audioFinal.play();
    }
  }

  requestAnimationFrame(loop);
}

loop();
