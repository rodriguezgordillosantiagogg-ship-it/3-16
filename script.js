const girl = document.getElementById('girl');
const shadow = document.getElementById('shadow');

let scale = 0.5;
let bottom = 20;

function animate() {
  if(scale < 1.5) {   // crece hasta tamaño de mujer
    scale += 0.002;
    bottom += 0.3;
    girl.style.transform = `translateX(-50%) scale(${scale})`;
    girl.style.bottom = bottom + 'px';
    shadow.style.width = 60 * scale + 'px';
    shadow.style.height = 20 * scale + 'px';
    shadow.style.bottom = (bottom - 20) + 'px';
    requestAnimationFrame(animate);
  }
}

animate();
