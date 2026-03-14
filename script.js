const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');
const videoFinal = document.getElementById('videoFinal');
const videoContainer = document.getElementById('videoContainer');

// Forzar renderizado estilo pixel-art
ctx.imageSmoothingEnabled = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Coordenada Y del Suelo (donde pisará Lit)
const Y_SUELO = canvas.height - 100;

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

// Carga de archivos (revisa que los nombres en tu carpeta coincidan exactamente)
assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png';
assets.micro.src = 'micro_anim.png';
assets.gorra.src = 'enemigo_gorra.png';

Object.values(assets).forEach(img => img.onload = checkCarga);

// Variables de Juego
let scrollOffset = 0;
let gameIsOver = false;
let showIsRunning = false;
let cinematicPlayed = false;
const teclas = { derecha: { presionada: false } };

// --- CLASE DE ANIMACIÓN CENTRALIZADA ---
class Sprite {
    constructor(img, framesHorizontal, filasVertical, animSpeed) {
        this.img = img;
        this.fx = framesHorizontal;
        this.fy = filasVertical;
        this.frameActual = 0;
        this.filaActual = 0;
        this.timer = Date.now();
        this.speed = animSpeed; // Tiempo entre frames en ms
    }

    // Función para dibujar y animar el sprite
    dibujar(x, y, anchoDestino, altoDestino, filaFix = -1) {
        // Calcular el tamaño real de CADA dibujo en la tira original
        const sw = this.img.width / this.fx;
        const sh = this.img.height / this.fy;

        // Cambiar de frame si ya pasó el tiempo
        if (Date.now() - this.timer > this.speed) {
            this.frameActual = (this.frameActual + 1) % this.fx;
            this.timer = Date.now();
        }

        // Si filaFix es -1, usa la fila por defecto. Si no, usa la fila indicada (ej. para Lit caminando)
        let f = (filaFix === -1) ? this.filaActual : filaFix;

        // DIBUJAR EN CANVAS:
        ctx.drawImage(
            this.img,
            this.frameActual * sw, f * sh, // Dónde empieza el recorte en la tira
            sw, sh,                         // Tamaño del recorte
            x, y,                           // Dónde se dibuja en pantalla
            anchoDestino, altoDestino       // Tamaño en pantalla
        );
    }
}

// Configuración de Sprites basados en tus archivos
// (Ajusta los números si tus tiras tienen más o menos dibujos)
const spriteLitNormal = new Sprite(assets.lit, 4, 2, 130);  // 4 frames quieto, 4 frames caminando
const spriteLitCanto = new Sprite(assets.canto, 4, 1, 100);  // 4 frames cantando rápido
const spriteBafle = new Sprite(assets.bafle, 4, 1, 150);     // 4 frames vibrando
const spriteGorra = new Sprite(assets.gorra, 3, 1, 200);     // 3 frames parpadeando
const spriteMicro = new Sprite(assets.micro, 3, 1, 150);     // 3 frames vibrando

// Variables de Lit
let litX = 100;
let litY = Y_SUELO - 128; // Lit mide 128px de alto
let litDy = 0;

// --- FUNCIÓN PRINCIPAL DEL BUCLE DEL JUEGO ---
function main() {
    // Si el celu está en vertical, paramos el juego y avisamos
    if (window.innerHeight > window.innerWidth) {
        ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white"; ctx.textAlign="center";
        ctx.fillText("Gira el celular 🔄", canvas.width/2, canvas.height/2);
        requestAnimationFrame(main); return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // --- DIBUJAR FONDO Y PISO (PARALLAX) ---
    // Fondo de la ciudad (se mueve al 50% de la velocidad)
    let xF = -(scrollOffset * 0.5 % canvas.width);
    ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);

    // 1. DIBUJAR EL PISO (NUEVO): Un rectángulo gris oscuro tipo calle
    ctx.fillStyle = "#333333"; // Gris oscuro
    ctx.fillRect(0, Y_SUELO, canvas.width, canvas.height); // Rellena todo abajo

    // --- LÓGICA DE MOVIMIENTO DE LIT ---
    // Solo si NO ha empezado el show
    if (!showIsRunning) {
        litY += litDy;
        if (litY + 128 < Y_SUELO) litDy += 0.8; // Gravedad
        else { litDy = 0; litY = Y_SUELO - 128; } // Pisar suelo

        // Moverse a la derecha y Scroll
        if (teclas.derecha.presionada) {
            if (litX < 400) litX += 6; // Lit avanza hasta el medio
            else scrollOffset += 6;    // El mundo retrocede (scroll)
        }
    }

    // --- DIBUJAR A LIT (SIN PARPADEOS) ---
    if (showIsRunning) {
        // Si el show empezó, Lit canta pixelado y lento (speed: 250ms)
        spriteLitCanto.speed = 250; 
        spriteLitCanto.dibujar(litX, litY, 128, 128); 
    } else {
        // Si está quieto, usa fila 0. Si camina, usa fila 1 (64px abajo)
        let fila = (teclas.derecha.presionada) ? 1 : 0;
        spriteLitNormal.dibujar(litX, litY, 128, 128, fila);
    }

    // --- ENEMIGOS Y OBSTÁCULOS (TODOS APARECEN) ---
    const enemigos = [
        { x: 1000, y: Y_SUELO - 80, sprite: spriteBafle, w: 80, h: 80 },
        { x: 2000, y: Y_PISO - 150, sprite: spriteGorra, w: 70, h: 70 },
        { x: 3000, y: Y_SUELO - 80, sprite: spriteBafle, w: 80, h: 80 },
        { x: 4000, y: Y_SUELO - 80, sprite: spriteMicro, w: 60, h: 60 }
    ];

    enemigos.forEach(en => {
        let posX = en.x - scrollOffset;
        // Solo dibujar si está cerca de la pantalla
        if (posX > -100 && posX < canvas.width + 100) {
            en.sprite.dibujar(posX, en.y, en.w, en.h);

            // Detección de Colisión (solo si el show no ha empezado)
            if (litX < posX + 50 && litX + 70 > posX && litY + 100 > en.y) {
                if (!showIsRunning) gameIsOver = true;
            }
        }
    });

    // --- 2. EL FINAL (NUEVO): El Micrófono Gigante de Oro ---
    let finalX = 5000 - scrollOffset;
    if (finalX > -100 && finalX < canvas.width + 100) {
        // Dibujamos un micrófono gigante que vibra para marcar el final
        spriteMicro.dibujar(finalX, Y_SUELO - 200, 150, 150);
        
        // Al tocarlo, se activa la cinemática
        if (litX + 80 > finalX && !showIsRunning) activarCinematica();
    }

    // --- BUCLE DE JUEGO ---
    if (!gameIsOver) requestAnimationFrame(main);
    else {
        ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white"; ctx.font = "24px Arial"; ctx.textAlign="center";
        ctx.fillText("¡Falla técnica! Chocaste. Recarga.", canvas.width/2, canvas.height/2);
    }
}

// --- CONTROLES Y CINEMÁTICA (IGUAL QUE ANTES) ---
window.addEventListener('keydown', (e) => { 
    if (e.code === 'ArrowRight') teclas.derecha.presionada = true; 
    // Salto desactivado si empezó el show
    if (e.code === 'Space' && litY >= Y_SUELO - 129 && !showIsRunning) litDy = -16;
});
window.addEventListener('keyup', (e) => { 
    if (e.code === 'ArrowRight') teclas.derecha.presionada = false; 
});

function activarCinematica() {
    showIsRunning = true;
    teclas.derecha.presionada = false; // Parar a Lit
    videoContainer.style.display = 'block';
    videoFinal.play();
    videoFinal.onended = () => {
        videoContainer.style.display = 'none';
        cinematicPlayed = true;
        audioFinal.play(); // Suena Sofi y Lit canta lento
    };
}
