document.querySelectorAll("[data-w]").forEach((el) => {
  el.style.width = el.dataset.w + "%";
  if (el.dataset.color) el.style.backgroundColor = el.dataset.color;
});
document.querySelectorAll(".plane-svg").forEach((svg) => {
  const x = parseFloat(svg.dataset.x);
  const y = parseFloat(svg.dataset.y);
  const cx = ((x + 1) / 2) * 180;
  const cy = ((1 - y) / 2) * 180;
  svg.querySelector(".plane-dot").setAttribute("cx", cx);
  svg.querySelector(".plane-dot").setAttribute("cy", cy);
});

// Static-site layer: the frozen page is baked at 50/50 defaults, so re-render from URL params
const scaleOrder = JSON.parse(
  document.getElementById("scale-order").dataset.value,
);
const params = new URLSearchParams(window.location.search);

const axisResults = document.querySelectorAll(".axis-result");
const planeSvgs = document.querySelectorAll(".plane-svg");
let row = 0,
  plane = 0;

const coordinates = {};

for (const [category, axes] of Object.entries(scaleOrder)) {
  let hSum = 0,
    hCount = 0,
    vSum = 0,
    vCount = 0;

  axes.forEach(([axis, dimension], index) => {
    const first = parseInt(params.get(category[0] + index) || "50");
    const second = 100 - first;
    const difference = Math.abs(first - second);
    const [firstIdeology, secondIdeology] = axis.split(" vs ");

    let label;
    if (difference === 0) {
      label = `As much ${firstIdeology} as ${secondIdeology}`;
    } else {
      const intensity =
        difference < 15
          ? "Slight"
          : difference < 40
            ? "Moderate"
            : difference < 70
              ? "Strong"
              : "Extreme";
      label = `${intensity} ${first > second ? firstIdeology : secondIdeology}`;
    }

    const result = axisResults[row++];
    result.querySelector(".axis-label").textContent = label;
    const barLeft = result.querySelector(".bar-left");
    barLeft.style.width = first + "%";
    barLeft.style.borderRight = first === 0 || first === 100 ? "none" : "";
    result.querySelector(".bar-right").style.width = second + "%";

    const pctLeft = result.querySelector(".pct-left");
    const pctRight = result.querySelector(".pct-right");
    if (pctLeft) {
      pctLeft.textContent = first + "%";
      pctLeft.style.display = first >= 7 ? "" : "none";
    }
    if (pctRight) {
      pctRight.textContent = second + "%";
      pctRight.style.display = second >= 7 ? "" : "none";
    }

    if (dimension === 0) {
      hSum += second * 0.02 - 1;
      hCount++;
    } else if (dimension === 1) {
      vSum += first * 0.02 - 1;
      vCount++;
    }
  });

  const x = hSum / hCount;
  const y = vSum / vCount;
  coordinates[category] = { x, y };

  const dot = planeSvgs[plane++].querySelector(".plane-dot");
  dot.setAttribute("cx", ((x + 1) / 2) * 180);
  dot.setAttribute("cy", ((1 - y) / 2) * 180);
}

// 1 = right/up, 0 = left/down (0+ is considered right/up)
// key order: economic, social, socioeconomic, foreignH, foreignV, V
const ideologies = {
  // Traditionalist Conservatism: econ=R, soc=R, SE=up, foreignV=up; foreignH+V free
  111010: "Traditionalist Conservatism",
  111011: "Traditionalist Conservatism",
  111110: "Traditionalist Conservatism",
  111111: "Traditionalist Conservatism",
  // Paleoconservatism: econ=R, soc=R, SE=up, foreignV=down; foreignH+V free
  111000: "Paleoconservatism",
  111001: "Paleoconservatism",
  111100: "Paleoconservatism",
  111101: "Paleoconservatism",
  // Neoconservatism: econ=R, soc=R, SE=down, foreignV=up; foreignH+V free
  110010: "Neoconservatism",
  110011: "Neoconservatism",
  110110: "Neoconservatism",
  110111: "Neoconservatism",
  // Right-Libertarianism: econ=R, soc=R, SE=down, foreignV=down; foreignH+V free
  110000: "Right-Libertarianism",
  110001: "Right-Libertarianism",
  110100: "Right-Libertarianism",
  110101: "Right-Libertarianism",
  // National Liberalism: econ=R, soc=L, SE=up, foreignV=down; foreignH+V free
  101000: "National Liberalism",
  101001: "National Liberalism",
  101100: "National Liberalism",
  101101: "National Liberalism",
  // Neoliberalism: econ=R, soc=L, SE=up, foreignV=up; foreignH+V free
  101010: "Neoliberalism",
  101011: "Neoliberalism",
  101110: "Neoliberalism",
  101111: "Neoliberalism",
  // Neolibertarianism: econ=R, soc=L, SE=down, foreignV=up; foreignH+V free
  100010: "Neolibertarianism",
  100011: "Neolibertarianism",
  100110: "Neolibertarianism",
  100111: "Neolibertarianism",
  // Neoclassical Liberalism: econ=R, soc=L, SE=down, foreignV=down; foreignH+V free
  100000: "Neoclassical Liberalism",
  100001: "Neoclassical Liberalism",
  100100: "Neoclassical Liberalism",
  100101: "Neoclassical Liberalism",
  // Paternalistic Conservatism: econ=L, soc=R, V=up; SE+foreignH+foreignV free
  "010001": "Paternalistic Conservatism",
  "010011": "Paternalistic Conservatism",
  "010101": "Paternalistic Conservatism",
  "010111": "Paternalistic Conservatism",
  "011001": "Paternalistic Conservatism",
  "011011": "Paternalistic Conservatism",
  "011101": "Paternalistic Conservatism",
  "011111": "Paternalistic Conservatism",
  // Conservative Populism: econ=L, soc=R, V=down; SE+foreignH+foreignV free
  "010000": "Conservative Populism",
  "010010": "Conservative Populism",
  "010100": "Conservative Populism",
  "010110": "Conservative Populism",
  "011000": "Conservative Populism",
  "011010": "Conservative Populism",
  "011100": "Conservative Populism",
  "011110": "Conservative Populism",
  // Social Democracy: econ=L, soc=L, foreignH=L, V=up; SE+foreignV free
  "000001": "Social Democracy",
  "000011": "Social Democracy",
  "001001": "Social Democracy",
  "001011": "Social Democracy",
  // Modern Liberalism: econ=L, soc=L, foreignH=R, V=up; SE+foreignV free
  "000101": "Modern Liberalism",
  "000111": "Modern Liberalism",
  "001101": "Modern Liberalism",
  "001111": "Modern Liberalism",
  // Left-Libertarianism: econ=L, soc=L, V=down; SE+foreignH+foreignV free
  "000000": "Left-Libertarianism",
  "000010": "Left-Libertarianism",
  "000100": "Left-Libertarianism",
  "000110": "Left-Libertarianism",
  "001000": "Left-Libertarianism",
  "001010": "Left-Libertarianism",
  "001100": "Left-Libertarianism",
  "001110": "Left-Libertarianism",
};

const bit = (b) => (b ? "1" : "0");

const allY = Object.values(coordinates).reduce((s, c) => s + c.y, 0);
const leaning =
  bit(coordinates["Economic and Class Issues"].x > 0) +
  bit(coordinates["Social Issues"].x > 0) +
  bit(
    coordinates["Economic and Class Issues"].y +
      coordinates["Social Issues"].y >
      0,
  ) +
  bit(coordinates["Foreign Policy"].x > 0) +
  bit(coordinates["Foreign Policy"].y > 0) +
  bit(allY > 0);

const ideology = ideologies[leaning];

const horizontalCumulative =
  ((Object.values(coordinates).reduce((s, c) => s + c.x, 0) / 3 + 1) / 2) * 100;

let stance;
if (horizontalCumulative >= 85) stance = "Reactionary";
else if (horizontalCumulative >= 70) stance = "Conservative";
else if (horizontalCumulative >= 55) stance = "Center-Right";
else if (horizontalCumulative >= 45) stance = "Moderate";
else if (horizontalCumulative >= 30) stance = "Center-Left";
else if (horizontalCumulative >= 15) stance = "Liberal";
else stance = "Progressive";

document.querySelector(".results-title").textContent =
  `You are ${stance} and support ${ideology}.`;
