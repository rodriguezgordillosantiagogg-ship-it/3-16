
/**
 * PROYECTO: LIT KILLAH - EL ÚLTIMO BAILE
 * ESTUDIANTE: SANTIAGO - ADSO
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');

// Configuración de pantalla
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const Y_SUELO = canvas.height - 120;

// --- 1. CARGA DE LOS 6 ARCHIVOS ---
const imgMasterLit = new Image(); imgMasterLit.src = 'lit_killah_master.png';
const imgCantoLit = new Image(); imgCantoLit.src = 'lit_cantando_flow.png';
const imgFondo = new Image(); imgFondo.src = 'fondo_ciudad_fiesta.png';
const imgBafle = new Image(); imgBafle.src = 'enemigo_bafle.png';
const imgMicro = new Image(); imgMicro.src = 'enemigo_micro.png';
const imgGorra = new Image(); imgGorra.src = 'enemigo_gorra.png';

const SPRITE_SIZE = 64; 
let scrollOffset = 0;
let gameIsOver = false;
let showIsRunning = false;

// --- 2. LÓGICA DEL JUGADOR ---
class Jugador {
    constructor() {
        this.x = 100; this.y = Y_SUELO - 128; this.dy = 0;
        this.ancho = SPRITE_SIZE; this.alto = SPRITE_SIZE;
        this.estaEnSuelo = false;
        
        // Control de frames
        this.frameWalk = 0; this.frameIdle = 0; this.frameCanto = 0;
        this.timer = Date.now();
    }

    dibujar() {
        const ahora = Date.now();
        
        if (showIsRunning) {
            // SHOW FINAL: Usa lit_cantando_flow.png (4 frames)
            ctx.drawImage(imgCantoLit, this.frameCanto * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, this.x, this.y, 128, 128);
            if (ahora - this.timer > 150) { this.frameCanto = (this.frameCanto + 1) % 4; this.timer = ahora; }
        } 
        else if (teclas.derecha.presionada || teclas.izquierda.presionada) {
            // CAMINANDO: Fila inferior de lit_killah_master.png
            ctx.drawImage(imgMasterLit, this.frameWalk * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, this.x, this.y, 128, 128);
            if (ahora - this.timer > 80) { this.frameWalk = (this.frameWalk + 1) % 4; this.timer = ahora; }
        } 
        else {
            // IDLE/PARPADEO: Fila superior de lit_killah_master.png
            ctx.drawImage(imgMasterLit, this.frameIdle * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, this.x, this.y, 128, 128);
            if (ahora - this.timer > 400) { this.frameIdle = (this.frameIdle + 1) % 2; this.timer = ahora; }
        }
    }

    actualizar() {
        this.y += this.dy;
        if (this.y + 128 + this.dy < Y_SUELO) { this.dy += 0.8; this.estaEnSuelo = false; }
        else { this.dy = 0; this.y = Y_SUELO - 128; this.estaEnSuelo = true; }
        
        // Movimiento de cámara
        if (teclas.derecha.presionada && this.x < 400) this.x += 5;
        else if (teclas.izquierda.presionada && this.x > 100) this.x -= 5;
        else if (teclas.derecha.presionada) scrollOffset += 5;
    }
}

// --- 3. LÓGICA DE ENEMIGOS ---
class Enemigo {
    constructor(x, y, img, tipo) {
        this.x = x; this.y = y; this.img = img; this.tipo = tipo;
        this.frameGorra = 0; this.timerGorra = Date.now();
    }

    dibujar() {
        let posX = this.x - scrollOffset;
        if (this.tipo === 'gorra') {
            // Animación de la gorra (3 frames)
            ctx.drawImage(this.img, this.frameGorra * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, posX, this.y, 64, 64);
            if (Date.now() - this.timerGorra > 150) { this.frameGorra = (this.frameGorra + 1) % 3; this.timerGorra = Date.now(); }
        } else {
            ctx.drawImage(this.img, posX, this.y, 64, 64);
        }
    }
}

// --- 4. OBJETOS E INICIALIZACIÓN ---
const lit = new Jugador();
const enemigos = [
    new Enemigo(800, Y_SUELO - 64, imgBafle, 'bafle'),
    new Enemigo(1500, Y_SUELO - 150, imgGorra, 'gorra'),
    new Enemigo(2200, Y_SUELO - 64, imgMicro, 'micro')
];

const teclas = { derecha: { presionada: false }, izquierda: { presionada: false } };

window.addEventListener('keydown', (e) => {
    if (e.keyCode === 39) teclas.derecha.presionada = true;
    if (e.keyCode === 37) teclas.izquierda.presionada = true;
    if (e.keyCode === 32 && lit.estaEnSuelo) lit.dy = -15;
});

window.addEventListener('keyup', (e) => {
    if (e.keyCode === 39) teclas.derecha.presionada = false;
    if (e.keyCode === 37) teclas.izquierda.presionada = false;
});

// --- 5. BUCLE PRINCIPAL ---
function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar Fondo Infinito
    let xFondo = -(scrollOffset * 0.5 % canvas.width);
    ctx.drawImage(imgFondo, xFondo, 0, canvas.width, canvas.height);
    ctx.drawImage(imgFondo, xFondo + canvas.width, 0, canvas.width, canvas.height);

    lit.actualizar();
    lit.dibujar();

    enemigos.forEach(en => {
        en.dibujar();
        // Colisión simple
        if (lit.x + 80 > en.x - scrollOffset && lit.x < en.x - scrollOffset + 40 && lit.y + 80 > en.y) {
             if (!showIsRunning) gameIsOver = true; 
        }
    });

    if (scrollOffset > 3000 && !showIsRunning) {
        showIsRunning = true;
        audioFinal.play();
    }

    if (!gameIsOver) requestAnimationFrame(main);
    else { ctx.fillStyle = "white"; ctx.font = "40px Arial"; ctx.fillText("GAME OVER - F5 para reintentar", canvas.width/4, canvas.height/2); }
}

main();
