/**
 * WeatherEffects.jsx - High-performance particle system for dynamic weather
 * Optimized with ParticlePool to avoid garbage collection and throttled updates
 *
 * Features:
 * - Rain/drizzle with wind trajectories, lens sheen, puddle ripples
 * - Fog/mist/haze layering with slow drift
 * - Dust/pollen particles (hot, windy days)
 * - Jacaranda blossoms (spring, Mexico City)
 * - Lightning flashes (thunderstorms)
 * - Heat shimmer (hot afternoons)
 * - Rainbow (after rain)
 */

import React, { useRef, useEffect } from 'react';

const WINDY_KMH = 18; // Wind speed threshold for visible effects

/**
 * ParticlePool - Reusable particle object pool to avoid garbage collection
 */
class ParticlePool {
  constructor(maxParticles, className) {
    this.particles = [];
    this.activeCount = 0;
    this.maxParticles = maxParticles;
    this.className = className;
  }

  init(container) {
    for (let i = 0; i < this.maxParticles; i++) {
      const particle = document.createElement('div');
      particle.className = this.className;
      particle.style.position = 'absolute';
      particle.style.pointerEvents = 'none';
      particle.style.display = 'none';
      container.appendChild(particle);
      this.particles.push(particle);
    }
  }

  activate(count, configureFn) {
    const toActivate = Math.min(count, this.maxParticles);
    for (let i = 0; i < toActivate; i++) {
      const p = this.particles[i];
      configureFn(p, i);
      p.style.display = 'block';
    }
    for (let i = toActivate; i < this.activeCount; i++) {
      this.particles[i].style.display = 'none';
    }
    this.activeCount = toActivate;
  }

  cleanup() {
    this.particles.forEach(p => p.remove());
    this.particles = [];
    this.activeCount = 0;
  }
}

const WeatherEffects = ({
  weather,
  width = typeof window !== 'undefined' ? window.innerWidth : 1920,
  height = typeof window !== 'undefined' ? window.innerHeight : 1080
}) => {
  const containerRef = useRef(null);

  // Particle pools
  const rainPoolRef = useRef(null);
  const rainBgPoolRef = useRef(null); // Background rain layer (behind clouds)
  const rainFgPoolRef = useRef(null); // Foreground rain layer (closest to viewer)
  const blossomPoolRef = useRef(null);
  const airPoolRef = useRef(null);

  // Throttle updates for performance
  const lastUpdateRef = useRef(0);
  const THROTTLE_MS = 250; // Update max every 250ms

  // Shorthands
  const fx = weather.fx;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  // Initialize pools once
  useEffect(() => {
    if (!containerRef.current) return;

    rainPoolRef.current = new ParticlePool(60, 'rain-particle'); // Midground layer
    rainBgPoolRef.current = new ParticlePool(40, 'rain-particle-bg'); // Background layer (behind clouds)
    rainFgPoolRef.current = new ParticlePool(40, 'rain-particle-fg'); // Foreground layer (closest)
    blossomPoolRef.current = new ParticlePool(80, 'petal-particle'); // Optimized from 120
    airPoolRef.current = new ParticlePool(60, 'air-particle'); // Optimized from 100

    rainPoolRef.current.init(containerRef.current);
    rainBgPoolRef.current.init(containerRef.current);
    rainFgPoolRef.current.init(containerRef.current);
    blossomPoolRef.current.init(containerRef.current);
    airPoolRef.current.init(containerRef.current);

    return () => {
      rainPoolRef.current?.cleanup();
      rainBgPoolRef.current?.cleanup();
      rainFgPoolRef.current?.cleanup();
      blossomPoolRef.current?.cleanup();
      airPoolRef.current?.cleanup();
    };
  }, []);

  // Update particles when weather changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Throttle updates
    const now = Date.now();
    if (now - lastUpdateRef.current < THROTTLE_MS) {
      return;
    }
    lastUpdateRef.current = now;

    const wind = weather.windSpeed ?? 0;
    const windDir = weather.windDirection ?? 0;
    const windX = Math.cos((windDir * Math.PI) / 180) * wind;
    const windShear = Math.min(160, Math.max(-160, windX * 6));
    const intensity = clamp(weather.intensity ?? 0);

    /* --------------------------- RAIN / DRIZZLE (3 DEPTH LAYERS) --------------------------- */
    if (weather.precipitation === 'rain' || weather.precipitation === 'drizzle') {
      const sizeFactor = fx?.dropletSize ?? (weather.precipitation === 'drizzle' ? 0.25 : 0.7);
      const baseCount = weather.precipitation === 'rain' ? 60 : 40;
      const totalCount = Math.floor(intensity * baseCount);

      // BACKGROUND LAYER (30% of drops) - Behind clouds, faint, smaller, slower
      const bgCount = Math.floor(totalCount * 0.3);
      rainBgPoolRef.current?.activate(bgCount, (particle) => {
        const x = Math.random() * width;
        const startY = -20 - Math.random() * 60;
        const dropW = clamp(0.6 + sizeFactor * 1.2, 0.6, 1.8); // Smaller
        const dropH = clamp(6 + sizeFactor * 10, 6, 16); // Shorter
        const duration = 1.8 + Math.random() * 1.6; // Slower (farther away)
        const delay = Math.random() * 3.0;

        particle.style.setProperty('--fall-y', `${height + 50}px`);
        particle.style.setProperty('--wind-offset', `${(windShear * 0.7).toFixed(1)}px`); // Less wind effect
        particle.style.left = `${x}px`;
        particle.style.top = `${startY}px`;
        particle.style.width = `${dropW}px`;
        particle.style.height = `${dropH}px`;
        particle.style.borderRadius = '1px';
        particle.style.background = 'linear-gradient(to bottom, rgba(185,205,240,0.04), rgba(155,185,230,0.35))'; // Faint
        particle.style.opacity = String(0.25 + Math.random() * 0.2); // Very faint
        particle.style.animation = `rain-fall ${duration}s linear ${delay}s infinite`;
        const visualTilt = Math.max(-16, Math.min(16, windX * 0.4));
        particle.style.transform = `rotate(${visualTilt}deg) translateZ(0)`;
        particle.style.boxShadow = 'none';
        particle.style.filter = 'blur(0.3px)'; // Atmospheric scattering
      });

      // MIDGROUND LAYER (50% of drops) - Main rain layer
      const midCount = Math.floor(totalCount * 0.5);
      rainPoolRef.current?.activate(midCount, (particle) => {
        const x = Math.random() * width;
        const startY = -20 - Math.random() * 80;
        const dropW = clamp(0.8 + sizeFactor * 2, 0.8, 3);
        const dropH = clamp(8 + sizeFactor * 16, 8, 24);
        const duration = 1.2 + Math.random() * 1.4;
        const delay = Math.random() * 3.0;

        particle.style.setProperty('--fall-y', `${height + 50}px`);
        particle.style.setProperty('--wind-offset', `${windShear.toFixed(1)}px`);
        particle.style.left = `${x}px`;
        particle.style.top = `${startY}px`;
        particle.style.width = `${dropW}px`;
        particle.style.height = `${dropH}px`;
        particle.style.borderRadius = '2px';
        particle.style.background = 'linear-gradient(to bottom, rgba(185,205,240,0.08), rgba(155,185,230,0.8))';
        particle.style.opacity = String(0.6 + Math.random() * 0.4);
        particle.style.animation = `rain-fall ${duration}s linear ${delay}s infinite`;
        const visualTilt = Math.max(-16, Math.min(16, windX * 0.6));
        particle.style.transform = `rotate(${visualTilt}deg) translateZ(0)`;
        particle.style.boxShadow = '0 0 1px rgba(185,205,240,0.3)';
      });

      // FOREGROUND LAYER (20% of drops) - Closest to viewer, brightest, largest, fastest
      const fgCount = Math.floor(totalCount * 0.2);
      rainFgPoolRef.current?.activate(fgCount, (particle) => {
        const x = Math.random() * width;
        const startY = -10 - Math.random() * 40;
        const dropW = clamp(1.2 + sizeFactor * 3, 1.2, 5); // Larger
        const dropH = clamp(12 + sizeFactor * 20, 12, 32); // Longer
        const duration = 0.8 + Math.random() * 0.8; // Faster (closer)
        const delay = Math.random() * 2.5;

        particle.style.setProperty('--fall-y', `${height + 50}px`);
        particle.style.setProperty('--wind-offset', `${(windShear * 1.2).toFixed(1)}px`); // More wind effect
        particle.style.left = `${x}px`;
        particle.style.top = `${startY}px`;
        particle.style.width = `${dropW}px`;
        particle.style.height = `${dropH}px`;
        particle.style.borderRadius = '2px';
        particle.style.background = 'linear-gradient(to bottom, rgba(205,225,255,0.15), rgba(175,205,250,0.95))'; // Brighter
        particle.style.opacity = String(0.8 + Math.random() * 0.2); // Very visible
        particle.style.animation = `rain-fall ${duration}s linear ${delay}s infinite`;
        const visualTilt = Math.max(-16, Math.min(16, windX * 0.7));
        particle.style.transform = `rotate(${visualTilt}deg) translateZ(0)`;
        particle.style.boxShadow = '0 0 2px rgba(205,225,255,0.5)'; // Brighter glow
        particle.style.filter = 'blur(0.2px)'; // Slight motion blur
      });
    } else {
      rainPoolRef.current?.activate(0, () => {});
      rainBgPoolRef.current?.activate(0, () => {});
      rainFgPoolRef.current?.activate(0, () => {});
    }

    /* --------------------------- BLOSSOMS (SPRING) ------------------------ */
    const blossoms = fx?.blossoms;
    const showBlossoms =
      !!blossoms &&
      weather.precipitation === 'none' &&
      (weather.windSpeed ?? 0) >= WINDY_KMH &&
      (blossoms.activity ?? 0) > 0.05;

    if (showBlossoms && blossoms) {
      const { activity, palette, sizeRange } = blossoms;
      const count = Math.min(80, Math.floor(activity * 80)); // Optimized for 80-particle pool

      blossomPoolRef.current?.activate(count, (particle) => {
        const x = Math.random() * width;
        const startY = Math.random() * (height * 0.28) - 60;
        const size = sizeRange ? (sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0])) : (3 + Math.random() * 4);
        const w = size + (Math.random() * 2);
        const h = size * (0.6 + Math.random() * 0.5);
        const dx = windX * (16 + Math.random() * 18) + (Math.random() * 200 - 100);
        const dy = height + 80 + Math.random() * 160;
        const dur = 7 + Math.random() * 4;
        const delay = Math.random() * 2.5;

        particle.style.setProperty('--petal-dx', `${dx}px`);
        particle.style.setProperty('--petal-dy', `${dy}px`);
        particle.style.setProperty('--petal-dx-half', `${dx * 0.55}px`);
        particle.style.setProperty('--petal-dy-half', `${dy * 0.55}px`);
        particle.style.setProperty('--petal-rotMid', `${(Math.random() * 220 - 110).toFixed(1)}deg`);
        particle.style.setProperty('--petal-rotEnd', `${(Math.random() * 480 - 240).toFixed(1)}deg`);
        particle.style.left = `${x}px`;
        particle.style.top = `${startY}px`;
        particle.style.width = `${w}px`;
        particle.style.height = `${h}px`;
        particle.style.borderRadius = '45% 55% 50% 50% / 55% 45% 55% 45%';

        const col = palette[(Math.random() * palette.length) | 0];
        particle.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), ${col})`;
        particle.style.boxShadow = '0 0 1px rgba(0,0,0,0.12)';
        particle.style.opacity = String(0.8 + Math.random() * 0.2);
        particle.style.animation = `petal-move ${dur}s ease-in ${delay}s infinite`;
      });
    } else {
      blossomPoolRef.current?.activate(0, () => {});
    }

    /* ------------------- AIRBORNE PARTICLES (dust/pollen) ----------------- */
    const ap = fx?.airborneParticles;
    const showDust = ap && (ap.type === 'dust' || ap.type === 'sand');
    const showPollen = ap && ap.type === 'pollen';

    if ((showDust || showPollen) && weather.precipitation === 'none') {
      const count = Math.floor((ap.density ?? 0.4) * 60); // Optimized for 60-particle pool

      airPoolRef.current?.activate(count, (particle) => {
        const x = Math.random() * width;
        const baseY = height * (showDust ? (0.08 + Math.random() * 0.5) : (0.15 + Math.random() * 0.5));
        const dx = showDust ? windX * (8 + Math.random() * 18) : (Math.random() * 40 - 20);
        const dy = showDust ? (10 + Math.random() * 40) : -(30 + Math.random() * 60);
        const size = showDust ? 0.8 + Math.random() * 1.6 : 1 + Math.random() * 2;
        const dur = showDust ? 7 + Math.random() * 5 : 9 + Math.random() * 6;
        const delay = Math.random() * 3.5;

        particle.style.setProperty('--air-dx', `${dx.toFixed(1)}px`);
        particle.style.setProperty('--air-dy', `${dy.toFixed(1)}px`);
        particle.style.left = `${x}px`;
        particle.style.top = `${baseY}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.background = showDust ? 'rgba(194, 164, 120, 0.75)' : 'rgba(230, 240, 150, 0.9)';
        particle.style.boxShadow = showDust ? '0 0 1px rgba(194,164,120,0.6)' : '0 0 2px rgba(230,240,150,0.6)';
        particle.style.opacity = String(showDust ? (0.35 + Math.random() * 0.3) : (0.55 + Math.random() * 0.35));
        particle.style.animation = `air-drift ${dur}s ease-in-out ${delay}s infinite`;
      });
    } else {
      airPoolRef.current?.activate(0, () => {});
    }
  }, [weather, width, height, fx]);

  /* ---------------- Fog / Mist / Haze layering ----------------- */
  const fogDensity = weather.fx?.fogDensity ?? 0;
  const hazeDensity = weather.fx?.hazeDensity ?? 0;
  const isFog = weather.special === 'fog' || fogDensity > 0.05;
  const isMist = weather.special === 'mist' || (hazeDensity > 0.1 && !isFog);

  const fogLayers = isFog ? (fogDensity > 0.5 ? 3 : 2) : isMist ? 1 : 0;

  const fogLayerData = fogLayers > 0
    ? Array.from({ length: fogLayers }, (_, i) => ({
        opacity: isFog
          ? fogDensity * (1 - i * 0.22)
          : hazeDensity * (0.22 + (i === 0 ? 0.15 : 0.08)),
        duration: 24 + i * 10,
        delay: i * 1.4,
        scale: 1.15 + i * 0.05
      }))
    : [];

  /* ----------------------------- Overlays -------------------------------- */
  const showHeat = weather.special === 'heatwave' || (weather.fx?.heatShimmer ?? 0) > 0.15;
  // Rainbow ONLY appears when precipitation has ended (meteorologically accurate: requires sun + water droplets, not active rain)
  const showRainbow = (weather.special === 'rainbow' || (weather.fx?.rainbowProbability ?? 0) > 0.55) && weather.precipitation === 'none';
  const lightningProb = weather.fx?.lightningProbability ?? 0;
  const showLightning = (weather.precipitation === 'rain' || weather.precipitation === 'drizzle') && lightningProb > 0.2;
  const showGusts = (weather.windSpeed ?? 0) >= WINDY_KMH && (weather.precipitation === 'rain' || weather.precipitation === 'drizzle');

  const wetness = Math.max(0, Math.min(1, weather.fx?.surfaceWetnessNow ?? 0));
  const showPuddles = wetness > 0.35;

  return (
    <>
      {/* Particle container */}
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 3 }}
      />

      {/* Lens sheen for heavy rain */}
      {(weather.precipitation === 'rain' || weather.precipitation === 'drizzle') && (weather.intensity ?? 0) > 0.6 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 3,
            opacity: Math.min(0.35, (weather.intensity ?? 0) * 0.45),
            background: 'repeating-linear-gradient(-14deg, rgba(220,230,255,0.05), rgba(220,230,255,0.05) 2px, rgba(220,230,255,0.0) 4px)',
            filter: 'blur(0.2px)'
          }}
        />
      )}

      {/* Wind gust lines */}
      {showGusts && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={`gust-${i}`}
              className="absolute"
              style={{
                left: `${(i * 137) % width}px`,
                top: `${((i * 97) % (height * 0.6)) + height * 0.1}px`,
                width: '28vw',
                maxWidth: '420px',
                height: '2px',
                background: 'linear-gradient(90deg, rgba(200,220,255,0), rgba(200,220,255,0.25), rgba(200,220,255,0))',
                transform: `rotate(${(Math.atan2(weather.windSpeed ?? 0, 100) * 180) / Math.PI - 10}deg)`,
                opacity: 0.35,
                animation: `wind-gust ${3 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`
              }}
            />
          ))}
        </div>
      )}

      {/* Fog / mist / haze */}
      {fogLayerData.length > 0 && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {fogLayerData.map((layer, i) => (
            <div
              key={`fog-${i}`}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% ${80 + i * 6}%, rgba(200,200,200,${layer.opacity}) 0%, rgba(200,200,200,${layer.opacity * 0.6}) 35%, rgba(200,200,200,${layer.opacity * 0.24}) 58%, transparent 75%), linear-gradient(to top, rgba(210,210,210,${layer.opacity * 0.25}) 0%, rgba(210,210,210,0) 45%)`,
                mixBlendMode: 'soft-light',
                transform: `scale(${layer.scale}) translateX(${i % 2 ? '-6%' : '6%'})`,
                animation: `fog-drift ${layer.duration}s ease-in-out ${layer.delay}s infinite alternate`
              }}
            />
          ))}
        </div>
      )}

      {/* Heatwave shimmer */}
      {showHeat && (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 2,
              opacity: Math.min(1, (weather.fx?.heatShimmer ?? 0.4) * 0.6 + 0.2),
              background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0), rgba(255,255,255,0) 8px, rgba(255,230,180,0.06) 12px, rgba(255,255,255,0) 16px)',
              animation: 'heat-shimmer 6s ease-in-out infinite',
              filter: 'blur(0.6px)'
            }}
          />
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              left: 0,
              right: 0,
              bottom: '6%',
              height: '16%',
              zIndex: 2,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255,225,170,0.10), rgba(255,225,170,0.05) 45%, transparent 70%)',
              filter: 'blur(2px)',
              animation: 'mirage 5.5s ease-in-out infinite'
            }}
          />
        </>
      )}

      {/* Rainbow - IMPROVED: Much larger, realistic opacity, atmospheric colors */}
      {showRainbow && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: '12%',
            right: '5%',
            width: Math.min(800, Math.max(500, width * 0.65)), // 65% of screen width (was 35%)
            height: Math.min(450, Math.max(280, height * 0.35)), // 35% of screen height (was 22%)
            zIndex: 2,
            filter: 'blur(0.8px)' // Slightly more blur for atmospheric effect
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 400 240">
            <defs>
              {/* Primary arc - desaturated atmospheric colors at 0.4 opacity */}
              <linearGradient id="rainbow-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 100, 100, 0.4)" />      {/* Soft red */}
                <stop offset="16.66%" stopColor="rgba(255, 180, 100, 0.4)" />  {/* Peachy orange */}
                <stop offset="33.33%" stopColor="rgba(255, 240, 120, 0.4)" />  {/* Pale yellow */}
                <stop offset="50%" stopColor="rgba(180, 255, 180, 0.4)" />     {/* Soft green */}
                <stop offset="66.66%" stopColor="rgba(150, 200, 255, 0.4)" />  {/* Sky blue */}
                <stop offset="83.33%" stopColor="rgba(180, 150, 255, 0.4)" />  {/* Lavender indigo */}
                <stop offset="100%" stopColor="rgba(220, 180, 255, 0.4)" />    {/* Soft violet */}
              </linearGradient>
              {/* Secondary arc (outer, reversed colors) - half the opacity of primary */}
              <linearGradient id="rainbow-grad-2" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 100, 100, 0.2)" />      {/* Soft red */}
                <stop offset="16.66%" stopColor="rgba(255, 180, 100, 0.2)" />  {/* Peachy orange */}
                <stop offset="33.33%" stopColor="rgba(255, 240, 120, 0.2)" />  {/* Pale yellow */}
                <stop offset="50%" stopColor="rgba(180, 255, 180, 0.2)" />     {/* Soft green */}
                <stop offset="66.66%" stopColor="rgba(150, 200, 255, 0.2)" />  {/* Sky blue */}
                <stop offset="83.33%" stopColor="rgba(180, 150, 255, 0.2)" />  {/* Lavender indigo */}
                <stop offset="100%" stopColor="rgba(220, 180, 255, 0.2)" />    {/* Soft violet */}
              </linearGradient>
              {/* Atmospheric glow effect */}
              <filter id="rainbow-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feFlood floodColor="rgba(255, 255, 255, 0.25)"/>
                <feComposite in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Primary arc (inner, brighter) */}
            <path
              d="M 40 230 A 160 160 0 0 1 360 230"
              stroke="url(#rainbow-grad-1)"
              strokeWidth="20"
              fill="none"
              filter="url(#rainbow-glow)"
            />
            {/* Secondary arc (outer, fainter, properly spaced ~10% larger radius) */}
            <path
              d="M 25 230 A 185 185 0 0 1 375 230"
              stroke="url(#rainbow-grad-2)"
              strokeWidth="16"
              fill="none"
              filter="url(#rainbow-glow)"
            />
          </svg>
        </div>
      )}

      {/* Puddle ripples */}
      {showPuddles && (
        <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: '18%', zIndex: 2, opacity: Math.min(0.7, 0.25 + wetness * 0.45) }}>
          {Array.from({ length: 12 }, (_, i) => {
            const w = 80 + (i % 4) * 30;
            const l = (i * 11.3) % width;
            const d = 3 + (i % 3);
            return (
              <div
                key={`puddle-${i}`}
                className="absolute"
                style={{
                  left: `${l}px`,
                  bottom: `${(i % 3) * 6}px`,
                  width: `${w}px`,
                  height: `${w / 4}px`,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(200,220,255,0.15) 0%, rgba(200,220,255,0.05) 50%, rgba(200,220,255,0) 70%)',
                  filter: 'blur(1px)',
                  animation: `ripple ${4 + d}s ease-out ${(i % 5) * 0.7}s infinite`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Lightning flash */}
      {showLightning && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 4,
            animation: `lightning-flash ${3 + (1 - Math.max(0, Math.min(1, lightningProb))) * 3}s ease-in-out ${Math.random() * 2}s infinite`,
            background: 'radial-gradient(circle at 60% 20%, rgba(255,255,255,0.6), rgba(255,255,255,0) 40%)',
            mixBlendMode: 'screen',
            opacity: 0
          }}
        />
      )}

      {/* CSS animations */}
      <style jsx="true">{`
        /* RAIN */
        @keyframes rain-fall {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(var(--wind-offset, 0), var(--fall-y, ${height + 50}px), 0); }
        }

        /* PETALS (spring blossoms) */
        @keyframes petal-move {
          0%   { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.95; }
          50%  { transform: translate3d(var(--petal-dx-half, 100px), var(--petal-dy-half, 200px), 0) rotate(var(--petal-rotMid, 120deg)); }
          100% { transform: translate3d(var(--petal-dx, 200px), var(--petal-dy, 400px), 0) rotate(var(--petal-rotEnd, 300deg)); opacity: 0; }
        }

        /* AIR (dust/pollen) */
        @keyframes air-drift {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.7; }
          100% { transform: translate3d(var(--air-dx, 40px), var(--air-dy, -50px), 0); opacity: 0; }
        }

        /* FOG / HAZE */
        @keyframes fog-drift {
          0%   { transform: translateX(-6%) scale(1.2); }
          100% { transform: translateX(6%)  scale(1.2); }
        }

        /* GUSTS */
        @keyframes wind-gust {
          0%   { opacity: 0; transform: translateX(-10%) scaleX(0.9); }
          20%  { opacity: 0.45; }
          50%  { opacity: 0.35; transform: translateX(10%)  scaleX(1.0); }
          80%  { opacity: 0.15; }
          100% { opacity: 0; transform: translateX(24%)  scaleX(1.05); }
        }

        /* HEATWAVE */
        @keyframes heat-shimmer {
          0%   { background-position: 0 0; }
          50%  { background-position: 0 8px; }
          100% { background-position: 0 0; }
        }
        @keyframes mirage {
          0%   { transform: scaleY(1.0); opacity: 0.55; }
          50%  { transform: scaleY(1.06); opacity: 0.75; }
          100% { transform: scaleY(1.0); opacity: 0.55; }
        }

        /* PUDDLES */
        @keyframes ripple {
          0%   { transform: scale(0.95); opacity: 0.4; }
          60%  { opacity: 0.2; }
          100% { transform: scale(1.05); opacity: 0.0; }
        }

        /* LIGHTNING */
        @keyframes lightning-flash {
          0%, 96%, 100% { opacity: 0; }
          97% { opacity: 0.9; }
          98% { opacity: 0.1; }
          99% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
};

export default WeatherEffects;
