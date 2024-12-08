document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('yearSlider');
    const sliderTicks = document.getElementById('sliderTicks');
    const minYear = parseInt(slider.min);
    const maxYear = parseInt(slider.max);

    for (let year = minYear; year <= maxYear; year++) {
        const tick = document.createElement('span');
        tick.textContent = year;
        sliderTicks.appendChild(tick);
    }

    function adjustTickMarks() {
        const tickWidth = sliderTicks.offsetWidth / (maxYear - minYear);
        sliderTicks.childNodes.forEach((tick, index) => {
            tick.style.left = `${index * tickWidth}px`;
        });
    }

    window.addEventListener('resize', adjustTickMarks);
    adjustTickMarks();
});