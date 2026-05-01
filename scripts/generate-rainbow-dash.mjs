// Generates rainbow-dash.png and rainbow-dash-blur.png for OG image routes.
// Replicates Figma node 287:4316: conic-gradient via foreignObject+SVG transform.
// Satori/Resvg cannot render conic-gradient, so we pre-render here.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const sharp = require(join(__dirname, "../node_modules/sharp/lib/index.js"));

// Figma gradient stops: [position_fraction, r, g, b]
// Positions are CSS percentages / 100. Negative = before start, >1 = after full rotation.
const STOPS = [
  [-0.10,    255, 77,  158],
  [-0.065385,255, 111, 119],
  [-0.030769,255, 146, 79 ],
  [0.0038462,255, 180, 40 ],
  [0.021154, 255, 197, 20 ],
  [0.029808, 255, 205, 10 ],
  [0.038462, 255, 214, 0  ],
  [0.12923,  255, 176, 0  ],
  [0.22,     255, 138, 0  ],
  [0.2425,   255, 121, 16 ],
  [0.265,    255, 104, 32 ],
  [0.31,     255, 69,  64 ],
  [0.355,    255, 35,  96 ],
  [0.3775,   255, 17,  112],
  [0.40,     255, 0,   128],
  [0.41875,  223, 18,  144],
  [0.4375,   191, 36,  160],
  [0.45625,  159, 54,  176],
  [0.475,    128, 72,  192],
  [0.49375,  96,  90,  207],
  [0.5125,   64,  108, 223],
  [0.53125,  32,  126, 239],
  [0.54063,  16,  135, 247],
  [0.55,     0,   144, 255],
  [0.635,    0,   200, 197],
  [0.72,     0,   255, 139],
  [0.73125,  16,  244, 140],
  [0.7425,   32,  233, 141],
  [0.765,    64,  211, 144],
  [0.7875,   96,  188, 146],
  [0.81,     128, 166, 148],
  [0.855,    191, 122, 153],
  [0.90,     255, 77,  158],
  [0.93462,  255, 111, 119],
  [0.96923,  255, 146, 79 ],
  [1.00385,  255, 180, 40 ],
  [1.02115,  255, 197, 20 ],
  [1.0298,   255, 205, 10 ],
  [1.0385,   255, 214, 0  ],
];

// Sample the conic-gradient(from 90deg, ...) at a normalized position [0, 1].
// Position < 0 or > 1: clamp to first/last stop.
function sampleGradient(pos) {
  // Clamp to first/last stop ranges
  const first = STOPS[0];
  const last = STOPS[STOPS.length - 1];

  if (pos <= first[0]) return [first[1], first[2], first[3]];
  if (pos >= last[0]) return [last[1], last[2], last[3]];

  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (pos >= a[0] && pos <= b[0]) {
      const range = b[0] - a[0];
      const f = range <= 0 ? 0 : (pos - a[0]) / range;
      return [
        Math.round(a[1] + (b[1] - a[1]) * f),
        Math.round(a[2] + (b[2] - a[2]) * f),
        Math.round(a[3] + (b[3] - a[3]) * f),
      ];
    }
  }
  return [last[1], last[2], last[3]];
}

// SVG viewBox: 0 0 48.132 11.619
// Transform on <g>: matrix(-2.4066 0 0 -0.58094 24.066 5.8094)
//   Converts <g>-local coords to parent SVG coords:
//   x_svg = -2.4066 * x_g + 24.066
//   y_svg = -0.58094 * y_g + 5.8094
// foreignObject inside: x=-190 y=-190 width=380 height=380
//   div local (u,v) = x_g+190, y_g+190  (u,v go 0..380)
// conic-gradient center at 50% 50% of div = (190, 190)
// CSS conic-gradient(from 90deg, ...) convention:
//   angle measured clockwise from top (CSS 0deg = top/north)
//   position = angle_css_deg / 360
//   The `from 90deg` offsets the start: position = (angle_css - 90) / 360

const SVG_W = 48.132;
const SVG_H = 11.619;
const SCALE = 8;
const W = Math.round(SVG_W * SCALE);
const H = Math.round(SVG_H * SCALE);

function pixelColor(px, py) {
  const svgX = (px + 0.5) / SCALE;
  const svgY = (py + 0.5) / SCALE;

  // Inverse transform: SVG → <g> local → div (u, v)
  const xG = (svgX - 24.066) / -2.4066;
  const yG = (svgY - 5.8094) / -0.58094;
  const u = xG + 190; // div local x (0..380, positive = right)
  const v = yG + 190; // div local y (0..380, positive = down)

  const dx = u - 190; // offset from gradient center, positive = right
  const dy = v - 190; // offset from gradient center, positive = down (CSS y-axis)

  // CSS angle: clockwise from top = atan2(dx, -dy) * 180/π
  // (because CSS 0° = north = (0,-1), 90° = east = (1,0))
  const angleCssDeg = Math.atan2(dx, -dy) * (180 / Math.PI);

  // Normalized gradient position with `from 90deg` offset
  // position = (angleCss - 90) / 360, in range [0, 1]
  const posRaw = (angleCssDeg - 90) / 360;
  const pos = ((posRaw % 1) + 1) % 1; // wrap to [0, 1]

  // Map back to stops (which go from -0.10 to 1.0385)
  // Wrap pos=0 → look in middle of range; need to find right bracket
  // Unwrap: since stops cover one full rotation with extra overlap,
  // choose the unwrapped position closest to pos in the stop range [first, last]
  const firstPos = STOPS[0][0];  // -0.10
  const lastPos = STOPS[STOPS.length - 1][0]; // 1.0385

  // Find the correct unwrapped position
  // pos is in [0,1]. Unwrap it to best fit within [firstPos, lastPos].
  let unwrapped = pos;
  if (unwrapped < firstPos) unwrapped += 1;
  if (unwrapped > lastPos) unwrapped -= 1;

  return sampleGradient(unwrapped);
}

const raw = Buffer.alloc(W * H * 4);
for (let py = 0; py < H; py++) {
  for (let px = 0; px < W; px++) {
    const [r, g, b] = pixelColor(px, py);
    const idx = (py * W + px) * 4;
    raw[idx] = r;
    raw[idx + 1] = g;
    raw[idx + 2] = b;
    raw[idx + 3] = 255;
  }
}

const outDir = join(__dirname, "../public");

await sharp(raw, { raw: { width: W, height: H, channels: 4 } })
  .png()
  .toFile(join(outDir, "rainbow-dash.png"));

console.log(`Generated rainbow-dash.png (${W}x${H})`);

// Blurred version — blur sigma = 2.073 SVG px × SCALE
const blurSigma = Math.max(0.3, 2.073 * SCALE);
await sharp(raw, { raw: { width: W, height: H, channels: 4 } })
  .blur(blurSigma)
  .png()
  .toFile(join(outDir, "rainbow-dash-blur.png"));

console.log(`Generated rainbow-dash-blur.png (blur σ=${blurSigma})`);
