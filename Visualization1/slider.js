document.addEventListener('DOMContentLoaded', function() {
    // Gets the references for the slider and play button
    const slider = document.getElementById('yearSlider');
    const playButton = document.getElementById('playButton');
    const minYear = parseInt(slider.min);
    const maxYear = parseInt(slider.max);
    let isPlaying = false;
    let interval;

    // Updates charts based on the year selected
    function updateCharts(year) {
        if (window.updateLineChartSelection && window.updateBarGraphSelection) {
            window.updateLineChartSelection(year);
            window.updateBarGraphSelection(year);
        }
    }

    // Plays or pauses the slider
    function playSlider() {
        if (isPlaying) { // Will pause interval and update the button text
            clearInterval(interval);
            playButton.textContent = 'Play';
            slider.removeEventListener('input', sliderInputHandler);
        } else { // Will start interval and update the button text
            interval = setInterval(() => {
                let currentValue = parseInt(slider.value);
                if (currentValue < maxYear) {
                    slider.value = currentValue + 1;
                    slider.dispatchEvent(new Event('input'));
                } else { //Repeat the animation
                    slider.value = minYear;
                    slider.dispatchEvent(new Event('input'));
                }
                updateCharts(slider.value); // Update the charts
            }, 700); // Adjust the interval time here
            playButton.textContent = 'Pause';
            slider.addEventListener('input', sliderInputHandler);
        }
        isPlaying = !isPlaying; // Toggle play state
    }

    // Updates the charts based on the slider value
    function sliderInputHandler() {
        updateCharts(parseInt(slider.value));
    }
    
    playButton.addEventListener('click', playSlider);
});