const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');
const videoFinal = document.getElementById('videoFinal');
const videoContainer = document.getElementById('videoContainer');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const Y_PISO = canvas.height - 40;

// --- SISTEMA DE CARGA SEGURO ---
let imagenesCargadas = 0;
const totalImagenes = 6;

function checkCarga() {
    imagenesCargadas++;
    if (imagenesCargadas === totalImagenes) {
        console.log("Todo listo, arrancando...");
        main(); // Solo arranca cuando todo cargó
    }
}

const assets = {
    lit: new Image(), canto: new Image(), fondo: new Image(),
    bafle: new Image(), micro: new Image(), gorra: new Image()
};

// Asignar fuentes y vigilar carga
assets.lit.onload = checkCarga; assets.lit.src = 'lit_killah_master.png';
assets.canto.onload = checkCarga; assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.onload = checkCarga; assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.onload = checkCarga; assets.bafle.src = 'bafle_anim.png.png';
assets.micro.onload = checkCarga; assets.micro.src = 'micro_anim.png';
assets.gorra.onload = checkCarga; assets.gorra.src = 'enemigo_gorra.png';

let scrollOffset = 0;
let gameIsOver = false;
let showIsRunning = false;
let cinematicPlayed = false;
const teclas = { derecha: { presionada: false }, izquierda: { presionada: false } };

class Jugador {
    constructor() {
        this.x = 100; this.y = Y_PISO - 120; this.dy = 0;
        this.frame = 0; this.timer = Date.now();
    }
    dibujar() {
        const ahora = Date.now();
        let img = (showIsRunning && cinematicPlayed) ? assets.canto : assets.lit;
        let fila = (teclas.derecha.presionada || teclas.izquierda.presionada) ? 64 : 0;
        
        let maxFrames = (showIsRunning) ? 4 : (fila === 64 ? 4 : 2);
        if (ahora - this.timer > 100) { this.frame = (this.frame + 1) % maxFrames; this.timer = ahora; }
        
        ctx.drawImage(img, this.frame * 64, fila, 64, 64, this.x, this.y, 120, 120);
    }
    actualizar() {
        if (showIsRunning && !cinematicPlayed) return;
        this.y += this.dy;
        if (this.y + 120 < Y_PISO) { this.dy += 0.8; }
        else { this.dy = 0; this.y = Y_PISO - 120; }
        if (teclas.derecha.presionada && this.x < 400) this.x += 6;
        else if (teclas.izquierda.presionada && this.x > 50) this.x -= 6;
        else if (teclas.derecha.presionada) scrollOffset += 6;
    }
}

class Enemigo {
    constructor(x, y, img) { this.x = x; this.y = y; this.img = img; this.frame = 0; this.timer = Date.now(); }
    dibujar() {
        let posX = this.x - scrollOffset;
        ctx.drawImage(this.img, this.frame * 64, 0, 64, 64, posX, this.y, 80, 80);
        if (Date.now() - this.timer > 150) { this.frame = (this.frame + 1) % 3; this.timer = Date.now(); }
    }
}

const lit = new Jugador();
const enemigos = [
    new Enemigo(1500, Y_PISO - 80, assets.bafle),
    new Enemigo(2500, Y_PISO - 220, assets.gorra),
    new Enemigo(3500, Y_PISO - 80, assets.micro)
];

// --- EVENTOS ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha.presionada = true;
    if (e.code === 'ArrowLeft') teclas.izquierda.presionada = true;
    if (e.code === 'Space' && lit.y >= Y_PISO - 121) lit.dy = -16;
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha.presionada = false;
    if (e.code === 'ArrowLeft') teclas.izquierda.presionada = false;
});

// Touch
document.getElementById('btnIzq').addEventListener('touchstart', (e) => { e.preventDefault(); teclas.izquierda.presionada = true; });
document.getElementById('btnIzq').addEventListener('touchend', () => teclas.izquierda.presionada = false);
document.getElementById('btnDer').addEventListener('touchstart', (e) => { e.preventDefault(); teclas.derecha.presionada = true; });
document.getElementById('btnDer').addEventListener('touchend', () => teclas.derecha.presionada = false);
document.getElementById('btnSalto').addEventListener('touchstart', (e) => { e.preventDefault(); if (lit.y >= Y_PISO - 121) lit.dy = -16; });

function main() {
    if (window.innerHeight > window.innerWidth) { requestAnimationFrame(main); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo Parallax
    let xF = -(scrollOffset * 0.5 % canvas.width);
    ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);

    lit.actualizar(); lit.dibujar();

    enemigos.forEach(en => {
        en.dibujar();
        if (lit.x < en.x - scrollOffset + 50 && lit.x + 60 > en.x - scrollOffset && lit.y < en.y + 50 && lit.y + 60 > en.y) {
            if (!showIsRunning) gameIsOver = true;
        }
    });

    if (scrollOffset > 5000 && !showIsRunning) {
        showIsRunning = true;
        videoContainer.style.display = 'block';
        videoFinal.play();
        videoFinal.onended = () => { videoContainer.style.display = 'none'; cinematicPlayed = true; audioFinal.play(); };
    }

    if (!gameIsOver) requestAnimationFrame(main);
    else {
        ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white"; ctx.font = "30px Arial"; ctx.textAlign="center";
        ctx.fillText("GAME OVER - RECARGA LA PÁGINA", canvas.width/2, canvas.height/2);
    }
}
