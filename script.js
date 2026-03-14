const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');
const videoFinal = document.getElementById('videoFinal');
const videoContainer = document.getElementById('videoContainer');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const Y_SUELO = canvas.height - 100; // El nivel del piso

// --- CARGA DE ARCHIVOS CON VERIFICACIÓN ---
const assets = {
    lit: new Image(),
    canto: new Image(),
    fondo: new Image(),
    bafle: new Image(),
    micro: new Image(),
    gorra: new Image()
};

assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png.png';
assets.micro.src = 'micro_anim.png';
assets.gorra.src = 'enemigo_gorra.png';

const SPRITE_SIZE = 64; 
let scrollOffset = 0;
let gameIsOver = false;
let showIsRunning = false;
let cinematicPlayed = false;

// --- CLASE JUGADOR ---
class Jugador {
    constructor() {
        this.x = 100; this.y = Y_SUELO - 128; this.dy = 0;
        this.estaEnSuelo = false;
        this.frame = 0;
        this.timer = Date.now();
    }

    dibujar() {
        const ahora = Date.now();
        let img = assets.lit;
        let fila = 0; // 0 es Idle, 64 es Walk

        if (showIsRunning && cinematicPlayed) {
            img = assets.canto;
            fila = 0;
            if (ahora - this.timer > 150) { this.frame = (this.frame + 1) % 4; this.timer = ahora; }
        } else if (teclas.derecha.presionada || teclas.izquierda.presionada) {
            fila = 64; // Fila de caminar
            if (ahora - this.timer > 80) { this.frame = (this.frame + 1) % 4; this.timer = ahora; }
        } else {
            fila = 0; // Fila de parpadeo
            if (ahora - this.timer > 400) { this.frame = (this.frame + 1) % 2; this.timer = ahora; }
        }

        ctx.drawImage(img, this.frame * SPRITE_SIZE, fila, SPRITE_SIZE, SPRITE_SIZE, this.x, this.y, 128, 128);
    }

    actualizar() {
        if (showIsRunning && !cinematicPlayed) return;
        this.y += this.dy;
        if (this.y + 128 < Y_SUELO) { this.dy += 0.8; this.estaEnSuelo = false; }
        else { this.dy = 0; this.y = Y_SUELO - 128; this.estaEnSuelo = true; }
        
        if (teclas.derecha.presionada && this.x < 400) this.x += 5;
        else if (teclas.izquierda.presionada && this.x > 100) this.x -= 5;
        else if (teclas.derecha.presionada) scrollOffset += 5;
    }
}

// --- CLASE ENEMIGO ---
class Enemigo {
    constructor(x, y, img, tipo) {
        this.x = x; this.y = y; this.img = img; this.tipo = tipo;
        this.frame = 0; this.timer = Date.now();
    }
    dibujar() {
        let posX = this.x - scrollOffset;
        // Si es la gorra o bafle que tienen varios frames
        ctx.drawImage(this.img, this.frame * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, posX, this.y, 80, 80);
        if (Date.now() - this.timer > 150) { this.frame = (this.frame + 1) % 3; this.timer = Date.now(); }
    }
}

const lit = new Jugador();
const enemigos = [
    new Enemigo(1200, Y_SUELO - 80, assets.bafle, 'bafle'),
    new Enemigo(2000, Y_SUELO - 200, assets.gorra, 'gorra'),
    new Enemigo(2800, Y_SUELO - 80, assets.micro, 'micro')
];

const teclas = { derecha: { presionada: false }, izquierda: { presionada: false } };

// --- CONTROLES ---
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 39) teclas.derecha.presionada = true;
    if (e.keyCode === 37) teclas.izquierda.presionada = true;
    if (e.keyCode === 32 && lit.estaEnSuelo) lit.dy = -15;
});
window.addEventListener('keyup', (e) => {
