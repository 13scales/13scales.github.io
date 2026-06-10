document.querySelectorAll('[data-w]').forEach(el => {
    el.style.width = el.dataset.w + '%';
    if (el.dataset.color) el.style.backgroundColor = el.dataset.color;
});
document.querySelectorAll('.plane-svg').forEach(svg => {
    const x = parseFloat(svg.dataset.x);
    const y = parseFloat(svg.dataset.y);
    const cx = (x + 1) / 2 * 180;
    const cy = (1 - y) / 2 * 180;
    svg.querySelector('.plane-dot').setAttribute('cx', cx);
    svg.querySelector('.plane-dot').setAttribute('cy', cy);
});

// Static-site layer: the frozen page is baked at 50/50 defaults, so re-render from URL params
const scaleOrder = JSON.parse(document.getElementById('scale-order').dataset.value);
const params = new URLSearchParams(window.location.search);

const axisResults = document.querySelectorAll('.axis-result');
const planeSvgs = document.querySelectorAll('.plane-svg');
let row = 0, plane = 0;

for (const [category, axes] of Object.entries(scaleOrder)) {
    let hSum = 0, hCount = 0, vSum = 0, vCount = 0;

    axes.forEach(([axis, dimension], index) => {
        const first = parseInt(params.get(category[0] + index) || '50');
        const second = 100 - first;
        const difference = Math.abs(first - second);
        const [firstIdeology, secondIdeology] = axis.split(' vs ');

        let label;
        if (difference === 0) {
            label = `As much ${firstIdeology} as ${secondIdeology}`;
        } else {
            const intensity = difference < 15 ? 'Slight' : difference < 40 ? 'Moderate' : difference < 70 ? 'Strong' : 'Extreme';
            label = `${intensity} ${first > second ? firstIdeology : secondIdeology}`;
        }

        const result = axisResults[row++];
        result.querySelector('.axis-label').textContent = label;
        const barLeft = result.querySelector('.bar-left');
        barLeft.style.width = first + '%';
        barLeft.style.borderRight = (first === 0 || first === 100) ? 'none' : '';
        result.querySelector('.bar-right').style.width = second + '%';

        const pctLeft = result.querySelector('.pct-left');
        const pctRight = result.querySelector('.pct-right');
        if (pctLeft) {
            pctLeft.textContent = first + '%';
            pctLeft.style.display = first >= 7 ? '' : 'none';
        }
        if (pctRight) {
            pctRight.textContent = second + '%';
            pctRight.style.display = second >= 7 ? '' : 'none';
        }

        if (dimension === 0) {
            hSum += second * 0.02 - 1;
            hCount++;
        } else if (dimension === 1) {
            vSum += first * 0.02 - 1;
            vCount++;
        }
    });

    const dot = planeSvgs[plane++].querySelector('.plane-dot');
    dot.setAttribute('cx', (hSum / hCount + 1) / 2 * 180);
    dot.setAttribute('cy', (1 - vSum / vCount) / 2 * 180);
}
