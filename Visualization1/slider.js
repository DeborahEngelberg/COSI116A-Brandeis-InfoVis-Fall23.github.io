document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('yearSlider');
    const playButton = document.getElementById('playButton');
    const minYear = parseInt(slider.min);
    const maxYear = parseInt(slider.max);
    let isPlaying = false;
    let interval;

    function updateCharts(year) {
        if (window.updateLineChartSelection && window.updateBarGraphSelection) {
            window.updateLineChartSelection(year);
            window.updateBarGraphSelection(year);
        }
    }


    function playSlider() {
        if (isPlaying) {
            clearInterval(interval);
            playButton.textContent = 'Play';
            slider.removeEventListener('input', sliderInputHandler);
        } else {
            interval = setInterval(() => {
                let currentValue = parseInt(slider.value);
                if (currentValue < maxYear) {
                    slider.value = currentValue + 1;
                    slider.dispatchEvent(new Event('input'));
                } else {
                    slider.value = minYear;
                    slider.dispatchEvent(new Event('input'));
                }
                updateCharts(slider.value);
            }, 700); // Adjust the interval time as needed
            playButton.textContent = 'Pause';
            slider.addEventListener('input', sliderInputHandler);
        }
        isPlaying = !isPlaying;
    }

    function sliderInputHandler() {
        updateCharts(parseInt(slider.value));
    }
    
    playButton.addEventListener('click', playSlider);
});