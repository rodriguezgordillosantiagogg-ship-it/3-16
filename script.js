const girl = document.getElementById('girl');
const shadow = document.getElementById('shadow');
const audio = document.getElementById('final-audio');

let scale = 0.5;    // tamaño inicial de la niña
let bottom = 20;    // posición inicial desde abajo

function animate() {
  if(scale < 1.5) {   // crecer hasta tamaño de mujer
    scale += 0.002;    // velocidad de crecimiento
    bottom += 0.3;     // simula caminar hacia arriba

    // Actualizar la silueta
    girl.style.transform = `translateX(-50%) scale(${scale})`;
    girl.style.bottom = bottom + 'px';

    // Actualizar la sombra
    shadow.style.width = 60 * scale + 'px';
    shadow.style.height = 20 * scale + 'px';
    shadow.style.bottom = (bottom - 20) + 'px';

    requestAnimationFrame(animate);
  } else {
    // Reproducir audio al final
    audio.play();
  }
}

// Iniciar animación
animate();
