const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const videoFinal = document.getElementById('videoFinal');
const audioFinal = document.getElementById('audioFinal');
const videoContainer = document.getElementById('videoContainer');
const playButton = document.getElementById('playButton');

let Y_PISO;
let scrollOffset = 0;

// --- CONFIG ---
const GRAVEDAD = 0.8;
let VELOCIDAD = 6;
let SALTO = 16;
const FRAMES_WALK = 4;

// Sprites
const assets = {
    lit: new Image(),
    canto: new Image(),
    fondo: new Image(),
    bafle: new Image(),
    gorra: new Image()
};

assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png';
assets.gorra.src = 'enemigo_gorra.png';

// Estado
let lit = { x: 100, y: 0, dy: 0, w: 120, h: 120 };
let enSuelo = false;
let showActivo = false;
let gameFinished = false;
const teclas = { derecha: false, izquierda: false };

// Enemigos
const enemigos = [
    { x: 1200, y: 0, w: 80, h: 80, sprite: 'bafle' },
    { x: 2500, y: 0, w: 80, h: 80, sprite: 'gorra' },
    { x: 3800, y: 0, w: 80, h: 80, sprite: 'bafle' }
];

// --- FUNCIONES ---
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    Y_PISO = canvas.height - 100;
    lit.y = Y_PISO - lit.h;
    enemigos.forEach(en => en.y = Y_PISO - en.h);
    VELOCIDAD = Math.max(4, canvas.width / 160);
    SALTO = Math.max(12, canvas.height / 50);
}
window.addEventListener('resize', resize);
resize();

// Reinicia juego
function reiniciar() {
    scrollOffset = 0;
    lit.x = 100; lit.y = Y_PISO - lit.h; lit.dy = 0;
    gameFinished = false;
    showActivo = false;
    teclas.derecha = false; teclas.izquierda = false;
    videoContainer.style.display = "none";
}

// --- LOOP PRINCIPAL ---
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mostrar mensaje si chocaste
    if (gameFinished) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("¡CHOCHASTE! TOCA PARA REINICIAR", canvas.width/2 - 180, canvas.height/2);
        requestAnimationFrame(loop);
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

    // 3. Física personaje
    if (!showActivo) {
        lit.y += lit.dy;
        if (lit.y + lit.h < Y_PISO) { lit.dy += GRAVEDAD; enSuelo = false; }
        else { lit.dy = 0; lit.y = Y_PISO - lit.h; enSuelo = true; }

        if (teclas.derecha) {
            if (lit.x < canvas.width * 0.4) lit.x += VELOCIDAD;
            else scrollOffset += VELOCIDAD;
        }
        if (teclas.izquierda) {
            if (lit.x > 50) lit.x -= VELOCIDAD;
            else scrollOffset = Math.max(0, scrollOffset - VELOCIDAD);
        }
    }

    // 4. Enemigos y colisiones
    enemigos.forEach(en => {
        let ex = en.x - scrollOffset;
        if (ex > -en.w && ex < canvas.width) {
            if (assets[en.sprite].complete) {
                let f = Math.floor(Date.now() / 150) % FRAMES_WALK;
                ctx.drawImage(
                    assets[en.sprite],
                    f * (assets[en.sprite].width / FRAMES_WALK), 0,
                    assets[en.sprite].width / FRAMES_WALK, assets[en.sprite].height,
                    ex, en.y, en.w, en.h
                );
            }

            let litBox = {x: lit.x + 10, y: lit.y + 10, w: lit.w - 20, h: lit.h - 10};
            let enBox = {x: ex, y: en.y, w: en.w, h: en.h};
            if (!showActivo &&
                litBox.x < enBox.x + enBox.w &&
                litBox.x + litBox.w > enBox.x &&
                litBox.y < enBox.y + enBox.h &&
                litBox.y + litBox.h > enBox.y
            ) gameFinished = true;
        }
    });

    // 5. Personaje
    let sprite = showActivo ? assets.canto : assets.lit;
    if (sprite.complete) {
        let cols = 4, filas = showActivo ? 1 : 2;
        let sw = sprite.width / cols;
        let sh = sprite.height / filas;
        let fila = showActivo ? 0 : 0;
        let f = Math.floor(Date.now() / (showActivo ? 250 : 150)) % cols;
        ctx.drawImage(sprite, f * sw, fila * sh, sw, sh, lit.x, lit.y, lit.w, lit.h);
    }

    // 6. Meta
    let metaX = 5000 - scrollOffset;
    ctx.fillStyle = "white"; ctx.fillRect(metaX, Y_PISO - 300, 8, 300);
    ctx.fillStyle = "red"; ctx.fillRect(metaX + 8, Y_PISO - 300, 50, 40);

    if (scrollOffset > 4950 && !showActivo) {
        showActivo = true;
        teclas.derecha = false; teclas.izquierda = false;
        videoContainer.style.display = "block";
        videoFinal.play().catch(() => console.log("Clic para activar video/audio"));
        videoFinal.onended = () => {
            videoContainer.style.display = "none";
            audioFinal.play().catch(() => console.log("Clic para activar audio"));
        };
    }

    requestAnimationFrame(loop);
}

// --- CONTROLES TECLADO ---
window.addEventListener('keydown', e => {
    if (e.code === 'ArrowRight') teclas.derecha = true;
    if (e.code === 'ArrowLeft') teclas.izquierda = true;
    if (e.code === 'Space' && enSuelo && !showActivo) lit.dy = -SALTO;
});
window.addEventListener('keyup', e => {
    if (e.code === 'ArrowRight') teclas.derecha = false;
    if (e.code === 'ArrowLeft') teclas.izquierda = false;
});

// --- BOTÓN DE INICIO ---
playButton.onclick = () => { playButton.style.display = "none"; loop(); };

// --- REINICIO AL TOCAR DESPUÉS DE MORIR ---
canvas.addEventListener('click', () => { if (gameFinished) reiniciar(); });
canvas.addEventListener('touchstart', () => { if (gameFinished) reiniciar(); });

// --- CONTROLES TÁCTILES MÓVIL ---
function createMobileControls() {
    const controls = document.createElement('div');
    controls.style.position = 'fixed';
    controls.style.bottom = '10px';
    controls.style.left = '0';
    controls.style.width = '100%';
    controls.style.display = 'flex';
    controls.style.justifyContent = 'space-around';
    controls.style.zIndex = 1500;

    const btnIzq = document.createElement('button');
    btnIzq.innerText = '⬅';
    btnIzq.style.fontSize = '40px'; btnIzq.style.padding = '20px';
    btnIzq.style.opacity = '0.5'; btnIzq.style.background = 'transparent';
    btnIzq.style.border = 'none';
    btnIzq.addEventListener('touchstart', () => teclas.izquierda = true);
    btnIzq.addEventListener('touchend', () => teclas.izquierda = false);

    const btnDer = document.createElement('button');
    btnDer.innerText = '➡';
    btnDer.style.fontSize = '40px'; btnDer.style.padding = '20px';
    btnDer.style.opacity = '0.5'; btnDer.style.background = 'transparent';
    btnDer.style.border = 'none';
    btnDer.addEventListener('touchstart', () => teclas.derecha = true);
    btnDer.addEventListener('touchend', () => teclas.derecha = false);

    const btnSalto = document.createElement('button');
    btnSalto.innerText = '⬆';
    btnSalto.style.fontSize = '40px'; btnSalto.style.padding = '20px';
    btnSalto.style.opacity = '0.5'; btnSalto.style.background = 'transparent';
    btnSalto.style.border = 'none';
    btnSalto.addEventListener('touchstart', () => { if (enSuelo) lit.dy = -SALTO; });

    controls.appendChild(btnIzq);
    controls.appendChild(btnSalto);
    controls.appendChild(btnDer);
    document.body.appendChild(controls);
}
createMobileControls();
