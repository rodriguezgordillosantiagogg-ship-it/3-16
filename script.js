const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const videoFinal = document.getElementById('videoFinal');
const audioFinal = document.getElementById('audioFinal');
const videoContainer = document.getElementById('videoContainer');
const playButton = document.getElementById('playButton');

let Y_PISO;
let scrollOffset = 0;

// --- CONFIGURACIÓN ---
const GRAVEDAD = 0.8;
let VELOCIDAD = 6;
let SALTO = 16;

// Sprites
const assets = {
    lit: new Image(), canto: new Image(), fondo: new Image(), bafle: new Image()
};
assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png';

// Estado
let lit = { x: 100, y: 0, dy: 0, w: 120, h: 120 };
let enSuelo = false;
let showActivo = false;
let gameFinished = false;
const teclas = { derecha: false };

// Enemigos fijos
const enemigos = [
    { x: 1200, y: 0, w: 80, h: 80 },
    { x: 2500, y: 0, w: 80, h: 80 },
    { x: 3800, y: 0, w: 80, h: 80 }
];

// --- FUNCIONES ---
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    Y_PISO = canvas.height - 100;
    lit.y = Y_PISO - lit.h;
    enemigos.forEach(en => en.y = Y_PISO - en.h);
}
window.addEventListener('resize', resize);
resize();

// --- LOOP PRINCIPAL ---
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameFinished) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("¡CHOCHASTE! RECARGA", canvas.width/2 - 150, canvas.height/2);
        requestAnimationFrame(loop); // No bloquea reinicio
        return;
    }

    // 1. Fondo parallax
    if (assets.fondo.complete) {
        let xF = -(scrollOffset * 0.3 % canvas.width);
        ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
        ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);
    }

    // 2. Piso
    ctx.fillStyle = "#8b4513"; ctx.fillRect(0, Y_PISO, canvas.width, 100);
    ctx.fillStyle = "#ffaa00"; ctx.fillRect(0, Y_PISO, canvas.width, 6);

    // 3. Física
    if (!showActivo) {
        lit.y += lit.dy;
        if (lit.y + lit.h < Y_PISO) {
            lit.dy += GRAVEDAD;
            enSuelo = false;
        } else {
            lit.dy = 0; lit.y = Y_PISO - lit.h;
            enSuelo = true;
        }

        if (teclas.derecha) {
            if (lit.x < canvas.width * 0.4) lit.x += VELOCIDAD;
            else scrollOffset += VELOCIDAD;
        }
    }

    // 4. Enemigos y colisiones
    enemigos.forEach(en => {
        let ex = en.x - scrollOffset;
        if (ex > -100 && ex < canvas.width) {
            if (assets.bafle.complete) {
                let f = Math.floor(Date.now() / 150) % 4;
                ctx.drawImage(assets.bafle, f * (assets.bafle.width/4), 0, assets.bafle.width/4, assets.bafle.height, ex, en.y, en.w, en.h);
            }

            // Colisión escalable
            let litBox = {x: lit.x + 10, y: lit.y + 10, w: lit.w - 20, h: lit.h - 10};
            let enBox = {x: ex, y: en.y, w: en.w, h: en.h};
            if (!showActivo &&
                litBox.x < enBox.x + enBox.w &&
                litBox.x + litBox.w > enBox.x &&
                litBox.y < enBox.y + enBox.h &&
                litBox.y + litBox.h > enBox.y
            ) {
                gameFinished = true;
            }
        }
    });

    // 5. Personaje
    let sprite = showActivo ? assets.canto : assets.lit;
    if (sprite.complete) {
        let fila = (teclas.derecha && !showActivo) ? 1 : 0;
        let cols = 4, filas = showActivo ? 1 : 2;
        let sw = sprite.width / cols;
        let sh = sprite.height / filas;
        let f = Math.floor(Date.now() / (showActivo ? 250 : 130)) % cols;
        ctx.drawImage(sprite, f * sw, fila * sh, sw, sh, lit.x, lit.y, lit.w, lit.h);
    }

    // 6. Meta
    let metaX = 5000 - scrollOffset;
    ctx.fillStyle = "white"; ctx.fillRect(metaX, Y_PISO - 300, 8, 300);
    ctx.fillStyle = "red"; ctx.fillRect(metaX + 8, Y_PISO - 300, 50, 40);

    if (scrollOffset > 4950 && !showActivo) {
        showActivo = true;
        teclas.derecha = false;
        videoContainer.style.display = "block";
        videoFinal.play().catch(() => console.log("Clic para activar video/audio"));
        videoFinal.onended = () => {
            videoContainer.style.display = "none";
            audioFinal.play().catch(() => console.log("Clic para activar audio"));
        };
    }

    requestAnimationFrame(loop);
}

// --- CONTROLES ---
window.onkeydown = (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = true;
    if (e.code === 'Space' && enSuelo && !showActivo) lit.dy = -SALTO;
};
window.onkeyup = (e) => { if (e.code === 'ArrowRight') teclas.derecha = false; };

// --- BOTÓN DE INICIO ---
playButton.onclick = () => {
    playButton.style.display = "none";
    loop();
};
