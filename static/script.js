document.addEventListener('DOMContentLoaded', () => {
    const ANCHORS = [-1, -0.5, 0, 0.5, 1];
    const SNAP = 0.05;

    const sliders = document.querySelectorAll('input[type="range"]');

    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            const val = parseFloat(slider.value);
            for (const anchor of ANCHORS) {
                if (Math.abs(val - anchor) <= SNAP) {
                    slider.value = anchor;
                    break;
                }
            }
        });
    });

    const counter = document.getElementById('progress-counter');
    if (counter) {
        const updateProgress = () => {
            const moved = Array.from(sliders).filter(s => parseFloat(s.value) !== 0).length;
            counter.textContent = `${moved} / ${sliders.length} answered`;
        };
        sliders.forEach(s => s.addEventListener('input', updateProgress));
        updateProgress();
    }
});
