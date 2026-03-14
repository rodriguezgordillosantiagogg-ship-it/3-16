const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');
const videoFinal = document.getElementById('videoFinal');
const videoContainer = document.getElementById('videoContainer');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;

// Configuración de Mundo (Estilo Mario)
const GRAVEDAD = 0.8;
const VEL_CAMINATA = 6;
const FUERZA_SALTO = -16;
const Y_SUELO = canvas.height - 100;

let imagenesCargadas = 0;
const assets = {
    lit: new Image(), canto: new Image(), fondo: new Image(), bafle: new Image()
};
assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png';

Object.values(assets).forEach(img => img.onload = () => { 
    imagenesCargadas++; 
    if (imagenesCargadas === 4) main(); 
});

let scrollOffset = 0;
let litX = 100;
let litY = Y_SUELO - 120;
let litDy = 0;
let estaEnSuelo = false;
let showIsRunning = false;
let gameIsOver = false;
const teclas = { derecha: false };

class Animador {
    constructor(img, fx, fy) {
        this.img = img; this.fx = fx; this.fy = fy;
        this.frame = 0; this.timer = Date.now();
    }
    dibujar(x, y, w, h, fila = 0, speed = 130) {
        const sw = this.img.width / this.fx;
        const sh = this.img.height / this.fy;
        if (Date.now() - this.timer > speed) {
            this.frame = (this.frame + 1) % this.fx;
            this.timer = Date.now();
        }
        ctx.drawImage(this.img, this.frame * sw, fila * sh, sw, sh, x, y, w, h);
    }
}

const spriteLit = new Animador(assets.lit, 4, 2);
const spriteCanto = new Animador(assets.canto, 4, 1);
const spriteBafle = new Animador(assets.bafle, 4, 1);

function dibujarEscenario() {
    // 1. DIBUJAR PISO DE BLOQUES (Estilo Mario)
    ctx.fillStyle = "#8b4513"; // Color tierra/ladrillo
    ctx.fillRect(0, Y_SUELO, canvas.width, 100);
    
    // Línea superior del bloque para que se vea la plataforma
    ctx.fillStyle = "#ffaa00"; 
    ctx.fillRect(0, Y_SUELO, canvas.width, 8);

    // 2. DIBUJAR LA BANDERA AL FINAL (Meta)
    let metaX = 5000 - scrollOffset;
    if (metaX > -100 && metaX < canvas.width + 200) {
        // El mástil de la bandera
        ctx.fillStyle = "white";
        ctx.fillRect(metaX + 40, Y_SUELO - 300, 10, 300);
        // El triángulo de la bandera
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.moveTo(metaX + 50, Y_SUELO - 300);
        ctx.lineTo(metaX + 100, Y_SUELO - 275);
        ctx.lineTo(metaX + 50, Y_SUELO - 250);
        ctx.fill();
    }
}

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo Parallax
    let xF = -(scrollOffset * 0.3 % canvas.width);
    ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);

    dibujarEscenario();

    // Lógica Física de Lit
    if (!showIsRunning) {
        litY += litDy;
        if (litY + 120 < Y_SUELO) {
            litDy += GRAVEDAD;
            estaEnSuelo = false;
        } else {
            litDy = 0;
            litY = Y_SUELO - 120;
            estaEnSuelo = true;
        }

        if (teclas.derecha) {
            if (litX < 400) litX += VEL_CAMINATA;
            else scrollOffset += VEL_CAMINATA;
        }
    }

    // Render de Lit
    if (showIsRunning) {
        spriteCanto.dibujar(litX, litY, 120, 120, 0, 250);
    } else {
        let fila = (teclas.derecha) ? 1 : 0;
        spriteLit.dibujar(litX, litY, 120, 120, fila);
    }

    // Colisión con Enemigo (Bafle)
    let bX = 1500 - scrollOffset;
    if (bX > -100 && bX < canvas.width) {
        spriteBafle.dibujar(bX, Y_SUELO - 80, 80, 80);
        if (litX < bX + 50 && litX + 60 > bX && litY > Y_SUELO - 140) {
            gameIsOver = true;
        }
    }

    // Activar Meta (Bandera)
    if (scrollOffset > 4900 && !showIsRunning) activarCinematica();

    if (!gameIsOver) requestAnimationFrame(main);
    else {
        ctx.fillStyle = "white"; ctx.font = "bold 30px sans-serif";
        ctx.fillText("¡INTÉNTALO DE NUEVO, SANTI!", canvas.width/2 - 200, canvas.height/2);
    }
}

// Eventos
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = true;
    if (e.code === 'Space' && estaEnSuelo && !showIsRunning) litDy = FUERZA_SALTO;
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = false;
});

function activarCinematica() {
    showIsRunning = true;
    teclas.derecha = false;
    videoContainer.style.display = 'block';
    videoFinal.play();
    videoFinal.onended = () => {
        videoContainer.style.display = 'none';
        audioFinal.play();
    };
}
