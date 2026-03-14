const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const videoFinal = document.getElementById('videoFinal');
const audioFinal = document.getElementById('audioFinal');
const videoContainer = document.getElementById('videoContainer');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- CONFIGURACIÓN ---
const GRAVEDAD = 0.8;
const Y_PISO = canvas.height - 100;

const assets = {
    lit: new Image(), canto: new Image(), fondo: new Image(), bafle: new Image()
};
assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png';

// --- ESTADO ---
let scrollOffset = 0;
let lit = { x: 100, y: Y_PISO - 120, dy: 0, w: 120, h: 120 };
let enSuelo = false;
let showActivo = false;
let gameFinished = false;
const teclas = { derecha: false };

// Enemigos fijos (Bafles)
const enemigos = [
    { x: 1200, y: Y_PISO - 80, w: 80, h: 80 },
    { x: 2500, y: Y_PISO - 80, w: 80, h: 80 },
    { x: 3800, y: Y_PISO - 80, w: 80, h: 80 }
];

function loop() {
    if (gameFinished) {
        ctx.fillStyle = "white"; ctx.font = "30px Arial";
        ctx.fillText("¡CHOCHASTE! RECARGA", canvas.width/2 - 150, canvas.height/2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. FONDO (Parallax)
    if (assets.fondo.complete) {
        let xF = -(scrollOffset * 0.3 % canvas.width);
        ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
        ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);
    }

    // 2. PISO (Estilo Mario)
    ctx.fillStyle = "#8b4513"; ctx.fillRect(0, Y_PISO, canvas.width, 100);
    ctx.fillStyle = "#ffaa00"; ctx.fillRect(0, Y_PISO, canvas.width, 6);

    // 3. FÍSICA Y MOVIMIENTO
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
            if (lit.x < 400) lit.x += 6;
            else scrollOffset += 6;
        }
    }

    // 4. ENEMIGOS Y COLISIONES
    enemigos.forEach(en => {
        let ex = en.x - scrollOffset;
        if (ex > -100 && ex < canvas.width) {
            if (assets.bafle.complete) {
                let f = Math.floor(Date.now() / 150) % 4;
                ctx.drawImage(assets.bafle, f * (assets.bafle.width/4), 0, assets.bafle.width/4, assets.bafle.height, ex, en.y, en.w, en.h);
            }
            // Colisión precisa
            if (!showActivo && lit.x < ex + en.w - 20 && lit.x + lit.w - 40 > ex + 20 && lit.y + lit.h > en.y + 10) {
                gameFinished = true;
            }
        }
    });

    // 5. PERSONAJE (Lit)
    let sprite = showActivo ? assets.canto : assets.lit;
    if (sprite.complete) {
        let fila = (teclas.derecha && !showActivo) ? 1 : 0;
        let sw = sprite.width / 4;
        let sh = showActivo ? sprite.height : sprite.height / 2;
        let f = Math.floor(Date.now() / (showActivo ? 250 : 130)) % 4;
        ctx.drawImage(sprite, f * sw, fila * sh, sw, sh, lit.x, lit.y, lit.w, lit.h);
    }

    // 6. META Y CINEMÁTICA
    let metaX = 5000 - scrollOffset;
    ctx.fillStyle = "white"; ctx.fillRect(metaX, Y_PISO - 300, 8, 300); // Mástil
    ctx.fillStyle = "red"; ctx.fillRect(metaX + 8, Y_PISO - 300, 50, 40); // Bandera

    if (scrollOffset > 4950 && !showActivo) {
        showActivo = true;
        teclas.derecha = false;
        videoContainer.style.display = "block";
        videoFinal.play().catch(() => console.log("Clic para activar audio/video"));
        videoFinal.onended = () => {
            videoContainer.style.display = "none";
            audioFinal.play();
        };
    }

    requestAnimationFrame(loop);
}

// CONTROLES
window.onkeydown = (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = true;
    if (e.code === 'Space' && enSuelo && !showActivo) lit.dy = -16;
};
window.onkeyup = (e) => { if (e.code === 'ArrowRight') teclas.derecha = false; };

loop();
