// ============================================================
// CAROUSEL.JS — Carrossel da página inicial AngoMovel
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    const carouselDom = document.querySelector('.carousel');
    if (!carouselDom) return;

    const listItemsDom = carouselDom.querySelectorAll('.carousel .list .item');
    const thumbnailDom = carouselDom.querySelector('.carousel .thumbnail');
    const thumbnailItems = thumbnailDom?.querySelectorAll('.item');
    const nextDom = document.getElementById('next');
    const prevDom = document.getElementById('prev');

    if (!nextDom || !prevDom || listItemsDom.length === 0) return;

    let timeRunning = 3000;
    let timeAutoNext = 7000;
    let runTimeOut;
    let runNextAuto = setTimeout(() => {
        nextDom.click();
    }, timeAutoNext);

    nextDom.onclick = function () {
        showSlider('next');
    };

    prevDom.onclick = function () {
        showSlider('prev');
    };

    function showSlider(type) {
        const listItems = carouselDom.querySelectorAll('.carousel .list .item');
        const thumbnailItems = thumbnailDom?.querySelectorAll('.item');

        if (type === 'next') {
            carouselDom.querySelector('.list').appendChild(listItems[0]);
            if (thumbnailDom) thumbnailDom.appendChild(thumbnailItems[0]);
            carouselDom.classList.add('next');
        } else {
            carouselDom.querySelector('.list').prepend(listItems[listItems.length - 1]);
            if (thumbnailDom) thumbnailDom.prepend(thumbnailItems[thumbnailItems.length - 1]);
            carouselDom.classList.add('prev');
        }

        clearTimeout(runTimeOut);
        runTimeOut = setTimeout(() => {
            carouselDom.classList.remove('next');
            carouselDom.classList.remove('prev');
        }, timeRunning);

        clearTimeout(runNextAuto);
        runNextAuto = setTimeout(() => {
            nextDom.click();
        }, timeAutoNext);
    }
});