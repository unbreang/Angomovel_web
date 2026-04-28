// ============================================================
// ADD.JS — Carrossel principal da página inicial AngoMovel
// ============================================================

// ── Step 1: Obter elementos do DOM ──
const nextDom         = document.getElementById('next');
const prevDom         = document.getElementById('prev');
const carouselDom     = document.querySelector('.carousel');
const SliderDom       = carouselDom.querySelector('.list');
const thumbnailBorderDom = document.querySelector('.carousel .thumbnail');
const thumbnailItemsDom  = thumbnailBorderDom.querySelectorAll('.item');
const timeDom         = document.querySelector('.carousel .time');

// Mover o primeiro thumbnail para o fim (lógica de loop)
thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);

// ── Configurações de tempo ──
const timeRunning = 3000; // duração da animação (ms)
const timeAutoNext = 7000; // intervalo para avançar automaticamente (ms)

// ── Controlo de timeouts ──
let runTimeOut;
let runNextAuto = setTimeout(() => {
    nextDom.click();
}, timeAutoNext);

// ── Event listeners dos botões ──
nextDom.onclick = () => showSlider('next');
prevDom.onclick = () => showSlider('prev');

// ── Função principal do carrossel ──
function showSlider(type) {
    const sliderItems    = SliderDom.querySelectorAll('.item');
    const thumbnailItems = thumbnailBorderDom.querySelectorAll('.item');

    if (type === 'next') {
        // Mover o primeiro item para o fim
        SliderDom.appendChild(sliderItems[0]);
        thumbnailBorderDom.appendChild(thumbnailItems[0]);
        carouselDom.classList.add('next');
    } else {
        // Mover o último item para o início
        SliderDom.prepend(sliderItems[sliderItems.length - 1]);
        thumbnailBorderDom.prepend(thumbnailItems[thumbnailItems.length - 1]);
        carouselDom.classList.add('prev');
    }

    // Remover classe de animação após a duração
    clearTimeout(runTimeOut);
    runTimeOut = setTimeout(() => {
        carouselDom.classList.remove('next');
        carouselDom.classList.remove('prev');
    }, timeRunning);

    // Reiniciar o avanço automático
    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        nextDom.click(); // ✅ corrigido: era next.click() — causava erro
    }, timeAutoNext);
}

// ── Pausar carrossel ao passar o rato ──
carouselDom.addEventListener('mouseenter', () => {
    clearTimeout(runNextAuto);
});

carouselDom.addEventListener('mouseleave', () => {
    runNextAuto = setTimeout(() => {
        nextDom.click();
    }, timeAutoNext);
});

// ── Suporte a swipe (mobile) ──
let touchStartX = 0;
let touchEndX   = 0;

carouselDom.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

carouselDom.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) { // threshold de 50px
        showSlider(diff > 0 ? 'next' : 'prev');
    }
}, { passive: true });