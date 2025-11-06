/**
 * TimeAwareBackground.jsx - Dynamic sky background based on time of day
 * Renders realistic gradient skies with seasonal variations, starfield, and atmospheric effects
 *
 * Features:
 * - Time-based sky gradients (dawn, day, dusk, twilight, night, midnight)
 * - Realistic starfield with parallax layers and colored stars
 * - Seasonal color adjustments
 * - Weather-responsive darkening (rain, fog, overcast)
 * - Atmospheric overlays (pre-dawn glow, twilight glow, night darkening)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { blendColors } from '../utils/colorUtils';

const TimeAwareBackground = ({
  gameTimeHours,
  gameTimeMinutes,
  viewMode = 'standard',
  weather = null,
  season = null,
  climate = null
}) => {
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [shootingStars, setShootingStars] = useState([]);

  // Extract weather values to prevent infinite re-renders (object reference changes)
  const weatherCloudCover = weather?.cloudCover ?? 0;
  const weatherPrecipitation = weather?.precipitation ?? 'none';

  // Base gradient colors for each time period - PHOTOREALISTIC atmospheric scattering
  const BASE_GRADIENT_COLORS = useMemo(() => ({
    DAWN: ['#1a2845', '#7B5F88', '#E88D5A', '#FFD4A3'], // Deep purple-blue → purple → peachy orange → warm yellow
    DAY: ['#0D3D7A', '#2865B8', '#5B9BD5', '#B8D4ED'], // Deep zenith blue → sky blue → lighter blue → horizon haze
    DUSK: ['#1B2845', '#6B4E71', '#D2691E', '#FF8C42'], // Deep purple-blue → purple → burnt orange → bright orange
    BLUE_HOUR_EVENING: ['#0a1628', '#1e3a5f', '#4a6fa5', '#7090c0'], // Civil twilight - deep saturated blues
    BLUE_HOUR_MORNING: ['#0e1a2e', '#2a4562', '#506a95', '#7a9bc5'], // Pre-dawn civil twilight - cooler blues
    TWILIGHT: ['#0a0e1a', '#1a1e2a', '#2a2e3a'], // Deeper twilight after blue hour
    NIGHT: ['#000308', '#00061a', '#000d2a', '#001440'], // Rich deep midnight blue
    MIDNIGHT: ['#000105', '#000312', '#00051f', '#000a35'], // Nearly black with deep blue gradient
    PRE_DAWN: ['#000510', '#0a0e20', '#101830'], // Very gradual lightening from deep night
  }), []);

  // Interior gradient (neutral dark)
  const INTERIOR_GRADIENT = useMemo(() => ({
    base: ['#2a2a2a', '#1a1a1a']
  }), []);

  // Time transition points - more realistic atmospheric periods
  const TIME_POINTS = useMemo(() => ({
    NIGHT_END: 5,
    BLUE_HOUR_MORNING_END: 6.5, // Morning blue hour: 5 AM - 6:30 AM
    DAWN_END: 8,
    DAY_END: 18,
    BLUE_HOUR_EVENING_END: 19.5, // Evening blue hour: 6 PM - 7:30 PM
    DUSK_END: 20.5,
    TWILIGHT_END: 22,
    PRE_DAWN_START: 4,
  }), []);

  // Get season and climate-adjusted colors
  const getSeasonalColors = (baseColors, season, climate) => {
    let colors = { ...baseColors };

    // Winter modifications - cooler, crisper atmospheric tones
    if (season === 'winter') {
      if (climate === 'temperate' || climate === 'continental') {
        colors.DAWN = ['#1a2a40', '#6a5280', '#C89070', '#E8D0C5'];
        colors.DAY = ['#1a4570', '#3a6aa0', '#6a9bc8', '#B8D8F0'];
        colors.DUSK = ['#1a2030', '#5a4568', '#B86850', '#D89070'];
        colors.BLUE_HOUR_EVENING = ['#0a1830', '#2a4270', '#5a78a8', '#8098c8'];
        colors.BLUE_HOUR_MORNING = ['#0e1a38', '#2a4870', '#5070a0', '#7a9cc8'];
      }
    }
    // Summer modifications - warmer, more vibrant
    else if (season === 'summer') {
      colors.DAWN = ['#2a3858', '#8a6890', '#F89860', '#FFE0C0'];
      colors.DAY = ['#0a3a78', '#2a6cb8', '#5a9ed8', '#A8CEF0'];
      colors.DUSK = ['#1f2840', '#7a5580', '#E87850', '#FFA070'];
      colors.BLUE_HOUR_EVENING = ['#0a1830', '#2a4a70', '#5a7ab0', '#7a9cd0'];
      colors.BLUE_HOUR_MORNING = ['#0e1e34', '#2a5070', '#5078a8', '#7aa0d0'];
      colors.TWILIGHT = ['#0e1628', '#2a3050', '#4a5070'];
    }
    // Fall modifications - richer golden and amber tones
    else if (season === 'fall') {
      colors.DAWN = ['#2a2840', '#7a5878', '#D88050', '#FFD090'];
      colors.DUSK = ['#1f1830', '#6a4860', '#D86840', '#FF9060'];
      colors.BLUE_HOUR_EVENING = ['#0a1428', '#2a3858', '#5a6090', '#7a80b0'];
    }
    // Spring modifications - fresh, vibrant colors
    else if (season === 'spring') {
      colors.DAWN = ['#1a3848', '#7a6888', '#E89868', '#FFE4C8'];
      colors.DAY = ['#0a4080', '#2a78c8', '#5aa8e8', '#A8D8F8'];
      colors.BLUE_HOUR_MORNING = ['#0e2038', '#2a5078', '#507aa8', '#7aa8d0'];
    }

    return colors;
  };

  const GRADIENT_COLORS = useMemo(
    () => getSeasonalColors(BASE_GRADIENT_COLORS, season, climate),
    [BASE_GRADIENT_COLORS, season, climate]
  );

  // Calculate gradient based on time
  useEffect(() => {
    // For interior view, use neutral dark background
    if (viewMode === 'interior') {
      setBackgroundStyle({
        background: `linear-gradient(160deg, ${INTERIOR_GRADIENT.base[0]} 0%, ${INTERIOR_GRADIENT.base[1]} 100%)`,
        transition: 'background 2s ease-out'
      });
      return;
    }

    const currentTime = gameTimeHours + gameTimeMinutes / 60;
    let fromKey, toKey, periodStart, periodEnd, progress;

    if (currentTime >= TIME_POINTS.PRE_DAWN_START && currentTime < TIME_POINTS.NIGHT_END) {
      // Pre-dawn transition (4-5 AM)
      fromKey = 'MIDNIGHT';
      toKey = 'PRE_DAWN';
      periodStart = TIME_POINTS.PRE_DAWN_START;
      periodEnd = TIME_POINTS.NIGHT_END;
      progress = (currentTime - periodStart) / (periodEnd - periodStart);
    } else if (currentTime >= TIME_POINTS.NIGHT_END && currentTime < TIME_POINTS.BLUE_HOUR_MORNING_END) {
      // Morning blue hour (5-6:30 AM) - magical deep saturated blue
      fromKey = 'PRE_DAWN';
      toKey = 'BLUE_HOUR_MORNING';
      periodStart = TIME_POINTS.NIGHT_END;
      periodEnd = TIME_POINTS.BLUE_HOUR_MORNING_END;
      progress = (currentTime - periodStart) / (periodEnd - periodStart);
    } else if (currentTime >= TIME_POINTS.BLUE_HOUR_MORNING_END && currentTime < TIME_POINTS.DAWN_END) {
      // Dawn transition (6:30-8 AM)
      fromKey = 'BLUE_HOUR_MORNING';
      toKey = 'DAWN';
      periodStart = TIME_POINTS.BLUE_HOUR_MORNING_END;
      periodEnd = TIME_POINTS.DAWN_END;
      progress = (currentTime - periodStart) / (periodEnd - periodStart);
    } else if (currentTime >= TIME_POINTS.DAWN_END && currentTime < TIME_POINTS.DAY_END) {
      // Day transition (8 AM - 6 PM)
      fromKey = 'DAWN';
      toKey = 'DAY';
      periodStart = TIME_POINTS.DAWN_END;
      periodEnd = TIME_POINTS.DAY_END;
      progress = (currentTime - periodStart) / (periodEnd - periodStart);
    } else if (currentTime >= TIME_POINTS.DAY_END && currentTime < TIME_POINTS.BLUE_HOUR_EVENING_END) {
      // Evening blue hour (6-7:30 PM) - magical deep saturated blue
      fromKey = 'DAY';
      toKey = 'BLUE_HOUR_EVENING';
      periodStart = TIME_POINTS.DAY_END;
      periodEnd = TIME_POINTS.BLUE_HOUR_EVENING_END;
      progress = (currentTime - periodStart) / (periodEnd - periodStart);
    } else if (currentTime >= TIME_POINTS.BLUE_HOUR_EVENING_END && currentTime < TIME_POINTS.DUSK_END) {
      // Dusk transition (7:30-8:30 PM)
      fromKey = 'BLUE_HOUR_EVENING';
      toKey = 'DUSK';
      periodStart = TIME_POINTS.BLUE_HOUR_EVENING_END;
      periodEnd = TIME_POINTS.DUSK_END;
      progress = (currentTime - periodStart) / (periodEnd - periodStart);
    } else if (currentTime >= TIME_POINTS.DUSK_END && currentTime < TIME_POINTS.TWILIGHT_END) {
      // Twilight transition (8:30-10 PM)
      fromKey = 'DUSK';
      toKey = 'TWILIGHT';
      periodStart = TIME_POINTS.DUSK_END;
      periodEnd = TIME_POINTS.TWILIGHT_END;
      progress = (currentTime - periodStart) / (periodEnd - periodStart);
    } else if (currentTime >= TIME_POINTS.TWILIGHT_END || currentTime < TIME_POINTS.PRE_DAWN_START) {
      // Deep night transition (10 PM - 4 AM)
      fromKey = 'TWILIGHT';
      toKey = 'MIDNIGHT';

      if (currentTime >= TIME_POINTS.TWILIGHT_END) {
        periodStart = TIME_POINTS.TWILIGHT_END;
        periodEnd = 24 + TIME_POINTS.PRE_DAWN_START;
        progress = (currentTime - periodStart) / (periodEnd - periodStart);
      } else {
        periodStart = TIME_POINTS.TWILIGHT_END;
        periodEnd = 24 + TIME_POINTS.PRE_DAWN_START;
        progress = (currentTime + 24 - periodStart) / (periodEnd - periodStart);
      }
    } else {
      fromKey = 'MIDNIGHT';
      toKey = 'MIDNIGHT';
      progress = 0;
    }

    // Clamp progress
    progress = Math.max(0, Math.min(1, progress));

    const fromGradient = GRADIENT_COLORS[fromKey];
    const toGradient = GRADIENT_COLORS[toKey];

    // Blend gradient colors - handle both 3-stop and 4-stop gradients
    const topColor = blendColors(fromGradient[0], toGradient[0], progress);
    const midColor1 = blendColors(fromGradient[1], toGradient[1], progress);
    const midColor2 = fromGradient[2] && toGradient[2]
      ? blendColors(fromGradient[2], toGradient[2], progress)
      : null;
    const bottomColor = fromGradient[3] && toGradient[3]
      ? blendColors(fromGradient[3], toGradient[3], progress)
      : blendColors(fromGradient[fromGradient.length - 1], toGradient[toGradient.length - 1], progress);

    let gradient;
    let finalTopColor = topColor;
    let finalMidColor1 = midColor1;
    let finalMidColor2 = midColor2;
    let finalBottomColor = bottomColor;

    // Weather adjustments - with realistic color temperature
    if (weatherCloudCover > 0.7) {
      // Overcast conditions - gray with color temperature based on time
      const isNight = gameTimeHours >= 22 || gameTimeHours < 4;
      const isDusk = gameTimeHours >= 18 && gameTimeHours < 22;
      const isDawn = gameTimeHours >= 4 && gameTimeHours < 7;

      if (isNight) {
        // Cloudy night: VERY dark cool blue-gray (almost black)
        const grayLevel = Math.floor(8 - weatherCloudCover * 5);
        finalTopColor = `rgb(${grayLevel}, ${grayLevel + 2}, ${grayLevel + 8})`;
        finalBottomColor = `rgb(${grayLevel + 6}, ${grayLevel + 10}, ${grayLevel + 18})`;
        finalMidColor1 = `rgb(${grayLevel + 3}, ${grayLevel + 5}, ${grayLevel + 12})`;
        finalMidColor2 = null;
      } else if (isDusk || isDawn) {
        // Twilight clouds: darker with warmer purple/orange tint
        const grayLevel = Math.floor(65 - weatherCloudCover * 20);
        const warmTint = Math.floor(grayLevel * 0.15); // Subtle warm tint
        finalTopColor = `rgb(${grayLevel}, ${grayLevel + warmTint}, ${grayLevel + warmTint * 1.5})`;
        finalBottomColor = `rgb(${grayLevel + 25}, ${grayLevel + 28 + warmTint}, ${grayLevel + 35})`;
        finalMidColor1 = `rgb(${grayLevel + 12}, ${grayLevel + 15 + warmTint}, ${grayLevel + 20})`;
        finalMidColor2 = null;
      } else {
        // Daytime clouds: realistic cool gray-blue overcast
        const grayLevel = Math.floor(120 - weatherCloudCover * 50);
        const blueTint = Math.floor(grayLevel * 0.18); // Realistic blue cast
        finalTopColor = `rgb(${grayLevel}, ${grayLevel + 5}, ${grayLevel + blueTint})`;
        finalBottomColor = `rgb(${grayLevel + 30}, ${grayLevel + 35}, ${grayLevel + blueTint + 35})`;
        finalMidColor1 = `rgb(${grayLevel + 15}, ${grayLevel + 20}, ${grayLevel + blueTint + 18})`;
        finalMidColor2 = null;
      }
      gradient = `linear-gradient(180deg, ${finalTopColor} 0%, ${finalMidColor1} 50%, ${finalBottomColor} 100%)`;
    } else if (weatherPrecipitation !== 'none') {
      // Rainy/snowy - DRAMATICALLY darker for meteorologically accurate overcast skies
      const isNight = gameTimeHours >= 22 || gameTimeHours < 4;
      const isDusk = gameTimeHours >= 18 && gameTimeHours < 22;
      const isDawn = gameTimeHours >= 4 && gameTimeHours < 7;

      if (isNight) {
        finalTopColor = blendColors(topColor, '#0a0a1a', 0.65);
        finalMidColor1 = blendColors(midColor1, '#0d0d20', 0.65);
        finalMidColor2 = midColor2 ? blendColors(midColor2, '#0f0f25', 0.65) : null;
        finalBottomColor = blendColors(bottomColor, '#121230', 0.65);
      } else if (isDusk || isDawn) {
        finalTopColor = blendColors(topColor, '#2a2538', 0.5);
        finalMidColor1 = blendColors(midColor1, '#30283a', 0.5);
        finalMidColor2 = midColor2 ? blendColors(midColor2, '#352a3c', 0.5) : null;
        finalBottomColor = blendColors(bottomColor, '#3a2c3e', 0.5);
      } else {
        // Daytime rain: Much darker gray sky (was #404550 @ 0.45, now #30363e @ 0.65)
        finalTopColor = blendColors(topColor, '#30363e', 0.65);
        finalMidColor1 = blendColors(midColor1, '#3a4048', 0.65);
        finalMidColor2 = midColor2 ? blendColors(midColor2, '#404850', 0.65) : null;
        finalBottomColor = blendColors(bottomColor, '#485058', 0.65);
      }
      gradient = finalMidColor2
        ? `linear-gradient(180deg, ${finalTopColor} 0%, ${finalMidColor1} 35%, ${finalMidColor2} 65%, ${finalBottomColor} 100%)`
        : `linear-gradient(180deg, ${finalTopColor} 0%, ${finalMidColor1} 50%, ${finalBottomColor} 100%)`;
    } else {
      // Normal time-based gradient - 4-stop for realistic atmospheric scattering
      gradient = finalMidColor2
        ? `linear-gradient(180deg, ${finalTopColor} 0%, ${finalMidColor1} 30%, ${finalMidColor2} 65%, ${finalBottomColor} 100%)`
        : `linear-gradient(180deg, ${finalTopColor} 0%, ${finalMidColor1} 50%, ${finalBottomColor} 100%)`;
    }

    // CSS variables for horizon components
    // IMPROVED: Time-aware haze blending - virtually NO white at night for rich, dark skies
    const isNightTime = gameTimeHours >= 20 || gameTimeHours < 6;
    const hazeWhiteBlend = isNightTime ? 0.0 : 0.25; // Night: 0% white, Day: 25% white
    const hazeLightBlend = isNightTime ? 0.0 : 0.45; // Night: 0% white, Day: 45% white

    const cssVars = {
      '--sky-top': finalTopColor,
      '--sky-mid': finalMidColor1 || finalTopColor,
      '--sky-bottom': finalBottomColor,
      '--sky-haze-dark': blendColors(finalMidColor1 || finalBottomColor, '#ffffff', hazeWhiteBlend),
      '--sky-haze-light': blendColors(finalBottomColor, '#ffffff', hazeLightBlend),
      '--sky-water': blendColors(finalBottomColor, '#2a6fb0', 0.35),
      '--sky-fog': blendColors(finalMidColor1 || finalBottomColor, '#d0d0d0', 0.4),
      '--sky-mountain-far': blendColors(finalTopColor, '#4a5568', 0.5),
      '--sky-mountain-mid': blendColors(finalMidColor1 || finalTopColor, '#2d3748', 0.6),
      '--sky-mountain-near': blendColors(finalBottomColor, '#1a202c', 0.7),
    };

    setBackgroundStyle({
      background: gradient,
      transition: 'background 5s ease-in-out',
      ...cssVars
    });
  }, [gameTimeHours, gameTimeMinutes, viewMode, weatherCloudCover, weatherPrecipitation, GRADIENT_COLORS, TIME_POINTS, INTERIOR_GRADIENT]);

  // Star visibility calculation
  const getStarOpacity = () => {
    if (viewMode === 'interior') return 0;

    const currentTime = gameTimeHours + gameTimeMinutes / 60;

    if (currentTime >= 22 || currentTime < 4) {
      return 1; // Peak visibility 10 PM - 4 AM
    } else if (currentTime >= 21 && currentTime < 22) {
      const progress = (currentTime - 21) / 1;
      return progress * 0.8;
    } else if (currentTime >= 20 && currentTime < 21) {
      const progress = (currentTime - 20) / 1;
      return progress * 0.4;
    } else if (currentTime >= 4 && currentTime < 5) {
      const progress = 1 - ((currentTime - 4) / 1);
      return progress * 0.6;
    } else if (currentTime >= 5 && currentTime < 6) {
      const progress = 1 - ((currentTime - 5) / 1);
      return progress * 0.3;
    }

    return 0;
  };

  // Generate randomized colored stars
  const generateColoredStars = (seed) => {
    const starColors = ['#ffffff', '#fffacd', '#b3d9ff', '#ffd1dc', '#e6e6fa', '#f0e68c'];
    const positions = [];
    const rng = (s) => {
      let x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 12; i++) {
      const x = rng(seed + i) * 300 + 50;
      const y = rng(seed + i + 100) * 200 + 30;
      const size = rng(seed + i + 200) * 1.5 + 0.5;
      const opacity = rng(seed + i + 300) * 0.6 + 0.4;
      const colorIndex = Math.floor(rng(seed + i + 400) * starColors.length);
      positions.push({ x, y, size, opacity, color: starColors[colorIndex] });
    }
    return positions;
  };

  const starOpacity = getStarOpacity();
  const coloredStars = useMemo(
    () => generateColoredStars(Math.floor(gameTimeHours + gameTimeMinutes / 15)),
    [gameTimeHours, gameTimeMinutes]
  );

  // Moon visibility and phase calculation
  const getMoonOpacity = () => {
    if (viewMode === 'interior') return 0;

    const currentTime = gameTimeHours + gameTimeMinutes / 60;

    // Moon visible from 7 PM to 6 AM
    if (currentTime >= 19 || currentTime < 6) {
      if (currentTime >= 22 || currentTime < 4) {
        return 1; // Peak visibility midnight to 4 AM
      } else if (currentTime >= 19 && currentTime < 22) {
        return (currentTime - 19) / 3; // Fade in 7-10 PM
      } else if (currentTime >= 4 && currentTime < 6) {
        return 1 - (currentTime - 4) / 2; // Fade out 4-6 AM
      }
    }

    return 0;
  };

  // Calculate moon phase (simplified - uses day of year)
  const getMoonPhase = () => {
    // Approximate lunar cycle: 29.5 days
    // Use gameTimeHours as a proxy for day progression
    const dayOfCycle = (gameTimeHours + gameTimeMinutes / 60) % 29.5;
    return dayOfCycle / 29.5; // 0 = new moon, 0.5 = full moon
  };

  const moonOpacity = getMoonOpacity();
  const moonPhase = getMoonPhase();

  // Shooting star effect - random meteors every 2-5 minutes during night
  useEffect(() => {
    const currentTime = gameTimeHours + gameTimeMinutes / 60;
    const isNight = currentTime >= 20 || currentTime < 6;

    if (!isNight || starOpacity < 0.5) {
      return;
    }

    // Schedule next shooting star
    const scheduleShootingStar = () => {
      const delay = (120 + Math.random() * 180) * 1000; // 2-5 minutes in ms

      return setTimeout(() => {
        const newStar = {
          id: Date.now(),
          startX: Math.random() * 100, // % from left
          startY: Math.random() * 50, // % from top (upper half of sky)
          angle: 30 + Math.random() * 60, // degrees (30-90)
          duration: 1 + Math.random() * 2, // 1-3 seconds
          brightness: 0.7 + Math.random() * 0.3 // 0.7-1.0
        };

        setShootingStars(prev => [...prev, newStar]);

        // Remove after animation completes
        setTimeout(() => {
          setShootingStars(prev => prev.filter(s => s.id !== newStar.id));
        }, newStar.duration * 1000 + 100);

        // Schedule next one
        scheduleShootingStar();
      }, delay);
    };

    const timeout = scheduleShootingStar();

    return () => clearTimeout(timeout);
  }, [gameTimeHours, gameTimeMinutes, starOpacity]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" style={backgroundStyle}>
      {/* Starfield layers */}
      {starOpacity > 0 && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-[6000ms] ease-in-out"
          style={{ opacity: starOpacity }}
        >
          {/* Primary star layer - star glyphs */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: `transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='280'%3E%3Ctext x='73' y='45' font-size='8' fill='%23ffffff' fill-opacity='0.3'%3E%E2%9C%A7%3C/text%3E%3Ctext x='187' y='93' font-size='10' fill='%23ffffff' fill-opacity='0.9'%3E%E2%9C%A7%3C/text%3E%3Ctext x='298' y='156' font-size='9' fill='%23ffffff' fill-opacity='0.7'%3E%E2%9C%A7%3C/text%3E%3Ctext x='142' y='203' font-size='7' fill='%23ffffff' fill-opacity='0.6'%3E%E2%9C%A7%3C/text%3E%3Ctext x='321' y='67' font-size='8' fill='%23ffffff' fill-opacity='0.8'%3E%E2%9C%A7%3C/text%3E%3Ctext x='29' y='178' font-size='9' fill='%23ffffff' fill-opacity='0.7'%3E%E2%9C%A7%3C/text%3E%3Ctext x='256' y='34' font-size='7' fill='%23ffffff' fill-opacity='0.6'%3E%E2%9C%A7%3C/text%3E%3C/svg%3E") repeat`,
              animation: 'move-twink-back 8000s linear infinite'
            }}
          />

          {/* Secondary star layer - warm white circles */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: `transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='220'%3E%3Cg fill='%23fffacd' fill-opacity='0.6'%3E%3Ccircle cx='67' cy='38' r='1'/%3E%3Ccircle cx='189' cy='82' r='0.8'/%3E%3Ccircle cx='124' cy='143' r='1.2'/%3E%3Ccircle cx='241' cy='176' r='0.6'/%3E%3Ccircle cx='43' cy='195' r='0.9'/%3E%3Ccircle cx='203' cy='47' r='0.7'/%3E%3Ccircle cx='156' cy='209' r='0.8'/%3E%3Ccircle cx='278' cy='91' r='0.5'/%3E%3Ccircle cx='89' cy='167' r='1'/%3E%3C/g%3E%3C/svg%3E") repeat`,
              animation: 'move-twink-back 7000s linear infinite'
            }}
          />

          {/* Tertiary star layer - cool blue tint */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: `transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='180'%3E%3Cg fill='%23b3d9ff' fill-opacity='0.4'%3E%3Ccircle cx='34' cy='29' r='0.5'/%3E%3Ccircle cx='123' cy='67' r='0.6'/%3E%3Ccircle cx='78' cy='134' r='0.4'/%3E%3Ccircle cx='167' cy='42' r='0.5'/%3E%3Ccircle cx='189' cy='156' r='0.7'/%3E%3Ccircle cx='52' cy='89' r='0.3'/%3E%3Ccircle cx='145' cy='178' r='0.6'/%3E%3Ccircle cx='198' cy='98' r='0.4'/%3E%3C/g%3E%3C/svg%3E") repeat`,
              animation: 'move-twink-back 6000s linear infinite'
            }}
          />

          {/* Distant stars - very faint */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: `transparent url("data:image/svg+xml,%3Csvg width='400' height='320' viewBox='0 0 400 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='89' cy='73' r='0.3'/%3E%3Ccircle cx='267' cy='134' r='0.2'/%3E%3Ccircle cx='156' cy='245' r='0.4'/%3E%3Ccircle cx='343' cy='89' r='0.2'/%3E%3Ccircle cx='78' cy='198' r='0.3'/%3E%3Ccircle cx='298' cy='267' r='0.2'/%3E%3Ccircle cx='134' cy='56' r='0.3'/%3E%3Ccircle cx='378' cy='178' r='0.2'/%3E%3Ccircle cx='43' cy='289' r='0.3'/%3E%3Ccircle cx='234' cy='312' r='0.2'/%3E%3C/g%3E%3C/svg%3E") repeat`,
              animation: 'move-twink-back 12000s linear infinite'
            }}
          />

          {/* Randomized colored stars with beautiful twinkling */}
          <div className="absolute inset-0 w-full h-full">
            {coloredStars.map((star, index) => (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${star.x}px`,
                  top: `${star.y}px`,
                  width: `${star.size * 2}px`,
                  height: `${star.size * 2}px`,
                  backgroundColor: star.color,
                  borderRadius: '50%',
                  opacity: star.opacity * starOpacity,
                  boxShadow: `0 0 ${star.size * 4}px ${star.color}, 0 0 ${star.size * 8}px ${star.color}`,
                  animation: `twinkle-${index % 4} ${2.5 + (index % 5) * 0.5}s ease-in-out ${index * 0.3}s infinite`,
                  willChange: 'opacity'
                }}
              />
            ))}
          </div>

          {/* Milky Way band - subtle galactic glow during deep night */}
          {starOpacity > 0.7 && (
            <div
              className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
              style={{
                opacity: starOpacity * (weather && weather.cloudCover > 0.5 ? 0.2 : 0.6),
                transition: 'opacity 6s ease-in-out'
              }}
            >
              <div
                className="absolute w-full h-full"
                style={{
                  background: `radial-gradient(
                    ellipse 200% 40% at 50% 30%,
                    rgba(200, 210, 255, 0.08) 0%,
                    rgba(180, 190, 240, 0.12) 20%,
                    rgba(160, 170, 220, 0.06) 40%,
                    transparent 60%
                  )`,
                  transform: 'rotate(-25deg)',
                  transformOrigin: 'center center'
                }}
              >
                {/* Enhanced star density in Milky Way band */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='23' cy='17' r='0.3'/%3E%3Ccircle cx='67' cy='34' r='0.2'/%3E%3Ccircle cx='45' cy='56' r='0.4'/%3E%3Ccircle cx='89' cy='23' r='0.2'/%3E%3Ccircle cx='34' cy='67' r='0.3'/%3E%3Ccircle cx='78' cy='71' r='0.2'/%3E%3Ccircle cx='56' cy='12' r='0.3'/%3E%3Ccircle cx='98' cy='45' r='0.2'/%3E%3Ccircle cx='12' cy='44' r='0.3'/%3E%3Ccircle cx='101' cy='68' r='0.2'/%3E%3C/g%3E%3C/svg%3E") repeat`,
                    mixBlendMode: 'screen'
                  }}
                />
              </div>
            </div>
          )}

          {/* Dynamic shooting stars - random meteors every 2-5 minutes */}
          {shootingStars.map(star => (
            <div
              key={star.id}
              className="absolute pointer-events-none"
              style={{
                left: `${star.startX}%`,
                top: `${star.startY}%`,
                width: '2px',
                height: '2px'
              }}
            >
              <div
                className="absolute w-full h-full bg-white rounded-full"
                style={{
                  animation: `shooting-star-travel ${star.duration}s ease-out forwards`,
                  opacity: star.brightness,
                  boxShadow: `
                    0 0 2px rgba(255, 255, 255, ${star.brightness}),
                    0 0 4px rgba(255, 255, 255, ${star.brightness * 0.8}),
                    0 0 8px rgba(200, 220, 255, ${star.brightness * 0.6})
                  `,
                  transform: `rotate(${star.angle}deg)`,
                  '--shoot-distance': '150px'
                }}
              />
              {/* Meteor trail */}
              <div
                className="absolute w-0.5 h-16 bg-gradient-to-b from-white to-transparent opacity-60"
                style={{
                  animation: `shooting-star-travel ${star.duration}s ease-out forwards`,
                  transform: `rotate(${star.angle}deg)`,
                  transformOrigin: 'top center',
                  '--shoot-distance': '150px'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Moon */}
      {moonOpacity > 0 && (
        <div
          className="absolute transition-opacity duration-[6000ms] ease-in-out"
          style={{
            opacity: moonOpacity * (weather && weather.cloudCover > 0.7 ? 0.3 : 1),
            top: '10%',
            right: '20%',
            width: '80px',
            height: '80px',
            pointerEvents: 'none'
          }}
        >
          {/* Moon body with glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #ffffeb 0%, #f5f5dc 40%, #e8e8d0 100%)',
              boxShadow: `0 0 30px rgba(255, 255, 220, ${moonOpacity * 0.6}),
                          0 0 60px rgba(255, 255, 200, ${moonOpacity * 0.3}),
                          inset -10px -10px 20px rgba(0, 0, 0, 0.1)`,
              filter: 'blur(0.5px)'
            }}
          />

          {/* Moon phase shadow overlay */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: moonPhase < 0.5
                ? `linear-gradient(to right,
                    rgba(20, 20, 40, ${0.8 * (0.5 - moonPhase) * 2}) 0%,
                    transparent ${50 + (moonPhase * 100)}%)`
                : `linear-gradient(to left,
                    rgba(20, 20, 40, ${0.8 * (moonPhase - 0.5) * 2}) 0%,
                    transparent ${150 - (moonPhase * 100)}%)`,
              mixBlendMode: 'multiply'
            }}
          />

          {/* Moon craters - subtle texture */}
          <div className="absolute inset-0 rounded-full" style={{ opacity: 0.15 }}>
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '35%',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,0,0,0.2), transparent)',
              filter: 'blur(1px)'
            }} />
            <div style={{
              position: 'absolute',
              top: '45%',
              left: '55%',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,0,0,0.15), transparent)',
              filter: 'blur(1px)'
            }} />
            <div style={{
              position: 'absolute',
              top: '60%',
              left: '25%',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,0,0,0.18), transparent)',
              filter: 'blur(1px)'
            }} />
          </div>

          {/* Moonlight atmospheric haze */}
          <div
            className="absolute"
            style={{
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(200, 220, 255, 0.08) 0%, transparent 60%)',
              pointerEvents: 'none'
            }}
          />
        </div>
      )}

      {/* Atmospheric overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Night atmospheric glow - REMOVED to preserve deep dark sky */}

        {/* Pre-dawn atmospheric lightening */}
        {gameTimeHours >= 4 && gameTimeHours < 6 && (
          <div
            className="absolute inset-0 transition-opacity duration-[3000ms]"
            style={{
              opacity: 0.3,
              background: 'radial-gradient(ellipse at center bottom, rgba(70, 90, 120, 0.15) 0%, transparent 60%)'
            }}
          />
        )}

        {/* Enhanced Sunrise/Sunset Glow - Multiple layers for dramatic effect */}
        {((gameTimeHours >= 18 && gameTimeHours < 22) || (gameTimeHours >= 5 && gameTimeHours < 9)) && (
          <>
            {/* Primary glow layer - warm orange/pink */}
            <div
              className="absolute inset-0 transition-opacity duration-[2000ms]"
              style={{
                opacity: 0.7,
                background: gameTimeHours >= 18 && gameTimeHours < 22
                  ? `radial-gradient(ellipse 120% 50% at 50% 100%,
                      rgba(255, 120, 60, 0.35) 0%,
                      rgba(255, 140, 80, 0.25) 20%,
                      rgba(255, 180, 120, 0.15) 40%,
                      transparent 70%)`
                  : `radial-gradient(ellipse 120% 50% at 50% 100%,
                      rgba(255, 200, 120, 0.4) 0%,
                      rgba(255, 220, 150, 0.3) 20%,
                      rgba(255, 230, 180, 0.2) 40%,
                      transparent 70%)`
              }}
            />

            {/* Secondary glow layer - purple/pink for depth */}
            <div
              className="absolute inset-0 transition-opacity duration-[2000ms]"
              style={{
                opacity: 0.5,
                background: gameTimeHours >= 18 && gameTimeHours < 22
                  ? `radial-gradient(ellipse 100% 40% at 50% 100%,
                      rgba(200, 100, 150, 0.2) 0%,
                      rgba(180, 120, 180, 0.12) 30%,
                      transparent 60%)`
                  : `radial-gradient(ellipse 100% 40% at 50% 100%,
                      rgba(255, 180, 200, 0.15) 0%,
                      rgba(255, 200, 220, 0.1) 30%,
                      transparent 60%)`
              }}
            />

            {/* Tertiary glow layer - yellow/gold highlights */}
            <div
              className="absolute inset-0 transition-opacity duration-[2000ms]"
              style={{
                opacity: 0.6,
                background: gameTimeHours >= 18 && gameTimeHours < 22
                  ? `radial-gradient(ellipse 80% 30% at 50% 100%,
                      rgba(255, 200, 100, 0.25) 0%,
                      rgba(255, 220, 140, 0.15) 25%,
                      transparent 50%)`
                  : `radial-gradient(ellipse 80% 35% at 50% 100%,
                      rgba(255, 240, 150, 0.3) 0%,
                      rgba(255, 250, 200, 0.2) 25%,
                      transparent 55%)`
              }}
            />

            {/* Upper atmospheric color - sky tint */}
            <div
              className="absolute inset-0 transition-opacity duration-[2000ms]"
              style={{
                opacity: 0.3,
                background: gameTimeHours >= 18 && gameTimeHours < 22
                  ? `linear-gradient(to bottom,
                      transparent 0%,
                      rgba(255, 150, 100, 0.08) 40%,
                      rgba(255, 180, 140, 0.12) 70%,
                      transparent 100%)`
                  : `linear-gradient(to bottom,
                      transparent 0%,
                      rgba(255, 220, 180, 0.1) 40%,
                      rgba(255, 240, 200, 0.15) 70%,
                      transparent 100%)`
              }}
            />
          </>
        )}

        {/* PRE-STORM DARKENING - Eerie atmospheric effect before storms */}
        {weather && (
          (weather.cloudCover > 0.6 && weather.precipitation !== 'none') ||
          (weather.cloudCover > 0.7 && weather.windSpeed > 15)
        ) && (gameTimeHours >= 6 && gameTimeHours < 20) && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-[5000ms]"
            style={{
              opacity: (() => {
                // Stronger effect with higher cloud cover and heavier precipitation
                const stormIntensity = weather.cloudCover * (weather.intensity || 0.5);
                const baseOpacity = 0.3 + (stormIntensity * 0.4); // 0.3 to 0.7

                // Special intensity for thunderstorms
                const isThunderstorm = weather.special === 'thunderstorm';
                return isThunderstorm ? Math.min(baseOpacity * 1.3, 0.85) : baseOpacity;
              })(),
              background: (() => {
                const isThunderstorm = weather.special === 'thunderstorm';

                // Eerie yellow-green tint for severe storms (meteorologically accurate)
                if (isThunderstorm || weather.intensity > 0.7) {
                  return `radial-gradient(ellipse at center,
                    rgba(75, 85, 60, 0.4) 0%,
                    rgba(60, 70, 55, 0.5) 30%,
                    rgba(45, 50, 45, 0.6) 60%,
                    rgba(30, 35, 30, 0.7) 100%)`;
                }

                // Dark blue-gray for regular rain
                return `radial-gradient(ellipse at center,
                  rgba(70, 80, 95, 0.25) 0%,
                  rgba(55, 65, 80, 0.35) 40%,
                  rgba(40, 50, 65, 0.45) 70%,
                  rgba(25, 35, 50, 0.55) 100%)`;
              })(),
              mixBlendMode: 'multiply',
              zIndex: 3
            }}
          >
            {/* Additional atmospheric haze for heavy storms */}
            {weather.intensity > 0.6 && (
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(20, 25, 30, 0.3) 50%, rgba(10, 15, 20, 0.4) 100%)',
                  mixBlendMode: 'multiply'
                }}
              />
            )}
          </div>
        )}

        {/* CREPUSCULAR RAYS (God Rays) - Dawn and Dusk */}
        {((gameTimeHours >= 5.5 && gameTimeHours < 8.5) || (gameTimeHours >= 17.5 && gameTimeHours < 20)) &&
         weatherCloudCover > 0.2 && weatherCloudCover < 0.8 && (
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-[3000ms]"
            style={{
              opacity: (() => {
                // Peak visibility at optimal cloud cover (30-60%)
                const cloudOptimal = weatherCloudCover > 0.3 && weatherCloudCover < 0.6 ? 1 : 0.6;

                // Fade in/out based on time of day
                const currentTime = gameTimeHours + gameTimeMinutes / 60;
                let timeOpacity = 1;

                // Dawn fade in: 5:30 AM - 6:30 AM
                if (currentTime >= 5.5 && currentTime < 6.5) {
                  timeOpacity = (currentTime - 5.5) / 1.0; // 0 to 1
                }
                // Dawn peak: 6:30 AM - 7:30 AM
                else if (currentTime >= 6.5 && currentTime < 7.5) {
                  timeOpacity = 1;
                }
                // Dawn fade out: 7:30 AM - 8:30 AM
                else if (currentTime >= 7.5 && currentTime < 8.5) {
                  timeOpacity = 1 - ((currentTime - 7.5) / 1.0); // 1 to 0
                }
                // Dusk fade in: 5:30 PM - 6:30 PM
                else if (currentTime >= 17.5 && currentTime < 18.5) {
                  timeOpacity = (currentTime - 17.5) / 1.0; // 0 to 1
                }
                // Dusk peak: 6:30 PM - 7:00 PM
                else if (currentTime >= 18.5 && currentTime < 19) {
                  timeOpacity = 1;
                }
                // Dusk fade out: 7:00 PM - 8:00 PM
                else if (currentTime >= 19 && currentTime < 20) {
                  timeOpacity = 1 - ((currentTime - 19) / 1.0); // 1 to 0
                }

                return cloudOptimal * timeOpacity * 0.5; // Middle ground: visible but subtle
              })()
            }}
          >
            {/* SVG for crisp, scalable rays */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMax slice"
              style={{
                mixBlendMode: 'screen',
                filter: 'blur(4px)' // Moderate blur for soft glow without losing definition
              }}
            >
              <defs>
                {/* Gradient for rays - balanced visibility */}
                <linearGradient id="ray-gradient-dawn" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style={{
                    stopColor: gameTimeHours >= 17.5 ? '#FF9955' : '#FFD580',
                    stopOpacity: 0.25 // Middle ground
                  }} />
                  <stop offset="25%" style={{
                    stopColor: gameTimeHours >= 17.5 ? '#FFB870' : '#FFE8B0',
                    stopOpacity: 0.15 // Middle ground
                  }} />
                  <stop offset="50%" style={{
                    stopColor: gameTimeHours >= 17.5 ? '#FFD0A0' : '#FFF5D0',
                    stopOpacity: 0.08 // Middle ground
                  }} />
                  <stop offset="75%" style={{
                    stopColor: '#FFFFFF',
                    stopOpacity: 0.04 // Gentle fade
                  }} />
                  <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
                </linearGradient>
              </defs>

              {/* Individual light rays emanating from horizon center */}
              {/* Ray positions and widths create realistic scattered light effect */}

              {/* Central rays - brightest and widest */}
              <polygon
                points="48,100 42,0 46,0"
                fill="url(#ray-gradient-dawn)"
                style={{ animation: 'ray-drift-1 8s ease-in-out infinite' }}
              />
              <polygon
                points="52,100 54,0 58,0"
                fill="url(#ray-gradient-dawn)"
                style={{ animation: 'ray-drift-2 9s ease-in-out infinite' }}
              />

              {/* Left rays - balanced visibility */}
              <polygon
                points="38,100 28,0 32,0"
                fill="url(#ray-gradient-dawn)"
                opacity="0.6"
                style={{ animation: 'ray-drift-3 10s ease-in-out infinite' }}
              />
              <polygon
                points="30,100 16,0 20,0"
                fill="url(#ray-gradient-dawn)"
                opacity="0.45"
                style={{ animation: 'ray-drift-4 11s ease-in-out infinite' }}
              />
              <polygon
                points="20,100 4,0 8,0"
                fill="url(#ray-gradient-dawn)"
                opacity="0.25"
                style={{ animation: 'ray-drift-1 12s ease-in-out infinite' }}
              />

              {/* Right rays - balanced visibility */}
              <polygon
                points="62,100 68,0 72,0"
                fill="url(#ray-gradient-dawn)"
                opacity="0.6"
                style={{ animation: 'ray-drift-2 9.5s ease-in-out infinite' }}
              />
              <polygon
                points="72,100 80,0 84,0"
                fill="url(#ray-gradient-dawn)"
                opacity="0.45"
                style={{ animation: 'ray-drift-3 10.5s ease-in-out infinite' }}
              />
              <polygon
                points="82,100 92,0 96,0"
                fill="url(#ray-gradient-dawn)"
                opacity="0.25"
                style={{ animation: 'ray-drift-4 11.5s ease-in-out infinite' }}
              />

              {/* Subtle extra rays for depth */}
              <polygon
                points="44,100 36,0 38,0"
                fill="url(#ray-gradient-dawn)"
                opacity="0.35"
                style={{ animation: 'ray-drift-2 8.5s ease-in-out infinite' }}
              />
              <polygon
                points="56,100 62,0 64,0"
                fill="url(#ray-gradient-dawn)"
                opacity="0.35"
                style={{ animation: 'ray-drift-1 9.2s ease-in-out infinite' }}
              />
            </svg>

            {/* Additional atmospheric scatter glow at horizon where rays originate - balanced */}
            <div
              className="absolute bottom-0 left-0 right-0 h-2/5"
              style={{
                background: gameTimeHours >= 17.5
                  ? 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(255, 180, 100, 0.12) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(255, 230, 150, 0.15) 0%, transparent 70%)',
                mixBlendMode: 'screen',
                filter: 'blur(8px)' // Moderate blur
              }}
            />
          </div>
        )}
      </div>

      {/* CSS animations for stars */}
      <style jsx="true">{`
        @keyframes move-twink-back {
          from { background-position: 0 0; }
          to { background-position: -10000px 5000px; }
        }

        @keyframes shooting-star {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(-300px, 200px);
            opacity: 0;
          }
        }

        /* Beautiful varied twinkling animations */
        @keyframes twinkle-0 {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes twinkle-1 {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          30% { opacity: 0.8; transform: scale(1.1); }
          70% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes twinkle-2 {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          25% { opacity: 0.7; transform: scale(1.15); }
          50% { opacity: 0.9; transform: scale(1.25); }
          75% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes twinkle-3 {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          40% { opacity: 0.9; transform: scale(1.2); }
          80% { opacity: 0.7; transform: scale(1.05); }
        }

        /* Crepuscular ray animations - gentle drift as clouds move */
        @keyframes ray-drift-1 {
          0%, 100% { opacity: 0.9; transform: translateX(0) scaleY(1); }
          50% { opacity: 1; transform: translateX(1%) scaleY(1.05); }
        }

        @keyframes ray-drift-2 {
          0%, 100% { opacity: 1; transform: translateX(0) scaleY(1); }
          50% { opacity: 0.85; transform: translateX(-0.8%) scaleY(0.98); }
        }

        @keyframes ray-drift-3 {
          0%, 100% { opacity: 0.85; transform: translateX(0) scaleY(1.02); }
          50% { opacity: 1; transform: translateX(0.6%) scaleY(1); }
        }

        @keyframes ray-drift-4 {
          0%, 100% { opacity: 0.9; transform: translateX(0) scaleY(0.98); }
          50% { opacity: 0.8; transform: translateX(-0.5%) scaleY(1.03); }
        }
      `}</style>
    </div>
  );
};

export default TimeAwareBackground;
