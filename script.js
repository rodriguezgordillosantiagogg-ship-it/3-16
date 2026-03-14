const photoInput = document.getElementById('photo-input');
const intro = document.getElementById('intro');
const show = document.getElementById('show');

photoInput.addEventListener('change', (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    startShow(files);
  }
});

function startShow(files) {
  // Animación de cierre de intro
  intro.style.opacity = 0;
  setTimeout(() => {
    intro.classList.add('hidden');
    show.classList.remove('hidden');

    // Mostrar fotos con animación secuencial
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        show.appendChild(img);

        // Animación con retraso para efecto cinematográfico
        setTimeout(() => {
          img.style.opacity = 1;
          img.style.transform = 'scale(1)';
        }, index * 500); // 0.5s de retraso entre cada foto
      };
      reader.readAsDataURL(file);
    });
  }, 1000); // 1s para animación de fade-out
}
