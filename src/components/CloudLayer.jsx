/**
 * CloudLayer.jsx - Animated cloud rendering with parallax movement
 *
 * Renders realistic clouds that slowly drift across the sky based on wind speed
 * Different cloud types (cirrus, cumulus, stratus, etc.) with appropriate shapes
 *
 * Features:
 * - Multiple parallax layers at different speeds
 * - Organic cloud shapes using SVG paths
 * - Smooth infinite scrolling animation
 * - Time-of-day color adjustments
 * - Weather-appropriate cloud types and density
 */

import React, { useMemo, memo } from 'react';
import { getCloudShapes, getCloudSizeMultiplier, getAltitudeRange, getAltitudeSpeedMultiplier } from '../services/cloudService';
import { createSeededRandom } from '../utils/seededRandom';

const CLOUD_SVG_CONFIG = {
  default: { width: 200, height: 100, viewBox: { minX: 0, minY: 0, width: 170, height: 80 } },
  stratus: { width: 400, height: 110, viewBox: { minX: 0, minY: 0, width: 220, height: 80 } },
  nimbostratus: { width: 400, height: 110, viewBox: { minX: 0, minY: 0, width: 220, height: 80 } },
  cumulonimbus: { width: 220, height: 150, viewBox: { minX: 0, minY: 0, width: 150, height: 100 } }
};

const getSvgConfigForType = (type) => {
  if (type === 'stratus' || type === 'nimbostratus') return CLOUD_SVG_CONFIG.stratus;
  if (type === 'cumulonimbus') return CLOUD_SVG_CONFIG.cumulonimbus;
  return CLOUD_SVG_CONFIG.default;
};

const SUN_DIRECTION_BY_PERIOD = {
  dawn: 0.2,
  'pre-dawn': 0.15,
  morning: 0.35,
  day: 0.5,
  afternoon: 0.55,
  dusk: 0.75,
  twilight: 0.65,
  night: 0.5,
  midnight: 0.45
};

const getSunLightingProfile = (timeOfDay) => {
  const dir = SUN_DIRECTION_BY_PERIOD[timeOfDay] ?? 0.5; // 0 = east, 1 = west
  const highlightCx = 18 + dir * 64; // keep inside 18%-82%
  const highlightCy = dir < 0.5 ? 28 : 34;
  const shadowX1 = `${Math.max(0, dir * 100 - 12)}%`;
  const shadowX2 = `${Math.min(100, dir * 100 + 28)}%`;
  return { highlightCx, highlightCy, shadowX1, shadowX2 };
};

const CloudLayer = ({
  cloudConfig = { enabled: false, layers: [], seed: 0 },
  width = 1920,
  height = 1080,
  timeOfDay = 'day',
  className = ''
}) => {
  // Don't render if clouds are disabled
  if (!cloudConfig.enabled || !cloudConfig.layers || cloudConfig.layers.length === 0) {
    return null;
  }

  // Enhanced time-based color adjustments for clouds with highlight and shadow
  const getTimeAdjustedColors = (baseColor, timeOfDay, isDark = false, altitude = 'mid') => {
    const isDawn = timeOfDay === 'dawn' || timeOfDay === 'pre-dawn';
    const isDusk = timeOfDay === 'dusk';
    const isNight = timeOfDay === 'night' || timeOfDay === 'midnight' || timeOfDay === 'twilight';

    // Atmospheric perspective: higher/more distant clouds get blue tint and desaturation
    const atmosphericTint = altitude === 'high' ? 0.15 : (altitude === 'veryhigh' ? 0.25 : 0);

    // Helper: Check if baseColor is a dark/gray rain cloud color
    const isRainCloud = (color) => {
      // Rain cloud colors from cloudService: #64748b (nimbostratus), #334155 (cumulonimbus), #475569 (stratus), etc.
      const hex = color.toLowerCase().replace(/[^0-9a-f]/g, '');
      if (hex.length !== 6) return false;
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      // Check if it's a dark gray color (low saturation, mid-to-low brightness)
      const avg = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      return avg < 140 && saturation < 50; // Dark and desaturated = rain cloud
    };

    let main, highlight, shadow, subsurface;

    // Dark storm clouds - MAXIMUM DRAMA: Deep darkness for severe storms
    if (isDark) {
      main = '#1a2332'; // Much darker base (was #2a3545) - nearly black
      highlight = '#2d3748'; // Very subdued highlight (was #4a5568) - minimal brightness
      shadow = '#050810'; // Pure black shadow (was #0a0f1c) - maximum depth
      subsurface = null; // No subsurface scattering in storm clouds
      return { main, highlight, shadow, subsurface };
    }

    // Rain clouds - METEOROLOGICALLY ACCURATE: Preserve dark gray colors during day
    if (isRainCloud(baseColor)) {
      main = baseColor; // Use the actual rain cloud color (e.g., #64748b for nimbostratus)
      // Lighter highlight (add 20% brightness)
      const hex = baseColor.replace('#', '');
      const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 51);
      const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 51);
      const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 51);
      highlight = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      // Darker shadow (subtract 30% brightness)
      const sr = Math.max(0, parseInt(hex.substr(0, 2), 16) - 77);
      const sg = Math.max(0, parseInt(hex.substr(2, 2), 16) - 77);
      const sb = Math.max(0, parseInt(hex.substr(4, 2), 16) - 77);
      shadow = `#${sr.toString(16).padStart(2, '0')}${sg.toString(16).padStart(2, '0')}${sb.toString(16).padStart(2, '0')}`;
      subsurface = null; // No subsurface scattering in rain clouds
      return { main, highlight, shadow, subsurface };
    }

    // Dawn - pinkish tints with warm highlights
    if (isDawn) {
      main = atmosphericTint > 0
        ? `color-mix(in srgb, #ffd1dc ${100 - atmosphericTint * 100}%, #d4e4f7)`
        : '#ffd1dc';
      highlight = '#ffe4e9';
      shadow = '#ffb8c8';
      subsurface = '#fff5e6'; // Warm peachy glow
      return { main, highlight, shadow, subsurface };
    }

    // Dusk - orange/golden tints
    if (isDusk) {
      main = atmosphericTint > 0
        ? `color-mix(in srgb, #ffa07a ${100 - atmosphericTint * 100}%, #c4d4e7)`
        : '#ffa07a';
      highlight = '#ffc09a';
      shadow = '#ff8860';
      subsurface = '#ffcc99'; // Golden backlit glow
      return { main, highlight, shadow, subsurface };
    }

    // Night - darker blue-gray
    if (isNight) {
      main = atmosphericTint > 0
        ? `color-mix(in srgb, #2d3748 ${100 - atmosphericTint * 100}%, #1a2a3a)`
        : '#2d3748';
      highlight = '#3d4758';
      shadow = '#1d2738';
      subsurface = '#4a5a6a'; // Subtle moonlight glow
      return { main, highlight, shadow, subsurface };
    }

    // Day - IMPROVED: Add subtle blue/sky tint instead of pure white + atmospheric perspective
    main = atmosphericTint > 0
      ? `color-mix(in srgb, #f8f9fb ${100 - atmosphericTint * 100}%, #b8d4ed)`
      : '#f8f9fb';
    highlight = '#ffffff';
    shadow = '#dce3eb'; // Cooler shadow with blue tint
    subsurface = '#fffef8'; // Warm sunlit translucent glow
    return { main, highlight, shadow, subsurface };
  };

  // Generate all cloud instances once and memoize them
  const allLayerInstances = useMemo(() => {
    // Create fresh RNG each time cloudConfig changes
    const rng = createSeededRandom(cloudConfig.seed || 0);

    return cloudConfig.layers.map((layer, layerIndex) => {
      const shapes = getCloudShapes()[layer.type] || [];
      const sizeMultiplier = getCloudSizeMultiplier(layer.size);
      const altitudeRange = getAltitudeRange(layer.altitude);

      // Apply altitude-based parallax speed multiplier
      const altitudeSpeedMultiplier = getAltitudeSpeedMultiplier(layer.altitude);
      const adjustedSpeed = layer.speed * altitudeSpeedMultiplier;

      // Calculate base animation duration (higher speed = shorter duration) - SLOWED DOWN 3x total
      const baseAnimationDuration = Math.max(180, 540 - (adjustedSpeed * 12));

      // Generate cloud instances with deterministic positions and varied speeds
      const cloudInstances = [];
      for (let i = 0; i < layer.count; i++) {
        const shapeIndex = i % shapes.length;
        const shapeData = shapes[shapeIndex];
        const yPosition = altitudeRange.min + (rng.random() * (altitudeRange.max - altitudeRange.min));
        const scale = sizeMultiplier * (1.2 + rng.random() * 0.4); // Reduced from 1.8 to 1.2
        const xOffset = (i / layer.count) * 100;

        // Add per-cloud speed variation (±50% - much more varied)
        const speedVariation = 0.6 + rng.random() * 0.8;
        const cloudAnimationDuration = baseAnimationDuration / speedVariation;
        const animationDelay = -(i / layer.count) * cloudAnimationDuration;

        cloudInstances.push({
          id: `${layerIndex}-${i}`,
          shapeData,
          type: layer.type,
          yPosition,
          scale,
          xOffset,
          animationDelay,
          animationDuration: cloudAnimationDuration,
          opacity: layer.opacity * (0.85 + rng.random() * 0.15)
        });
      }

      return {
        layer,
        layerIndex,
        cloudInstances
      };
    });
  }, [cloudConfig]);

  const daytimeBirdWindow = ['dawn', 'morning', 'afternoon', 'day', 'dusk', 'twilight'];
  const hasStormClouds = (cloudConfig.layers || []).some((layer) =>
    ['nimbostratus', 'cumulonimbus'].includes(layer.type)
  );
  const shouldShowBirds = cloudConfig.enabled && daytimeBirdWindow.includes(timeOfDay) && !hasStormClouds;

  // Enhanced bird activity - more active during dawn and dusk
  const isDawnDusk = timeOfDay === 'dawn' || timeOfDay === 'dusk' || timeOfDay === 'twilight' || timeOfDay === 'pre-dawn';

  const birdFlocks = useMemo(() => {
    if (!shouldShowBirds) return [];
    const rng = createSeededRandom((cloudConfig.seed || 0) + 97);

    // More flocks during dawn/dusk (2-4 instead of 1-2)
    const baseFlockCount = isDawnDusk ? 2 + rng.randomInt(0, 3) : 1 + rng.randomInt(0, 2);
    const maxFlockCount = 6; // Cap at 6 flocks to prevent memory leak
    const baseDuration = width < 900 ? 22 : 28;

    // More realistic bird silhouettes
    const singleBirdShapes = [
      'M1 3 Q3 1 5 3 M5 3 Q7 1 9 3',        // Simple M-shape bird
      'M0 3 Q2 0.5 4 3 M4 3 Q6 0.5 8 3',    // Narrower wingspan
      'M1 4 Q4 1 7 4 M7 4 Q10 1 13 4'       // Wider glide
    ];

    const flocks = [];

    // Generate varied flight patterns
    for (let i = 0; i < baseFlockCount; i++) {
      const flightType = rng.randomInt(0, 100);

      // 55% straight, 30% swooping, 15% V-formation (removed circling - looked unnatural)
      if (flightType < 55) {
        // STRAIGHT FLIGHT - Simple horizontal movement
        flocks.push({
          id: `bird-straight-${i}`,
          type: 'straight',
          scale: 0.4 + rng.random() * 0.3, // Smaller
          topPercent: (0.18 + rng.random() * 0.22) * 100,
          duration: baseDuration + rng.random() * 8,
          delay: rng.random() * 10 + i * 2, // Shorter delays
          rise: (rng.random() - 0.5) * 25, // Less vertical drift
          shape: singleBirdShapes[rng.randomInt(0, singleBirdShapes.length)],
          opacity: 0.5 + rng.random() * 0.2
        });
      } else if (flightType < 85) {
        // SWOOPING FLIGHT - Gentle up/down movement
        flocks.push({
          id: `bird-swoop-${i}`,
          type: 'swoop',
          scale: 0.35 + rng.random() * 0.25, // Smaller
          topPercent: (0.15 + rng.random() * 0.25) * 100,
          duration: baseDuration + rng.random() * 6,
          delay: rng.random() * 8 + i * 2,
          swoopAmplitude: 20 + rng.random() * 25, // Less dramatic swooping
          swoopFrequency: 2 + rng.randomInt(0, 2),
          shape: singleBirdShapes[rng.randomInt(0, singleBirdShapes.length)],
          opacity: 0.5 + rng.random() * 0.15
        });
      } else {
        // V-FORMATION FLOCK - Multiple birds in V shape
        const formationSize = 3 + rng.randomInt(0, 3); // 3-5 birds (smaller groups)
        const leaderY = (0.2 + rng.random() * 0.2) * 100;
        const vAngle = 35 + rng.random() * 20;

        flocks.push({
          id: `bird-vformation-${i}`,
          type: 'vformation',
          formationSize,
          scale: 0.3 + rng.random() * 0.2, // Smaller
          topPercent: leaderY,
          duration: baseDuration + rng.random() * 10,
          delay: rng.random() * 12 + i * 3,
          vAngle,
          shape: singleBirdShapes[0],
          opacity: 0.45 + rng.random() * 0.15
        });
      }
    }

    return flocks.slice(0, maxFlockCount);
  }, [shouldShowBirds, cloudConfig.seed, width, isDawnDusk]);

  // Perching birds on spires and rooftops
  const perchingBirds = useMemo(() => {
    if (!shouldShowBirds) return [];
    const rng = createSeededRandom((cloudConfig.seed || 0) + 199);

    // Fewer, smaller perching birds
    const birdCount = isDawnDusk ? 2 + rng.randomInt(0, 2) : 1 + rng.randomInt(0, 2);

    // Perching locations (church spires and rooftops - scaled to vw)
    const perchLocations = [
      { x: 246 / 8, y: 197 / 3, type: 'spire' }, // Church 1 spire peak
      { x: 434 / 8, y: 212 / 3, type: 'spire' }, // Church 2 needle spire
      { x: 559 / 8, y: 233 / 3, type: 'dome' },  // Baroque church dome cross
      { x: 110 / 8, y: 200 / 3, type: 'spire' }, // Background church
    ];

    const birds = [];

    for (let i = 0; i < birdCount && i < perchLocations.length; i++) {
      const location = perchLocations[i];
      const activityType = rng.randomInt(0, 100);

      birds.push({
        id: `perching-bird-${i}`,
        x: location.x,
        y: location.y,
        scale: location.type === 'spire' ? 0.4 + rng.random() * 0.15 : 0.3 + rng.random() * 0.1, // Much smaller
        // Activity: 60% idle, 25% preening, 15% fly away and return
        activity: activityType < 60 ? 'idle' : (activityType < 85 ? 'preen' : 'fly'),
        delay: rng.random() * 8,
        idleDuration: 3 + rng.random() * 4,
        opacity: 0.55 + rng.random() * 0.2,
        facing: rng.random() > 0.5 ? 'left' : 'right'
      });
    }

    return birds;
  }, [shouldShowBirds, cloudConfig.seed, isDawnDusk]);

  // High-altitude birds with animated wings - tiny distant birds
  const highAltitudeBirds = useMemo(() => {
    if (!shouldShowBirds) return [];
    const rng = createSeededRandom((cloudConfig.seed || 0) + 777);

    // Spawn 2-4 tiny birds at high altitude
    const birdCount = 2 + rng.randomInt(0, 3);
    const birds = [];

    for (let i = 0; i < birdCount; i++) {
      birds.push({
        id: `high-altitude-${i}`,
        startX: rng.random() * 30 - 20, // Start off-screen left
        y: 8 + rng.random() * 12, // Upper 20% of sky (8-20vh)
        scale: 0.15 + rng.random() * 0.1, // Very small (0.15-0.25x) - about 3-5 pixels
        duration: 60 + rng.random() * 40, // 60-100 seconds (very slow, majestic)
        delay: i * 25 + rng.random() * 15, // Staggered appearance
        wingbeatSpeed: 1.2 + rng.random() * 0.8, // 1.2-2.0s per wingbeat cycle
        soarProbability: rng.random(), // Chance to glide vs flap (higher = more gliding)
        rise: rng.random() * 15 - 7.5, // Slight vertical drift (-7.5 to 7.5vh)
        opacity: 0.5 + rng.random() * 0.2
      });
    }

    return birds;
  }, [shouldShowBirds, cloudConfig.seed]);

  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        zIndex: 2,
        left: '-15%',
        right: '-15%',
        top: 0,
        bottom: 0,
        width: '130%' // Extended to prevent edge clipping of large clouds
      }}
    >
      {allLayerInstances.map(({ layer, layerIndex, cloudInstances }) => {
        const colors = getTimeAdjustedColors(layer.color, timeOfDay, layer.dark, layer.altitude);
        const lighting = getSunLightingProfile(timeOfDay);

        // Atmospheric perspective: higher altitude = more blur and less contrast
        const altitudeBlurMultiplier = layer.altitude === 'veryhigh' ? 1.8 : (layer.altitude === 'high' ? 1.3 : 1.0);
        const contrastReduction = layer.altitude === 'veryhigh' ? 0.6 : (layer.altitude === 'high' ? 0.8 : 1.0);

        return (
          <div
            key={`cloud-layer-${layerIndex}`}
            className="absolute inset-0"
            style={{
              opacity: layer.opacity,
              filter: layer.blur ? 'blur(4px)' : 'none'
            }}
          >
            {cloudInstances.map((instance) => {
              // Determine if this is a puff-based or path-based cloud
              const isPuffCloud = instance.shapeData && instance.shapeData.puffs;
              const isWispCloud = instance.shapeData && instance.shapeData.wisps;

              return (
                <div
                  key={instance.id}
                  className="cloud-drift"
                  style={{
                    position: 'absolute',
                    top: `${instance.yPosition * 100}%`,
                    left: `${instance.xOffset}%`,
                    '--scale': instance.scale,
                    '--animation-duration': `${instance.animationDuration}s`,
                    '--animation-delay': `${instance.animationDelay}s`,
                    opacity: instance.opacity,
                    animation: `cloudDrift var(--animation-duration) linear var(--animation-delay) infinite`,
                    willChange: 'transform'
                  }}
                >
                  {(() => {
                    const svgConfig = getSvgConfigForType(instance.type);
                    const { minX, minY, width: vbWidth, height: vbHeight } = svgConfig.viewBox;
                    const maskPadding = Math.max(vbWidth, vbHeight) * 0.35;

                    const viewBoxString = `${minX} ${minY} ${vbWidth} ${vbHeight}`;
                    const maskFilterId = `cloud-soften-${instance.id}`;
                    const maskId = `cloud-mask-${instance.id}`;
                    const highlightId = `cloud-highlight-${instance.id}`;
                    const shadowGradId = `cloud-shadow-grad-${instance.id}`;
                    const sunCenter = lighting.highlightCx / 100;
                    const ambientOffsetX = (0.5 - sunCenter) * 6;
                    const lowerShadowOffsetX = (0.5 - sunCenter) * 4;
                    const lowerShadowOffsetY = 3;

                    return (
                      <svg
                        width={svgConfig.width}
                        height={svgConfig.height}
                        viewBox={viewBoxString}
                        style={{ overflow: 'visible' }}
                      >
                        <defs>
                          {/* Organic cloud texture using turbulence noise */}
                          <filter
                            id={`${maskFilterId}-texture`}
                            filterUnits="userSpaceOnUse"
                            x={minX - maskPadding}
                            y={minY - maskPadding}
                            width={vbWidth + maskPadding * 2}
                            height={vbHeight + maskPadding * 2}
                            colorInterpolationFilters="sRGB"
                          >
                            {/* Turbulence creates organic noise pattern */}
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency={instance.type === 'cirrus' ? '0.03 0.01' : (instance.type === 'cumulus' ? '0.02 0.02' : '0.015 0.008')}
                              numOctaves={instance.type === 'cumulonimbus' ? '5' : '4'}
                              seed={instance.id.split('-')[1] || 0}
                              result="turbulence"
                            />
                            {/* Displacement map creates irregular, torn edges */}
                            <feDisplacementMap
                              in="SourceGraphic"
                              in2="turbulence"
                              scale={instance.type === 'cirrus' ? '8' : (instance.type === 'stratus' ? '3' : '5')}
                              xChannelSelector="R"
                              yChannelSelector="G"
                              result="displaced"
                            />
                            {/* Blur for atmospheric softness */}
                            <feGaussianBlur in="displaced" stdDeviation={Math.max(vbWidth, vbHeight) * 0.025 * altitudeBlurMultiplier} />
                          </filter>

                          {/* Variable edge softness - different blur for different cloud types */}
                          <filter
                            id={maskFilterId}
                            filterUnits="userSpaceOnUse"
                            x={minX - maskPadding}
                            y={minY - maskPadding}
                            width={vbWidth + maskPadding * 2}
                            height={vbHeight + maskPadding * 2}
                            colorInterpolationFilters="sRGB"
                          >
                            <feGaussianBlur stdDeviation={Math.max(vbWidth, vbHeight) * 0.035 * altitudeBlurMultiplier} />
                          </filter>

                          {/* Additional soft edge filter for wispy cloud parts */}
                          <filter
                            id={`${maskFilterId}-soft`}
                            filterUnits="userSpaceOnUse"
                            x={minX - maskPadding}
                            y={minY - maskPadding}
                            width={vbWidth + maskPadding * 2}
                            height={vbHeight + maskPadding * 2}
                            colorInterpolationFilters="sRGB"
                          >
                            <feGaussianBlur stdDeviation={Math.max(vbWidth, vbHeight) * 0.065 * altitudeBlurMultiplier} />
                          </filter>

                          {/* Torn/irregular edge filter - combines turbulence + heavy blur */}
                          <filter
                            id={`${maskFilterId}-torn`}
                            filterUnits="userSpaceOnUse"
                            x={minX - maskPadding}
                            y={minY - maskPadding}
                            width={vbWidth + maskPadding * 2}
                            height={vbHeight + maskPadding * 2}
                            colorInterpolationFilters="sRGB"
                          >
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="0.015 0.015"
                              numOctaves="3"
                              seed={(instance.id.split('-')[1] || 0) + 100}
                              result="noise"
                            />
                            <feDisplacementMap
                              in="SourceGraphic"
                              in2="noise"
                              scale="12"
                              xChannelSelector="R"
                              yChannelSelector="G"
                              result="displaced"
                            />
                            <feGaussianBlur in="displaced" stdDeviation={Math.max(vbWidth, vbHeight) * 0.09 * altitudeBlurMultiplier} />
                          </filter>

                          <mask
                            id={maskId}
                            maskUnits="userSpaceOnUse"
                            x={minX}
                            y={minY}
                            width={vbWidth}
                            height={vbHeight}
                          >
                            <rect x={minX} y={minY} width={vbWidth} height={vbHeight} fill="black" opacity="0" />
                            <g filter={`url(#${maskFilterId})`}>
                              {isPuffCloud &&
                                instance.shapeData.puffs.map((puff, idx) => (
                                  <ellipse
                                    key={`mask-puff-${idx}`}
                                    cx={puff.cx}
                                    cy={puff.cy}
                                    rx={puff.rx}
                                    ry={puff.ry}
                                    fill="white"
                                  />
                                ))}

                              {isWispCloud && (
                                <>
                                  <path
                                    d={instance.shapeData.main}
                                    stroke="white"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    fill="none"
                                  />
                                  {instance.shapeData.wisps.map((wisp, idx) => (
                                    <path
                                      key={`mask-wisp-${idx}`}
                                      d={wisp}
                                      stroke="white"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                      fill="none"
                                      opacity={0.8 - idx * 0.2}
                                    />
                                  ))}
                                </>
                              )}
                            </g>
                          </mask>

                          {/* Fuzzy blur filter for highlights */}
                          <filter id={`${highlightId}-blur`}>
                            <feGaussianBlur stdDeviation={Math.max(vbWidth, vbHeight) * 0.08} />
                          </filter>

                          <radialGradient id={highlightId} cx={`${lighting.highlightCx}%`} cy={`${lighting.highlightCy}%`} r="85%">
                            <stop offset="0%" stopColor={colors.highlight} stopOpacity="0.4" />
                            <stop offset="30%" stopColor={colors.highlight} stopOpacity="0.25" />
                            <stop offset="55%" stopColor={colors.main} stopOpacity="0.15" />
                            <stop offset="75%" stopColor={colors.main} stopOpacity="0.08" />
                            <stop offset="90%" stopColor={colors.main} stopOpacity="0.02" />
                            <stop offset="100%" stopColor={colors.main} stopOpacity="0" />
                          </radialGradient>

                          {/* Improved shadow gradient with depth variation and ambient color mixing */}
                          <linearGradient id={shadowGradId} x1={lighting.shadowX1} y1="45%" x2={lighting.shadowX2} y2="100%">
                            <stop offset="0%" stopColor={colors.main} stopOpacity="0" />
                            <stop offset="35%" stopColor={colors.shadow} stopOpacity={0.08 * contrastReduction} />
                            <stop offset="55%" stopColor={colors.shadow} stopOpacity={0.18 * contrastReduction} />
                            <stop offset="75%" stopColor={colors.shadow} stopOpacity={0.28 * contrastReduction} />
                            <stop offset="100%" stopColor={colors.shadow} stopOpacity={0.42 * contrastReduction} />
                          </linearGradient>

                          {/* Density gradients - each puff gets its own radial gradient for realistic density falloff */}
                          {isPuffCloud && instance.shapeData.puffs.map((puff, idx) => (
                            <radialGradient
                              key={`density-grad-${idx}`}
                              id={`density-${instance.id}-${idx}`}
                              cx="50%"
                              cy="50%"
                              r="50%"
                            >
                              <stop offset="0%" stopColor={colors.main} stopOpacity={0.98 * contrastReduction} />
                              <stop offset="40%" stopColor={colors.main} stopOpacity={0.90 * contrastReduction} />
                              <stop offset="70%" stopColor={colors.main} stopOpacity={0.65 * contrastReduction} />
                              <stop offset="90%" stopColor={colors.main} stopOpacity={0.25 * contrastReduction} />
                              <stop offset="100%" stopColor={colors.main} stopOpacity="0" />
                            </radialGradient>
                          ))}

                          {/* Subsurface scattering gradient - warm backlit glow for translucent edges */}
                          {colors.subsurface && (
                            <radialGradient
                              id={`subsurface-${instance.id}`}
                              cx={`${100 - lighting.highlightCx}%`}
                              cy={`${lighting.highlightCy + 10}%`}
                              r="60%"
                            >
                              <stop offset="0%" stopColor={colors.subsurface} stopOpacity="0" />
                              <stop offset="40%" stopColor={colors.subsurface} stopOpacity={0.15 * contrastReduction} />
                              <stop offset="75%" stopColor={colors.subsurface} stopOpacity={0.35 * contrastReduction} />
                              <stop offset="100%" stopColor={colors.subsurface} stopOpacity="0" />
                            </radialGradient>
                          )}

                          {/* Ambient occlusion - shadows between overlapping puffs for depth */}
                          {isPuffCloud && instance.shapeData.puffs.map((puff, idx) => {
                            if (idx === 0) return null; // Skip first puff
                            return (
                              <radialGradient
                                key={`ao-grad-${idx}`}
                                id={`ao-${instance.id}-${idx}`}
                                cx="50%"
                                cy="50%"
                                r="50%"
                              >
                                <stop offset="0%" stopColor={colors.shadow} stopOpacity="0" />
                                <stop offset="50%" stopColor={colors.shadow} stopOpacity={0.12 * contrastReduction} />
                                <stop offset="100%" stopColor={colors.shadow} stopOpacity={0.25 * contrastReduction} />
                              </radialGradient>
                            );
                          })}
                        </defs>

                        {/* Ambient soft drop shadow - ENHANCED: Much stronger shadow for dramatic depth */}
                        {isPuffCloud && (
                          <g opacity="0.35">
                            {instance.shapeData.puffs.map((puff, idx) => (
                              <ellipse
                                key={`ambient-${idx}`}
                                cx={puff.cx + ambientOffsetX * 1.5}
                                cy={puff.cy + 7}
                                rx={puff.rx * 1.12}
                                ry={puff.ry * 1.12}
                                fill={colors.shadow}
                              />
                            ))}
                          </g>
                        )}

                        {/* Render puff-based clouds (cumulus, stratocumulus, etc.) */}
                        {isPuffCloud && (
                          <g mask={`url(#${maskId})`}>
                            {/* Lower shadow volume - ENHANCED: Maximum volumetric depth */}
                            <g opacity="0.65">
                              {instance.shapeData.puffs.map((puff, idx) => (
                                <ellipse
                                  key={`shadow-${idx}`}
                                  cx={puff.cx + lowerShadowOffsetX * 1.6}
                                  cy={puff.cy + lowerShadowOffsetY * 2.0}
                                  rx={puff.rx * 1.08}
                                  ry={puff.ry * 1.08}
                                  fill={colors.shadow}
                                />
                              ))}
                            </g>

                            {/* Main cloud body - IMPROVED: Density gradients + organic texture */}
                            <g filter={`url(#${maskFilterId}-texture)`}>
                              {instance.shapeData.puffs.map((puff, idx) => (
                                <ellipse
                                  key={`main-${idx}`}
                                  cx={puff.cx}
                                  cy={puff.cy}
                                  rx={puff.rx}
                                  ry={puff.ry}
                                  fill={`url(#density-${instance.id}-${idx})`}
                                />
                              ))}
                            </g>

                            {/* Ambient occlusion - IMPROVED: Shadows between puffs for volumetric depth */}
                            <g opacity="0.6">
                              {instance.shapeData.puffs.map((puff, idx) => {
                                if (idx === 0) return null;
                                return (
                                  <ellipse
                                    key={`ao-${idx}`}
                                    cx={puff.cx}
                                    cy={puff.cy}
                                    rx={puff.rx * 0.9}
                                    ry={puff.ry * 0.9}
                                    fill={`url(#ao-${instance.id}-${idx})`}
                                  />
                                );
                              })}
                            </g>

                            {/* Subsurface scattering - IMPROVED: Warm backlit glow for translucent cloud edges */}
                            {colors.subsurface && (
                              <g opacity="0.5">
                                <rect
                                  x={minX}
                                  y={minY}
                                  width={vbWidth}
                                  height={vbHeight}
                                  fill={`url(#subsurface-${instance.id})`}
                                />
                              </g>
                            )}

                            {/* Fractal detail - IMPROVED: Small-scale texture for realism */}
                            <g opacity="0.25">
                              {instance.shapeData.puffs.map((puff, idx) => {
                                // Add 2-3 micro-puffs per main puff for fractal structure
                                return [0, 1, 2].map((microIdx) => {
                                  const angle = (microIdx / 3) * Math.PI * 2;
                                  const offsetDist = puff.rx * 0.35;
                                  const microX = puff.cx + Math.cos(angle) * offsetDist;
                                  const microY = puff.cy + Math.sin(angle) * offsetDist;
                                  return (
                                    <ellipse
                                      key={`fractal-${idx}-${microIdx}`}
                                      cx={microX}
                                      cy={microY}
                                      rx={puff.rx * 0.25}
                                      ry={puff.ry * 0.25}
                                      fill={colors.main}
                                      fillOpacity={0.5}
                                    />
                                  );
                                });
                              })}
                            </g>

                            {/* Wispy outer edges - IMPROVED: Variable softness + torn irregular edges */}
                            <g opacity="0.3" filter={`url(#${maskFilterId}-soft)`}>
                              {instance.shapeData.puffs.map((puff, idx) => {
                                // Only add wispy edges to outer puffs
                                if (idx % 2 === 0) return null;
                                return (
                                  <ellipse
                                    key={`wispy-${idx}`}
                                    cx={puff.cx}
                                    cy={puff.cy}
                                    rx={puff.rx * 1.15}
                                    ry={puff.ry * 1.15}
                                    fill={colors.main}
                                    fillOpacity={0.4}
                                  />
                                );
                              })}
                            </g>

                            {/* Torn/irregular outer edges - NEW: Creates ragged, realistic cloud boundaries */}
                            <g opacity={0.18 + (Math.random() * 0.12)} filter={`url(#${maskFilterId}-torn)`}>
                              {instance.shapeData.puffs.map((puff, idx) => {
                                // Add torn edges to all outer puffs (first 40% and last 40%)
                                const totalPuffs = instance.shapeData.puffs.length;
                                const isOuterPuff = idx < totalPuffs * 0.4 || idx > totalPuffs * 0.6;
                                if (!isOuterPuff) return null;

                                return (
                                  <ellipse
                                    key={`torn-${idx}`}
                                    cx={puff.cx}
                                    cy={puff.cy}
                                    rx={puff.rx * 1.3}
                                    ry={puff.ry * 1.3}
                                    fill={colors.main}
                                    fillOpacity={0.25 - (idx % 3) * 0.05}
                                  />
                                );
                              })}
                            </g>

                            {/* Highlight layer - ENHANCED: Glowing sun-facing edges with fuzzy blur */}
                            <g opacity="0.5" filter={`url(#${highlightId}-blur)`}>
                              {instance.shapeData.puffs
                                .slice(0, Math.ceil(instance.shapeData.puffs.length / 3))
                                .map((puff, idx) => (
                                  <ellipse
                                    key={`highlight-${idx}`}
                                    cx={puff.cx}
                                    cy={puff.cy - 2}
                                    rx={puff.rx * 0.75}
                                    ry={puff.ry * 0.65}
                                    fill={`url(#${highlightId})`}
                                  />
                                ))}
                            </g>

                            {/* INTENSE EDGE GLOW - Bright rim light on sun-facing edges with fuzzy blur */}
                            {!layer.dark && (timeOfDay === 'dawn' || timeOfDay === 'dusk' || timeOfDay === 'morning' || timeOfDay === 'afternoon' || timeOfDay === 'day') && (
                              <g opacity={timeOfDay === 'dawn' || timeOfDay === 'dusk' ? '0.5' : '0.35'} filter={`url(#${highlightId}-blur)`}>
                                {instance.shapeData.puffs
                                  .slice(0, Math.ceil(instance.shapeData.puffs.length / 2))
                                  .map((puff, idx) => {
                                    // Calculate sun-facing edge position
                                    const sunAngle = lighting.highlightCx / 100;
                                    const edgeOffsetX = (sunAngle - 0.5) * puff.rx * 0.3;
                                    const edgeOffsetY = -puff.ry * 0.15;

                                    return (
                                      <ellipse
                                        key={`edge-glow-${idx}`}
                                        cx={puff.cx + edgeOffsetX}
                                        cy={puff.cy + edgeOffsetY}
                                        rx={puff.rx * 0.5}
                                        ry={puff.ry * 0.3}
                                        fill={timeOfDay === 'dawn' ? '#fff0e6' : (timeOfDay === 'dusk' ? '#ffcc99' : '#ffffff')}
                                        opacity={0.6 - (idx * 0.15)}
                                      />
                                    );
                                  })}
                              </g>
                            )}

                            {/* Underside shading - ENHANCED: Very strong bottom shading for dramatic depth */}
                            <g opacity="0.75">
                              <path
                                d={`M ${minX} ${minY + vbHeight * 0.42} H ${minX + vbWidth} V ${minY + vbHeight} H ${minX} Z`}
                                fill={`url(#${shadowGradId})`}
                              />
                            </g>
                          </g>
                        )}

                        {/* Render wisp-based clouds (cirrus) */}
                        {isWispCloud && (
                          <g mask={`url(#${maskId})`} opacity="0.9">
                            <path
                              d={instance.shapeData.main}
                              stroke={colors.main}
                              strokeWidth="3"
                              fill="none"
                              strokeLinecap="round"
                              opacity="0.85"
                            />
                            {instance.shapeData.wisps.map((wisp, idx) => (
                              <path
                                key={`wisp-${idx}`}
                                d={wisp}
                                stroke={colors.main}
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                opacity={0.55 - idx * 0.1}
                              />
                            ))}
                            <path
                              d={instance.shapeData.main}
                              stroke={colors.highlight}
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              opacity="0.45"
                            />
                          </g>
                        )}
                      </svg>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        );
      })}

      {birdFlocks.map((flock) => {
        // Render different bird types
        if (flock.type === 'straight') {
          return (
            <div
              key={flock.id}
              className="absolute horizon-bird-straight"
              style={{
                top: `${flock.topPercent}%`,
                left: '-12vw',
                opacity: flock.opacity,
                '--bird-scale': flock.scale,
                '--bird-rise': `${flock.rise}px`,
                animationDuration: `${flock.duration}s`,
                animationDelay: `${flock.delay}s`
              }}
            >
              <svg width="24" height="12" viewBox="0 0 14 8" style={{ transform: 'scaleX(-1)' }}>
                <path
                  d={flock.shape}
                  fill="none"
                  stroke="rgba(50, 58, 72, 0.7)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        } else if (flock.type === 'swoop') {
          return (
            <div
              key={flock.id}
              className="absolute horizon-bird-swoop"
              style={{
                top: `${flock.topPercent}%`,
                left: '-12vw',
                opacity: flock.opacity,
                '--bird-scale': flock.scale,
                '--swoop-amplitude': `${flock.swoopAmplitude}px`,
                '--swoop-frequency': flock.swoopFrequency,
                animationDuration: `${flock.duration}s`,
                animationDelay: `${flock.delay}s`
              }}
            >
              <svg width="24" height="12" viewBox="0 0 14 8" style={{ transform: 'scaleX(-1)' }}>
                <path
                  d={flock.shape}
                  fill="none"
                  stroke="rgba(50, 58, 72, 0.65)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        } else if (flock.type === 'vformation') {
          // Render V-formation: leader + birds on each wing
          const birds = [];
          const leaderIndex = Math.floor(flock.formationSize / 2);

          for (let i = 0; i < flock.formationSize; i++) {
            const isLeader = i === leaderIndex;
            const wingOffset = i - leaderIndex; // -2, -1, 0, 1, 2
            const verticalOffset = Math.abs(wingOffset) * Math.tan((flock.vAngle * Math.PI) / 180) * 15;
            const horizontalOffset = wingOffset * 18;

            birds.push(
              <div
                key={`${flock.id}-bird-${i}`}
                className="absolute"
                style={{
                  top: `${verticalOffset}px`,
                  left: `${horizontalOffset}px`
                }}
              >
                <svg width="20" height="10" viewBox="0 0 14 8" style={{ transform: 'scaleX(-1)' }}>
                  <path
                    d={flock.shape}
                    fill="none"
                    stroke={isLeader ? "rgba(50, 58, 72, 0.7)" : "rgba(50, 58, 72, 0.55)"}
                    strokeWidth={isLeader ? "1" : "0.9"}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            );
          }

          return (
            <div
              key={flock.id}
              className="absolute horizon-bird-vformation"
              style={{
                top: `${flock.topPercent}%`,
                left: '-15vw',
                opacity: flock.opacity,
                '--bird-scale': flock.scale,
                animationDuration: `${flock.duration}s`,
                animationDelay: `${flock.delay}s`
              }}
            >
              {birds}
            </div>
          );
        }

        return null;
      })}

      {/* Perching birds on rooftops and spires */}
      {perchingBirds.map((bird) => {
        const birdPath = 'M2 6 C6 2 9 2 13 6'; // Simple V-shape bird

        if (bird.activity === 'idle') {
          // Subtle head bob and occasional wing flutter
          return (
            <div
              key={bird.id}
              className="absolute horizon-bird-perch-idle"
              style={{
                top: `${bird.y}vh`,
                left: `${bird.x}vw`,
                opacity: bird.opacity,
                '--bird-scale': bird.scale,
                '--bird-facing': bird.facing === 'left' ? -1 : 1,
                '--idle-duration': `${bird.idleDuration}s`,
                animationDelay: `${bird.delay}s`
              }}
            >
              <svg width="18" height="9" viewBox="0 0 14 8" style={{ transform: `scaleX(${bird.facing === 'left' ? -1 : 1})` }}>
                <path
                  d={birdPath}
                  fill="none"
                  stroke="rgba(40, 48, 62, 0.75)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        } else if (bird.activity === 'preen') {
          // Preening animation (wing adjustments)
          return (
            <div
              key={bird.id}
              className="absolute horizon-bird-perch-preen"
              style={{
                top: `${bird.y}vh`,
                left: `${bird.x}vw`,
                opacity: bird.opacity,
                '--bird-scale': bird.scale,
                '--bird-facing': bird.facing === 'left' ? -1 : 1,
                animationDelay: `${bird.delay}s`
              }}
            >
              <svg width="18" height="9" viewBox="0 0 14 8" style={{ transform: `scaleX(${bird.facing === 'left' ? -1 : 1})` }}>
                <path
                  d={birdPath}
                  fill="none"
                  stroke="rgba(40, 48, 62, 0.75)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        } else if (bird.activity === 'fly') {
          // Fly away in small circle and return
          return (
            <div
              key={bird.id}
              className="absolute horizon-bird-perch-fly"
              style={{
                top: `${bird.y}vh`,
                left: `${bird.x}vw`,
                opacity: bird.opacity,
                '--bird-scale': bird.scale,
                animationDelay: `${bird.delay}s`
              }}
            >
              <svg width="18" height="9" viewBox="0 0 14 8" style={{ transform: 'scaleX(-1)' }}>
                <path
                  d={birdPath}
                  fill="none"
                  stroke="rgba(40, 48, 62, 0.7)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        }

        return null;
      })}

      {/* High-altitude birds with animated wings */}
      {highAltitudeBirds.map((bird) => (
        <div
          key={bird.id}
          className="absolute horizon-bird-high-altitude"
          style={{
            top: `${bird.y}vh`,
            left: `${bird.startX}vw`,
            opacity: bird.opacity,
            '--bird-scale': bird.scale,
            '--bird-duration': `${bird.duration}s`,
            '--bird-rise': `${bird.rise}vh`,
            '--wingbeat-speed': `${bird.wingbeatSpeed}s`,
            '--soar-probability': bird.soarProbability,
            animationDelay: `${bird.delay}s`
          }}
        >
          <svg
            width="20"
            height="10"
            viewBox="0 0 20 10"
          >
            {/* Tiny body */}
            <ellipse
              cx="10"
              cy="5"
              rx="1.5"
              ry="1"
              fill="rgba(30, 35, 45, 0.9)"
            />

            {/* Left wing - animated */}
            <g className="bird-wing-left">
              <path
                d="M 10 5 Q 4 2 1 4"
                stroke="rgba(30, 35, 45, 0.9)"
                strokeWidth="1"
                fill="none"
              />
            </g>

            {/* Right wing - animated */}
            <g className="bird-wing-right">
              <path
                d="M 10 5 Q 16 2 19 4"
                stroke="rgba(30, 35, 45, 0.9)"
                strokeWidth="1"
                fill="none"
              />
            </g>
          </svg>
        </div>
      ))}

      {/* CSS Animation */}
      <style>{`
        @keyframes cloudDrift {
          0% {
            transform: translateX(0) translateY(0) scale(var(--scale, 1), var(--scale, 1));
          }
          15% {
            transform: translateX(15vw) translateY(-2px) scale(calc(var(--scale, 1) * 1.01), calc(var(--scale, 1) * 0.99));
          }
          35% {
            transform: translateX(35vw) translateY(1px) scale(calc(var(--scale, 1) * 0.99), calc(var(--scale, 1) * 1.01));
          }
          50% {
            transform: translateX(50vw) translateY(0) scale(var(--scale, 1), var(--scale, 1));
          }
          65% {
            transform: translateX(65vw) translateY(-1px) scale(calc(var(--scale, 1) * 1.005), calc(var(--scale, 1) * 0.995));
          }
          85% {
            transform: translateX(85vw) translateY(1.5px) scale(calc(var(--scale, 1) * 0.995), calc(var(--scale, 1) * 1.005));
          }
          100% {
            transform: translateX(100vw) translateY(0) scale(var(--scale, 1), var(--scale, 1));
          }
        }

        .cloud-drift {
          will-change: transform;
        }

        @keyframes horizonBirdStraight {
          0% {
            transform: translate3d(0, 0, 0) scale(var(--bird-scale, 1));
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translate3d(calc(120vw), var(--bird-rise, 0px), 0) scale(var(--bird-scale, 1));
            opacity: 0;
          }
        }

        @keyframes horizonBirdSwoop {
          0% {
            transform: translate3d(0, 0, 0) scale(var(--bird-scale, 1));
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          15% {
            transform: translate3d(18vw, -30px, 0) scale(var(--bird-scale, 1));
          }
          30% {
            transform: translate3d(36vw, var(--swoop-amplitude, -40px), 0) scale(var(--bird-scale, 1));
          }
          45% {
            transform: translate3d(54vw, -20px, 0) scale(var(--bird-scale, 1));
          }
          60% {
            transform: translate3d(72vw, var(--swoop-amplitude, -40px), 0) scale(var(--bird-scale, 1));
          }
          75% {
            transform: translate3d(90vw, -15px, 0) scale(var(--bird-scale, 1));
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translate3d(120vw, 0, 0) scale(var(--bird-scale, 1));
            opacity: 0;
          }
        }

        @keyframes horizonBirdVformation {
          0% {
            transform: translate3d(0, 0, 0) scale(var(--bird-scale, 1));
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translate3d(calc(125vw), 0, 0) scale(var(--bird-scale, 1));
            opacity: 0;
          }
        }

        .horizon-bird-straight {
          animation-name: horizonBirdStraight;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          pointer-events: none;
          will-change: transform, opacity;
        }

        .horizon-bird-swoop {
          animation-name: horizonBirdSwoop;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          pointer-events: none;
          will-change: transform, opacity;
        }

        .horizon-bird-vformation {
          animation-name: horizonBirdVformation;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          pointer-events: none;
          will-change: transform, opacity;
        }

        /* Perching bird animations */
        @keyframes birdPerchIdle {
          0%, 100% {
            transform: scale(var(--bird-scale, 1)) translateY(0);
          }
          15% {
            transform: scale(var(--bird-scale, 1)) translateY(-3px);
          }
          25% {
            transform: scale(var(--bird-scale, 1)) translateY(0);
          }
          40% {
            transform: scale(var(--bird-scale, 1)) translateY(-2px);
          }
          50% {
            transform: scale(var(--bird-scale, 1)) translateY(0);
          }
        }

        @keyframes birdPerchPreen {
          0%, 100% {
            transform: scale(var(--bird-scale, 1)) rotate(0deg);
          }
          20% {
            transform: scale(var(--bird-scale, 1)) rotate(-8deg);
          }
          40% {
            transform: scale(var(--bird-scale, 1)) rotate(8deg);
          }
          50% {
            transform: scale(var(--bird-scale, 1)) rotate(-5deg) scaleY(0.9);
          }
          60% {
            transform: scale(var(--bird-scale, 1)) rotate(5deg) scaleY(0.9);
          }
          80% {
            transform: scale(var(--bird-scale, 1)) rotate(0deg);
          }
        }

        @keyframes birdPerchFlyAway {
          0% {
            transform: translate3d(0, 0, 0) scale(var(--bird-scale, 1));
            opacity: 1;
          }
          10% {
            transform: translate3d(-2vw, -4vh, 0) scale(var(--bird-scale, 1));
            opacity: 1;
          }
          25% {
            transform: translate3d(-3vw, -6vh, 0) scale(calc(var(--bird-scale, 1) * 0.85));
            opacity: 0.9;
          }
          40% {
            transform: translate3d(-2vw, -5vh, 0) scale(calc(var(--bird-scale, 1) * 0.8));
            opacity: 0.7;
          }
          50% {
            transform: translate3d(0, -4vh, 0) scale(calc(var(--bird-scale, 1) * 0.75));
            opacity: 0.5;
          }
          60% {
            transform: translate3d(2vw, -5vh, 0) scale(calc(var(--bird-scale, 1) * 0.8));
            opacity: 0.7;
          }
          75% {
            transform: translate3d(3vw, -6vh, 0) scale(calc(var(--bird-scale, 1) * 0.85));
            opacity: 0.9;
          }
          90% {
            transform: translate3d(2vw, -4vh, 0) scale(var(--bird-scale, 1));
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(var(--bird-scale, 1));
            opacity: 1;
          }
        }

        .horizon-bird-perch-idle {
          animation-name: birdPerchIdle;
          animation-duration: var(--idle-duration, 4s);
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          pointer-events: none;
          will-change: transform;
        }

        .horizon-bird-perch-preen {
          animation-name: birdPerchPreen;
          animation-duration: 5s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          pointer-events: none;
          will-change: transform;
        }

        .horizon-bird-perch-fly {
          animation-name: birdPerchFlyAway;
          animation-duration: 12s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          pointer-events: none;
          will-change: transform, opacity;
        }

        /* High-altitude birds with animated wings */
        @keyframes highAltitudeFlight {
          0% {
            transform: translate3d(0, 0, 0) scale(var(--bird-scale, 1));
            opacity: 0;
          }
          5% {
            opacity: var(--bird-opacity, 0.7);
          }
          50% {
            transform: translate3d(60vw, var(--bird-rise, 0), 0) scale(var(--bird-scale, 1));
            opacity: var(--bird-opacity, 0.7);
          }
          95% {
            opacity: var(--bird-opacity, 0.7);
          }
          100% {
            transform: translate3d(120vw, calc(var(--bird-rise, 0) * 1.5), 0) scale(calc(var(--bird-scale, 1) * 0.8));
            opacity: 0;
          }
        }

        @keyframes wingFlapLeft {
          0%, 100% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          25% {
            transform: rotateY(-15deg) rotateZ(-8deg);
          }
          50% {
            transform: rotateY(-25deg) rotateZ(-15deg);
          }
          75% {
            transform: rotateY(-15deg) rotateZ(-8deg);
          }
        }

        @keyframes wingFlapRight {
          0%, 100% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          25% {
            transform: rotateY(15deg) rotateZ(8deg);
          }
          50% {
            transform: rotateY(25deg) rotateZ(15deg);
          }
          75% {
            transform: rotateY(15deg) rotateZ(8deg);
          }
        }

        @keyframes wingGlide {
          0%, 100% {
            transform: rotateY(0deg) rotateZ(-2deg);
          }
          50% {
            transform: rotateY(0deg) rotateZ(2deg);
          }
        }

        .horizon-bird-high-altitude {
          animation-name: highAltitudeFlight;
          animation-duration: var(--bird-duration, 80s);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          pointer-events: none;
          will-change: transform, opacity;
        }

        .horizon-bird-high-altitude .bird-wing-left {
          transform-origin: 10px 5px;
          animation: wingFlapLeft var(--wingbeat-speed, 2s) ease-in-out infinite;
        }

        .horizon-bird-high-altitude .bird-wing-right {
          transform-origin: 10px 5px;
          animation: wingFlapRight var(--wingbeat-speed, 2s) ease-in-out infinite;
        }

        /* Occasional gliding - wings held steady */
        .horizon-bird-high-altitude[style*="--soar-probability: 0.7"] .bird-wing-left,
        .horizon-bird-high-altitude[style*="--soar-probability: 0.8"] .bird-wing-left,
        .horizon-bird-high-altitude[style*="--soar-probability: 0.9"] .bird-wing-left {
          animation: wingGlide 4s ease-in-out infinite;
        }

        .horizon-bird-high-altitude[style*="--soar-probability: 0.7"] .bird-wing-right,
        .horizon-bird-high-altitude[style*="--soar-probability: 0.8"] .bird-wing-right,
        .horizon-bird-high-altitude[style*="--soar-probability: 0.9"] .bird-wing-right {
          animation: wingGlide 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Custom comparison to prevent unnecessary re-renders
// Only re-render if cloudConfig.seed or other props actually change
const arePropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.cloudConfig?.seed === nextProps.cloudConfig?.seed &&
    prevProps.cloudConfig?.enabled === nextProps.cloudConfig?.enabled &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.timeOfDay === nextProps.timeOfDay &&
    prevProps.className === nextProps.className
  );
};

export default memo(CloudLayer, arePropsEqual);
