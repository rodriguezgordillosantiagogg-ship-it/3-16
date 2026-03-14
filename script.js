const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');
const videoFinal = document.getElementById('videoFinal');
const videoContainer = document.getElementById('videoContainer');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const Y_SUELO = canvas.height - 120;

// CARGA DE ACTIVOS
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
let cinematicPlayed = false;

class Jugador {
    constructor() {
        this.x = 100; this.y = Y_SUELO - 128; this.dy = 0;
        this.estaEnSuelo = false;
        this.frameWalk = 0; this.frameIdle = 0; this.frameCanto = 0;
        this.timer = Date.now();
    }

    dibujar() {
        const ahora = Date.now();
        if (showIsRunning && cinematicPlayed) {
            ctx.drawImage(imgCantoLit, this.frameCanto * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, this.x, this.y, 128, 128);
            if (ahora - this.timer > 150) { this.frameCanto = (this.frameCanto + 1) % 4; this.timer = ahora; }
        } else if (teclas.derecha.presionada || teclas.izquierda.presionada) {
            ctx.drawImage(imgMasterLit, this.frameWalk * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, this.x, this.y, 128, 128);
            if (ahora - this.timer > 80) { this.frameWalk = (this.frameWalk + 1) % 4; this.timer = ahora; }
        } else {
            ctx.drawImage(imgMasterLit, this.frameIdle * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, this.x, this.y, 128, 128);
            if (ahora - this.timer > 400) { this.frameIdle = (this.frameIdle + 1) % 2; this.timer = ahora; }
        }
    }

    actualizar() {
        if (showIsRunning && !cinematicPlayed) return; // Pausa durante el video
        this.y += this.dy;
        if (this.y + 128 + this.dy < Y_SUELO) { this.dy += 0.8; this.estaEnSuelo = false; }
        else { this.dy = 0; this.y = Y_SUELO - 128; this.estaEnSuelo = true; }
        if (teclas.derecha.presionada && this.x < 400) this.x += 5;
        else if (teclas.izquierda.presionada && this.x > 100) this.x -= 5;
        else if (teclas.derecha.presionada) scrollOffset += 5;
    }
}

// Lógica de Cinemática Final
function activarCinematica() {
    if (!showIsRunning) {
        showIsRunning = true;
        teclas.derecha.presionada = false;
        videoContainer.style.display = 'block';
        videoFinal.play();
        
        videoFinal.onended = () => {
            videoContainer.style.display = 'none';
            cinematicPlayed = true;
            audioFinal.play();
        };
    }
}

const lit = new Jugador();
const teclas = { derecha: { presionada: false }, izquierda: { presionada: false } };

// CONTROLES (PC & TOUCH)
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 39) teclas.derecha.presionada = true;
    if (e.keyCode === 37) teclas.izquierda.presionada = true;
    if (e.keyCode === 32 && lit.estaEnSuelo) lit.dy = -15;
});
window.addEventListener('keyup', (e) => {
    if (e.keyCode === 39) teclas.derecha.presionada = false;
    if (e.keyCode === 37) teclas.izquierda.presionada = false;
});

document.getElementById('btnIzq').addEventListener('touchstart', (e) => { e.preventDefault(); teclas.izquierda.presionada = true; });
document.getElementById('btnIzq').addEventListener('touchend', () => teclas.izquierda.presionada = false);
document.getElementById('btnDer').addEventListener('touchstart', (e) => { e.preventDefault(); teclas.derecha.presionada = true; });
document.getElementById('btnDer').addEventListener('touchend', () => teclas.derecha.presionada = false);
document.getElementById('btnSalto').addEventListener('touchstart', (e) => { e.preventDefault(); if (lit.estaEnSuelo) lit.dy = -15; });

function main() {
    if (window.innerHeight > window.innerWidth) { requestAnimationFrame(main); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let xFondo = -(scrollOffset * 0.5 % canvas.width);
    ctx.drawImage(imgFondo, xFondo, 0, canvas.width, canvas.height);
    ctx.drawImage(imgFondo, xFondo + canvas.width, 0, canvas.width, canvas.height);

    lit.actualizar(); lit.dibujar();

    if (scrollOffset > 3000) activarCinematica();
    if (!gameIsOver) requestAnimationFrame(main);
}
main();
