document.addEventListener("DOMContentLoaded", () => {
  const ANCHORS = [-1, -0.5, 0, 0.5, 1];
  const SNAP = 0.05;

  const sliders = document.querySelectorAll('input[type="range"]');

  sliders.forEach((slider) => {
    slider.addEventListener("input", () => {
      const val = parseFloat(slider.value);
      for (const anchor of ANCHORS) {
        if (Math.abs(val - anchor) <= SNAP) {
          slider.value = anchor;
          break;
        }
      }
    });
  });
});

// Shuffle questions within each category on every visit (order is baked in at freeze time)
document.querySelectorAll(".category-section").forEach((section) => {
  const cards = Array.from(section.querySelectorAll(".question-card"));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  cards.forEach((card) => section.appendChild(card));
});
let questionNumber = 1;
document.querySelectorAll(".question-text").forEach((p) => {
  p.textContent = p.textContent.replace(/^\s*\d+\./, questionNumber++ + ".");
});

const scaleOrder = JSON.parse(
  document.getElementById("scale-order").dataset.value,
);

function getView(bias, response) {
  if (bias < 0) {
    if (response === 0) return bias + 0.5;
    if (response > 0) return bias + 0.5 - response * (bias + 1.5);
    return bias + 0.5 - response * (0.5 - bias);
  }
  if (response === 0) return bias - 0.5;
  if (response > 0) return bias - 0.5 + response * (1.5 - bias);
  return bias - 0.5 + response * (bias + 0.5);
}

document.getElementById("quiz-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const axisViews = {};
  document.querySelectorAll('input[name$=".bias"]').forEach((biasInput) => {
    const i = biasInput.name.slice(1, -5);
    const bias = parseFloat(biasInput.value);
    const category = document.querySelector(`[name="#${i}.category"]`).value;
    const axis = document.querySelector(`[name="#${i}.axis"]`).value;
    const response = parseFloat(
      document.querySelector(`[name="#${i}.response"]`).value,
    );
    const key = category + "|" + axis;
    if (!axisViews[key]) axisViews[key] = [0, 0];
    axisViews[key][0] += getView(bias, response);
    axisViews[key][1]++;
  });

  const params = new URLSearchParams();
  for (const [category, axes] of Object.entries(scaleOrder)) {
    axes.forEach(([axis], index) => {
      const [sum, count] = axisViews[category + "|" + axis] || [0, 1];
      params.set(category[0] + index, Math.round((1 - sum / count) * 50));
    });
  }

  window.location.href = "../results/?" + params.toString();
});
