export function initSlider() {
  const slider = document.getElementById('hero-slider');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.hero-slide')];
  const dots = slider.querySelector('.slider-dots');
  let index = 0;
  let timer;
  let touchStartX = 0;

  dots.innerHTML = slides.map((_, i) => `<button type="button" class="slider-dot ${i === 0 ? 'is-active' : ''}" data-slide-to="${i}" role="tab" aria-label="Go to slide ${i + 1}"></button>`).join('');
  const dotButtons = [...dots.querySelectorAll('.slider-dot')];

  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dotButtons.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => show(index + 1), 5000); };
  slider.querySelector('.slider-next').addEventListener('click', () => { show(index + 1); start(); });
  slider.querySelector('.slider-prev').addEventListener('click', () => { show(index - 1); start(); });
  dotButtons.forEach((dot) => dot.addEventListener('click', () => { show(Number(dot.dataset.slideTo)); start(); }));
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 45) show(index + (delta < 0 ? 1 : -1));
    start();
  }, { passive: true });
  start();
}
