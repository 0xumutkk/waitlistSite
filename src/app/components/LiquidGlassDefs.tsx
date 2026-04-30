/**
 * Liquid-glass SVG filter definitions.
 *
 * Mount once near the root of the page; the .glass / .glass-soft classes
 * reference these by id via `backdrop-filter: url(#liquid-glass)`.
 *
 * Technique adapted from kube.io/blog/liquid-glass-css-svg.
 * Only Chromium currently allows SVG filters inside backdrop-filter; other
 * browsers fall back to plain blur (see globals.css @supports block).
 */
export function LiquidGlassDefs() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        <filter
          id="liquid-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves={2}
            seed={17}
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="shapedNoise">
            <feFuncR type="gamma" amplitude="1" exponent="6" offset="0" />
            <feFuncG type="gamma" amplitude="1" exponent="6" offset="0" />
            <feFuncB type="gamma" amplitude="0.1" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="shapedNoise" stdDeviation="2" result="softMap" />
          <feSpecularLighting
            in="softMap"
            surfaceScale={6}
            specularConstant={1.4}
            specularExponent={80}
            lightingColor="#ffffff"
            result="specLight"
          >
            <fePointLight x={-100} y={-100} z={220} />
          </feSpecularLighting>
          <feComposite
            in="specLight"
            in2="SourceGraphic"
            operator="in"
            result="lit"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale={60}
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />
          <feComposite
            in="lit"
            in2="refracted"
            operator="arithmetic"
            k1={0}
            k2={1}
            k3={0.6}
            k4={0}
          />
        </filter>

        <filter
          id="liquid-glass-soft"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.005 0.008"
            numOctaves={2}
            seed={3}
            result="t"
          />
          <feGaussianBlur in="t" stdDeviation="3" result="b" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="b"
            scale={35}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
