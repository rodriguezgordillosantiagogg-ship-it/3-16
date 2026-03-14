const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');
const videoFinal = document.getElementById('videoFinal');
const videoContainer = document.getElementById('videoContainer');

// Renderizado estilo Pixel-Art
ctx.imageSmoothingEnabled = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const Y_PISO = canvas.height - 80;

let imagenesCargadas = 0;
const totalImagenes = 6;

function checkCarga() {
    imagenesCargadas++;
    if (imagenesCargadas === totalImagenes) main();
}

const assets = {
    lit: new Image(), canto: new Image(), fondo: new Image(),
    bafle: new Image(), micro: new Image(), gorra: new Image()
};

// Carga de archivos
assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png';
assets.micro.src = 'micro_anim.png';
assets.gorra.src = 'enemigo_gorra.png';

Object.values(assets).forEach(img => img.onload = checkCarga);

let scrollOffset = 0;
let gameIsOver = false;
let showIsRunning = false;
let cinematicPlayed = false;
const teclas = { derecha: { presionada: false } };

class Animador {
    constructor(img, framesX, framesY) {
        this.img = img;
        this.fx = framesX;
        this.fy = framesY;
        this.frame = 0;
        this.timer = 0;
    }

    dibujar(x, y, w, h, fila = 0, speed = 150) {
        const sw = this.img.width / this.fx;
        const sh = this.img.height / this.fy;

        if (Date.now() - this.timer > speed) {
            this.frame = (this.frame + 1) % this.fx;
            this.timer = Date.now();
        }

        ctx.drawImage(this.img, this.frame * sw, fila * sh, sw, sh, x, y, w, h);
    }
}

const animLit = new Animador(assets.lit, 4, 2); 
const animCanto = new Animador(assets.canto, 4, 1);
const animBafle = new Animador(assets.bafle, 4, 1);

let litX = 100;
let litY = Y_PISO - 120;
let litDy = 0;

function main() {
    if (window.innerHeight > window.innerWidth) { requestAnimationFrame(main); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo
    let xF = -(scrollOffset * 0.5 % canvas.width);
    ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);

    // LÓGICA DE MOVIMIENTO (Solo si NO ha empezado el show)
    if (!showIsRunning) {
        litY += litDy;
        if (litY + 120 < Y_PISO) litDy += 0.8;
        else { litDy = 0; litY = Y_PISO - 120; }

        if (teclas.derecha.presionada) {
            if (litX < 400) litX += 6;
            else scrollOffset += 6;
        }
    }

    // DIBUJO DE LIT
    if (showIsRunning) {
        // MÁS LENTO: speed aumentado a 250ms para que se note cada movimiento del micro
        animCanto.dibujar(litX, litY, 120, 120, 0, 250); 
    } else {
        let fila = (teclas.derecha.presionada) ? 1 : 0;
        animLit.dibujar(litX, litY, 120, 120, fila, 130);
    }

    // Obstáculos (Bafle)
    let bafleX = 1200 - scrollOffset;
    if (bafleX > -100 && bafleX < canvas.width) {
        animBafle.dibujar(bafleX, Y_PISO - 80, 80, 80);
        if (litX < bafleX + 50 && litX + 60 > bafleX && litY > Y_PISO - 150) {
            if (!showIsRunning) gameIsOver = true;
        }
    }

    if (scrollOffset > 5000 && !showIsRunning) activarCinematica();

    if (!gameIsOver) requestAnimationFrame(main);
}

function activarCinematica() {
    showIsRunning = true;
    // Forzamos que Lit deje de correr
    teclas.derecha.presionada = false;
    
    videoContainer.style.display = 'block';
    videoFinal.play();
    
    videoFinal.onended = () => {
        videoContainer.style.display = 'none';
        cinematicPlayed = true;
        audioFinal.play(); // Inicia el audio de Sofi
    };
}

// Eventos (Desactivados internamente por showIsRunning)
window.addEventListener('keydown', (e) => { 
    if (e.code === 'ArrowRight') teclas.derecha.presionada = true; 
    if (e.code === 'Space' && litY >= Y_PISO - 121 && !showIsRunning) litDy = -16;
});
window.addEventListener('keyup', (e) => { 
    if (e.code === 'ArrowRight') teclas.derecha.presionada = false; 
});
