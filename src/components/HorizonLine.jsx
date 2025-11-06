/**
 * HorizonLine.jsx - Responsive horizon with silhouettes and atmospheric effects
 * Renders mountain ranges, city buildings, and atmospheric haze at the bottom of the screen
 *
 * Features:
 * - Responsive positioning (bottom 15-25% of screen)
 * - Multiple variants (mountains, city, desert, forest)
 * - Mexico City specific: mountains + colonial buildings
 * - Time-aware coloring (darker at night, golden at sunset)
 * - Fog/haze integration
 * - Uses CSS variables from TimeAwareBackground for color matching
 */

import React, { useId, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Notable building metadata for hover tooltips
const NOTABLE_BUILDINGS = {
  cathedral: {
    name: "Metropolitan Cathedral",
    description: "The grand cathedral dominates the plaza with its twin baroque towers.",
    bounds: { x: 92, y: 183, width: 95, height: 117 }
  },
  churchTower: {
    name: "Church of San Hipólito",
    description: "Twin baroque bell towers flank the entrance of this colonial church dedicated to Saint Hippolytus.",
    bounds: { x: 225, y: 225, width: 42, height: 75 }
  },
  palace: {
    name: "Viceregal Palace",
    description: "The seat of colonial administration where the Viceroy holds court.",
    bounds: { x: 340, y: 263, width: 65, height: 37 }
  },
  baroqueChurch: {
    name: "Church of Santo Domingo",
    description: "A baroque masterpiece featuring an ornate dome with drum and lantern.",
    bounds: { x: 530, y: 230, width: 58, height: 70 }
  },
  gothicChurch: {
    name: "Church of San Francisco",
    description: "Colonial baroque complex with cloister arcade, ornate facade, and asymmetric bell tower crowned by a dome.",
    bounds: { x: 690, y: 220, width: 78, height: 80 }
  },
  weathervaneChurch: {
    name: "Church of San Agustín",
    description: "An imposing church with distinctive triangular gable facade adorned with arched windows (3-2-1 pattern), flanked by twin bell towers.",
    bounds: { x: 940, y: 215, width: 50, height: 85 }
  },
  botica: {
    name: "Botica de la Amargura",
    description: "Maria de Lima's apothecary shop, where healing and danger intertwine.",
    bounds: { x: 1028, y: 276, width: 30, height: 24 }
  },
  consulado: {
    name: "El Consulado de Mercaderes",
    description: "The merchant's guild headquarters, a two-story building with ground-floor arcades and a distinctive corner tower.",
    bounds: { x: 273, y: 235, width: 65, height: 65 }
  },
  lamerced: {
    name: "La Merced Market",
    description: "The sprawling market complex centered on a baroque church with twin bell towers, flanked by covered market arcades.",
    bounds: { x: 1090, y: 239, width: 60, height: 61 }
  }
};

const HorizonLine = ({
  type = 'mountains-city', // 'mountains', 'city', 'desert', 'forest', 'mountains-city'
  timeOfDay = 'day',
  weather = null,
  className = '',
  travelZoom = null // House call zoom state { isActive, progress, targetX }
}) => {
  // Generate unique IDs for SVG gradients/filters to prevent collisions
  const instanceId = useId();

  // Check for reduced motion preference (accessibility)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [birds, setBirds] = useState([]);
  const [windowPeople, setWindowPeople] = useState([]);
  const [walkingFigures, setWalkingFigures] = useState([]);
  const [horses, setHorses] = useState([]);

  // Building hover tooltip state
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes to the preference
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Starling-like particle flocks with organic murmuration behavior
  useEffect(() => {
    if (prefersReducedMotion) return;

    // Rooftop positions for house-hopping behavior
    const rooftopPositions = [
      { x: 110, y: 238 }, { x: 245, y: 227 }, { x: 370, y: 268 },
      { x: 434, y: 240 }, { x: 559, y: 238 }, { x: 720, y: 218 },
      { x: 820, y: 246 }, { x: 965, y: 246 }
    ];

    const spawnFlybySwoopFlock = (flockId, flockSize) => {
      const startX = Math.random() > 0.5 ? -50 : 1250;
      const endX = startX < 0 ? 1250 : -50;
      const centerY = 80 + Math.random() * 100;
      const velocityX = (endX - startX) / 60; // 60 seconds to cross (very slow drift)
      const velocityY = (Math.random() - 0.5) * 1; // Barely any vertical drift

      const newBirds = [];
      for (let i = 0; i < flockSize; i++) {
        newBirds.push({
          id: `${flockId}-${i}`,
          flockId,
          x: startX + (Math.random() - 0.5) * 30,
          y: centerY + (Math.random() - 0.5) * 30,
          flockCenterX: startX,
          flockCenterY: centerY,
          flockVelocityX: velocityX,
          flockVelocityY: velocityY,
          offsetX: (Math.random() - 0.5) * 40,
          offsetY: (Math.random() - 0.5) * 40,
          flutterPhase: Math.random() * Math.PI * 2,
          behavior: 'flyby',
          spawnTime: Date.now(),
          lifetime: 70000 // 70 seconds to complete journey
        });
      }
      setBirds(prev => {
        const filtered = prev.filter(b => Date.now() - b.spawnTime < b.lifetime);
        return [...filtered.slice(-50), ...newBirds]; // Cap at 50 total birds for performance
      });
    };

    const spawnHouseHoppingFlock = (flockId, flockSize) => {
      // Pick 3 random rooftops for hopping route
      const shuffled = [...rooftopPositions].sort(() => Math.random() - 0.5);
      const route = shuffled.slice(0, 3);
      const start = route[0];

      const newBirds = [];
      for (let i = 0; i < flockSize; i++) {
        newBirds.push({
          id: `${flockId}-${i}`,
          flockId,
          x: start.x + (Math.random() - 0.5) * 20,
          y: start.y + (Math.random() - 0.5) * 10,
          flockCenterX: start.x,
          flockCenterY: start.y,
          offsetX: (Math.random() - 0.5) * 25,
          offsetY: (Math.random() - 0.5) * 25,
          flutterPhase: Math.random() * Math.PI * 2,
          behavior: 'house-hopping',
          route: route,
          routeIndex: 0,
          nextHopTime: Date.now() + 4000 + Math.random() * 3000, // Wait 4-7 seconds between hops
          spawnTime: Date.now(),
          lifetime: 45000 // 45 seconds total (perch longer on each roof)
        });
      }
      setBirds(prev => {
        const filtered = prev.filter(b => Date.now() - b.spawnTime < b.lifetime);
        return [...filtered.slice(-50), ...newBirds]; // Cap at 50 total birds for performance
      });
    };

    const spawnLandingFlock = (flockId, flockSize) => {
      // Pick a random rooftop for the entire flock to land on
      const landingSpot = rooftopPositions[Math.floor(Math.random() * rooftopPositions.length)];

      // Start from above and off to the side
      const startX = landingSpot.x + (Math.random() > 0.5 ? 150 : -150);
      const startY = landingSpot.y - 80 - Math.random() * 40;

      const newBirds = [];
      for (let i = 0; i < flockSize; i++) {
        newBirds.push({
          id: `${flockId}-${i}`,
          flockId,
          x: startX + (Math.random() - 0.5) * 40,
          y: startY + (Math.random() - 0.5) * 30,
          flockCenterX: startX,
          flockCenterY: startY,
          landingX: landingSpot.x,
          landingY: landingSpot.y,
          offsetX: (Math.random() - 0.5) * 25, // Tighter cluster when landed
          offsetY: (Math.random() - 0.5) * 8, // Very tight vertical spread when perched
          flutterPhase: Math.random() * Math.PI * 2,
          behavior: 'landing',
          landingProgress: 0, // 0 = approaching, 1 = landed
          landingDuration: 3000, // 3 seconds to land
          perchDuration: 8000 + Math.random() * 7000, // Perch for 8-15 seconds
          landingStartTime: Date.now(),
          spawnTime: Date.now(),
          lifetime: 25000 // 25 seconds total (approach + perch + takeoff)
        });
      }
      setBirds(prev => {
        const filtered = prev.filter(b => Date.now() - b.spawnTime < b.lifetime);
        return [...filtered.slice(-50), ...newBirds]; // Cap at 50 total birds for performance
      });
    };

    const spawnBirdFlock = () => {
      // Reduce bird spawns during zoom (birds look weird when zooming)
      const spawnChance = travelZoom?.isActive ? 0.1 : 0.4; // 10% when zooming, 40% normally
      if (Math.random() > spawnChance) return;

      // Smaller flocks (5-15 birds)
      const flockSize = 5 + Math.floor(Math.random() * 11);
      const behavior = Math.random();
      const flockId = Date.now() + Math.random();

      if (behavior < 0.4) {
        spawnFlybySwoopFlock(flockId, flockSize);
      } else if (behavior < 0.8) {
        spawnHouseHoppingFlock(flockId, flockSize);
      } else {
        spawnLandingFlock(flockId, flockSize);
      }
    };

    // Spawn every 8-12 seconds (slower frequency)
    const spawnInterval = () => {
      spawnBirdFlock();
      const nextInterval = 8000 + Math.random() * 4000;
      return setTimeout(spawnInterval, nextInterval);
    };

    // Spawn initial flock quickly
    setTimeout(spawnBirdFlock, 1000);
    const timeoutId = setTimeout(spawnInterval, 6000);

    return () => clearTimeout(timeoutId);
  }, [prefersReducedMotion]);

  // RAF update loop for organic bird movement
  useEffect(() => {
    if (prefersReducedMotion) return;

    let animationFrameId;
    let lastTimestamp = Date.now();

    const updateBirds = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimestamp) / 1000; // seconds
      lastTimestamp = now;

      setBirds(prevBirds => {
        // Skip update if no birds exist yet (but keep loop running)
        if (prevBirds.length === 0) {
          return prevBirds;
        }

        // Cap at 100 birds for performance
        const activeBirds = prevBirds.slice(-100);

        const newBirds = activeBirds.map(bird => {
          // Remove expired birds
          if (now - bird.spawnTime > bird.lifetime) {
            return null;
          }

          let newFlockCenterX = bird.flockCenterX;
          let newFlockCenterY = bird.flockCenterY;

          // Update behavior-specific movement
          if (bird.behavior === 'flyby') {
            // Move flock center across screen
            newFlockCenterX += bird.flockVelocityX * deltaTime;
            newFlockCenterY += bird.flockVelocityY * deltaTime;

            // Add sine wave undulation (barely perceptible)
            const waveOffset = Math.sin((now - bird.spawnTime) / 1000) * 1.5;
            newFlockCenterY += waveOffset * deltaTime * 0.5;

          } else if (bird.behavior === 'house-hopping') {
            // Check if it's time to hop to next rooftop
            if (now >= bird.nextHopTime && bird.routeIndex < bird.route.length - 1) {
              const nextIndex = bird.routeIndex + 1;
              const nextRooftop = bird.route[nextIndex];

              // Update to new rooftop
              newFlockCenterX = nextRooftop.x;
              newFlockCenterY = nextRooftop.y;
              bird.routeIndex = nextIndex;
              bird.nextHopTime = now + 4000 + Math.random() * 3000; // Wait 4-7 seconds
            }
            // Final hop - fly away (very slowly)
            else if (now >= bird.nextHopTime && bird.routeIndex === bird.route.length - 1) {
              newFlockCenterX += 15 * deltaTime; // Drift off screen very slowly
              newFlockCenterY -= 5 * deltaTime;
            }

          } else if (bird.behavior === 'landing') {
            const timeSinceLanding = now - bird.landingStartTime;

            // Phase 1: Approaching (flying down to rooftop)
            if (timeSinceLanding < bird.landingDuration) {
              const landingProgress = timeSinceLanding / bird.landingDuration;
              // Ease-out curve for natural landing
              const easedProgress = 1 - Math.pow(1 - landingProgress, 3);

              // Interpolate flock center from start to landing position
              const startX = bird.landingX + (Math.random() > 0.5 ? 150 : -150);
              const startY = bird.landingY - 80;
              newFlockCenterX = startX + (bird.landingX - startX) * easedProgress;
              newFlockCenterY = startY + (bird.landingY - startY) * easedProgress;

              bird.landingProgress = easedProgress;
            }
            // Phase 2: Perched (sitting still on rooftop)
            else if (timeSinceLanding < bird.landingDuration + bird.perchDuration) {
              newFlockCenterX = bird.landingX;
              newFlockCenterY = bird.landingY;
              bird.landingProgress = 1; // Fully landed
            }
            // Phase 3: Taking off (flying away)
            else {
              const takeoffTime = timeSinceLanding - (bird.landingDuration + bird.perchDuration);
              newFlockCenterX = bird.landingX + takeoffTime * 0.02; // Drift away slowly
              newFlockCenterY = bird.landingY - takeoffTime * 0.015; // Rise up slowly
            }
          }

          // Calculate target position (flock center + offset)
          const targetX = newFlockCenterX + bird.offsetX;
          const targetY = newFlockCenterY + bird.offsetY;

          // Very subtle organic variation (not oscillating jitter)
          const organicVariation = Math.sin(bird.flutterPhase + now / 3000) * 0.08;

          // Smooth movement toward target (gentle drift)
          const newX = bird.x + (targetX - bird.x) * 0.015 + organicVariation;
          const newY = bird.y + (targetY - bird.y) * 0.015;

          return {
            ...bird,
            x: newX,
            y: newY,
            flockCenterX: newFlockCenterX,
            flockCenterY: newFlockCenterY
          };
        }).filter(bird => bird !== null);

        return newBirds;
      });

      animationFrameId = requestAnimationFrame(updateBirds);
    };

    animationFrameId = requestAnimationFrame(updateBirds);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [prefersReducedMotion]); // Removed birds.length to prevent infinite loop

  // Person-in-window animations - occasional silhouette leaning out
  useEffect(() => {
    if (prefersReducedMotion) return;

    const spawnWindowPerson = () => {
      // 30% chance to spawn someone in a window
      if (Math.random() > 0.3) return;

      // Window positions on buildings (x, y coordinates of windows)
      const windowPositions = [
        { x: 56, y: 285 }, { x: 68, y: 283 }, { x: 105, y: 253 },
        { x: 162, y: 260 }, { x: 244, y: 238 }, { x: 260, y: 245 },
        { x: 375, y: 273 }, { x: 392, y: 280 }, { x: 441, y: 250 },
        { x: 567, y: 250 }, { x: 585, y: 258 }, { x: 725, y: 230 },
        { x: 745, y: 238 }, { x: 970, y: 255 }, { x: 990, y: 263 }
      ];

      const position = windowPositions[Math.floor(Math.random() * windowPositions.length)];
      const id = Date.now() + Math.random();

      const newPerson = {
        id,
        x: position.x,
        y: position.y,
        phase: 'appearing' // appearing -> leaning -> disappearing
      };

      setWindowPeople(prev => [...prev, newPerson]);

      // Lean out for 2-4 seconds
      const leanDuration = 2000 + Math.random() * 2000;

      // Change to leaning phase
      setTimeout(() => {
        setWindowPeople(prev => prev.map(p =>
          p.id === id ? { ...p, phase: 'leaning' } : p
        ));
      }, 500);

      // Change to disappearing phase
      setTimeout(() => {
        setWindowPeople(prev => prev.map(p =>
          p.id === id ? { ...p, phase: 'disappearing' } : p
        ));
      }, leanDuration);

      // Remove completely
      setTimeout(() => {
        setWindowPeople(prev => prev.filter(p => p.id !== id));
      }, leanDuration + 500);
    };

    // Check every 15 seconds
    const interval = setInterval(spawnWindowPerson, 15000);

    // Spawn initial person after a delay
    setTimeout(spawnWindowPerson, 3000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Walking figures at ground level - tiny silhouettes
  useEffect(() => {
    if (prefersReducedMotion) return;

    const spawnWalkingFigure = () => {
      // 40% chance to spawn someone walking
      if (Math.random() > 0.4) return;

      const id = Date.now() + Math.random();
      const startX = Math.random() > 0.5 ? -10 : 1210;
      const endX = startX < 0 ? 1210 : -10;
      const walkSpeed = 0.04 + Math.random() * 0.03; // Very slow leisurely stroll - 0.04-0.07 pixels per frame
      const groundY = 298; // Very bottom of the scene

      const newFigure = {
        id,
        x: startX,
        y: groundY,
        targetX: endX,
        speed: walkSpeed,
        direction: startX < 0 ? 1 : -1
      };

      setWalkingFigures(prev => [...prev, newFigure]);

      // Calculate duration based on distance and speed
      const distance = Math.abs(endX - startX);
      const duration = (distance / walkSpeed) * 16; // ~16ms per frame

      // Remove after walking across
      setTimeout(() => {
        setWalkingFigures(prev => prev.filter(f => f.id !== id));
      }, duration);
    };

    // Check every 10 seconds
    const interval = setInterval(spawnWalkingFigure, 10000);

    // Spawn initial figure
    setTimeout(spawnWalkingFigure, 2000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Horses and wagons at ground level - max 3 for performance
  useEffect(() => {
    if (prefersReducedMotion) return;

    const spawnHorse = () => {
      // Don't spawn if already at max (performance limit)
      if (horses.length >= 3) return;

      // 30% chance to spawn a horse
      if (Math.random() > 0.3) return;

      const id = Date.now() + Math.random();
      const startX = Math.random() > 0.5 ? -20 : 1220;
      const endX = startX < 0 ? 1220 : -20;
      const horseSpeed = 0.075 + Math.random() * 0.175; // More variance - 0.075-0.25 pixels per frame (some slow, some fast)
      const groundY = 298; // Very bottom of the scene

      // Random type: 40% rider, 30% simple wagon, 30% grand carriage
      const rand = Math.random();
      let type;
      if (rand < 0.4) {
        type = 'rider';
      } else if (rand < 0.7) {
        type = 'wagon';
      } else {
        type = 'carriage';
      }

      const newHorse = {
        id,
        x: startX,
        y: groundY,
        targetX: endX,
        speed: horseSpeed,
        direction: startX < 0 ? 1 : -1,
        type // 'rider', 'wagon', or 'carriage'
      };

      setHorses(prev => [...prev, newHorse]);

      // Calculate duration based on distance and speed
      const distance = Math.abs(endX - startX);
      const duration = (distance / horseSpeed) * 16; // ~16ms per frame

      // Remove after crossing
      setTimeout(() => {
        setHorses(prev => prev.filter(h => h.id !== id));
      }, duration);
    };

    // Check every 12 seconds (less frequent than people)
    const interval = setInterval(spawnHorse, 12000);

    // Spawn initial horse
    setTimeout(spawnHorse, 5000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, horses.length]);

  // Building hover handlers
  const handleBuildingHover = (buildingId, event) => {
    // Don't show tooltips during zoom (too distracting)
    if (travelZoom?.isActive) return;

    console.log('[HorizonLine] Hovering building:', buildingId);
    setHoveredBuilding(buildingId);
    const rect = event.currentTarget.getBoundingClientRect();
    const pos = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    };
    console.log('[HorizonLine] Tooltip position:', pos);
    setTooltipPos(pos);
  };

  const handleBuildingLeave = () => {
    console.log('[HorizonLine] Leave building');
    setHoveredBuilding(null);
  };

  // Debug effect to track tooltip rendering
  useEffect(() => {
    if (hoveredBuilding && NOTABLE_BUILDINGS[hoveredBuilding]) {
      console.log('[HorizonLine] Tooltip should render for:', hoveredBuilding, 'at position:', tooltipPos);
    }
  }, [hoveredBuilding, tooltipPos]);

  // Determine if fog/haze should affect visibility
  const hasFog = weather && (weather.special === 'fog' || weather.special === 'mist');
  const fogOpacity = hasFog ? (weather.fx?.fogDensity || 0.5) : 0;
  const hazeOpacity = weather ? (weather.fx?.hazeDensity || 0) : 0;

  // Time-based opacity adjustments
  const isNight = timeOfDay === 'midnight' || timeOfDay === 'night' || timeOfDay === 'twilight';
  const isDusk = timeOfDay === 'dusk';
  const isDawn = timeOfDay === 'dawn' || timeOfDay === 'pre-dawn';
  const isDaytime = !isNight && !isDawn && !isDusk; // Clear daytime hours

  // Check for poor visibility conditions (precipitation, overcast, low visibility)
  const hasPoorVisibility = weather && (
    weather.precipitation !== 'none' || // Any precipitation
    weather.cloudCover > 0.7 || // Heavily overcast
    weather.visibility < 0.5 // Low visibility
  );

  // At night, buildings should be MORE visible (darker silhouettes), not less
  // During day, atmospheric haze reduces contrast
  const baseOpacity = isNight ? 0.95 : isDusk || isDawn ? 0.75 : 0.7;

  // Determine which chimneys should have visible smoke (4-6 active at a time for lively scene)
  // Use a simple hash of the current hour to keep it stable but rotating
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const smokeSeed = (currentHour * 37) + (Math.floor(currentMinute / 10) * 7); // Changes every 10 minutes
  const activeChimneys = new Set();

  // Always have 4-6 chimneys smoking for more atmospheric scene
  const numSmokingChimneys = 4 + (smokeSeed % 3); // 4, 5, or 6 chimneys
  for (let i = 0; i < numSmokingChimneys; i++) {
    const chimneyIndex = ((smokeSeed + i * 17) % 12) + 1; // Random chimney 1-12
    activeChimneys.add(chimneyIndex);
  }

  // Calculate wind-based smoke drift
  // Wind direction in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  const windSpeed = weather?.windSpeed || 5;
  const windDirection = weather?.windDirection || 90;

  // Convert wind direction to horizontal drift (-1 to 1, where positive = rightward)
  // East wind (90°) pushes smoke west (left), so we invert
  const windRadians = (windDirection * Math.PI) / 180;
  const windDriftX = -Math.sin(windRadians) * windSpeed * 0.4; // Scale factor for visual effect

  // Stronger wind = more dispersed smoke
  const windDispersion = Math.min(windSpeed / 20, 1); // 0-1 scale

  // Render Mexico City horizon (mountains + colonial buildings)
  if (type === 'mountains-city') {
    return (
      <>
      <div
        className={`absolute bottom-0 left-0 right-0 pointer-events-none ${className}`}
        style={{
          height: '40%',
          minHeight: '220px',
          zIndex: 1
        }}
      >
        {/* Extended ground layer - Extends far below visible area for zoom effects */}
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: '-100vh',
            height: '100vh',
            background: isDawn || isDusk
              ? (isDusk ? '#1a1e28' : '#1e2230')
              : (isNight ? '#0f1218' : '#1a2028'),
            zIndex: -1
          }}
        />

        {/* Atmospheric haze/fog layer */}
        {(hasFog || hazeOpacity > 0.3) && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top,
                rgba(200, 200, 210, ${Math.max(fogOpacity, hazeOpacity) * 0.3}) 0%,
                rgba(220, 220, 230, ${Math.max(fogOpacity, hazeOpacity) * 0.3}) 100%,
                transparent 80%)`,
              mixBlendMode: 'soft-light',
              transition: 'opacity 3s ease'
            }}
          />
        )}

        {/* Far mountains (Popocatépetl, Iztaccíhuatl inspired) - IMPROVED atmospheric perspective */}
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMax slice"
          style={{
            opacity: baseOpacity * 0.4,
            filter: 'blur(0.8px)'
          }}
        >
          <defs>
            {/* Time-aware mountain gradient */}
            <linearGradient id={`mountain-far-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{
                stopColor: isDawn ? '#b8a0c0' : (isDusk ? '#9b7ba0' : (isNight ? '#3a4a5c' : 'var(--sky-mountain-far, #6b7280)')),
                stopOpacity: isDawn || isDusk ? 0.95 : 0.9
              }} />
              <stop offset="40%" style={{
                stopColor: isDawn ? '#a08bb0' : (isDusk ? '#8b6b90' : (isNight ? '#4a5a6c' : 'var(--sky-mountain-far, #6b7280)')),
                stopOpacity: 0.6
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn ? '#8a7ba0' : (isDusk ? '#6a4a70' : (isNight ? '#5a6a7c' : 'var(--sky-mountain-far, #9ca3af)')),
                stopOpacity: 0.3
              }} />
            </linearGradient>

            {/* Enhanced snow caps with irregular patterns */}
            <radialGradient id={`volcano-snow-main-${instanceId}`} cx="50%" cy="30%">
              <stop offset="0%" style={{
                stopColor: isDawn ? '#ffeedd' : (isDusk ? '#ffccbb' : '#ffffff'),
                stopOpacity: isDawn || isDusk ? 0.7 : 0.65
              }} />
              <stop offset="50%" style={{
                stopColor: isDawn ? '#ffe4cc' : (isDusk ? '#ffb899' : '#f5f5f5'),
                stopOpacity: 0.4
              }} />
              <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
            </radialGradient>

            <radialGradient id={`volcano-snow-accent-${instanceId}`} cx="60%" cy="20%">
              <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
            </radialGradient>

            {/* Atmospheric scattering overlay - IMPROVED: stronger haze with smooth fadeout */}
            <linearGradient id={`mountain-haze-far-${instanceId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" style={{
                stopColor: isDawn ? 'rgba(220,210,235,0)' : (isDusk ? 'rgba(235,200,210,0)' : 'rgba(200,215,230,0)'),
                stopOpacity: 0
              }} />
              <stop offset="30%" style={{
                stopColor: isDawn ? 'rgba(220,210,235,0.22)' : (isDusk ? 'rgba(235,200,210,0.25)' : 'rgba(200,215,230,0.20)'),
                stopOpacity: 0.3
              }} />
              <stop offset="60%" style={{
                stopColor: isDawn ? 'rgba(220,210,235,0.10)' : (isDusk ? 'rgba(235,200,210,0.12)' : 'rgba(200,215,230,0.08)'),
                stopOpacity: 0.15
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn ? 'rgba(220,210,235,0)' : (isDusk ? 'rgba(235,200,210,0)' : 'rgba(200,215,230,0)'),
                stopOpacity: 0
              }} />
            </linearGradient>

            {/* Mountain depth radials - shadow/valley sides (very faint for distant mountains) */}
            <radialGradient id={`mountain-shadow-1-${instanceId}`} cx="30%" cy="20%">
              <stop offset="0%" style={{
                stopColor: isDawn ? 'rgba(20,10,30,0.20)' : (isDusk ? 'rgba(15,5,25,0.22)' : (isNight ? 'rgba(5,8,15,0.25)' : 'rgba(10,20,35,0.18)')),
                stopOpacity: 1
              }} />
              <stop offset="50%" style={{ stopColor: 'rgba(0,0,0,0.08)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0)', stopOpacity: 0 }} />
            </radialGradient>

            <radialGradient id={`mountain-shadow-2-${instanceId}`} cx="70%" cy="25%">
              <stop offset="0%" style={{
                stopColor: isDawn ? 'rgba(18,8,28,0.18)' : (isDusk ? 'rgba(13,3,23,0.20)' : (isNight ? 'rgba(3,6,13,0.23)' : 'rgba(8,18,33,0.16)')),
                stopOpacity: 1
              }} />
              <stop offset="50%" style={{ stopColor: 'rgba(0,0,0,0.07)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0)', stopOpacity: 0 }} />
            </radialGradient>

            {/* Mountain depth radials - sunlit slopes (very faint for distant atmospheric effect) */}
            <radialGradient id={`mountain-light-1-${instanceId}`} cx="60%" cy="30%">
              <stop offset="0%" style={{
                stopColor: isDawn ? 'rgba(240,210,230,0.18)' : (isDusk ? 'rgba(255,190,210,0.20)' : (isNight ? 'rgba(80,95,115,0.12)' : 'rgba(220,230,245,0.16)')),
                stopOpacity: 1
              }} />
              <stop offset="50%" style={{
                stopColor: isDawn ? 'rgba(220,190,215,0.08)' : (isDusk ? 'rgba(235,175,195,0.09)' : (isNight ? 'rgba(70,85,105,0.05)' : 'rgba(200,215,235,0.07)')),
                stopOpacity: 1
              }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 0 }} />
            </radialGradient>

            <radialGradient id={`mountain-light-2-${instanceId}`} cx="40%" cy="35%">
              <stop offset="0%" style={{
                stopColor: isDawn ? 'rgba(235,205,225,0.16)' : (isDusk ? 'rgba(250,185,205,0.18)' : (isNight ? 'rgba(75,90,110,0.10)' : 'rgba(215,225,240,0.15)')),
                stopOpacity: 1
              }} />
              <stop offset="50%" style={{
                stopColor: isDawn ? 'rgba(215,185,210,0.07)' : (isDusk ? 'rgba(230,170,190,0.08)' : (isNight ? 'rgba(65,80,100,0.04)' : 'rgba(195,210,230,0.06)')),
                stopOpacity: 1
              }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 0 }} />
            </radialGradient>

            {/* Organic distortion filter for realistic mountain texture */}
            <filter id={`mountain-texture-distortion-${instanceId}`}>
              <feTurbulence type="fractalNoise"
                            baseFrequency="0.015 0.025"
                            numOctaves="3"
                            seed="42"
                            result="noise" />
              <feDisplacementMap in="SourceGraphic"
                                 in2="noise"
                                 scale="6"
                                 xChannelSelector="R"
                                 yChannelSelector="G"
                                 result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation="1.5" />
            </filter>

            {/* Subtle noise overlay filter for surface texture */}
            <filter id={`mountain-surface-noise-${instanceId}`}>
              <feTurbulence type="fractalNoise"
                            baseFrequency="0.08 0.12"
                            numOctaves="4"
                            seed="123"
                            result="turbulence" />
              <feColorMatrix in="turbulence"
                             type="saturate"
                             values="0"
                             result="grayscale" />
              <feComponentTransfer in="grayscale" result="contrast">
                <feFuncA type="linear" slope="0.4" intercept="0" />
              </feComponentTransfer>
            </filter>

            {/* Clip path for far mountains - constrains overlays to mountain shape */}
            <clipPath id={`mountain-far-clip-${instanceId}`}>
              <path d="M0,300 L0,160 Q00,152 200,108 Q300,93 400,83 L480,55 L560,83 Q650,95 750,88 L850,78 L920,85 L980,88 Q1050,90 1100,95 L1150,100 Q1175,104 1200,106 L1200,300 Z" />
            </clipPath>
          </defs>

          {/* Distant mountain range - with varied peaks (left peak taller, right peak lowered) */}
          <path
            d="M0,300 L0,160 Q00,152 200,108 Q300,93 400,83 L480,55 L560,83 Q650,95 750,88 L850,78 L920,85 L980,88 Q1050,90 1100,95 L1150,100 Q1175,104 1200,106 L1200,300 Z"
            fill={`url(#mountain-far-${instanceId})`}
          />

          {/* Mountain depth overlays - reduced count with organic distortion */}
          <g clipPath={`url(#mountain-far-clip-${instanceId})`} filter={`url(#mountain-texture-distortion-${instanceId})`}>
            {/* Left section - key highlight */}
            <ellipse cx="280" cy="108" rx="20" ry="120" fill={`url(#mountain-light-1-${instanceId})`}
              transform="rotate(-23 280 108)" />

            {/* Popocatépetl - shadow and light for depth */}
            <ellipse cx="460" cy="78" rx="26" ry="135" fill={`url(#mountain-shadow-2-${instanceId})`}
              transform="rotate(14 460 78)" />
            <ellipse cx="500" cy="76" rx="23" ry="125" fill={`url(#mountain-light-1-${instanceId})`}
              transform="rotate(-19 500 76)" />

            {/* Central valley area - key highlights */}
            <ellipse cx="700" cy="90" rx="22" ry="122" fill={`url(#mountain-light-2-${instanceId})`}
              transform="rotate(21 700 90)" />
            <ellipse cx="750" cy="92" rx="24" ry="126" fill={`url(#mountain-light-1-${instanceId})`}
              transform="rotate(-15 750 92)" />

            {/* Iztaccíhuatl - shadow and light for depth */}
            <ellipse cx="900" cy="75" rx="28" ry="130" fill={`url(#mountain-shadow-1-${instanceId})`}
              transform="rotate(-26 900 75)" />
            <ellipse cx="940" cy="73" rx="25" ry="120" fill={`url(#mountain-light-1-${instanceId})`}
              transform="rotate(16 940 73)" />

            {/* Right section - key highlight */}
            <ellipse cx="1080" cy="95" rx="24" ry="118" fill={`url(#mountain-light-1-${instanceId})`}
              transform="rotate(22 1080 95)" />

            {/* Organic canyon shapes - Popocatépetl erosion */}
            <path d="M 440 90
                     Q 445 80 450 75
                     Q 455 70 460 72
                     Q 465 75 470 82
                     Q 475 90 480 100
                     Q 485 110 490 120
                     Q 492 125 490 130
                     L 485 128
                     Q 480 115 475 105
                     Q 470 95 465 88
                     Q 460 82 455 85
                     Q 450 88 445 95
                     Z"
                  fill={`url(#mountain-shadow-1-${instanceId})`}
                  opacity="0.4" />

            <path d="M 510 85
                     Q 515 75 520 70
                     Q 523 68 526 70
                     Q 530 73 535 80
                     Q 540 88 544 98
                     Q 547 108 548 118
                     L 545 120
                     Q 542 110 538 100
                     Q 534 90 530 83
                     Q 526 78 523 80
                     Q 518 82 513 90
                     Z"
                  fill={`url(#mountain-shadow-2-${instanceId})`}
                  opacity="0.35" />

            {/* Valley depression - Iztaccíhuatl */}
            <path d="M 870 88
                     Q 875 80 880 76
                     Q 885 73 890 75
                     Q 895 78 900 85
                     Q 905 93 910 103
                     Q 912 110 911 118
                     L 908 120
                     Q 905 110 900 100
                     Q 895 90 890 84
                     Q 886 80 883 83
                     Q 878 87 873 93
                     Z"
                  fill="rgba(0,0,0,0.25)"
                  opacity="0.3" />

            {/* Subtle noise texture overlay */}
            <rect x="0" y="0" width="1200" height="300"
                  fill="white"
                  filter={`url(#mountain-surface-noise-${instanceId})`}
                  opacity="0.08"
                  style={{ mixBlendMode: 'overlay' }} />
          </g>

          {/* Natural Snow cap - Popocatépetl (LEFT peak only) - Organic, integrated with mountain - HIDDEN at night and during poor visibility */}
          {!isNight && !hasPoorVisibility && (
          <>
          {/* Main snow cap - irregular organic shape following mountain contour */}
          <path d="M 445 73
                   Q 452 60 458 63
                   C 462 60 430 70 470 60
                   Q 476 53 480 51
                   L 484 53
                   Q 488 55 493 57
                   C 498 60 503 63 509 67
                   Q 515 72 520 77
                   L 510 70
                   Q 513 75 508 71
                   C 502 67 496 64 490 62
                   Q 485 60 480 59
                   Q 475 60 470 62
                   C 464 64 458 67 452 71
                   Q 447 75 443 79
                   Z"
                fill={isDawn ? 'rgba(255,245,235,0.85)' : (isDusk ? 'rgba(255,235,225,0.82)' : 'rgba(255,255,255,0.88)')}
                opacity={0.85} />

          {/* Summit highlight - bright peak with natural edge */}
          <path d="M 476 53
                   Q 478 51 480 49
                   Q 482 51 484 53
                   Q 482 55 480 56
                   Q 478 55 476 53 Z"
                fill={isDawn ? 'rgba(255,250,245,0.95)' : (isDusk ? 'rgba(255,242,235,0.92)' : 'rgba(255,255,255,0.98)')}
                opacity={0.95} />

          {/* Left slope snow patch - irregular natural boundary */}
          <path d="M 440 80
                   Q 446 75 452 71
                   Q 456 69 460 67
                   L 458 70
                   Q 453 73 448 77
                   Q 444 80 441 83
                   Z"
                fill="rgba(255,255,255,0.55)"
                opacity={0.55} />

          {/* Right slope snow patch - irregular natural boundary */}
          <path d="M 520 80
                   Q 514 75 508 71
                   Q 504 69 500 67
                   L 502 70
                   Q 507 73 512 77
                   Q 516 80 519 83
                   Z"
                fill="rgba(255,255,255,0.52)"
                opacity={0.52} />

          {/* Subtle crevasse shadows for texture */}
          <path d="M 490 73 Q 495 52 460 70"
                stroke="rgba(210,225,240,0.7)"
                strokeWidth="9"
                fill="none"
                opacity={0.8} />
          <path d="M 480 54 Q 485 56 490 59"
                stroke="rgba(210,225,240,0.28)"
                strokeWidth="200.9"
                fill="none"
                opacity={0.7} />
          </>
          )}

          {/* Atmospheric scattering overlay */}
          <rect x="0" y="0" width="1200" height="300" fill={`url(#mountain-haze-far-${instanceId})`} />
        </svg>

        {/* Mid mountains - more dramatic with time-aware lighting */}
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMax slice"
          style={{ opacity: baseOpacity * 0.60 }}
        >
          <defs>
            {/* Time-aware mid-mountain gradient - 5 stops for more realistic lighting */}
            <linearGradient id={`mountain-mid-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              {/* Sky-facing slopes */}
              <stop offset="0%" style={{
                stopColor: isDawn ? '#8a7b9a' : (isDusk ? '#7a6a8a' : (isNight ? '#3a4a5c' : '#577191')),
                stopOpacity: 1
              }} />
              {/* Upper slopes */}
              <stop offset="30%" style={{
                stopColor: isDawn ? '#7a6b8a' : (isDusk ? '#6a5a7a' : (isNight ? '#324252' : '#475d81')),
                stopOpacity: 1
              }} />
              {/* Mid slopes - transition zone */}
              <stop offset="55%" style={{
                stopColor: isDawn ? '#5a4b6a' : (isDusk ? '#4d3d5a' : (isNight ? '#283848' : '#374d71')),
                stopOpacity: 1
              }} />
              {/* Lower slopes - more shadow */}
              <stop offset="75%" style={{
                stopColor: isDawn ? '#3a2b4a' : (isDusk ? '#332536' : (isNight ? '#1f2d3d' : '#273d61')),
                stopOpacity: 1
              }} />
              {/* Base - darkest */}
              <stop offset="100%" style={{
                stopColor: isDawn ? '#2a1b3a' : (isDusk ? '#231a2d' : (isNight ? '#1a232e' : '#1f2d51')),
                stopOpacity: 1
              }} />
            </linearGradient>

            {/* Atmospheric scattering for mid-mountains - enhanced depth */}
            <linearGradient id={`mountain-haze-mid-${instanceId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              {/* No haze at base */}
              <stop offset="0%" style={{ stopColor: 'rgba(0,0,0,0)', stopOpacity: 0 }} />
              {/* Slight haze begins */}
              <stop offset="35%" style={{
                stopColor: isDawn ? 'rgba(240,220,200,0.02)' : (isDusk ? 'rgba(230,200,180,0.025)' : 'rgba(200,210,220,0.015)'),
                stopOpacity: 1
              }} />
              {/* Moderate haze */}
              <stop offset="65%" style={{
                stopColor: isDawn ? 'rgba(245,230,215,0.045)' : (isDusk ? 'rgba(240,210,190,0.05)' : 'rgba(200,215,230,0.03)'),
                stopOpacity: 1
              }} />
              {/* Peak haze */}
              <stop offset="100%" style={{
                stopColor: isDawn ? 'rgba(250,240,230,0.08)' : (isDusk ? 'rgba(250,220,200,0.09)' : 'rgba(200,220,240,0.055)'),
                stopOpacity: 1
              }} />
            </linearGradient>

            {/* Mid-mountain depth radials - shadow/valley sides (subtle for natural appearance) */}
            <radialGradient id={`mountain-mid-shadow-1-${instanceId}`} cx="30%" cy="15%">
              <stop offset="0%" style={{
                stopColor: isDawn ? 'rgba(15,8,25,0.35)' : (isDusk ? 'rgba(12,5,20,0.4)' : (isNight ? 'rgba(3,5,12,0.45)' : 'rgba(8,15,30,0.35)')),
                stopOpacity: 1
              }} />
              <stop offset="50%" style={{ stopColor: 'rgba(0,0,0,0.15)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0)', stopOpacity: 0 }} />
            </radialGradient>

            <radialGradient id={`mountain-mid-shadow-2-${instanceId}`} cx="70%" cy="30%">
              <stop offset="0%" style={{
                stopColor: isDawn ? 'rgba(13,6,23,0.35)' : (isDusk ? 'rgba(10,3,18,0.4)' : (isNight ? 'rgba(2,4,10,0.45)' : 'rgba(6,13,28,0.35)')),
                stopOpacity: 1
              }} />
              <stop offset="50%" style={{ stopColor: 'rgba(0,0,0,0.15)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0)', stopOpacity: 0 }} />
            </radialGradient>

            {/* Mid-mountain depth radials - sunlit slopes (enhanced for closer, more dramatic lighting) */}
            <radialGradient id={`mountain-mid-light-1-${instanceId}`} cx="60%" cy="35%">
              <stop offset="0%" style={{
                stopColor: isDawn ? 'rgba(250,220,240,0.28)' : (isDusk ? 'rgba(255,200,220,0.32)' : (isNight ? 'rgba(90,110,130,0.22)' : 'rgba(230,240,255,0.28)')),
                stopOpacity: 1
              }} />
              <stop offset="45%" style={{
                stopColor: isDawn ? 'rgba(225,195,220,0.12)' : (isDusk ? 'rgba(240,180,200,0.14)' : (isNight ? 'rgba(75,95,115,0.08)' : 'rgba(205,220,240,0.12)')),
                stopOpacity: 1
              }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 0 }} />
            </radialGradient>

            <radialGradient id={`mountain-mid-light-2-${instanceId}`} cx="40%" cy="40%">
              <stop offset="0%" style={{
                stopColor: isDawn ? 'rgba(245,215,235,0.26)' : (isDusk ? 'rgba(250,195,215,0.3)' : (isNight ? 'rgba(85,105,125,0.2)' : 'rgba(225,235,250,0.26)')),
                stopOpacity: 1
              }} />
              <stop offset="45%" style={{
                stopColor: isDawn ? 'rgba(220,190,215,0.1)' : (isDusk ? 'rgba(235,175,195,0.12)' : (isNight ? 'rgba(70,90,110,0.07)' : 'rgba(200,215,235,0.1)')),
                stopOpacity: 1
              }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 0 }} />
            </radialGradient>

            {/* Organic distortion filter for realistic mountain texture */}
            <filter id={`mountain-mid-texture-distortion-${instanceId}`}>
              <feTurbulence type="fractalNoise"
                            baseFrequency="0.018 0.03"
                            numOctaves="3"
                            seed="84"
                            result="noise" />
              <feDisplacementMap in="SourceGraphic"
                                 in2="noise"
                                 scale="8"
                                 xChannelSelector="R"
                                 yChannelSelector="G"
                                 result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation="2" />
            </filter>

            {/* Subtle noise overlay filter for surface texture */}
            <filter id={`mountain-mid-surface-noise-${instanceId}`}>
              <feTurbulence type="fractalNoise"
                            baseFrequency="0.1 0.15"
                            numOctaves="4"
                            seed="456"
                            result="turbulence" />
              <feColorMatrix in="turbulence"
                             type="saturate"
                             values="0"
                             result="grayscale" />
              <feComponentTransfer in="grayscale" result="contrast">
                <feFuncA type="linear" slope="0.5" intercept="0" />
              </feComponentTransfer>
            </filter>

            {/* Clip path for mid mountains - constrains overlays to mountain shape */}
            <clipPath id={`mountain-mid-clip-${instanceId}`}>
              <path d="M0,300 L0,172
                       Q40,165 80,158
                       Q110,152 150,148
                       Q175,143 200,138
                       Q230,140 260,146
                       Q290,151 320,153
                       Q350,157 380,160
                       Q415,163 450,166
                       Q485,165 520,163
                       Q555,160 590,156
                       Q620,150 650,143
                       Q690,140 730,136
                       Q770,141 810,150
                       Q845,155 880,160
                       Q905,163 930,165
                       Q955,162 980,158
                       Q1005,154 1030,150
                       Q1055,148 1080,145
                       Q1105,142 1130,140
                       Q1165,139 1180,138
                       Q1190,137 1200,136
                       L1200,300 Z" />
            </clipPath>
          </defs>

          {/* Mid-distance peaks with organic curves */}
          <path
            d="M0,300 L0,172
               Q40,165 80,158
               Q110,152 150,148
               Q175,143 200,138
               Q230,140 260,146
               Q290,151 320,153
               Q350,157 380,160
               Q415,163 450,166
               Q485,165 520,163
               Q555,160 590,156
               Q620,150 650,143
               Q690,140 730,136
               Q770,141 810,150
               Q845,155 880,160
               Q905,163 930,165
               Q955,162 980,158
               Q1005,154 1030,150
               Q1055,148 1080,145
               Q1105,142 1130,140
               Q1165,139 1180,138
               Q1190,137 1200,136
               L1200,300 Z"
            fill={`url(#mountain-mid-${instanceId})`}
          />

          {/* Mid-mountain depth overlays - reduced count with organic distortion */}
          <g clipPath={`url(#mountain-mid-clip-${instanceId})`} filter={`url(#mountain-mid-texture-distortion-${instanceId})`}>
            {/* Left section - key shadow */}
            <ellipse cx="175" cy="155" rx="28" ry="105" fill={`url(#mountain-mid-shadow-1-${instanceId})`}
              transform="rotate(-14 175 155)" />

            {/* Central-left - shadow and light for depth */}
            <ellipse cx="330" cy="160" rx="30" ry="108" fill={`url(#mountain-mid-shadow-2-${instanceId})`}
              transform="rotate(9 330 160)" />
            <ellipse cx="380" cy="164" rx="27" ry="103" fill={`url(#mountain-mid-light-1-${instanceId})`}
              transform="rotate(15 380 164)" />

            {/* Center valley - deep erosion patterns */}
            <ellipse cx="620" cy="156" rx="29" ry="107" fill={`url(#mountain-mid-shadow-1-${instanceId})`}
              transform="rotate(-10 620 156)" />
            <ellipse cx="660" cy="148" rx="28" ry="104" fill={`url(#mountain-mid-light-2-${instanceId})`}
              transform="rotate(8 660 148)" />

            {/* Central-right - shadow and light for depth */}
            <ellipse cx="750" cy="142" rx="30" ry="106" fill={`url(#mountain-mid-shadow-2-${instanceId})`}
              transform="rotate(12 750 142)" />
            <ellipse cx="810" cy="154" rx="27" ry="102" fill={`url(#mountain-mid-light-1-${instanceId})`}
              transform="rotate(19 810 154)" />

            {/* Right section - shadow and light for depth */}
            <ellipse cx="1010" cy="158" rx="29" ry="104" fill={`url(#mountain-mid-shadow-1-${instanceId})`}
              transform="rotate(-13 1010 158)" />
            <ellipse cx="1060" cy="150" rx="27" ry="100" fill={`url(#mountain-mid-light-2-${instanceId})`}
              transform="rotate(10 1060 150)" />

            {/* Subtle ridge highlights - top edges catch more light */}
            <path
              d="M0,172 Q40,165 80,158 Q110,152 150,148 Q175,143 200,138 Q230,140 260,146 Q290,151 320,153 Q350,157 380,160 Q415,163 450,166 Q485,165 520,163 Q555,160 590,156 Q620,150 650,143 Q690,140 730,136 Q770,141 810,150 Q845,155 880,160 Q905,163 930,165 Q955,162 980,158 Q1005,154 1030,150 Q1055,148 1080,145 Q1105,142 1130,140 Q1165,139 1180,138 Q1190,137 1200,136"
              stroke={isDawn ? 'rgba(255,240,220,0.3)' : (isDusk ? 'rgba(255,220,200,0.35)' : (isNight ? 'rgba(120,140,160,0.2)' : 'rgba(230,240,255,0.25)'))}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Organic valley/canyon shapes - deep erosion patterns */}
            <path d="M 430 175
                     Q 435 168 440 164
                     Q 445 160 450 162
                     Q 455 165 460 172
                     Q 465 180 470 190
                     Q 472 198 471 206
                     L 468 208
                     Q 465 198 460 188
                     Q 455 178 450 172
                     Q 446 168 443 172
                     Q 438 176 433 182
                     Z"
                  fill="rgba(0,0,0,0.35)"
                  opacity="0.4" />

            <path d="M 600 168
                     Q 605 160 610 155
                     Q 615 152 620 154
                     Q 625 157 630 165
                     Q 635 174 638 185
                     Q 640 193 639 201
                     L 636 203
                     Q 633 193 628 183
                     Q 623 173 618 166
                     Q 614 161 611 164
                     Q 606 168 601 175
                     Z"
                  fill={`url(#mountain-mid-shadow-1-${instanceId})`}
                  opacity="0.35" />

            <path d="M 1010 162
                     Q 1015 155 1020 151
                     Q 1024 149 1028 151
                     Q 1032 154 1036 161
                     Q 1040 169 1043 179
                     Q 1045 187 1044 195
                     L 1041 197
                     Q 1038 187 1033 177
                     Q 1028 167 1023 160
                     Q 1019 156 1016 159
                     Q 1012 163 1008 169
                     Z"
                  fill="rgba(0,0,0,0.3)"
                  opacity="0.35" />

            {/* Subtle noise texture overlay */}
            <rect x="0" y="0" width="1200" height="300"
                  fill="white"
                  filter={`url(#mountain-mid-surface-noise-${instanceId})`}
                  opacity="0.1"
                  style={{ mixBlendMode: 'overlay' }} />
          </g>
        </svg>

        {/* BACKGROUND SKYLINE - SOLID (no transparency) */}
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1350 312"
          preserveAspectRatio="xMidYMax slice"
          style={{
            opacity: isNight ? baseOpacity * 0.65 : 0.6, // More visible at night for atmospheric depth
            filter: 'blur(0.5px)'
          }}
        >
          <defs>
            <linearGradient id={`buildings-bg-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              {/* Background buildings - much darker for proper atmospheric depth */}
              <stop offset="0%" style={{
                stopColor: isDawn ? '#3d4a5f' : (isDusk ? '#2d3545' : (isNight ? '#1a2230' : '#3d4d60')),
                stopOpacity: 1.0
              }} />
              <stop offset="50%" style={{
                stopColor: isDawn ? '#434e62' : (isDusk ? '#323a48' : (isNight ? '#202835' : '#435361')),
                stopOpacity: 1.0
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn ? '#4a5566' : (isDusk ? '#38404e' : (isNight ? '#252d3a' : '#4a5868')),
                stopOpacity: 1.0
              }} />
            </linearGradient>
          </defs>

          {/* Simplified background buildings */}
       
          <rect x="210" y="265" width="32" height="35" fill={`url(#buildings-bg-${instanceId})`} />
          <rect x="221" y="245" width="10" height="20" fill={`url(#buildings-bg-${instanceId})`} />
          <polygon points="221,245 226,230 231,245" fill={`url(#buildings-bg-${instanceId})`} />

          <rect x="265" y="278" width="45" height="22" fill={`url(#buildings-bg-${instanceId})`} />
          <rect x="330" y="280" width="38" height="20" fill={`url(#buildings-bg-${instanceId})`} />

     
          <rect x="410" y="280" width="45" height="22" fill={`url(#buildings-bg-${instanceId})`} />

          <rect x="555" y="270" width="42" height="40" fill={`url(#buildings-bg-${instanceId})`} />
          <path d="M 555 270 Q 576 254 597 270" fill={`url(#buildings-bg-${instanceId})`} />

          <rect x="620" y="279" width="40" height="21" fill={`url(#buildings-bg-${instanceId})`} />
          <rect x="680" y="277" width="38" height="23" fill={`url(#buildings-bg-${instanceId})`} />

          <rect x="740" y="262" width="36" height="38" fill={`url(#buildings-bg-${instanceId})`} />
          <rect x="753" y="240" width="8" height="22" fill={`url(#buildings-bg-${instanceId})`} />
          <polygon points="753,240 757,224 761,240" fill={`url(#buildings-bg-${instanceId})`} />

          <rect x="845" y="280" width="48" height="20" fill={`url(#buildings-bg-${instanceId})`} />
          <rect x="915" y="278" width="42" height="22" fill={`url(#buildings-bg-${instanceId})`} />

          <rect x="980" y="272" width="32" height="28" fill={`url(#buildings-bg-${instanceId})`} />
          <polygon points="986,272 994,258 1002,272" fill={`url(#buildings-bg-${instanceId})`} />

          <rect x="1030" y="279" width="44" height="21" fill={`url(#buildings-bg-${instanceId})`} />
          <rect x="1090" y="281" width="38" height="19" fill={`url(#buildings-bg-${instanceId})`} />

          <rect x="1145" y="275" width="28" height="25" fill={`url(#buildings-bg-${instanceId})`} />
          <polygon points="1151,275 1159,264 1167,275" fill={`url(#buildings-bg-${instanceId})`} />
        </svg>

      

        {/* Morning mist layer (dawn 5-8 AM) - Lake Texcoco effect */}
        {isDawn && (
          <div
            className="absolute bottom-0 left-0 right-0 transition-opacity duration-[3000ms]"
            style={{
              height: '18%',
              background: `linear-gradient(to top,
                rgba(220, 230, 245, ${0.5 - (currentHour - 5) * 0.15}) 0%,
                rgba(200, 215, 235, ${0.4 - (currentHour - 5) * 0.12}) 30%,
                rgba(180, 200, 230, ${0.2 - (currentHour - 5) * 0.08}) 60%,
                transparent 100%)`,
              filter: 'blur(8px)',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
              opacity: Math.max(0, 1 - (currentHour - 5) / 3) // Fade from 1 at 5 AM to 0 at 8 AM
            }}
          />
        )}

        {/* FOREGROUND SKYLINE - SOLID (no transparency) */}
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMax slice"
          style={{ opacity: 1, pointerEvents: 'auto' }}
        >
          <defs>
            {/* Atmospheric perspective gradients - cooler (bluer) on west, warmer on east */}

            {/* Left/West buildings - cooler silhouettes */}
            <linearGradient id={`buildings-fg-left-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{
                stopColor: isDawn || isDusk
                  ? (isDusk ? '#2a3142' : '#2d3a50')
                  : (isNight ? '#1a2230' : '#2a3545'),
                stopOpacity: 1
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn || isDusk
                  ? (isDusk ? '#303848' : '#35425a')
                  : (isNight ? '#202835' : '#30404e'),
                stopOpacity: 1
              }} />
            </linearGradient>

            {/* Center buildings - neutral - SOLID */}
            <linearGradient id={`buildings-fg-center-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{
                stopColor: 'var(--sky-mountain-near, #1a202c)',
                stopOpacity: isNight ? 1.0 : 0.8
              }} />
              <stop offset="50%" style={{
                stopColor: 'var(--sky-mountain-near, #1a202c)',
                stopOpacity: isNight ? 1.0 : 0.9
              }} />
              <stop offset="100%" style={{
                stopColor: 'var(--sky-mountain-near, #1a202c)',
                stopOpacity: isNight ? 1.0 : 0.6
              }} />
            </linearGradient>

            {/* Right/East buildings - warmer tint - SOLID */}
            <linearGradient id={`buildings-fg-right-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{
                stopColor: isDawn || isDusk
                  ? (isDusk ? '#2d2628' : '#322a2d')
                  : (isNight ? '#1c181c' : '#1e1c20'),
                stopOpacity: isNight ? 1.0 : 0.9
              }} />
              <stop offset="80%" style={{
                stopColor: isDawn || isDusk
                  ? (isDusk ? '#30282a' : '#34282f')
                  : (isNight ? '#1e1a1e' : '#201e22'),
                stopOpacity: isNight ? 1.0 : 0.7
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn || isDusk
                  ? (isDusk ? '#372d30' : '#3a3033')
                  : (isNight ? '#221e22' : '#242226'),
                stopOpacity: isNight ? 1.0 : 0.6
              }} />
            </linearGradient>

            {/* Street/Ground gradient - cobblestone surface with subtle depth */}
            <linearGradient id={`street-gradient-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{
                stopColor: isDawn || isDusk
                  ? (isDusk ? '#2a2218' : '#302820')
                  : (isNight ? '#151210' : '#1a1815'),
                stopOpacity: 0.85
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn || isDusk
                  ? (isDusk ? '#1e1810' : '#241c15')
                  : (isNight ? '#0f0c0a' : '#14110e'),
                stopOpacity: 0.95
              }} />
            </linearGradient>
          </defs>

          {/* Residential building cluster - LEFT */}
          <rect x="15" y="283" width="28" height="17" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="20" y="287" width="4" height="5" fill="rgba(255,255,255,0.05)" />
          <rect x="32" y="287" width="4" height="5" fill="rgba(255,255,255,0.05)" />
          <rect x="26" y="290" width="5" height="10" fill="rgba(0,0,0,0.15)" />

          {/* Varied roof heights - stepped building */}
          <rect x="48" y="277" width="15" height="23" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="63" y="275" width="20" height="25" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Roof tiles detail */}
          <rect x="48" y="275" width="15" height="2" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="63" y="273" width="20" height="2" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Balcony with railing */}
          <rect x="51" y="282" width="10" height="1" fill="rgba(255,255,255,0.08)" />
          <line x1="51" y1="283" x2="51" y2="285" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="54" y1="283" x2="54" y2="285" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="57" y1="283" x2="57" y2="285" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="60" y1="283" x2="60" y2="285" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Windows */}
          <rect x="53" y="279" width="3" height="4" fill="rgba(255,255,255,0.06)" />
          <rect x="67" y="279" width="3" height="4" fill="rgba(255,255,255,0.06)" />
          <rect x="75" y="279" width="3" height="4" fill="rgba(255,255,255,0.06)" />
          <rect x="53" y="287" width="3" height="5" fill="rgba(255,255,255,0.05)" />
          <rect x="69" y="287" width="3" height="5" fill="rgba(255,255,255,0.05)" />
          {/* Cornice detail */}
          <rect x="48" y="285" width="35" height="1" fill="rgba(255,255,255,0.08)" />
          <rect x="79" y="270" width="4" height="5" fill={`url(#buildings-fg-left-${instanceId})`} id="chimney-1" />

          {/* METROPOLITAN CATHEDRAL - Major landmark with octagonal towers */}
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onMouseEnter={(e) => handleBuildingHover('cathedral', e)}
            onMouseLeave={handleBuildingLeave}
          >
          {/* Visual elements - wrapped in group with no pointer events */}
          <g style={{ pointerEvents: 'none' }}>
          <rect x="92" y="238" width="95" height="62" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Daytime roof highlight - sun-facing edge */}
          {!isNight && (
            <line x1="92" y1="238" x2="92" y2="300" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          )}

          {/* Statue silhouettes along roofline - baroque saints */}
          <rect x="98" y="236" width="2" height="3" fill="rgba(0,0,0,0.5)" />
          <ellipse cx="99" cy="235.5" rx="1" ry="1.2" fill="rgba(0,0,0,0.5)" />
          <rect x="118" y="236" width="2" height="3" fill="rgba(0,0,0,0.5)" />
          <ellipse cx="119" cy="235.5" rx="1" ry="1.2" fill="rgba(0,0,0,0.5)" />
          <rect x="139" y="236" width="2" height="3" fill="rgba(0,0,0,0.5)" />
          <ellipse cx="140" cy="235.5" rx="1" ry="1.2" fill="rgba(0,0,0,0.5)" />
          <rect x="159" y="236" width="2" height="3" fill="rgba(0,0,0,0.5)" />
          <ellipse cx="160" cy="235.5" rx="1" ry="1.2" fill="rgba(0,0,0,0.5)" />
          <rect x="177" y="236" width="2" height="3" fill="rgba(0,0,0,0.5)" />
          <ellipse cx="178" cy="235.5" rx="1" ry="1.2" fill="rgba(0,0,0,0.5)" />

          {/* Left tower - colonial Mexican baroque bell tower with proper cupola */}
          {/* Main rectangular bell chamber - TALLER */}
          <rect x="98" y="205" width="24" height="33" fill={`url(#buildings-fg-left-${instanceId})`} />

          {/* Large arched bell openings - BIGGER */}
          {/* Left bell opening - arched window showing sky */}
          <path d="M 102 218 L 102 227 Q 106 229 110 227 L 110 218 Q 106 215 102 218 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.35)' : (isDusk ? 'rgba(255, 150, 100, 0.35)' : (isNight ? 'rgba(50, 60, 80, 0.4)' : 'rgba(150, 180, 210, 0.35)'))} />
          {/* Stone archway frame */}
          <path d="M 102 218 L 102 227 Q 106 229 110 227 L 110 218 Q 106 215 102 218 Z"
                fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />

          {/* Right bell opening - arched window showing sky */}
          <path d="M 112 218 L 112 227 Q 116 229 120 227 L 120 218 Q 116 215 112 218 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.35)' : (isDusk ? 'rgba(255, 150, 100, 0.35)' : (isNight ? 'rgba(50, 60, 80, 0.4)' : 'rgba(150, 180, 210, 0.35)'))} />
          {/* Stone archway frame */}
          <path d="M 112 218 L 112 227 Q 116 229 120 227 L 120 218 Q 116 215 112 218 Z"
                fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />

          {/* Bell-shaped silhouettes - wider at bottom, proper bell shape - WITH DRAMATIC SWINGING ANIMATION */}
          {/* Left bell - animated swing */}
          <g>
            <path d="M 104 221 Q 103 224 103.5 225.5 L 108.5 225.5 Q 109 224 108 221 Q 106 220 104 221 Z"
                  fill="rgba(0,0,0,0.7)">
              <animateTransform attributeName="transform" type="rotate"
                values="0 106 220; -12 106 220; 12 106 220; -12 106 220; 0 106 220"
                dur="3s" repeatCount="indefinite" />
            </path>
            <line x1="106" y1="220" x2="106" y2="219" stroke="rgba(0,0,0,0.6)" strokeWidth="0.6" />
            {/* Bell clapper - swings opposite to bell */}
            <line x1="106" y1="224" x2="106" y2="225.5" stroke="rgba(0,0,0,0.5)" strokeWidth="0.4">
              <animateTransform attributeName="transform" type="rotate"
                values="0 106 224; 15 106 224; -15 106 224; 15 106 224; 0 106 224"
                dur="3s" repeatCount="indefinite" />
            </line>
            <circle cx="106" cy="225.5" r="0.4" fill="rgba(0,0,0,0.5)">
              <animateTransform attributeName="transform" type="rotate"
                values="0 106 224; 15 106 224; -15 106 224; 15 106 224; 0 106 224"
                dur="3s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Right bell - animated swing (slightly offset timing) */}
          <g>
            <path d="M 114 221 Q 113 224 113.5 225.5 L 118.5 225.5 Q 119 224 118 221 Q 116 220 114 221 Z"
                  fill="rgba(0,0,0,0.7)">
              <animateTransform attributeName="transform" type="rotate"
                values="0 116 220; 12 116 220; -12 116 220; 12 116 220; 0 116 220"
                dur="3.2s" begin="0.3s" repeatCount="indefinite" />
            </path>
            <line x1="116" y1="220" x2="116" y2="219" stroke="rgba(0,0,0,0.6)" strokeWidth="0.6" />
            {/* Bell clapper - swings opposite to bell */}
            <line x1="116" y1="224" x2="116" y2="225.5" stroke="rgba(0,0,0,0.5)" strokeWidth="0.4">
              <animateTransform attributeName="transform" type="rotate"
                values="0 116 224; -15 116 224; 15 116 224; -15 116 224; 0 116 224"
                dur="3.2s" begin="0.3s" repeatCount="indefinite" />
            </line>
            <circle cx="116" cy="225.5" r="0.4" fill="rgba(0,0,0,0.5)">
              <animateTransform attributeName="transform" type="rotate"
                values="0 116 224; -15 116 224; 15 116 224; -15 116 224; 0 116 224"
                dur="3.2s" begin="0.3s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Decorative column between openings */}
          <rect x="110.5" y="218" width="1" height="10" fill="rgba(0,0,0,0.3)" />

          {/* Balustrade on bell chamber ledge */}
          <rect x="98" y="204" width="24" height="0.8" fill="rgba(0,0,0,0.25)" />
          {/* Baluster posts */}
          <rect x="100" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="103" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="106" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="109" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="112" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="115" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="118" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="121" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />

          {/* Multi-tiered transition section above bell chamber */}
          {/* First tier - slightly narrower */}
          <rect x="101" y="201" width="18" height="3" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="100.5" y="200.8" width="19" height="0.4" fill="rgba(255,255,255,0.08)" />
          {/* Second tier - narrower still */}
          <rect x="103" y="198" width="14" height="3" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="102.5" y="197.8" width="15" height="0.4" fill="rgba(255,255,255,0.06)" />

          {/* Small balustrade on transition ledge */}
          <rect x="103" y="197.5" width="14" height="0.5" fill="rgba(0,0,0,0.2)" />
          <rect x="104" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="106" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="108" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="111" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="113" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="115" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />

          {/* Bell-shaped dome (cupola) - characteristic Mexican baroque */}
          <ellipse cx="110" cy="194" rx="7" ry="4" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Dome highlights and shading */}
          <ellipse cx="110" cy="193.5" rx="6.5" ry="3.5" fill="rgba(255,255,255,0.04)" />
          <path d="M 103 194 Q 110 190 117 194" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          <path d="M 104 195 Q 110 191.5 116 195" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.4" />

          {/* Spherical ball (orb) on top of dome */}
          <circle cx="110" cy="189.5" r="1.8" fill={`url(#buildings-fg-left-${instanceId})`} />
          <circle cx="110" cy="189.2" r="1.5" fill="rgba(255,255,255,0.06)" />
          <circle cx="110.3" cy="189" r="0.5" fill="rgba(255,255,255,0.12)" />

          {/* Elaborate multi-tiered cross pedestal - on top of ball */}
          {/* Bottom tier */}
          <rect x="108" y="187.5" width="4" height="1.2" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="108" y="187.5" width="4" height="0.25" fill="rgba(255,255,255,0.1)" />
          {/* Second tier */}
          <rect x="108.3" y="186.3" width="3.4" height="1.2" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="108.3" y="186.3" width="3.4" height="0.25" fill="rgba(255,255,255,0.08)" />
          {/* Third tier */}
          <rect x="108.6" y="185.1" width="2.8" height="1.2" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="108.6" y="185.1" width="2.8" height="0.25" fill="rgba(255,255,255,0.06)" />
          {/* Top tier with finials */}
          <rect x="108.9" y="184" width="2.2" height="1.1" fill={`url(#buildings-fg-left-${instanceId})`} />
          <circle cx="108.9" cy="184.2" r="0.35" fill="rgba(0,0,0,0.3)" />
          <circle cx="111.1" cy="184.2" r="0.35" fill="rgba(0,0,0,0.3)" />

          {/* Cross - larger and proportional */}
          <rect x="109.3" y="179" width="1.4" height="5.5" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="107.5" y="181.5" width="5" height="1.4" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Right tower - matching colonial Mexican baroque bell tower with proper cupola */}
          {/* Main rectangular bell chamber - TALLER */}
          <rect x="157" y="205" width="24" height="33" fill={`url(#buildings-fg-left-${instanceId})`} />

          {/* Large arched bell openings - BIGGER */}
          {/* Left bell opening - arched window showing sky */}
          <path d="M 161 218 L 161 227 Q 165 229 169 227 L 169 218 Q 165 215 161 218 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.35)' : (isDusk ? 'rgba(255, 150, 100, 0.35)' : (isNight ? 'rgba(50, 60, 80, 0.4)' : 'rgba(150, 180, 210, 0.35)'))} />
          {/* Stone archway frame */}
          <path d="M 161 218 L 161 227 Q 165 229 169 227 L 169 218 Q 165 215 161 218 Z"
                fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />

          {/* Right bell opening - arched window showing sky */}
          <path d="M 171 218 L 171 227 Q 175 229 179 227 L 179 218 Q 175 215 171 218 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.35)' : (isDusk ? 'rgba(255, 150, 100, 0.35)' : (isNight ? 'rgba(50, 60, 80, 0.4)' : 'rgba(150, 180, 210, 0.35)'))} />
          {/* Stone archway frame */}
          <path d="M 171 218 L 171 227 Q 175 229 179 227 L 179 218 Q 175 215 171 218 Z"
                fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />

          {/* Bell-shaped silhouettes - wider at bottom, proper bell shape - WITH DRAMATIC SWINGING ANIMATION */}
          {/* Left bell - animated swing */}
          <g>
            <path d="M 163 221 Q 162 224 162.5 225.5 L 167.5 225.5 Q 168 224 167 221 Q 165 220 163 221 Z"
                  fill="rgba(0,0,0,0.7)">
              <animateTransform attributeName="transform" type="rotate"
                values="0 165 220; -12 165 220; 12 165 220; -12 165 220; 0 165 220"
                dur="3.1s" begin="0.6s" repeatCount="indefinite" />
            </path>
            <line x1="165" y1="220" x2="165" y2="219" stroke="rgba(0,0,0,0.6)" strokeWidth="0.6" />
            {/* Bell clapper - swings opposite to bell */}
            <line x1="165" y1="224" x2="165" y2="225.5" stroke="rgba(0,0,0,0.5)" strokeWidth="0.4">
              <animateTransform attributeName="transform" type="rotate"
                values="0 165 224; 15 165 224; -15 165 224; 15 165 224; 0 165 224"
                dur="3.1s" begin="0.6s" repeatCount="indefinite" />
            </line>
            <circle cx="165" cy="225.5" r="0.4" fill="rgba(0,0,0,0.5)">
              <animateTransform attributeName="transform" type="rotate"
                values="0 165 224; 15 165 224; -15 165 224; 15 165 224; 0 165 224"
                dur="3.1s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Right bell - animated swing (different timing) */}
          <g>
            <path d="M 173 221 Q 172 224 172.5 225.5 L 177.5 225.5 Q 178 224 177 221 Q 175 220 173 221 Z"
                  fill="rgba(0,0,0,0.7)">
              <animateTransform attributeName="transform" type="rotate"
                values="0 175 220; 12 175 220; -12 175 220; 12 175 220; 0 175 220"
                dur="3.3s" begin="0.9s" repeatCount="indefinite" />
            </path>
            <line x1="175" y1="220" x2="175" y2="219" stroke="rgba(0,0,0,0.6)" strokeWidth="0.6" />
            {/* Bell clapper - swings opposite to bell */}
            <line x1="175" y1="224" x2="175" y2="225.5" stroke="rgba(0,0,0,0.5)" strokeWidth="0.4">
              <animateTransform attributeName="transform" type="rotate"
                values="0 175 224; -15 175 224; 15 175 224; -15 175 224; 0 175 224"
                dur="3.3s" begin="0.9s" repeatCount="indefinite" />
            </line>
            <circle cx="175" cy="225.5" r="0.4" fill="rgba(0,0,0,0.5)">
              <animateTransform attributeName="transform" type="rotate"
                values="0 175 224; -15 175 224; 15 175 224; -15 175 224; 0 175 224"
                dur="3.3s" begin="0.9s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Decorative column between openings */}
          <rect x="169.5" y="218" width="1" height="10" fill="rgba(0,0,0,0.3)" />

          {/* Balustrade on bell chamber ledge */}
          <rect x="157" y="204" width="24" height="0.8" fill="rgba(0,0,0,0.25)" />
          {/* Baluster posts */}
          <rect x="159" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="162" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="165" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="168" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="171" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="174" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="177" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />
          <rect x="180" y="204.8" width="1" height="1.5" fill="rgba(0,0,0,0.2)" />

          {/* Multi-tiered transition section above bell chamber */}
          {/* First tier - slightly narrower */}
          <rect x="160" y="201" width="18" height="3" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="159.5" y="200.8" width="19" height="0.4" fill="rgba(255,255,255,0.08)" />
          {/* Second tier - narrower still */}
          <rect x="162" y="198" width="14" height="3" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="161.5" y="197.8" width="15" height="0.4" fill="rgba(255,255,255,0.06)" />

          {/* Small balustrade on transition ledge */}
          <rect x="162" y="197.5" width="14" height="0.5" fill="rgba(0,0,0,0.2)" />
          <rect x="163" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="165" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="167" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="170" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="172" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />
          <rect x="174" y="198" width="0.8" height="0.8" fill="rgba(0,0,0,0.15)" />

          {/* Bell-shaped dome (cupola) - characteristic Mexican baroque */}
          <ellipse cx="169" cy="194" rx="7" ry="4" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Dome highlights and shading */}
          <ellipse cx="169" cy="193.5" rx="6.5" ry="3.5" fill="rgba(255,255,255,0.04)" />
          <path d="M 162 194 Q 169 190 176 194" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          <path d="M 163 195 Q 169 191.5 175 195" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.4" />

          {/* Spherical ball (orb) on top of dome */}
          <circle cx="169" cy="189.5" r="1.8" fill={`url(#buildings-fg-left-${instanceId})`} />
          <circle cx="169" cy="189.2" r="1.5" fill="rgba(255,255,255,0.06)" />
          <circle cx="169.3" cy="189" r="0.5" fill="rgba(255,255,255,0.12)" />

          {/* Elaborate multi-tiered cross pedestal - on top of ball */}
          {/* Bottom tier */}
          <rect x="167" y="187.5" width="4" height="1.2" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="167" y="187.5" width="4" height="0.25" fill="rgba(255,255,255,0.1)" />
          {/* Second tier */}
          <rect x="167.3" y="186.3" width="3.4" height="1.2" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="167.3" y="186.3" width="3.4" height="0.25" fill="rgba(255,255,255,0.08)" />
          {/* Third tier */}
          <rect x="167.6" y="185.1" width="2.8" height="1.2" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="167.6" y="185.1" width="2.8" height="0.25" fill="rgba(255,255,255,0.06)" />
          {/* Top tier with finials */}
          <rect x="167.9" y="184" width="2.2" height="1.1" fill={`url(#buildings-fg-left-${instanceId})`} />
          <circle cx="167.9" cy="184.2" r="0.35" fill="rgba(0,0,0,0.3)" />
          <circle cx="170.1" cy="184.2" r="0.35" fill="rgba(0,0,0,0.3)" />

          {/* Cross - larger and proportional */}
          <rect x="168.3" y="179" width="1.4" height="5.5" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="166.5" y="181.5" width="5" height="1.4" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Large rose window - center of facade - shows sky through it */}
          <circle cx="140" cy="250" r="8" fill={isDawn ? 'rgba(255, 200, 150, 0.25)' : (isDusk ? 'rgba(255, 150, 100, 0.25)' : (isNight ? 'rgba(50, 60, 80, 0.3)' : 'rgba(150, 180, 210, 0.25)'))} />
          {/* Rose window tracery - decorative stone divisions */}
        
          
          <circle cx="140" cy="250" r="4" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />
          <circle cx="140" cy="250" r="2" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
          {/* Outer frame */}
          <circle cx="140" cy="250" r="8" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
          {/* Side windows */}
          <rect x="107" y="250" width="5" height="8" fill="rgba(255,255,255,0.04)" />
          <rect x="145" y="250" width="5" height="8" fill="rgba(255,255,255,0.04)" />
          <rect x="115" y="260" width="4" height="7" fill="rgba(0,0,0,0.12)" />
          <rect x="158" y="260" width="4" height="7" fill="rgba(0,0,0,0.12)" />
          {/* Grand cathedral entrance - tall arched doorway */}
          {/* Main doorway body */}
          <rect x="122" y="270" width="34" height="30" fill="rgba(0,0,0,0.25)" />
          {/* Rounded arch top */}
          <path d="M 122 270 Q 139 250 156 270" fill="rgba(0,0,0,0.25)" />
          {/* Arch outline/frame */}
          <path d="M 122 270 Q 139 250 156 270" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
          {/* Vertical frame sides */}
          <rect x="121" y="270" width="1.5" height="30" fill="rgba(0,0,0,0.35)" />
          <rect x="155.5" y="270" width="1.5" height="30" fill="rgba(0,0,0,0.35)" />
          {/* Double door split in center */}
          <line x1="139" y1="270" x2="139" y2="300" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
          {/* Door decorative panels */}
          <rect x="126" y="275" width="10" height="12" fill="rgba(0,0,0,0.15)" />
          <rect x="142" y="275" width="10" height="12" fill="rgba(0,0,0,0.15)" />
          {/* Inner arch detail - tympanum */}
          <path d="M 126 268 Q 139 258 152 268" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
          {/* Thick colonial Mexican buttresses (not Gothic flying buttresses) */}
          <rect x="97" y="238" width="3" height="62" fill="rgba(0,0,0,0.15)" />
          <rect x="119" y="238" width="3" height="62" fill="rgba(0,0,0,0.15)" />
          <rect x="139" y="238" width="3" height="62" fill="rgba(0,0,0,0.15)" />
          <rect x="179" y="238" width="3" height="62" fill="rgba(0,0,0,0.15)" />
          {/* Buttress cap moldings - characteristic of colonial Mexican architecture */}
          <rect x="96.5" y="238" width="4" height="1" fill="rgba(0,0,0,0.2)" />
          <rect x="118.5" y="238" width="4" height="1" fill="rgba(0,0,0,0.2)" />
          <rect x="138.5" y="238" width="4" height="1" fill="rgba(0,0,0,0.2)" />
          <rect x="178.5" y="238" width="4" height="1" fill="rgba(0,0,0,0.2)" />

          {/* Stone quoins - alternating large/small corner stones - LEFT CORNER */}
          <rect x="92" y="238" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="92" y="244" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="92" y="248" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="92" y="254" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="92" y="258" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="92" y="264" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="92" y="268" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="92" y="274" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="92" y="278" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="92" y="284" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="92" y="288" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="92" y="294" width="2.5" height="6" fill="rgba(0,0,0,0.18)" />

          {/* Stone quoins - RIGHT CORNER */}
          <rect x="185" y="238" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="185" y="244" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="185" y="248" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="185" y="254" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="185" y="258" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="185" y="264" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="185" y="268" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="185" y="274" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="185" y="278" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="185" y="284" width="2.5" height="4" fill="rgba(0,0,0,0.18)" />
          <rect x="185" y="288" width="2.5" height="6" fill="rgba(0,0,0,0.25)" />
          <rect x="185" y="294" width="2.5" height="6" fill="rgba(0,0,0,0.18)" />
          </g>
          {/* Invisible hover area covering entire building including taller towers with cupolas - painted LAST to be on top */}
          <rect x="92" y="175" width="95" height="125" fill="transparent" style={{ pointerEvents: 'auto' }} />
          </g>

          {/* ATRIAL CROSS MONUMENT - Cruz Atrial in front of cathedral */}
          {/* Third tier (widest base) */}
          <rect x="136" y="303" width="6" height="1.2" fill="rgba(0,0,0,0.4)" />
          <rect x="136.3" y="303.3" width="5.4" height="0.6" fill="rgba(80,70,60,0.3)" />
          {/* Second tier */}
          <rect x="137" y="301.8" width="4" height="1.2" fill="rgba(0,0,0,0.38)" />
          <rect x="137.3" y="302.1" width="3.4" height="0.6" fill="rgba(90,80,70,0.25)" />
          {/* First tier (narrowest) */}
          <rect x="137.5" y="300.6" width="3" height="1.2" fill="rgba(0,0,0,0.36)" />
          <rect x="137.8" y="300.9" width="2.4" height="0.6" fill="rgba(100,90,80,0.25)" />
          {/* Cross shaft */}
          <rect x="138.4" y="295" width="1.2" height="6" fill="rgba(0,0,0,0.65)" />
          {/* Cross arms */}
          <rect x="136.8" y="296.5" width="4.4" height="1.2" fill="rgba(0,0,0,0.65)" />
          {/* Stone texture highlights */}
          <line x1="136.5" y1="303.5" x2="141.5" y2="303.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
          <line x1="137.5" y1="302.3" x2="140.5" y2="302.3" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />

          {/* HANGING STREET LAMP - Cathedral entrance */}
          <g>
            {/* Wrought iron bracket */}
            <line x1="125" y1="268" x2="128" y2="268" stroke="rgba(0,0,0,0.7)" strokeWidth="0.6" />
            <line x1="128" y1="268" x2="128" y2="271" stroke="rgba(0,0,0,0.7)" strokeWidth="0.5" />
            {/* Lantern body with sway animation */}
            <g>
              <rect x="126.5" y="271" width="3" height="4" fill="rgba(0,0,0,0.6)" />
              <rect x="127" y="271.5" width="2" height="3" fill="rgba(80,60,40,0.4)" />
              {/* Night glow effect */}
              {isNight && (
                <>
                  <rect x="127" y="271.5" width="2" height="3" fill="rgba(255,210,120,0.6)" />
                  <ellipse cx="128" cy="273" rx="3" ry="3" fill="rgba(255,210,120,0.15)" opacity="0.8" />
                </>
              )}
              {/* Wind sway animation */}
              <animateTransform attributeName="transform" type="translate"
                values="0,0; ${windDriftX * 0.15},0.3; 0,0; ${-windDriftX * 0.15},-0.3; 0,0"
                dur="4s" repeatCount="indefinite" />
            </g>
          </g>

          {/* Small residential near cathedral */}
          <rect x="192" y="284" width="26" height="16" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="198" y="288" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="208" y="288" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="203" y="290" width="4" height="10" fill="rgba(0,0,0,0.15)" />
          <rect x="210" y="280" width="4" height="4" fill={`url(#buildings-fg-left-${instanceId})`} id="chimney-2" />

          {/* CHURCH OF SAN HIPÓLITO - Twin baroque towers */}
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onMouseEnter={(e) => handleBuildingHover('churchTower', e)}
            onMouseLeave={handleBuildingLeave}
          >
          {/* Visual elements - wrapped in group with no pointer events */}
          <g style={{ pointerEvents: 'none' }}>
          {/* Main church body */}
          <rect x="225" y="260" width="42" height="40" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Daytime roof highlight - sun-facing edge */}
          {!isNight && (
            <line x1="225" y1="260" x2="225" y2="300" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          )}

          {/* LEFT BELL TOWER */}
          <rect x="227" y="235" width="13" height="25" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Bell chamber openings */}
          <path d="M 230 245 Q 232 242 234 245 L 234 250 L 230 250 Z" fill="rgba(0,0,0,0.3)" />
          <path d="M 235 245 Q 237 242 239 245 L 239 250 L 235 250 Z" fill="rgba(0,0,0,0.3)" />
          {/* Visible bells */}
          <ellipse cx="232" cy="247" rx="1.2" ry="1.5" fill="rgba(0,0,0,0.6)" />
          <ellipse cx="237" cy="247" rx="1.2" ry="1.5" fill="rgba(0,0,0,0.6)" />
          {/* Baroque dome cap on left tower */}
          <ellipse cx="233.5" cy="233" rx="7" ry="3.5" fill={`url(#buildings-fg-left-${instanceId})`} />
          <path d="M 227 233 Q 233.5 230 240 233" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          {/* Ornamental ball */}
          <circle cx="233.5" cy="229.5" r="1.5" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Cross on left tower */}
          <rect x="233" y="225" width="1" height="5" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="231.5" y="227" width="4" height="1" fill={`url(#buildings-fg-left-${instanceId})`} />

          {/* RIGHT BELL TOWER */}
          <rect x="252" y="235" width="13" height="25" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Bell chamber openings */}
          <path d="M 255 245 Q 257 242 259 245 L 259 250 L 255 250 Z" fill="rgba(0,0,0,0.3)" />
          <path d="M 260 245 Q 262 242 264 245 L 264 250 L 260 250 Z" fill="rgba(0,0,0,0.3)" />
          {/* Visible bells */}
          <ellipse cx="257" cy="247" rx="1.2" ry="1.5" fill="rgba(0,0,0,0.6)" />
          <ellipse cx="262" cy="247" rx="1.2" ry="1.5" fill="rgba(0,0,0,0.6)" />
          {/* Baroque dome cap on right tower */}
          <ellipse cx="258.5" cy="233" rx="7" ry="3.5" fill={`url(#buildings-fg-left-${instanceId})`} />
          <path d="M 252 233 Q 258.5 230 265 233" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          {/* Ornamental ball */}
          <circle cx="258.5" cy="229.5" r="1.5" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Cross on right tower */}
          <rect x="258" y="225" width="1" height="5" fill={`url(#buildings-fg-left-${instanceId})`} />
          <rect x="256.5" y="227" width="4" height="1" fill={`url(#buildings-fg-left-${instanceId})`} />

          {/* Central baroque facade between towers */}
          <rect x="240" y="250" width="12" height="10" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Baroque pediment ornament */}
          <path d="M 240 250 Q 246 247 252 250" fill={`url(#buildings-fg-left-${instanceId})`} />
          <circle cx="246" cy="246" r="1.8" fill="rgba(0,0,0,0.3)" />

          {/* Main entrance archway */}
          <path d="M 238 270 Q 246 262 254 270 L 254 285 L 238 285 Z" fill="rgba(0,0,0,0.18)" />
          <path d="M 238 270 Q 246 262 254 270" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />

          {/* Baroque window above entrance */}
          <circle cx="246" cy="267" r="3.5" fill="rgba(0,0,0,0.15)" />
          <line x1="246" y1="263.5" x2="246" y2="270.5" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          <line x1="242.5" y1="267" x2="249.5" y2="267" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />

          {/* Stone quoins on left corner */}
          <rect x="225" y="260" width="2" height="5" fill="rgba(0,0,0,0.22)" />
          <rect x="225" y="265" width="2" height="3.5" fill="rgba(0,0,0,0.16)" />
          <rect x="225" y="268.5" width="2" height="5" fill="rgba(0,0,0,0.22)" />
          <rect x="225" y="273.5" width="2" height="3.5" fill="rgba(0,0,0,0.16)" />
          <rect x="225" y="277" width="2" height="5" fill="rgba(0,0,0,0.22)" />
          <rect x="225" y="282" width="2" height="3.5" fill="rgba(0,0,0,0.16)" />
          <rect x="225" y="285.5" width="2" height="5" fill="rgba(0,0,0,0.22)" />
          <rect x="225" y="290.5" width="2" height="4.5" fill="rgba(0,0,0,0.16)" />

          {/* Stone quoins on right corner */}
          <rect x="265" y="260" width="2" height="5" fill="rgba(0,0,0,0.22)" />
          <rect x="265" y="265" width="2" height="3.5" fill="rgba(0,0,0,0.16)" />
          <rect x="265" y="268.5" width="2" height="5" fill="rgba(0,0,0,0.22)" />
          <rect x="265" y="273.5" width="2" height="3.5" fill="rgba(0,0,0,0.16)" />
          <rect x="265" y="277" width="2" height="5" fill="rgba(0,0,0,0.22)" />
          <rect x="265" y="282" width="2" height="3.5" fill="rgba(0,0,0,0.16)" />
          <rect x="265" y="285.5" width="2" height="5" fill="rgba(0,0,0,0.22)" />
          <rect x="265" y="290.5" width="2" height="4.5" fill="rgba(0,0,0,0.16)" />
          </g>
          {/* Invisible hover area covering entire building - ONLY this receives pointer events */}
          <rect x="225" y="225" width="42" height="75" fill="transparent" style={{ pointerEvents: 'auto' }} />
          </g>

          {/* EL CONSULADO DE MERCADERES - Merchant's guild headquarters */}
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onMouseEnter={(e) => handleBuildingHover('consulado', e)}
            onMouseLeave={handleBuildingLeave}
          >
          <g style={{ pointerEvents: 'none' }}>
          {/* Main building body - 2 stories */}
          <rect x="273" y="258" width="60" height="42" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Daytime roof highlight - sun-facing edge */}
          {!isNight && (
            <line x1="273" y1="258" x2="273" y2="300" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          )}

          {/* GROUND FLOOR ARCADE - Series of arches */}
          <path d="M 278 285 Q 283 280 288 285 L 288 300 L 278 300 Z" fill="rgba(0,0,0,0.2)" />
          <path d="M 278 285 Q 283 280 288 285" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />

          <path d="M 291 285 Q 296 280 301 285 L 301 300 L 291 300 Z" fill="rgba(0,0,0,0.2)" />
          <path d="M 291 285 Q 296 280 301 285" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />

          <path d="M 304 285 Q 309 280 314 285 L 314 300 L 304 300 Z" fill="rgba(0,0,0,0.2)" />
          <path d="M 304 285 Q 309 280 314 285" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />

          <path d="M 317 285 Q 322 280 327 285 L 327 300 L 317 300 Z" fill="rgba(0,0,0,0.2)" />
          <path d="M 317 285 Q 322 280 327 285" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />

          {/* SECOND FLOOR - Balconied windows */}
          {/* Left window with balcony */}
          <rect x="280" y="266" width="8" height="10" fill="rgba(0,0,0,0.12)" />
          <path d="M 280 266 Q 284 264 288 266" fill="rgba(0,0,0,0.08)" />
          <rect x="280" y="275" width="8" height="1.5" fill="rgba(255,255,255,0.1)" />
          <line x1="280" y1="276.5" x2="280" y2="278" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="284" y1="276.5" x2="284" y2="278" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="288" y1="276.5" x2="288" y2="278" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* Center window with balcony */}
          <rect x="298" y="266" width="8" height="10" fill="rgba(0,0,0,0.12)" />
          <path d="M 298 266 Q 302 264 306 266" fill="rgba(0,0,0,0.08)" />
          <rect x="298" y="275" width="8" height="1.5" fill="rgba(255,255,255,0.1)" />
          <line x1="298" y1="276.5" x2="298" y2="278" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="302" y1="276.5" x2="302" y2="278" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="306" y1="276.5" x2="306" y2="278" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* Right window with balcony */}
          <rect x="316" y="266" width="8" height="10" fill="rgba(0,0,0,0.12)" />
          <path d="M 316 266 Q 320 264 324 266" fill="rgba(0,0,0,0.08)" />
          <rect x="316" y="275" width="8" height="1.5" fill="rgba(255,255,255,0.1)" />
          <line x1="316" y1="276.5" x2="316" y2="278" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="320" y1="276.5" x2="320" y2="278" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="324" y1="276.5" x2="324" y2="278" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* CORNER TOWER - Right side landmark */}
          <rect x="328" y="245" width="10" height="55" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Tower window */}
          <rect x="330" y="260" width="6" height="8" fill="rgba(0,0,0,0.12)" />
          <path d="M 330 260 Q 333 258 336 260" fill="rgba(0,0,0,0.08)" />
          {/* Tower cupola */}
          <path d="M 328 245 Q 333 238 338 245" fill={`url(#buildings-fg-left-${instanceId})`} />
          <circle cx="333" cy="237" r="1.2" fill="rgba(0,0,0,0.4)" />
          <rect x="332.5" y="235" width="1" height="2.5" fill="rgba(0,0,0,0.5)" />

          {/* STONE QUOINS on left corner */}
          <rect x="273" y="260" width="2" height="4" fill="rgba(0,0,0,0.2)" />
          <rect x="273" y="264" width="2" height="3" fill="rgba(0,0,0,0.15)" />
          <rect x="273" y="267" width="2" height="4" fill="rgba(0,0,0,0.2)" />
          <rect x="273" y="271" width="2" height="3" fill="rgba(0,0,0,0.15)" />
          <rect x="273" y="274" width="2" height="4" fill="rgba(0,0,0,0.2)" />
          <rect x="273" y="278" width="2" height="3" fill="rgba(0,0,0,0.15)" />

          {/* Cornice at roofline */}
          <rect x="273" y="256" width="60" height="2" fill="rgba(255,255,255,0.12)" />

          {/* Chimney on main building */}
          <rect x="290" y="252" width="4" height="6" fill={`url(#buildings-fg-left-${instanceId})`} id="chimney-3" />
          </g>
          {/* Invisible hover area covering entire building */}
          <rect x="273" y="235" width="65" height="65" fill="transparent" style={{ pointerEvents: 'auto' }} />
          </g>


          {/* ADMINISTRATIVE BUILDING - Viceregal Palace */}
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onMouseEnter={(e) => handleBuildingHover('palace', e)}
            onMouseLeave={handleBuildingLeave}
          >
          <g style={{ pointerEvents: 'none' }}>
          <rect x="340" y="268" width="65" height="32" fill={`url(#buildings-fg-left-${instanceId})`} />
          {/* Daytime roof highlight - sun-facing edge */}
          {!isNight && (
            <line x1="340" y1="268" x2="340" y2="300" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          )}

          {/* Arched windows */}
          <path d="M 348 284 Q 350 282 352 284" fill="rgba(0,0,0,0.1)" />
          <path d="M 358 284 Q 360 282 362 284" fill="rgba(0,0,0,0.1)" />
          <path d="M 368 284 Q 370 282 372 284" fill="rgba(0,0,0,0.1)" />
          <path d="M 378 284 Q 380 282 382 284" fill="rgba(0,0,0,0.1)" />
          <path d="M 388 284 Q 390 282 392 284" fill="rgba(0,0,0,0.1)" />
          <rect x="350" y="273" width="4" height="6" fill="rgba(255,255,255,0.05)" />
          <rect x="365" y="273" width="4" height="6" fill="rgba(255,255,255,0.05)" />
          <rect x="380" y="273" width="4" height="6" fill="rgba(255,255,255,0.05)" />
          <rect x="395" y="273" width="4" height="6" fill="rgba(255,255,255,0.05)" />

          {/* Decorative cornice */}
          <rect x="340" y="266" width="65" height="2" fill="rgba(255,255,255,0.08)" />

          {/* FANCY ORNATE CHIMNEYS - Colonial administrative style */}
          {/* Left chimney with decorative cap */}
          <rect x="350" y="260" width="4" height="8" fill={`url(#buildings-fg-left-${instanceId})`} id="chimney-4a" />
          <rect x="349" y="259" width="6" height="1.5" fill="rgba(0,0,0,0.3)" />
          <rect x="348.5" y="257.5" width="7" height="1.5" fill="rgba(0,0,0,0.25)" />

          {/* Center chimney - taller with crown */}
          <rect x="370" y="257" width="5" height="11" fill={`url(#buildings-fg-left-${instanceId})`} id="chimney-4b" />
          <rect x="369" y="256" width="7" height="1.5" fill="rgba(0,0,0,0.3)" />
          <rect x="368.5" y="254.5" width="8" height="1.5" fill="rgba(0,0,0,0.25)" />
          <rect x="371" y="253.5" width="3" height="1" fill="rgba(0,0,0,0.35)" />

          {/* Right chimney with decorative cap */}
          <rect x="390" y="261" width="4" height="7" fill={`url(#buildings-fg-left-${instanceId})`} id="chimney-4c" />
          <rect x="389" y="260" width="6" height="1.5" fill="rgba(0,0,0,0.3)" />
          <rect x="388.5" y="258.5" width="7" height="1.5" fill="rgba(0,0,0,0.25)" />

          {/* SPANISH FLAG - Wind-responsive animation - DARKER & SMALLER */}
          {/* Taller flagpole */}
          <line x1="360" y1="268" x2="360" y2="242" stroke="rgba(0,0,0,0.8)" strokeWidth="0.7" />
          <circle cx="360" cy="241" r="0.7" fill="rgba(0,0,0,0.5)" />

          {/* Flag - even darker and smaller for silhouette effect */}
          {/* Top red stripe */}
          <path d={`M 360 245 Q ${360 + windDriftX * 0.25} ${244.5 + Math.abs(Math.sin(Date.now() / 800) * 0.6)} ${360 + 6 + windDriftX * 0.9} ${245 + Math.abs(Math.sin(Date.now() / 800) * 0.9)} L ${360 + 6 + windDriftX * 0.5} ${246.5 + Math.abs(Math.sin(Date.now() / 800) * 0.9)} Q ${360 + windDriftX * 0.25} ${246 + Math.abs(Math.sin(Date.now() / 800) * 0.6)} 360 246.5 Z`}
                fill="rgba(70,10,10,0.7)">
            <animate attributeName="d"
              values={`M 360 245 Q ${360 + windDriftX * 0.25} 244.5 ${360 + 6 + windDriftX * 0.5} 245 L ${360 + 6 + windDriftX * 0.5} 246.5 Q ${360 + windDriftX * 0.25} 246 360 246.5 Z;
                       M 360 245 Q ${360 + windDriftX * 0.35} ${244.8 + Math.abs(windDriftX * 0.08)} ${360 + 6 + windDriftX * 0.6} ${245.3 + Math.abs(windDriftX * 0.12)} L ${360 + 6 + windDriftX * 0.6} ${246.8 + Math.abs(windDriftX * 0.12)} Q ${360 + windDriftX * 0.35} ${246.3 + Math.abs(windDriftX * 0.08)} 360 246.5 Z;
                       M 360 245 Q ${360 + windDriftX * 0.25} 244.5 ${360 + 6 + windDriftX * 0.5} 245 L ${360 + 6 + windDriftX * 0.5} 246.5 Q ${360 + windDriftX * 0.25} 246 360 246.5 Z`}
              dur="1.2s" repeatCount="indefinite" />
          </path>

          {/* Middle gold stripe - much darker for silhouette */}
          <path d={`M 360 246.5 Q ${360 + windDriftX * 0.25} ${246 + Math.abs(Math.sin(Date.now() / 800) * 0.6)} ${360 + 6 + windDriftX * 0.5} ${246.5 + Math.abs(Math.sin(Date.now() / 800) * 0.9)} L ${360 + 6 + windDriftX * 0.5} ${248 + Math.abs(Math.sin(Date.now() / 800) * 0.9)} Q ${360 + windDriftX * 0.25} ${247.5 + Math.abs(Math.sin(Date.now() / 800) * 0.6)} 360 248 Z`}
                fill="rgba(80,50,15,0.75)">
            <animate attributeName="d"
              values={`M 360 246.5 Q ${360 + windDriftX * 0.25} 246 ${360 + 6 + windDriftX * 0.5} 246.5 L ${360 + 6 + windDriftX * 0.5} 248 Q ${360 + windDriftX * 0.25} 247.5 360 248 Z;
                       M 360 246.5 Q ${360 + windDriftX * 0.35} ${246.3 + Math.abs(windDriftX * 0.08)} ${360 + 6 + windDriftX * 0.6} ${246.8 + Math.abs(windDriftX * 0.12)} L ${360 + 6 + windDriftX * 0.6} ${248.3 + Math.abs(windDriftX * 0.12)} Q ${360 + windDriftX * 0.35} ${247.8 + Math.abs(windDriftX * 0.08)} 360 248 Z;
                       M 360 246.5 Q ${360 + windDriftX * 0.25} 246 ${360 + 6 + windDriftX * 0.5} 246.5 L ${360 + 6 + windDriftX * 0.5} 248 Q ${360 + windDriftX * 0.25} 247.5 360 248 Z`}
              dur="1.2s" repeatCount="indefinite" />
          </path>

          {/* Bottom red stripe */}
          <path d={`M 360 248 Q ${360 + windDriftX * 0.25} ${247.5 + Math.abs(Math.sin(Date.now() / 800) * 0.6)} ${360 + 6 + windDriftX * 0.5} ${248 + Math.abs(Math.sin(Date.now() / 800) * 0.9)} L ${360 + 6 + windDriftX * 0.5} ${249.5 + Math.abs(Math.sin(Date.now() / 800) * 0.9)} Q ${360 + windDriftX * 0.25} ${249 + Math.abs(Math.sin(Date.now() / 800) * 0.6)} 360 249.5 Z`}
                fill="rgba(70,10,10,0.7)">
            <animate attributeName="d"
              values={`M 360 248 Q ${360 + windDriftX * 0.25} 247.5 ${360 + 6 + windDriftX * 0.5} 248 L ${360 + 6 + windDriftX * 0.5} 249.5 Q ${360 + windDriftX * 0.25} 249 360 249.5 Z;
                       M 360 248 Q ${360 + windDriftX * 0.35} ${247.8 + Math.abs(windDriftX * 0.08)} ${360 + 6 + windDriftX * 0.6} ${248.3 + Math.abs(windDriftX * 0.12)} L ${360 + 6 + windDriftX * 0.6} ${249.8 + Math.abs(windDriftX * 0.12)} Q ${360 + windDriftX * 0.35} ${249.3 + Math.abs(windDriftX * 0.08)} 360 249.5 Z;
                       M 360 248 Q ${360 + windDriftX * 0.25} 247.5 ${360 + 6 + windDriftX * 0.5} 248 L ${360 + 6 + windDriftX * 0.5} 249.5 Q ${360 + windDriftX * 0.25} 249 360 249.5 Z`}
              dur="1.2s" repeatCount="indefinite" />
          </path>

          {/* CRENELLATIONS - Palace roofline battlements */}
          <rect x="342" y="266" width="3" height="2" fill="rgba(0,0,0,0.4)" />
          <rect x="348" y="266" width="3" height="2" fill="rgba(0,0,0,0.4)" />
          <rect x="354" y="266" width="3" height="2" fill="rgba(0,0,0,0.4)" />
          <rect x="366" y="266" width="3" height="2" fill="rgba(0,0,0,0.4)" />
          <rect x="378" y="266" width="3" height="2" fill="rgba(0,0,0,0.4)" />
          <rect x="384" y="266" width="3" height="2" fill="rgba(0,0,0,0.4)" />
          <rect x="396" y="266" width="3" height="2" fill="rgba(0,0,0,0.4)" />
          <rect x="402" y="266" width="3" height="2" fill="rgba(0,0,0,0.4)" />

          {/* BAROQUE CORNER TURRETS - Small cylindrical towers */}
          {/* Left turret */}
          <rect x="338.5" y="262" width="5" height="6" fill={`url(#buildings-fg-left-${instanceId})`} />
          <ellipse cx="341" cy="262" rx="2.5" ry="1.5" fill={`url(#buildings-fg-left-${instanceId})`} />
          <circle cx="341" cy="260" r="1.2" fill="rgba(0,0,0,0.4)" />
          <rect x="340.5" y="258" width="1" height="2.5" fill="rgba(0,0,0,0.5)" />

          {/* Right turret */}
          <rect x="402" y="262" width="5" height="6" fill={`url(#buildings-fg-left-${instanceId})`} />
          <ellipse cx="404.5" cy="262" rx="2.5" ry="1.5" fill={`url(#buildings-fg-left-${instanceId})`} />
          <circle cx="404.5" cy="260" r="1.2" fill="rgba(0,0,0,0.4)" />
          <rect x="404" y="258" width="1" height="2.5" fill="rgba(0,0,0,0.5)" />

          {/* PATROLLING SOLDIER - Fixed position on roof */}
          <g>
            {/* Head - ON roof level */}
            <ellipse cx="385" cy="265" rx="0.8" ry="1" fill="rgba(0,0,0,0.9)">
              <animate attributeName="cx" values="345;365;385;395;385;365;345" dur="40s" repeatCount="indefinite" />
            </ellipse>
            {/* Body */}
            <rect x="384.3" y="266" width="1.4" height="2.5" fill="rgba(0,0,0,0.9)">
              <animate attributeName="x" values="344.3;364.3;384.3;394.3;384.3;364.3;344.3" dur="40s" repeatCount="indefinite" />
            </rect>
            {/* Legs extending down to roof */}
            <line x1="384.7" y1="268.5" x2="384.7" y2="268" stroke="rgba(0,0,0,0.9)" strokeWidth="0.6">
              <animate attributeName="x1" values="344.7;364.7;384.7;394.7;384.7;364.7;344.7" dur="40s" repeatCount="indefinite" />
              <animate attributeName="x2" values="344.7;364.7;384.7;394.7;384.7;364.7;344.7" dur="40s" repeatCount="indefinite" />
            </line>
            <line x1="385.3" y1="268.5" x2="385.3" y2="268" stroke="rgba(0,0,0,0.7)" strokeWidth="0.6">
              <animate attributeName="x1" values="345.3;365.3;385.3;395.3;385.3;365.3;345.3" dur="40s" repeatCount="indefinite" />
              <animate attributeName="x2" values="345.3;365.3;385.3;395.3;385.3;365.3;345.3" dur="40s" repeatCount="indefinite" />
            </line>
            {/* Pike/musket - angled upward, shorter length */}
            <line x1="385.5" y1="266.5" x2="387" y2="261" stroke="rgba(0,0,0,0.95)" strokeWidth="0.4">
              <animate attributeName="x1" values="345.5;365.5;385.5;395.5;385.5;365.5;345.5" dur="40s" repeatCount="indefinite" />
              <animate attributeName="x2" values="347;367;387;397;387;367;347" dur="40s" repeatCount="indefinite" />
            </line>
            {/* Pike tip - sharper, more visible */}
            <polygon points="387,261 387.8,259.5 386.2,259.8" fill="rgba(0,0,0,0.9)">
              <animate attributeName="points" values="347,261 347.8,259.5 346.2,259.8;367,261 367.8,259.5 366.2,259.8;387,261 387.8,259.5 386.2,259.8;397,261 397.8,259.5 396.2,259.8;387,261 387.8,259.5 386.2,259.8;367,261 367.8,259.5 366.2,259.8;347,261 347.8,259.5 346.2,259.8" dur="40s" repeatCount="indefinite" />
            </polygon>
          </g>

          {/* PALACE ENTRANCE GUARDS - Standing sentries with pikes */}
          {/* Left guard */}
          <g>
            <ellipse cx="365" cy="298.5" rx="0.5" ry="0.7" fill="rgba(0,0,0,0.75)" />
            <rect x="364.7" y="299.2" width="0.6" height="1.5" fill="rgba(0,0,0,0.75)" />
            {/* Pike - vertical at attention */}
            <line x1="365.3" y1="298.5" x2="365.3" y2="295" stroke="rgba(0,0,0,0.8)" strokeWidth="0.5" />
            <polygon points="365.3,295 365.7,294.2 364.9,294.2" fill="rgba(0,0,0,0.85)" />
            {/* Subtle stance shift animation - every 40 seconds */}
            <animateTransform attributeName="transform" type="translate"
              values="0,0; 0.3,0; 0,0; -0.3,0; 0,0"
              dur="40s" repeatCount="indefinite" />
          </g>

          {/* Right guard */}
          <g>
            <ellipse cx="355" cy="288.5" rx="0.5" ry="0.7" fill="rgba(0,0,0,0.75)" />
            <rect x="374.7" y="299.2" width="0.6" height="1.5" fill="rgba(0,0,0,0.75)" />
            {/* Pike - vertical at attention */}
            <line x1="374.7" y1="288.5" x2="374.7" y2="295" stroke="rgba(0,0,0,0.8)" strokeWidth="0.5" />
            <polygon points="374.7,285 375.1,294.2 374.3,294.2" fill="rgba(0,0,0,0.85)" />
            {/* Subtle stance shift animation - every 50 seconds, offset timing */}
            <animateTransform attributeName="transform" type="translate"
              values="0,0; -0.3,0; 0,0; 0.3,0; 0,0"
              dur="50s" begin="5s" repeatCount="indefinite" />
          </g>

   
          {/* HANGING STREET LAMP - Palace entrance */}
          <g>
            {/* Wrought iron bracket */}
            <line x1="368" y1="280" x2="371" y2="280" stroke="rgba(0,0,0,0.7)" strokeWidth="0.6" />
            <line x1="371" y1="280" x2="371" y2="283" stroke="rgba(0,0,0,0.7)" strokeWidth="0.5" />
            {/* Lantern body with sway animation */}
            <g>
              <rect x="369.5" y="283" width="3" height="4" fill="rgba(0,0,0,0.6)" />
              <rect x="370" y="283.5" width="2" height="3" fill="rgba(80,60,40,0.4)" />
              {/* Night glow effect */}
              {isNight && (
                <>
                  <rect x="370" y="283.5" width="3" height="4" fill="rgba(255,210,120,0.9)" />
                  <ellipse cx="371" cy="285" rx="6" ry="5" fill="rgba(255,210,120,0.15)" opacity="0.8" />
                </>
              )}
              {/* Wind sway animation - offset timing */}
              <animateTransform attributeName="transform" type="translate"
                values="0,0; ${windDriftX * 0.15},0.3; 0,0; ${-windDriftX * 0.15},-0.3; 0,0"
                dur="4.2s" begin="0.5s" repeatCount="indefinite" />
            </g>
          </g>
          </g>
          {/* Invisible hover area covering entire building */}
          <rect x="340" y="263" width="65" height="37" fill="transparent" style={{ pointerEvents: 'auto' }} />
          </g>

          {/* CHURCH with simple needle spire */}
          <rect x="415" y="260" width="38" height="40" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Daytime roof highlight - sun-facing edge */}
          {!isNight && (
            <line x1="415" y1="260" x2="415" y2="300" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          )}
          {/* Tower */}
          <rect x="429" y="240" width="10" height="20" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Needle spire */}
          <polygon points="429,240 434,220 439,240" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Stone plinth at spire peak */}
          <rect x="432" y="218" width="4" height="3" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Cross - thicker base */}
          <rect x="433" y="210" width="2.5" height="9" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="430" y="213" width="8.5" height="2.5" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Rose window */}
          <circle cx="434" cy="270" r="4" fill="rgba(0,0,0,0.12)" />
          <line x1="434" y1="266" x2="434" y2="274" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
          <line x1="430" y1="270" x2="438" y2="270" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
          {/* Window */}
          <rect x="433" y="247" width="2" height="6" fill="rgba(0,0,0,0.15)" />

          {/* Residential cluster - CENTER */}
          <rect x="460" y="282" width="30" height="18" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="466" y="286" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="476" y="286" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="470" y="289" width="12" height="1" fill="rgba(255,255,255,0.08)" />
          <rect x="472" y="291" width="5" height="9" fill="rgba(0,0,0,0.15)" />
          <rect x="482" y="277" width="4" height="5" fill={`url(#buildings-fg-center-${instanceId})`} id="chimney-5" />

          <rect x="495" y="284" width="26" height="16" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="501" y="288" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="511" y="288" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="506" y="290" width="4" height="10" fill="rgba(0,0,0,0.15)" />
          <line x1="498" y1="285" x2="512" y2="285" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />

          {/* BAROQUE CHURCH with dome, drum, and lantern */}
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onMouseEnter={(e) => handleBuildingHover('baroqueChurch', e)}
            onMouseLeave={handleBuildingLeave}
          >
          <g style={{ pointerEvents: 'none' }}>
          <rect x="530" y="258" width="58" height="42" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Daytime roof highlight - sun-facing edge */}
          {!isNight && (
            <line x1="530" y1="258" x2="530" y2="300" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          )}
          {/* Drum (cylindrical base for dome) with windows */}
          <rect x="550" y="248" width="18" height="10" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="553" y="251" width="2" height="4" fill="rgba(0,0,0,0.12)" />
          <rect x="563" y="251" width="2" height="4" fill="rgba(0,0,0,0.12)" />
          {/* Dome with ribs */}
          <path d="M 550 248 Q 559 230 568 248" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Dome ribs (structural lines) */}
          <line x1="559" y1="230" x2="553" y2="248" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          <line x1="559" y1="230" x2="565" y2="248" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          {/* Lantern (small windowed cylinder on top) */}
          <rect x="556" y="234" width="6" height="6" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="557" y="236" width="1" height="2" fill="rgba(0,0,0,0.1)" />
          <rect x="560" y="236" width="1" height="2" fill="rgba(0,0,0,0.1)" />
          {/* Finial (decorative ball) */}
          <circle cx="559" cy="232" r="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Stone plinth for cross */}
          <rect x="557.5" y="229" width="3" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Cross on top of finial */}
          <rect x="558" y="222" width="2.5" height="8" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="555.5" y="225" width="7.5" height="2.5" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Windows */}
          <path d="M 540 272 Q 543 270 546 272" fill="rgba(0,0,0,0.1)" />
          <path d="M 555 272 Q 559 270 563 272" fill="rgba(0,0,0,0.1)" />
          <path d="M 572 272 Q 575 270 578 272" fill="rgba(0,0,0,0.1)" />
          {/* Main entrance */}
          <rect x="553" y="280" width="10" height="20" fill="rgba(0,0,0,0.15)" />
          <path d="M 553 280 Q 558 277 563 280" fill="rgba(0,0,0,0.1)" />
          </g>
          {/* Invisible hover area covering entire building */}
          <rect x="530" y="230" width="58" height="70" fill="transparent" style={{ pointerEvents: 'auto' }} />
          </g>

          {/* Residential cluster - MID RIGHT */}
          <rect x="595" y="283" width="28" height="17" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="601" y="287" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="611" y="287" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="606" y="290" width="4" height="10" fill="rgba(0,0,0,0.15)" />

          <rect x="628" y="281" width="32" height="19" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="628" y="279" width="3" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="635" y="279" width="3" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="642" y="279" width="3" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="649" y="279" width="3" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="656" y="279" width="3" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="633" y="285" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="645" y="285" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="652" y="276" width="4" height="5" fill={`url(#buildings-fg-center-${instanceId})`} id="chimney-6" />

          <rect x="665" y="285" width="24" height="15" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="671" y="289" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="680" y="289" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="675" y="291" width="4" height="9" fill="rgba(0,0,0,0.15)" />

          {/* CHURCH OF SAN FRANCISCO - Baroque facade with cloister and asymmetric bell tower */}
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onMouseEnter={(e) => handleBuildingHover('gothicChurch', e)}
            onMouseLeave={handleBuildingLeave}
          >
          <g style={{ pointerEvents: 'none' }}>
          {/* CLOISTER with clearer arcade arches on the left */}
          <rect x="690" y="270" width="28" height="30" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Arcade arches - THREE columns with clear rounded arches */}
          {/* Bottom row */}
          <path d="M 692 293 L 692 285 Q 695 282 698 285 L 698 293" fill="rgba(0,0,0,0.25)" />
          <path d="M 700 293 L 700 285 Q 703 282 706 285 L 706 293" fill="rgba(0,0,0,0.25)" />
          <path d="M 708 293 L 708 285 Q 711 282 714 285 L 714 293" fill="rgba(0,0,0,0.25)" />
          {/* Middle row */}
          <path d="M 692 284 L 692 278 Q 695 275 698 278 L 698 284" fill="rgba(0,0,0,0.22)" />
          <path d="M 700 284 L 700 278 Q 703 275 706 278 L 706 284" fill="rgba(0,0,0,0.22)" />
          <path d="M 708 284 L 708 278 Q 711 275 714 278 L 714 284" fill="rgba(0,0,0,0.22)" />
          {/* Column capitals between arches */}
          <rect x="698" y="277" width="1" height="2" fill="rgba(255,255,255,0.08)" />
          <rect x="706" y="277" width="1" height="2" fill="rgba(255,255,255,0.08)" />
          <rect x="698" y="284" width="1" height="2" fill="rgba(255,255,255,0.08)" />
          <rect x="706" y="284" width="1" height="2" fill="rgba(255,255,255,0.08)" />
          {/* Cloister roof with detail */}
          <rect x="690" y="268" width="28" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          <line x1="690" y1="269" x2="718" y2="269" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* MAIN CHURCH BUILDING - Wider baroque facade with clearer tympanum */}
          <rect x="718" y="258" width="32" height="42" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Daytime highlight on left edge */}
          {!isNight && (
            <line x1="718" y1="258" x2="718" y2="300" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          )}

          {/* Baroque TYMPANUM (triangular/arched pediment at top) */}
          {/* Tympanum arch - clearer baroque curved top */}
          <path d="M 720 258 L 720 252 Q 734 248 748 252 L 748 258" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Tympanum decorative arch detail */}
          <path d="M 722 254 Q 734 250 746 254" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" />
          {/* Tympanum relief decoration (circular window/oculus) */}
          <circle cx="734" cy="253" r="2.5" fill="rgba(0,0,0,0.15)" />
          <circle cx="734" cy="253" r="2" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" fill="none" />

          {/* Baroque ornamentation - pilasters (vertical decorative columns) */}
          <line x1="722" y1="258" x2="722" y2="285" stroke="rgba(0,0,0,0.1)" strokeWidth="1.2" />
          <line x1="734" y1="258" x2="734" y2="285" stroke="rgba(0,0,0,0.1)" strokeWidth="1.2" />
          <line x1="746" y1="258" x2="746" y2="285" stroke="rgba(0,0,0,0.1)" strokeWidth="1.2" />

          {/* Decorative baroque window - large rounded arch */}
          <path d="M 724 263 Q 734 257 744 263 L 744 278 L 724 278 Z" fill="rgba(0,0,0,0.15)" />
          {/* Window decorative frame */}
          <path d="M 724 263 Q 734 257 744 263" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
          {/* Window muntins (cross dividers) */}
          <line x1="734" y1="263" x2="734" y2="278" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
          <line x1="724" y1="270" x2="744" y2="270" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />

          {/* Baroque decorative elements - scrolls/volutes on pilasters */}
          <path d="M 722 260 Q 724 258 726 260" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" fill="none" />
          <path d="M 742 260 Q 744 258 746 260" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" fill="none" />

          {/* Main entrance with baroque arch */}
          <rect x="727" y="285" width="14" height="15" fill="rgba(0,0,0,0.18)" />
          <path d="M 727 285 Q 734 280 741 285" fill="rgba(0,0,0,0.15)" />
          {/* Door panels */}
          <line x1="734" y1="285" x2="734" y2="300" stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
          <rect x="729" y="288" width="4" height="5" fill="rgba(0,0,0,0.08)" />
          <rect x="735" y="288" width="4" height="5" fill="rgba(0,0,0,0.08)" />

          {/* SHORTER BELL TOWER on the RIGHT - asymmetric placement */}
          <rect x="750" y="240" width="18" height="60" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Tower decorative bands */}
          <line x1="750" y1="255" x2="768" y2="255" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
          <line x1="750" y1="270" x2="768" y2="270" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />

          {/* Bell chamber with arched openings */}
          <rect x="752" y="245" width="14" height="14" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Two arched bell openings - larger and clearer */}
          <path d="M 754 250 Q 757 246 760 250 L 760 257 L 754 257 Z" fill="rgba(0,0,0,0.3)" />
          <path d="M 762 250 Q 765 246 768 250 L 768 257 L 762 257 Z" fill="rgba(0,0,0,0.3)" />

          {/* Visible bells hanging inside openings */}
          <ellipse cx="757" cy="252" rx="2" ry="2.5" fill="rgba(80,60,40,0.6)" />
          <ellipse cx="765" cy="252" rx="2" ry="2.5" fill="rgba(80,60,40,0.6)" />
          {/* Bell clappers */}
          <line x1="757" y1="253.5" x2="757" y2="255.5" stroke="rgba(40,30,20,0.4)" strokeWidth="0.5" />
          <line x1="765" y1="253.5" x2="765" y2="255.5" stroke="rgba(40,30,20,0.4)" strokeWidth="0.5" />

          {/* DOME on top of bell tower */}
          {/* Drum (cylindrical base of dome) */}
          <rect x="754" y="236" width="10" height="4" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Dome shape - hemisphere */}
          <ellipse cx="759" cy="232" rx="6" ry="5" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Dome highlight (curved surface catching light) */}
          {!isNight && (
            <ellipse cx="758" cy="231" rx="2.5" ry="2" fill="rgba(255,255,255,0.15)" opacity="0.6" />
          )}

          {/* Dome ornamentation - ribs/sections */}
          <line x1="759" y1="227" x2="759" y2="237" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
          <path d="M 755 229 Q 759 227 763 229" stroke="rgba(0,0,0,0.1)" strokeWidth="0.4" fill="none" />
          <path d="M 754 232 Q 759 229 764 232" stroke="rgba(0,0,0,0.1)" strokeWidth="0.4" fill="none" />

          {/* Lantern on top of dome */}
          <rect x="757.5" y="225" width="3" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />

          {/* Small cross on top */}
          <rect x="758.7" y="220" width="0.6" height="5.5" fill="rgba(40,30,25,0.9)" />
          <rect x="757" y="222" width="3.5" height="0.6" fill="rgba(40,30,25,0.9)" />

          {/* Facade connection detail */}
          <line x1="750" y1="258" x2="750" y2="300" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />

          {/* HANGING STREET LAMP - San Francisco entrance */}
          <g>
            {/* Wrought iron bracket */}
            <line x1="732" y1="283" x2="736" y2="283" stroke="rgba(0,0,0,0.7)" strokeWidth="0.6" />
            <line x1="736" y1="283" x2="736" y2="286" stroke="rgba(0,0,0,0.7)" strokeWidth="0.5" />
            {/* Lantern body with sway animation */}
            <g>
              <rect x="734" y="286" width="4" height="5" fill="rgba(0,0,0,0.6)" />
              <rect x="734.5" y="286.5" width="3" height="4" fill="rgba(80,60,40,0.4)" />
              {/* Night glow effect */}
              {isNight && (
                <>
                  <rect x="734.5" y="286.5" width="3" height="4" fill="rgba(255,210,120,0.6)" />
                  <ellipse cx="736" cy="288.5" rx="4" ry="4" fill="rgba(255,210,120,0.15)" opacity="0.8" />
                </>
              )}
              {/* Wind sway animation - offset timing */}
              <animateTransform attributeName="transform" type="translate"
                values="0,0; ${windDriftX * 0.15},0.3; 0,0; ${-windDriftX * 0.15},-0.3; 0,0"
                dur="3.8s" begin="1s" repeatCount="indefinite" />
            </g>
          </g>
          </g>
          {/* Invisible hover area covering entire building complex */}
          <rect x="690" y="220" width="78" height="80" fill="transparent" style={{ pointerEvents: 'auto' }} />
          </g>

          {/* Residential cluster - RIGHT with varied heights and balconies */}
          <rect x="755" y="285" width="14" height="15" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="769" y="281" width="16" height="19" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Roof detail */}
          <rect x="755" y="283" width="14" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          <rect x="769" y="279" width="16" height="2" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* Balcony on taller building */}
          <rect x="772" y="286" width="10" height="1" fill="rgba(255,255,255,0.08)" />
          <line x1="772" y1="287" x2="772" y2="289" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="776" y1="287" x2="776" y2="289" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="780" y1="287" x2="780" y2="289" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Windows */}
          <rect x="761" y="289" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="774" y="292" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          {/* Cornice */}
          <rect x="755" y="292" width="30" height="1" fill="rgba(255,255,255,0.12)" />
          <rect x="766" y="290" width="4" height="10" fill="rgba(0,0,0,0.15)" />
          <rect x="781" y="276" width="4" height="4" fill={`url(#buildings-fg-center-${instanceId})`} id="chimney-7" />

          {/* Larger residential with multiple balconies */}
          <rect x="790" y="278" width="32" height="22" fill={`url(#buildings-fg-center-${instanceId})`} />
          {/* First floor balcony */}
          <rect x="795" y="287" width="12" height="1" fill="rgba(255,255,255,0.08)" />
          <line x1="795" y1="288" x2="795" y2="290" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="801" y1="288" x2="801" y2="290" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Second floor balcony */}
          <rect x="809" y="282" width="10" height="1" fill="rgba(255,255,255,0.08)" />
          <line x1="809" y1="283" x2="809" y2="285" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="814" y1="283" x2="814" y2="285" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Windows */}
          <rect x="796" y="282" width="3" height="4" fill="rgba(255,255,255,0.06)" />
          <rect x="812" y="287" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="796" y="293" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="818" y="273" width="4" height="5" fill={`url(#buildings-fg-center-${instanceId})`} id="chimney-8" />

          {/* ESPADAÑA (Bell Wall) - distinctly colonial Mexican */}
          <rect x="830" y="276" width="34" height="24" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Daytime roof highlight - sun-facing edge */}
          {!isNight && (
            <line x1="830" y1="276" x2="830" y2="300" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          )}
          {/* Flat facade bell wall with curved parapet */}
          <rect x="838" y="264" width="18" height="12" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Curved baroque top */}
          <path d="M 838 264 Q 842 259 847 258 Q 852 259 856 264" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Bell arches - two openings */}
          <path d="M 841 268 Q 843 265 845 268" fill="rgba(0,0,0,0.2)" />
          <path d="M 849 268 Q 851 265 853 268" fill="rgba(0,0,0,0.2)" />
          {/* Visible bells inside arches */}
          <ellipse cx="843" cy="269" rx="1.5" ry="2" fill="rgba(0,0,0,0.3)" />
          <ellipse cx="851" cy="269" rx="1.5" ry="2" fill="rgba(0,0,0,0.3)" />
          {/* Stone plinth for cross */}
          <rect x="845" y="256" width="4" height="3" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Cross on top */}
          <rect x="846" y="250" width="2.5" height="7" fill={`url(#buildings-fg-right-${instanceId})`} />
          <rect x="844" y="253" width="6.5" height="2.5" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Main entrance */}
          <circle cx="847" cy="285" r="3" fill="rgba(0,0,0,0.1)" />
          <rect x="851" y="285" width="5" height="15" fill="rgba(0,0,0,0.15)" />

          {/* Residential cluster - FAR RIGHT */}
          <rect x="870" y="282" width="28" height="18" fill={`url(#buildings-fg-right-${instanceId})`} />
          <rect x="876" y="286" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="886" y="286" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="881" y="289" width="4" height="11" fill="rgba(0,0,0,0.15)" />

          {/* Residential with varied heights and roof detail */}
          <rect x="903" y="282" width="13" height="18" fill={`url(#buildings-fg-right-${instanceId})`} />
          <rect x="916" y="278" width="17" height="22" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Roof tiles */}
          <rect x="903" y="280" width="13" height="2" fill={`url(#buildings-fg-right-${instanceId})`} />
          <rect x="916" y="276" width="17" height="2" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Balcony */}
          <rect x="919" y="284" width="11" height="1" fill="rgba(255,255,255,0.08)" />
          <line x1="919" y1="285" x2="919" y2="287" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="924" y1="285" x2="924" y2="287" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="929" y1="285" x2="929" y2="287" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Windows */}
          <rect x="908" y="286" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="922" y="290" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          {/* Cornice */}
          <rect x="903" y="292" width="30" height="1" fill="rgba(255,255,255,0.12)" />
          <rect x="929" y="273" width="4" height="5" fill={`url(#buildings-fg-right-${instanceId})`} id="chimney-9" />

          {/* CHURCH OF SAN AGUSTÍN - Distinctive triangular gable facade */}
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onMouseEnter={(e) => handleBuildingHover('weathervaneChurch', e)}
            onMouseLeave={handleBuildingLeave}
          >
          <g style={{ pointerEvents: 'none' }}>
          {/* Main church body - wider facade */}
          <rect x="940" y="270" width="50" height="30" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Daytime highlight */}
          {!isNight && (
            <line x1="940" y1="270" x2="940" y2="300" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          )}

          {/* TRIANGULAR GABLE FACADE - Most distinctive feature */}
          {/* Base of triangle */}
          <rect x="945" y="245" width="40" height="25" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Triangular top */}
          <polygon points="945,245 965,220 985,245" fill={`url(#buildings-fg-right-${instanceId})`} />

          {/* ARCHED WINDOWS in triangular pattern (3-2-1 from bottom to top) */}
          {/* Top single arched window */}
          <path d="M 962 234 L 962 229 Q 965 226 968 229 L 968 234 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.25)' : (isDusk ? 'rgba(255, 150, 100, 0.25)' : (isNight ? 'rgba(50, 60, 80, 0.3)' : 'rgba(150, 180, 210, 0.25)'))} />
          <path d="M 962 234 L 962 229 Q 965 226 968 229 L 968 234 Z"
                fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />

          {/* Middle row - 2 arched windows */}
          <path d="M 956 241 L 956 236 Q 959 233 962 236 L 962 241 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.25)' : (isDusk ? 'rgba(255, 150, 100, 0.25)' : (isNight ? 'rgba(50, 60, 80, 0.3)' : 'rgba(150, 180, 210, 0.25)'))} />
          <path d="M 956 241 L 956 236 Q 959 233 962 236 L 962 241 Z"
                fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />

          <path d="M 968 241 L 968 236 Q 971 233 974 236 L 974 241 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.25)' : (isDusk ? 'rgba(255, 150, 100, 0.25)' : (isNight ? 'rgba(50, 60, 80, 0.3)' : 'rgba(150, 180, 210, 0.25)'))} />
          <path d="M 968 241 L 968 236 Q 971 233 974 236 L 974 241 Z"
                fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />

          {/* Bottom row - 3 arched windows */}
          <path d="M 950 247 L 950 242 Q 953 239 956 242 L 956 247 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.25)' : (isDusk ? 'rgba(255, 150, 100, 0.25)' : (isNight ? 'rgba(50, 60, 80, 0.3)' : 'rgba(150, 180, 210, 0.25)'))} />
          <path d="M 950 247 L 950 242 Q 953 239 956 242 L 956 247 Z"
                fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />

          <path d="M 961.5 247 L 961.5 242 Q 965 239 968.5 242 L 968.5 247 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.25)' : (isDusk ? 'rgba(255, 150, 100, 0.25)' : (isNight ? 'rgba(50, 60, 80, 0.3)' : 'rgba(150, 180, 210, 0.25)'))} />
          <path d="M 961.5 247 L 961.5 242 Q 965 239 968.5 242 L 968.5 247 Z"
                fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />

          <path d="M 974 247 L 974 242 Q 977 239 980 242 L 980 247 Z"
                fill={isDawn ? 'rgba(255, 200, 150, 0.25)' : (isDusk ? 'rgba(255, 150, 100, 0.25)' : (isNight ? 'rgba(50, 60, 80, 0.3)' : 'rgba(150, 180, 210, 0.25)'))} />
          <path d="M 974 247 L 974 242 Q 977 239 980 242 L 980 247 Z"
                fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />

          {/* Cross at apex */}
          <rect x="964.3" y="215" width="1.4" height="5.5" fill={`url(#buildings-fg-right-${instanceId})`} />
          <rect x="962.5" y="217" width="5" height="1.4" fill={`url(#buildings-fg-right-${instanceId})`} />

          {/* LEFT BELL TOWER with dome */}
          <rect x="942" y="250" width="7" height="20" fill={`url(#buildings-fg-right-${instanceId})`} />
          <ellipse cx="945.5" cy="249" rx="4" ry="2" fill={`url(#buildings-fg-right-${instanceId})`} />
          <circle cx="945.5" cy="247" r="1" fill="rgba(0,0,0,0.4)" />
          <rect x="945" y="245" width="1" height="2.5" fill="rgba(0,0,0,0.5)" />
          {/* Bell opening */}
          <rect x="944" y="256" width="3" height="4" fill="rgba(0,0,0,0.3)" />

          {/* RIGHT BELL TOWER with dome */}
          <rect x="981" y="250" width="7" height="20" fill={`url(#buildings-fg-right-${instanceId})`} />
          <ellipse cx="984.5" cy="249" rx="4" ry="2" fill={`url(#buildings-fg-right-${instanceId})`} />
          <circle cx="984.5" cy="247" r="1" fill="rgba(0,0,0,0.4)" />
          <rect x="984" y="245" width="1" height="2.5" fill="rgba(0,0,0,0.5)" />
          {/* Bell opening */}
          <rect x="983" y="256" width="3" height="4" fill="rgba(0,0,0,0.3)" />

          {/* LARGE CENTRAL ARCHED NICHE */}
          <path d="M 952 260 Q 965 250 978 260 L 978 285 L 952 285 Z" fill="rgba(0,0,0,0.2)" />
          <path d="M 952 260 Q 965 250 978 260" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />

          {/* Main entrance door within niche */}
          <rect x="960" y="278" width="10" height="22" fill="rgba(0,0,0,0.3)" />
          <path d="M 960 278 Q 965 275 970 278" fill="rgba(0,0,0,0.2)" />
          </g>
          {/* Invisible hover area covering entire building */}
          <rect x="940" y="215" width="50" height="85" fill="transparent" style={{ pointerEvents: 'auto' }} />
          </g>

          {/* Residential cluster - RIGHTMOST */}
          <rect x="995" y="283" width="26" height="17" fill={`url(#buildings-fg-right-${instanceId})`} />
          <rect x="1001" y="287" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="1010" y="287" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="1006" y="290" width="4" height="10" fill="rgba(0,0,0,0.15)" />
          <rect x="1014" y="279" width="4" height="4" fill={`url(#buildings-fg-right-${instanceId})`} id="chimney-10" />

          {/* BOTICA DE LA AMARGURA - Maria's apothecary shop */}
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onMouseEnter={(e) => handleBuildingHover('botica', e)}
            onMouseLeave={handleBuildingLeave}
          >
          <g style={{ pointerEvents: 'none' }}>
          <rect x="1028" y="281" width="30" height="19" fill={`url(#buildings-fg-right-${instanceId})`} />
          <rect x="1034" y="285" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="1046" y="285" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="1038" y="288" width="10" height="1" fill="rgba(255,255,255,0.08)" />
          <rect x="1050" y="276" width="4" height="5" fill={`url(#buildings-fg-right-${instanceId})`} id="chimney-11" />
          </g>
          {/* Invisible hover area covering entire building */}
          <rect x="1028" y="276" width="30" height="24" fill="transparent" style={{ pointerEvents: 'auto' }} />
          </g>

          <rect x="1063" y="284" width="24" height="16" fill={`url(#buildings-fg-right-${instanceId})`} />
          <rect x="1069" y="288" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="1078" y="288" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="1073" y="291" width="4" height="9" fill="rgba(0,0,0,0.15)" />

          {/* LA MERCED MARKET COMPLEX - Church and market arcades */}
          <g
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onMouseEnter={(e) => handleBuildingHover('lamerced', e)}
            onMouseLeave={handleBuildingLeave}
          >
          <g style={{ pointerEvents: 'none' }}>
          {/* CENTRAL BAROQUE CHURCH */}
          <rect x="1100" y="260" width="40" height="40" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Daytime highlight */}
          {!isNight && (
            <line x1="1100" y1="260" x2="1100" y2="300" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          )}

          {/* LEFT BELL TOWER */}
          <rect x="1103" y="245" width="8" height="15" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Bell opening */}
          <rect x="1105" y="250" width="4" height="5" fill="rgba(0,0,0,0.3)" />
          {/* Cupola dome */}
          <ellipse cx="1107" cy="243" rx="5" ry="2.5" fill={`url(#buildings-fg-right-${instanceId})`} />
          <circle cx="1107" cy="241" r="1" fill="rgba(0,0,0,0.4)" />
          <rect x="1106.5" y="239" width="1" height="2.5" fill="rgba(0,0,0,0.5)" />

          {/* RIGHT BELL TOWER */}
          <rect x="1129" y="245" width="8" height="15" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Bell opening */}
          <rect x="1131" y="250" width="4" height="5" fill="rgba(0,0,0,0.3)" />
          {/* Cupola dome */}
          <ellipse cx="1133" cy="243" rx="5" ry="2.5" fill={`url(#buildings-fg-right-${instanceId})`} />
          <circle cx="1133" cy="241" r="1" fill="rgba(0,0,0,0.4)" />
          <rect x="1132.5" y="239" width="1" height="2.5" fill="rgba(0,0,0,0.5)" />

          {/* BAROQUE FACADE - Central section between towers */}
          <rect x="1111" y="255" width="18" height="5" fill={`url(#buildings-fg-right-${instanceId})`} />
          {/* Decorative pediment */}
          <path d="M 1111 255 Q 1120 250 1129 255" fill={`url(#buildings-fg-right-${instanceId})`} />
          <circle cx="1120" cy="251" r="1.5" fill="rgba(0,0,0,0.3)" />

          {/* ROSE WINDOW - Circular ornate window */}
          <circle cx="1120" cy="268" r="4" fill="rgba(0,0,0,0.15)" />
          <line x1="1120" y1="264" x2="1120" y2="272" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          <line x1="1116" y1="268" x2="1124" y2="268" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />

          {/* MAIN ARCHED ENTRANCE */}
          <path d="M 1112 280 Q 1120 273 1128 280 L 1128 300 L 1112 300 Z" fill="rgba(0,0,0,0.2)" />
          <path d="M 1112 280 Q 1120 273 1128 280" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />

          {/* LEFT MARKET ARCADE - Lower building with arches */}
          <rect x="1090" y="275" width="10" height="25" fill={`url(#buildings-fg-right-${instanceId})`} />
          <path d="M 1091 285 Q 1095 282 1099 285 L 1099 300 L 1091 300 Z" fill="rgba(0,0,0,0.18)" />
          <path d="M 1091 285 Q 1095 282 1099 285" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />

          {/* RIGHT MARKET ARCADE - Lower building with arches */}
          <rect x="1140" y="275" width="10" height="25" fill={`url(#buildings-fg-right-${instanceId})`} />
          <path d="M 1141 285 Q 1145 282 1149 285 L 1149 300 L 1141 300 Z" fill="rgba(0,0,0,0.18)" />
          <path d="M 1141 285 Q 1145 282 1149 285" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
          </g>
          {/* Invisible hover area covering entire complex */}
          <rect x="1090" y="239" width="60" height="61" fill="transparent" style={{ pointerEvents: 'auto' }} />
          </g>

          {/* Final residential */}
          <rect x="1145" y="283" width="28" height="17" fill={`url(#buildings-fg-right-${instanceId})`} />
          <rect x="1151" y="287" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="1161" y="287" width="3" height="4" fill="rgba(255,255,255,0.05)" />
          <rect x="1156" y="290" width="4" height="10" fill="rgba(0,0,0,0.15)" />
          <rect x="1166" y="279" width="4" height="4" fill={`url(#buildings-fg-right-${instanceId})`} id="chimney-12" />

          {/* GROUND/STREET LEVEL - Cobblestone street surface (8px tall, visually prominent) */}
          <rect
            x="0"
            y="292"
            width="1200"
            height="8"
            fill={`url(#street-gradient-${instanceId})`}
          />
          {/* Cobblestone texture - subtle variation */}
          <g opacity="0.15">
            {/* Create repeating cobblestone pattern across the street */}
            {Array.from({ length: 60 }).map((_, i) => {
              const x = i * 20;
              return (
                <g key={`cobble-${i}`}>
                  <rect x={x} y="292" width="1" height="8" fill="rgba(0,0,0,0.5)" />
                  <rect x={x + 5} y="292" width="1" height="8" fill="rgba(0,0,0,0.4)" />
                  <rect x={x + 10} y="292" width="1" height="8" fill="rgba(0,0,0,0.5)" />
                  <rect x={x + 15} y="292" width="1" height="8" fill="rgba(0,0,0,0.4)" />
                </g>
              );
            })}
          </g>
          {/* Horizontal seams for cobblestone rows */}
          <line x1="0" y1="294" x2="1200" y2="294" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
          <line x1="0" y1="296" x2="1200" y2="296" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          <line x1="0" y1="298" x2="1200" y2="298" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
        </svg>

        {/* CHIMNEY SMOKE - Wind-responsive animated smoke plumes - HIDDEN at night */}
        {!prefersReducedMotion && !isNight && (
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMax slice"
          style={{ opacity: baseOpacity, pointerEvents: 'none' }}
        >
          <defs>
            {/* Improved smoke gradients - more realistic with better opacity falloff */}
            <radialGradient id={`smoke-puff-dense-${instanceId}`}>
              <stop offset="0%" stopColor={isDawn || isDusk ? 'rgba(255,200,150,0.85)' : (isNight ? 'rgba(220,230,240,0.75)' : 'rgba(200,210,220,0.8)')} />
              <stop offset="40%" stopColor={isDawn || isDusk ? 'rgba(255,220,180,0.55)' : (isNight ? 'rgba(210,220,230,0.45)' : 'rgba(210,220,230,0.5)')} />
              <stop offset="75%" stopColor={isDawn || isDusk ? 'rgba(240,230,220,0.25)' : (isNight ? 'rgba(200,210,220,0.2)' : 'rgba(220,225,230,0.2)')} />
              <stop offset="100%" stopColor="rgba(220,230,240,0)" />
            </radialGradient>
            <radialGradient id={`smoke-puff-wispy-${instanceId}`}>
              <stop offset="0%" stopColor={isDawn || isDusk ? 'rgba(255,200,150,0.65)' : (isNight ? 'rgba(220,230,240,0.55)' : 'rgba(200,210,220,0.6)')} />
              <stop offset="35%" stopColor={isDawn || isDusk ? 'rgba(255,220,180,0.4)' : (isNight ? 'rgba(210,220,230,0.3)' : 'rgba(210,220,230,0.35)')} />
              <stop offset="70%" stopColor={isDawn || isDusk ? 'rgba(240,230,220,0.15)' : (isNight ? 'rgba(200,210,220,0.1)' : 'rgba(220,225,230,0.12)')} />
              <stop offset="100%" stopColor="rgba(220,230,240,0)" />
            </radialGradient>
          </defs>

          {/* Smoke from chimney 1 - Improved volumetric smoke */}
          {activeChimneys.has(1) && (
            <g className="chimney-smoke">
              {/* Dense base puff */}
              <ellipse cx="77" cy="268" rx="3.5" ry="3" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="268;245;218" dur="5s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`77;${77 + windDriftX * 0.4};${77 + windDriftX * 0.9}`} dur="5s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${6 + windDispersion};${10 + windDispersion * 2.5}`} dur="5s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;5.5;9" dur="5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.6;0" dur="5s" repeatCount="indefinite" />
              </ellipse>
              {/* Wispy middle puff */}
              <ellipse cx="77" cy="267" rx="4" ry="3.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="267;242;215" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`77;${77 + windDriftX * 0.5};${77 + windDriftX * 1.1}`} dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4;${7 + windDispersion};${11 + windDispersion * 3}`} dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3.5;6;9.5" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.5;0" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
              </ellipse>
              {/* Trailing wispy puff */}
              <ellipse cx="77" cy="270" rx="3" ry="2.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="270;247;222" dur="4.8s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`77;${77 + windDriftX * 0.6};${77 + windDriftX * 1.3}`} dur="4.8s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${6.5 + windDispersion};${10 + windDispersion * 2.5}`} dur="4.8s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;5.5;8.5" dur="4.8s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.4;0" dur="4.8s" begin="1.2s" repeatCount="indefinite" />
              </ellipse>
              {/* Light dispersing puff */}
              <ellipse cx="77" cy="266" rx="3.5" ry="3" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="266;240;212" dur="5.5s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`77;${77 + windDriftX * 0.7};${77 + windDriftX * 1.5}`} dur="5.5s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${8 + windDispersion};${12 + windDispersion * 3}`} dur="5.5s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;6.5;10" dur="5.5s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.3;0" dur="5.5s" begin="1.8s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 2 - Improved */}
          {activeChimneys.has(2) && (
            <g className="chimney-smoke">
              <ellipse cx="212" cy="279" rx="3" ry="2.5" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="279;256;230" dur="4.7s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`212;${212 + windDriftX * 0.4};${212 + windDriftX * 0.9}`} dur="4.7s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${5.5 + windDispersion};${9 + windDispersion * 2.5}`} dur="4.7s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;5;8.5" dur="4.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0.55;0" dur="4.7s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="212" cy="278" rx="3.5" ry="3" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="278;253;226" dur="5s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`212;${212 + windDriftX * 0.5};${212 + windDriftX * 1.1}`} dur="5s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${6.5 + windDispersion};${10 + windDispersion * 2.8}`} dur="5s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;5.5;9" dur="5s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.45;0" dur="5s" begin="0.7s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="212" cy="280" rx="2.5" ry="2" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="280;258;233" dur="4.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`212;${212 + windDriftX * 0.6};${212 + windDriftX * 1.3}`} dur="4.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`2.5;${6 + windDispersion};${9.5 + windDispersion * 2.5}`} dur="4.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2;5;8" dur="4.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.65;0.35;0" dur="4.5s" begin="1.4s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 3 - Improved */}
          {activeChimneys.has(3) && (
            <g className="chimney-smoke">
              <ellipse cx="303" cy="269" rx="4" ry="3.5" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="269;244;216" dur="5.3s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`303;${303 + windDriftX * 0.4};${303 + windDriftX * 0.95}`} dur="5.3s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4;${6.5 + windDispersion};${11 + windDispersion * 2.8}`} dur="5.3s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3.5;6;9.5" dur="5.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.6;0" dur="5.3s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="303" cy="268" rx="3.5" ry="3" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="268;241;213" dur="5.1s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`303;${303 + windDriftX * 0.5};${303 + windDriftX * 1.1}`} dur="5.1s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${7 + windDispersion};${11.5 + windDispersion * 3}`} dur="5.1s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;6.5;10" dur="5.1s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.5;0" dur="5.1s" begin="0.8s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="303" cy="271" rx="3" ry="2.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="271;247;220" dur="4.9s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`303;${303 + windDriftX * 0.6};${303 + windDriftX * 1.4}`} dur="4.9s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${7 + windDispersion};${11 + windDispersion * 2.8}`} dur="4.9s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;6;9" dur="4.9s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.4;0" dur="4.9s" begin="1.5s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 4 (Palace) - Improved larger smoke from center chimney */}
          {activeChimneys.has(4) && (
            <g className="chimney-smoke">
              <ellipse cx="372" cy="254" rx="4.5" ry="4" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="254;227;199" dur="5.8s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`372;${372 + windDriftX * 0.4};${372 + windDriftX * 1}`} dur="5.8s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4.5;${7.5 + windDispersion};${12 + windDispersion * 3}`} dur="5.8s" repeatCount="indefinite" />
                <animate attributeName="ry" values="4;7;10.5" dur="5.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.6;0" dur="5.8s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="372" cy="253" rx="5" ry="4.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="253;224;194" dur="6s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`372;${372 + windDriftX * 0.5};${372 + windDriftX * 1.2}`} dur="6s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`5;${8.5 + windDispersion};${13 + windDispersion * 3.5}`} dur="6s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="ry" values="4.5;7.5;11" dur="6s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.5;0" dur="6s" begin="0.7s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="372" cy="256" rx="4" ry="3.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="256;229;201" dur="5.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`372;${372 + windDriftX * 0.6};${372 + windDriftX * 1.4}`} dur="5.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4;${8 + windDispersion};${12.5 + windDispersion * 3.2}`} dur="5.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3.5;7;10.5" dur="5.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.45;0" dur="5.5s" begin="1.4s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 5 - Improved */}
          {activeChimneys.has(5) && (
            <g className="chimney-smoke">
              <ellipse cx="484" cy="275" rx="3.5" ry="3" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="275;251;224" dur="4.9s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`484;${484 + windDriftX * 0.4};${484 + windDriftX * 0.9}`} dur="4.9s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${6 + windDispersion};${10 + windDispersion * 2.6}`} dur="4.9s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;5.5;9" dur="4.9s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0.55;0" dur="4.9s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="484" cy="274" rx="4" ry="3.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="274;248;220" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`484;${484 + windDriftX * 0.5};${484 + windDriftX * 1.1}`} dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4;${7 + windDispersion};${11 + windDispersion * 3}`} dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3.5;6;9.5" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.45;0" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="484" cy="276" rx="3" ry="2.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="276;253;227" dur="4.7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`484;${484 + windDriftX * 0.6};${484 + windDriftX * 1.3}`} dur="4.7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${6.5 + windDispersion};${10.5 + windDispersion * 2.8}`} dur="4.7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;5.5;8.5" dur="4.7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.4;0" dur="4.7s" begin="1.2s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 6 - Improved */}
          {activeChimneys.has(6) && (
            <g className="chimney-smoke">
              <ellipse cx="654" cy="273" rx="4" ry="3.5" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="273;248;220" dur="5.1s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`654;${654 + windDriftX * 0.4};${654 + windDriftX * 0.95}`} dur="5.1s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4;${6.5 + windDispersion};${10.5 + windDispersion * 2.8}`} dur="5.1s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3.5;6;9.5" dur="5.1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.6;0" dur="5.1s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="654" cy="272" rx="3.5" ry="3" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="272;245;217" dur="5.3s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`654;${654 + windDriftX * 0.5};${654 + windDriftX * 1.1}`} dur="5.3s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${7 + windDispersion};${11 + windDispersion * 3}`} dur="5.3s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;6;10" dur="5.3s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.5;0" dur="5.3s" begin="0.7s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="654" cy="275" rx="3" ry="2.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="275;251;224" dur="4.8s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`654;${654 + windDriftX * 0.6};${654 + windDriftX * 1.3}`} dur="4.8s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${6.5 + windDispersion};${10 + windDispersion * 2.5}`} dur="4.8s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;5.5;8.5" dur="4.8s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.4;0" dur="4.8s" begin="1.3s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 7 - Improved */}
          {activeChimneys.has(7) && (
            <g className="chimney-smoke">
              <ellipse cx="783" cy="273" rx="3" ry="2.5" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="273;252;228" dur="4.7s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`783;${783 + windDriftX * 0.4};${783 + windDriftX * 0.9}`} dur="4.7s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${5.5 + windDispersion};${9 + windDispersion * 2.5}`} dur="4.7s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;5;8.5" dur="4.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0.55;0" dur="4.7s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="783" cy="272" rx="3.5" ry="3" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="272;249;223" dur="5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`783;${783 + windDriftX * 0.5};${783 + windDriftX * 1.1}`} dur="5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${6.5 + windDispersion};${10 + windDispersion * 2.8}`} dur="5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;5.5;9" dur="5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.45;0" dur="5s" begin="0.6s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 8 - Improved */}
          {activeChimneys.has(8) && (
            <g className="chimney-smoke">
              <ellipse cx="820" cy="270" rx="4" ry="3.5" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="270;245;217" dur="5.3s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`820;${820 + windDriftX * 0.4};${820 + windDriftX * 0.95}`} dur="5.3s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4;${6.5 + windDispersion};${11 + windDispersion * 2.8}`} dur="5.3s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3.5;6;9.5" dur="5.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.6;0" dur="5.3s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="820" cy="269" rx="3.5" ry="3" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="269;242;214" dur="5.1s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`820;${820 + windDriftX * 0.5};${820 + windDriftX * 1.1}`} dur="5.1s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${7 + windDispersion};${11.5 + windDispersion * 3}`} dur="5.1s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;6.5;10" dur="5.1s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.5;0" dur="5.1s" begin="0.8s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="820" cy="272" rx="3" ry="2.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="272;248;221" dur="4.9s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`820;${820 + windDriftX * 0.6};${820 + windDriftX * 1.4}`} dur="4.9s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${7 + windDispersion};${11 + windDispersion * 2.8}`} dur="4.9s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;6;9" dur="4.9s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.4;0" dur="4.9s" begin="1.5s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 9 - Improved */}
          {activeChimneys.has(9) && (
            <g className="chimney-smoke">
              <ellipse cx="931" cy="273" rx="3.5" ry="3" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="273;249;222" dur="4.9s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`931;${931 + windDriftX * 0.4};${931 + windDriftX * 0.9}`} dur="4.9s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${6 + windDispersion};${10 + windDispersion * 2.6}`} dur="4.9s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;5.5;9" dur="4.9s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0.55;0" dur="4.9s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="931" cy="272" rx="4" ry="3.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="272;246;218" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`931;${931 + windDriftX * 0.5};${931 + windDriftX * 1.1}`} dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4;${7 + windDispersion};${11 + windDispersion * 3}`} dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3.5;6;9.5" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.45;0" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 10 - Improved */}
          {activeChimneys.has(10) && (
            <g className="chimney-smoke">
              <ellipse cx="1016" cy="277" rx="3" ry="2.5" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="277;254;228" dur="4.6s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`1016;${1016 + windDriftX * 0.4};${1016 + windDriftX * 0.9}`} dur="4.6s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${5.5 + windDispersion};${9 + windDispersion * 2.5}`} dur="4.6s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;5;8.5" dur="4.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0.55;0" dur="4.6s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="1016" cy="276" rx="3.5" ry="3" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="276;251;223" dur="4.9s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`1016;${1016 + windDriftX * 0.5};${1016 + windDriftX * 1.1}`} dur="4.9s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${6 + windDispersion};${9.5 + windDispersion * 2.8}`} dur="4.9s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;5.5;8.5" dur="4.9s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.45;0" dur="4.9s" begin="0.7s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 11 - Improved */}
          {activeChimneys.has(11) && (
            <g className="chimney-smoke">
              <ellipse cx="1052" cy="273" rx="4" ry="3.5" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="273;248;220" dur="5s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`1052;${1052 + windDriftX * 0.4};${1052 + windDriftX * 0.95}`} dur="5s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4;${6.5 + windDispersion};${10.5 + windDispersion * 2.8}`} dur="5s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3.5;6;9.5" dur="5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.6;0" dur="5s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="1052" cy="272" rx="3.5" ry="3" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="272;245;217" dur="5.2s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`1052;${1052 + windDriftX * 0.5};${1052 + windDriftX * 1.1}`} dur="5.2s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${7 + windDispersion};${11 + windDispersion * 3}`} dur="5.2s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;6.5;10" dur="5.2s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.5;0" dur="5.2s" begin="0.8s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="1052" cy="275" rx="3" ry="2.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="275;250;223" dur="4.8s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`1052;${1052 + windDriftX * 0.6};${1052 + windDriftX * 1.4}`} dur="4.8s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${6.5 + windDispersion};${10 + windDispersion * 2.5}`} dur="4.8s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;6;9" dur="4.8s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.4;0" dur="4.8s" begin="1.5s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* Smoke from chimney 12 - Improved */}
          {activeChimneys.has(12) && (
            <g className="chimney-smoke">
              <ellipse cx="1168" cy="277" rx="3.5" ry="3" fill={`url(#smoke-puff-dense-${instanceId})`}>
                <animate attributeName="cy" values="277;253;226" dur="4.8s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`1168;${1168 + windDriftX * 0.4};${1168 + windDriftX * 0.9}`} dur="4.8s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3.5;${6 + windDispersion};${10 + windDispersion * 2.6}`} dur="4.8s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3;5.5;9" dur="4.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0.55;0" dur="4.8s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="1168" cy="276" rx="4" ry="3.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="276;250;222" dur="5.1s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`1168;${1168 + windDriftX * 0.5};${1168 + windDriftX * 1.1}`} dur="5.1s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`4;${7 + windDispersion};${11 + windDispersion * 3}`} dur="5.1s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="ry" values="3.5;6;9.5" dur="5.1s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0.45;0" dur="5.1s" begin="0.6s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="1168" cy="278" rx="3" ry="2.5" fill={`url(#smoke-puff-wispy-${instanceId})`}>
                <animate attributeName="cy" values="278;255;229" dur="4.7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`1168;${1168 + windDriftX * 0.6};${1168 + windDriftX * 1.3}`} dur="4.7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`3;${6.5 + windDispersion};${10.5 + windDispersion * 2.8}`} dur="4.7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="ry" values="2.5;5.5;8.5" dur="4.7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.4;0" dur="4.7s" begin="1.2s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}
        </svg>
        )}

        {/* ILLUMINATED WINDOWS - Active during dusk/night */}
        {!prefersReducedMotion && (isDusk || isNight) && (
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="xMidYMax slice"
            style={{ opacity: baseOpacity, pointerEvents: 'none' }}
          >
            <defs>
              {/* Window glow filter */}
              <filter id={`window-glow-${instanceId}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Flickering candlelight windows - Upper floors of residential buildings */}
            {/* Building 1 - LEFT */}
            <rect x="20" y="287" width="4" height="5" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.6;0.85;0.7;0.9;0.75" dur="6s" repeatCount="indefinite" />
            </rect>
            <rect x="32" y="287" width="4" height="5" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.8;0.65;0.85;0.7" dur="5.5s" repeatCount="indefinite" />
            </rect>

            {/* Building 2 - Multiple windows - FIXED ALIGNMENT */}
            <rect x="53" y="279" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.65;0.9;0.7;0.8;0.7" dur="5.8s" repeatCount="indefinite" />
            </rect>
            <rect x="67" y="279" width="3" height="4" fill="rgba(255,200,100,0.85)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.75;0.85;0.8;0.9;0.75" dur="6.2s" repeatCount="indefinite" />
            </rect>
            <rect x="75" y="279" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.6;0.75;0.7;0.85;0.65" dur="5.3s" repeatCount="indefinite" />
            </rect>
            <rect x="53" y="287" width="3" height="5" fill="rgba(255,200,100,0.7)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.5;0.8;0.65;0.75;0.6" dur="6.5s" repeatCount="indefinite" />
            </rect>
            <rect x="69" y="287" width="3" height="5" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.7s" repeatCount="indefinite" />
            </rect>

            {/* Cathedral windows - dimmer, steadier light (religious vigil candles) */}
            <rect x="107" y="250" width="5" height="8" fill="rgba(255,220,150,0.6)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.5;0.55;0.52;0.58;0.5" dur="8s" repeatCount="indefinite" />
            </rect>
            <rect x="145" y="250" width="5" height="8" fill="rgba(255,220,150,0.6)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.52;0.58;0.5;0.56;0.52" dur="8.5s" repeatCount="indefinite" />
            </rect>

            {/* More residential windows across skyline */}
            <rect x="198" y="288" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.65;0.8;0.7;0.85;0.65" dur="5.9s" repeatCount="indefinite" />
            </rect>
            <rect x="208" y="288" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="6.1s" repeatCount="indefinite" />
            </rect>

            {/* El Consulado de Mercaderes - NEW merchant guild windows */}
            <rect x="280" y="266" width="8" height="10" fill="rgba(255,210,120,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="6.1s" repeatCount="indefinite" />
            </rect>
            <rect x="298" y="266" width="8" height="10" fill="rgba(255,210,120,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.75;0.9;0.8;0.95;0.75" dur="5.8s" repeatCount="indefinite" />
            </rect>
            <rect x="316" y="266" width="8" height="10" fill="rgba(255,210,120,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="6.3s" repeatCount="indefinite" />
            </rect>

            {/* Church windows */}
            <rect x="272" y="271" width="3" height="5" fill="rgba(255,220,150,0.55)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.48;0.54;0.5;0.56;0.48" dur="9s" repeatCount="indefinite" />
            </rect>
            <rect x="282" y="271" width="3" height="5" fill="rgba(255,220,150,0.55)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.5;0.56;0.52;0.58;0.5" dur="8.7s" repeatCount="indefinite" />
            </rect>

            {/* Palace windows - brighter, more numerous */}
            <rect x="377" y="264" width="4" height="6" fill="rgba(255,210,120,0.85)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.75;0.9;0.8;0.95;0.75" dur="5.5s" repeatCount="indefinite" />
            </rect>
            <rect x="387" y="264" width="4" height="6" fill="rgba(255,210,120,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.8s" repeatCount="indefinite" />
            </rect>
            <rect x="397" y="264" width="4" height="6" fill="rgba(255,210,120,0.85)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.75;0.9;0.8;0.95;0.75" dur="6s" repeatCount="indefinite" />
            </rect>

            {/* Additional scattered residential windows */}
            <rect x="467" y="277" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.6;0.8;0.7;0.85;0.6" dur="6.3s" repeatCount="indefinite" />
            </rect>
            <rect x="478" y="277" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.6s" repeatCount="indefinite" />
            </rect>

            <rect x="542" y="271" width="3" height="5" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.65;0.8;0.7;0.85;0.65" dur="6.2s" repeatCount="indefinite" />
            </rect>
            <rect x="560" y="271" width="3" height="5" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.9s" repeatCount="indefinite" />
            </rect>

            {/* Mid-right residential cluster - FIXED to match actual windows */}
            <rect x="601" y="287" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.6;0.8;0.7;0.85;0.6" dur="6.4s" repeatCount="indefinite" />
            </rect>
            <rect x="611" y="287" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.7s" repeatCount="indefinite" />
            </rect>

            {/* Mid-center residential - NEW glows for existing windows */}
            <rect x="761" y="289" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.65;0.8;0.7;0.85;0.65" dur="6.3s" repeatCount="indefinite" />
            </rect>
            <rect x="774" y="292" width="3" height="4" fill="rgba(255,200,100,0.7)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.6;0.75;0.7;0.8;0.6" dur="5.8s" repeatCount="indefinite" />
            </rect>

            {/* Larger residential with balconies - NEW glows */}
            <rect x="796" y="282" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="6.1s" repeatCount="indefinite" />
            </rect>
            <rect x="812" y="287" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.65;0.8;0.7;0.85;0.65" dur="5.9s" repeatCount="indefinite" />
            </rect>
            <rect x="796" y="293" width="3" height="4" fill="rgba(255,200,100,0.7)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.6;0.75;0.65;0.8;0.6" dur="6.4s" repeatCount="indefinite" />
            </rect>

            <rect x="876" y="286" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.65;0.8;0.7;0.85;0.65" dur="6.1s" repeatCount="indefinite" />
            </rect>
            <rect x="886" y="286" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.8s" repeatCount="indefinite" />
            </rect>

            {/* Far-right residential - FIXED ALIGNMENT */}
            <rect x="908" y="286" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.6;0.8;0.7;0.85;0.6" dur="6.2s" repeatCount="indefinite" />
            </rect>
            <rect x="922" y="290" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.9s" repeatCount="indefinite" />
            </rect>

            <rect x="1001" y="287" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.65;0.8;0.7;0.85;0.65" dur="6.3s" repeatCount="indefinite" />
            </rect>
            <rect x="1010" y="287" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.6s" repeatCount="indefinite" />
            </rect>

            <rect x="1034" y="285" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.6;0.8;0.7;0.85;0.6" dur="6.4s" repeatCount="indefinite" />
            </rect>
            <rect x="1046" y="285" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.7s" repeatCount="indefinite" />
            </rect>

            <rect x="1069" y="288" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.65;0.8;0.7;0.85;0.65" dur="6.1s" repeatCount="indefinite" />
            </rect>
            <rect x="1078" y="288" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.8s" repeatCount="indefinite" />
            </rect>

            {/* La Merced Market complex - NEW church and bell tower windows */}
            {/* Left bell tower */}
            <rect x="1105" y="250" width="4" height="5" fill="rgba(255,220,150,0.55)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.48;0.54;0.5;0.56;0.48" dur="8.5s" repeatCount="indefinite" />
            </rect>
            {/* Right bell tower */}
            <rect x="1131" y="250" width="4" height="5" fill="rgba(255,220,150,0.55)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.5;0.56;0.52;0.58;0.5" dur="8.8s" repeatCount="indefinite" />
            </rect>
            {/* Rose window - central church */}
            <circle cx="1120" cy="268" r="4" fill="rgba(255,220,150,0.6)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.52;0.58;0.54;0.6;0.52" dur="9.2s" repeatCount="indefinite" />
            </circle>

            <rect x="1151" y="287" width="3" height="4" fill="rgba(255,200,100,0.75)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.65;0.8;0.7;0.85;0.65" dur="6.2s" repeatCount="indefinite" />
            </rect>
            <rect x="1161" y="287" width="3" height="4" fill="rgba(255,200,100,0.8)" filter={`url(#window-glow-${instanceId})`}>
              <animate attributeName="opacity" values="0.7;0.85;0.75;0.9;0.7" dur="5.9s" repeatCount="indefinite" />
            </rect>
          </svg>
        )}

        {/* ACTIVITY INDICATORS - Subtle life in the city */}
        {!prefersReducedMotion && (
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMax slice"
          style={{ opacity: baseOpacity, pointerEvents: 'none' }}
        >
          {/* IMPROVED Swaying clotheslines - more visible and detailed */}
          <g className="clotheslines">
            {/* Clothesline 1 - Between buildings */}
            <line x1="56" y1="284" x2="76" y2="284"
                  stroke="rgba(80,70,60,0.6)"
                  strokeWidth="0.8"
                 >
              <animate attributeName="y1"
                       values={`284;${284 - windSpeed * 0.15};284`}
                       dur={`${Math.max(2, 4 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
              <animate attributeName="y2"
                       values={`284;${284 - windSpeed * 0.12};284`}
                       dur={`${Math.max(2, 4 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
            </line>
            {/* Hanging garment 1 - white shirt */}
            <rect x="60" y="284" width="4" height="5" fill="rgba(240,235,220,0.75)" stroke="rgba(200,190,180,0.3)" strokeWidth="0.3">
              <animate attributeName="y"
                       values={`284;${284 - windSpeed * 0.15};284`}
                       dur={`${Math.max(2, 4 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
              <animate attributeName="x"
                       values={`60;${60 + windDriftX * 0.03};60`}
                       dur={`${Math.max(2, 4 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
            </rect>
            {/* Hanging garment 2 - darker cloth */}
            <rect x="67" y="284" width="3" height="4" fill="rgba(180,160,140,0.7)" stroke="rgba(150,130,110,0.3)" strokeWidth="0.3">
              <animate attributeName="y"
                       values={`284;${284 - windSpeed * 0.15};284`}
                       dur={`${Math.max(2, 4 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
              <animate attributeName="x"
                       values={`67;${67 + windDriftX * 0.03};67`}
                       dur={`${Math.max(2, 4 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
            </rect>

            {/* Clothesline 2 - Right side buildings */}
            <line x1="1034" y1="287" x2="1052" y2="287"
                  stroke="rgba(80,70,60,0.55)"
                  strokeWidth="0.8"
                 >
              <animate attributeName="y1"
                       values={`287;${287 - windSpeed * 0.12};287`}
                       dur={`${Math.max(2.2, 4.2 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
              <animate attributeName="y2"
                       values={`287;${287 - windSpeed * 0.1};287`}
                       dur={`${Math.max(2.2, 4.2 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
            </line>
            {/* Hanging garment 3 - light colored */}
            <rect x="1038" y="287" width="3" height="4" fill="rgba(220,215,200,0.7)" stroke="rgba(190,180,170,0.3)" strokeWidth="0.3">
              <animate attributeName="y"
                       values={`287;${287 - windSpeed * 0.12};287`}
                       dur={`${Math.max(2.2, 4.2 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
              <animate attributeName="x"
                       values={`1038;${1038 + windDriftX * 0.02};1038`}
                       dur={`${Math.max(2.2, 4.2 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
            </rect>
            {/* Hanging garment 4 - medium tone */}
            <rect x="1045" y="287" width="4" height="5" fill="rgba(200,190,180,0.75)" stroke="rgba(170,160,150,0.3)" strokeWidth="0.3">
              <animate attributeName="y"
                       values={`287;${287 - windSpeed * 0.12};287`}
                       dur={`${Math.max(2.2, 4.2 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
              <animate attributeName="x"
                       values={`1045;${1045 + windDriftX * 0.02};1045`}
                       dur={`${Math.max(2.2, 4.2 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
            </rect>

            {/* Clothesline 3 - Mid-section */}
            <line x1="293" y1="286" x2="310" y2="286"
                  stroke="rgba(80,70,60,0.5)"
                  strokeWidth="0.7"
                 >
              <animate attributeName="y1"
                       values={`286;${286 - windSpeed * 0.13};286`}
                       dur={`${Math.max(2.1, 4.1 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
              <animate attributeName="y2"
                       values={`286;${286 - windSpeed * 0.11};286`}
                       dur={`${Math.max(2.1, 4.1 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
            </line>
            {/* Hanging garment 5 */}
            <rect x="299" y="286" width="3" height="4" fill="rgba(230,220,210,0.7)" stroke="rgba(200,190,180,0.3)" strokeWidth="0.3">
              <animate attributeName="y"
                       values={`286;${286 - windSpeed * 0.13};286`}
                       dur={`${Math.max(2.1, 4.1 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
              <animate attributeName="x"
                       values={`299;${299 + windDriftX * 0.025};299`}
                       dur={`${Math.max(2.1, 4.1 - windSpeed * 0.08)}s`}
                       repeatCount="indefinite" />
            </rect>
          </g>

          {/* Church bell indicators - appear during dawn (6-7 AM) and dusk (6-7 PM) */}
          {(currentHour === 6 || currentHour === 18) && (
            <g className="bell-rings">
              {/* Metropolitan Cathedral bells */}
              <g opacity="0">
                <circle cx="109" cy="200" r="8" fill="none" stroke="rgba(255,255,200,0.4)" strokeWidth="0.5">
                  <animate attributeName="r" values="3;12;20" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="109" cy="200" r="8" fill="none" stroke="rgba(255,255,200,0.4)" strokeWidth="0.5">
                  <animate attributeName="r" values="3;12;20" dur="3s" begin="0.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.6;0" dur="3s" begin="0.5s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Second cathedral tower */}
              <g opacity="0">
                <circle cx="168" cy="200" r="8" fill="none" stroke="rgba(255,255,200,0.4)" strokeWidth="0.5">
                  <animate attributeName="r" values="3;12;20" dur="3s" begin="0.3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.6;0" dur="3s" begin="0.3s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Church with needle spire */}
              <g opacity="0">
                <circle cx="276" cy="255" r="6" fill="none" stroke="rgba(255,255,200,0.3)" strokeWidth="0.4">
                  <animate attributeName="r" values="2;10;16" dur="3.5s" begin="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.5;0" dur="3.5s" begin="1s" repeatCount="indefinite" />
                </circle>
              </g>
            </g>
          )}

          {/* Occasional door opening - only during daytime (7 AM - 7 PM) */}
          {(currentHour >= 7 && currentHour < 19 && (smokeSeed % 5 === 0)) && (
            <g className="door-activity">
              {/* Door on residential building */}
              <rect x="26" y="290" width="5" height="10" fill="rgba(100,80,60,0.8)" />
              {/* Person silhouette in doorway */}
              <g opacity="0">
                <ellipse cx="28.5" cy="295" rx="1" ry="1.5" fill="rgba(60,50,40,0.6)">
                  <animate attributeName="opacity" values="0;0;0.8;0.8;0" dur="8s" repeatCount="indefinite" />
                </ellipse>
                <rect x="27.5" y="296" width="2" height="3.5" fill="rgba(60,50,40,0.6)">
                  <animate attributeName="opacity" values="0;0;0.8;0.8;0" dur="8s" repeatCount="indefinite" />
                </rect>
              </g>
            </g>
          )}
        </svg>
        )}

        {/* Tree silhouettes in foreground - SOLID (no transparency) */}
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMax slice"
          style={{
            opacity: 1.0,
            '--wind-sway-amount': `${windSpeed * 0.3}px`,
            '--wind-sway-duration': `${Math.max(2, 4 - windSpeed * 0.1)}s`
          }}
        >
          <defs>
            {/* IMPROVED: Multiple tree gradient variations with time-aware colors and radial depth */}

            {/* Type A: Dark Cypress (cooler blue-green) - Radial with highlight */}
            <radialGradient id={`tree-cypress-${instanceId}`} cx="40%" cy="30%">
              <stop offset="0%" style={{
                stopColor: isDawn || isDusk ? '#2a5835' : (isNight ? '#0a2818' : '#1a4828'),
                stopOpacity: 1.0
              }} />
              <stop offset="35%" style={{
                stopColor: isDawn || isDusk ? '#1a4428' : (isNight ? '#08201a' : '#0f3a20'),
                stopOpacity: 1.0
              }} />
              <stop offset="70%" style={{
                stopColor: isDawn || isDusk ? '#0f3018' : (isNight ? '#061815' : '#0a2818'),
                stopOpacity: 1.0
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn || isDusk ? '#0a2515' : (isNight ? '#041210' : '#071f13'),
                stopOpacity: 1.0
              }} />
            </radialGradient>

            {/* Type B: Medium Ahuehuete (balanced green) - Radial with warmth */}
            <radialGradient id={`tree-ahuehuete-${instanceId}`} cx="45%" cy="35%">
              <stop offset="0%" style={{
                stopColor: isDawn || isDusk ? '#3a6840' : (isNight ? '#0c2a1a' : '#1a4d28'),
                stopOpacity: 1.0
              }} />
              <stop offset="40%" style={{
                stopColor: isDawn || isDusk ? '#2a5030' : (isNight ? '#0a2318' : '#12382a'),
                stopOpacity: 1.0
              }} />
              <stop offset="75%" style={{
                stopColor: isDawn || isDusk ? '#1a3820' : (isNight ? '#071a12' : '#0c2a1c'),
                stopOpacity: 1.0
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn || isDusk ? '#122818' : (isNight ? '#051410' : '#081f15'),
                stopOpacity: 1.0
              }} />
            </radialGradient>

            {/* Type C: Lighter Foliage (warmer yellow-green) - Radial with glow */}
            <radialGradient id={`tree-light-${instanceId}`} cx="50%" cy="40%">
              <stop offset="0%" style={{
                stopColor: isDawn || isDusk ? '#4a7848' : (isNight ? '#0e2c1c' : '#285d30'),
                stopOpacity: 1.0
              }} />
              <stop offset="35%" style={{
                stopColor: isDawn || isDusk ? '#355a38' : (isNight ? '#0b241a' : '#1a4625'),
                stopOpacity: 1.0
              }} />
              <stop offset="70%" style={{
                stopColor: isDawn || isDusk ? '#254028' : (isNight ? '#081c14' : '#0f3020'),
                stopOpacity: 1.0
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn || isDusk ? '#1a3020' : (isNight ? '#061612' : '#0a251a'),
                stopOpacity: 1.0
              }} />
            </radialGradient>

            {/* Type D: Shrub (warmer, bushier appearance) - Radial with spread */}
            <radialGradient id={`tree-shrub-${instanceId}`} cx="50%" cy="45%">
              <stop offset="0%" style={{
                stopColor: isDawn || isDusk ? '#4d7a45' : (isNight ? '#0f2e1e' : '#2d6038'),
                stopOpacity: 1.0
              }} />
              <stop offset="45%" style={{
                stopColor: isDawn || isDusk ? '#385c35' : (isNight ? '#0c251c' : '#1c4828'),
                stopOpacity: 1.0
              }} />
              <stop offset="80%" style={{
                stopColor: isDawn || isDusk ? '#28422a' : (isNight ? '#091e16' : '#123522'),
                stopOpacity: 1.0
              }} />
              <stop offset="100%" style={{
                stopColor: isDawn || isDusk ? '#1d3222' : (isNight ? '#071814' : '#0d281d'),
                stopOpacity: 1.0
              }} />
            </radialGradient>
          </defs>

          {/* Mexican trees - cypresses (tall columnar) and ahuehuetes (broader) */}

          {/* Left cluster - mix of cypress and broader trees */}
          {/* Tall cypress with visible trunk */}
          <g>
            <ellipse cx="45" cy="285" rx="4" ry="15" fill={`url(#tree-cypress-${instanceId})`}>
              {!prefersReducedMotion && (
                <animate attributeName="cx"
                  values={`45;${45 + windDriftX * 0.08};45`}
                  dur={`${Math.max(2.5, 4.5 - windSpeed * 0.1)}s`}
                  repeatCount="indefinite" />
              )}
            </ellipse>
            <rect x="43.5" y="293" width="3" height="7" fill={isDawn || isDusk ? '#2a2018' : (isNight ? '#0a0805' : '#1a1208')} />
          </g>

          {/* Ahuehuete - broader with trunk and branch hints */}
          <g>
            <ellipse cx="60" cy="287" rx="11" ry="13" fill={`url(#tree-ahuehuete-${instanceId})`}>
              {!prefersReducedMotion && (
                <animate attributeName="cx"
                  values={`60;${60 + windDriftX * 0.06};60`}
                  dur={`${Math.max(2.8, 5 - windSpeed * 0.12)}s`}
                  repeatCount="indefinite" />
              )}
            </ellipse>
            <ellipse cx="55" cy="291" rx="4" ry="5" fill={`url(#tree-ahuehuete-${instanceId})`} opacity="0.6" />
            <ellipse cx="65" cy="290" rx="5" ry="6" fill={`url(#tree-ahuehuete-${instanceId})`} opacity="0.5" />
            <rect x="58.5" y="295" width="3" height="5" fill={isDawn || isDusk ? '#2d2218' : (isNight ? '#0d0a08' : '#1d1408')} />
          </g>

          {/* Cypress with visible trunk */}
          <g>
            <ellipse cx="72" cy="286" rx="3" ry="13" fill={`url(#tree-cypress-${instanceId})`}>
              {!prefersReducedMotion && (
                <animate attributeName="cx"
                  values={`72;${72 + windDriftX * 0.09};72`}
                  dur={`${Math.max(2.3, 4.3 - windSpeed * 0.09)}s`}
                  repeatCount="indefinite" />
              )}
            </ellipse>
            <rect x="70.5" y="294" width="3" height="6" fill={isDawn || isDusk ? '#282018' : (isNight ? '#080605' : '#181208')} />
          </g>

          {/* Small shrub */}
          <ellipse cx="35" cy="294" rx="8" ry="10" fill={`url(#tree-shrub-${instanceId})`} />

          {/* Trees throughout cityscape - smaller, varied */}
          {/* Cypress */}
          <ellipse cx="180" cy="291" rx="5" ry="15" fill={`url(#tree-cypress-${instanceId})`}>
            {!prefersReducedMotion && (
              <animate attributeName="cx"
                values={`180;${180 + windDriftX * 0.08};180`}
                dur={`${Math.max(2.6, 4.6 - windSpeed * 0.11)}s`}
                repeatCount="indefinite" />
            )}
          </ellipse>
          <ellipse cx="195" cy="293" rx="8" ry="11" fill={`url(#tree-shrub-${instanceId})`} />

          {/* Cypress pair */}
          <ellipse cx="310" cy="289" rx="5" ry="17" fill={`url(#tree-cypress-${instanceId})`}>
            {!prefersReducedMotion && (
              <animate attributeName="cx"
                values={`310;${310 + windDriftX * 0.09};310`}
                dur={`${Math.max(2.4, 4.4 - windSpeed * 0.1)}s`}
                repeatCount="indefinite" />
            )}
          </ellipse>
          <ellipse cx="323" cy="291" rx="9" ry="13" fill={`url(#tree-ahuehuete-${instanceId})`} />

          {/* Single cypress */}
          <ellipse cx="440" cy="291" rx="4" ry="14" fill={`url(#tree-cypress-${instanceId})`}>
            {!prefersReducedMotion && (
              <animate attributeName="cx"
                values={`440;${440 + windDriftX * 0.07};440`}
                dur={`${Math.max(2.7, 4.7 - windSpeed * 0.11)}s`}
                repeatCount="indefinite" />
            )}
          </ellipse>

          {/* Tree cluster */}
          <ellipse cx="545" cy="289" rx="6" ry="16" fill={`url(#tree-light-${instanceId})`}>
            {!prefersReducedMotion && (
              <animate attributeName="cx"
                values={`545;${545 + windDriftX * 0.08};545`}
                dur={`${Math.max(2.5, 4.5 - windSpeed * 0.1)}s`}
                repeatCount="indefinite" />
            )}
          </ellipse>
          <ellipse cx="558" cy="292" rx="8" ry="12" fill={`url(#tree-shrub-${instanceId})`} />

          {/* Tall cypress with visible trunk */}
          <g>
            <ellipse cx="680" cy="287" rx="4" ry="14" fill={`url(#tree-cypress-${instanceId})`}>
              {!prefersReducedMotion && (
                <animate attributeName="cx"
                  values={`680;${680 + windDriftX * 0.09};680`}
                  dur={`${Math.max(2.3, 4.3 - windSpeed * 0.09)}s`}
                  repeatCount="indefinite" />
              )}
            </ellipse>
            <rect x="678.5" y="295" width="3" height="5" fill={isDawn || isDusk ? '#2a2018' : (isNight ? '#0a0805' : '#1a1208')} />
          </g>

          {/* Tree grouping - taller tree with visible trunk */}
          <g>
            <ellipse cx="808" cy="285" rx="5" ry="15" fill={`url(#tree-light-${instanceId})`}>
              {!prefersReducedMotion && (
                <animate attributeName="cx"
                  values={`808;${808 + windDriftX * 0.1};808`}
                  dur={`${Math.max(2.2, 4.2 - windSpeed * 0.09)}s`}
                  repeatCount="indefinite" />
              )}
            </ellipse>
            <rect x="806.5" y="294" width="3" height="6" fill={isDawn || isDusk ? '#2d2218' : (isNight ? '#0d0a08' : '#1d1408')} />
          </g>
          {/* Companion ahuehuete with branch clusters and trunk */}
          <g>
            <ellipse cx="822" cy="288" rx="10" ry="13" fill={`url(#tree-ahuehuete-${instanceId})`} />
            <ellipse cx="817" cy="292" rx="4" ry="5" fill={`url(#tree-ahuehuete-${instanceId})`} opacity="0.6" />
            <ellipse cx="827" cy="291" rx="5" ry="6" fill={`url(#tree-ahuehuete-${instanceId})`} opacity="0.5" />
            <rect x="820.5" y="296" width="3" height="4" fill={isDawn || isDusk ? '#2d2218' : (isNight ? '#0d0a08' : '#1d1408')} />
          </g>

          {/* Cypress and shrub */}
          <ellipse cx="950" cy="291" rx="5" ry="15" fill={`url(#tree-cypress-${instanceId})`}>
            {!prefersReducedMotion && (
              <animate attributeName="cx"
                values={`950;${950 + windDriftX * 0.08};950`}
                dur={`${Math.max(2.6, 4.6 - windSpeed * 0.11)}s`}
                repeatCount="indefinite" />
            )}
          </ellipse>
          <ellipse cx="963" cy="293" rx="7" ry="10" fill={`url(#tree-shrub-${instanceId})`} />

          {/* Right cluster - more prominent */}
          {/* Cypress with visible trunk */}
          <g>
            <ellipse cx="1095" cy="286" rx="4" ry="14" fill={`url(#tree-cypress-${instanceId})`}>
              {!prefersReducedMotion && (
                <animate attributeName="cx"
                  values={`1095;${1095 + windDriftX * 0.09};1095`}
                  dur={`${Math.max(2.4, 4.4 - windSpeed * 0.1)}s`}
                  repeatCount="indefinite" />
              )}
            </ellipse>
            <rect x="1092.5" y="294" width="3" height="6" fill={isDawn || isDusk ? '#2a2018' : (isNight ? '#0a0805' : '#1a1208')} />
          </g>

          {/* Ahuehuete - with trunk and branch clusters */}
          <g>
            <ellipse cx="1110" cy="288" rx="11" ry="14" fill={`url(#tree-ahuehuete-${instanceId})`}>
              {!prefersReducedMotion && (
                <animate attributeName="cx"
                  values={`1110;${1110 + windDriftX * 0.06};1110`}
                  dur={`${Math.max(2.9, 5.2 - windSpeed * 0.12)}s`}
                  repeatCount="indefinite" />
              )}
            </ellipse>
            <ellipse cx="1104" cy="292" rx="5" ry="6" fill={`url(#tree-ahuehuete-${instanceId})`} opacity="0.6" />
            <ellipse cx="1116" cy="291" rx="4" ry="5" fill={`url(#tree-ahuehuete-${instanceId})`} opacity="0.5" />
            <rect x="1107" y="297" width="3" height="3" fill={isDawn || isDusk ? '#2d2218' : (isNight ? '#0d0a08' : '#1d1408')} />
          </g>

          {/* Two cypresses with visible trunks */}
          <g>
            <ellipse cx="1125" cy="287" rx="3" ry="13" fill={`url(#tree-cypress-${instanceId})`}>
              {!prefersReducedMotion && (
                <animate attributeName="cx"
                  values={`1125;${1125 + windDriftX * 0.09};1125`}
                  dur={`${Math.max(2.3, 4.3 - windSpeed * 0.09)}s`}
                  repeatCount="indefinite" />
              )}
            </ellipse>
            <rect x="1122.5" y="295" width="3" height="5" fill={isDawn || isDusk ? '#282018' : (isNight ? '#080605' : '#181208')} />
          </g>

          <g>
            <ellipse cx="1138" cy="289" rx="3.5" ry="12" fill={`url(#tree-cypress-${instanceId})`}>
              {!prefersReducedMotion && (
                <animate attributeName="cx"
                  values={`1138;${1138 + windDriftX * 0.07};1138`}
                  dur={`${Math.max(2.7, 4.7 - windSpeed * 0.11)}s`}
                  repeatCount="indefinite" />
              )}
            </ellipse>
            <rect x="1135.5" y="296" width="3" height="4" fill={isDawn || isDusk ? '#282018' : (isNight ? '#080605' : '#181208')} />
          </g>

          {/* Small shrub */}
          <ellipse cx="1152" cy="293" rx="8" ry="11" fill={`url(#tree-shrub-${instanceId})`} />
        </svg>

        {/* Bird flocks - flying or perched */}
        {birds.length > 0 && (
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="xMidYMax slice"
            style={{ opacity: baseOpacity, pointerEvents: 'none', zIndex: 10 }}
          >
            {birds.map(bird => (
              <circle
                key={bird.id}
                cx={bird.x}
                cy={bird.y}
                r="0.5"
                fill="rgba(0, 0, 0, 0.9)"
                style={{
                  animation: prefersReducedMotion ? 'none' : 'bird-pulse 1.3s ease-in-out infinite alternate'
                }}
              />
            ))}
          </svg>
        )}

        {/* Person-in-window animations - silhouettes leaning out */}
        {windowPeople.length > 0 && (
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="xMidYMax slice"
            style={{ opacity: baseOpacity, pointerEvents: 'none', zIndex: 11 }}
          >
            {windowPeople.map(person => {
              const opacity = person.phase === 'appearing' ? 0.3 :
                             person.phase === 'disappearing' ? 0.3 : 0.6;
              const leanDistance = person.phase === 'leaning' ? 3 : 0;

              return (
                <g key={person.id} style={{
                  opacity,
                  transition: 'opacity 0.5s ease-in-out'
                }}>
                  {/* Simple person silhouette - head and upper body leaning out */}
                  {/* Head */}
                  <ellipse
                    cx={person.x + leanDistance}
                    cy={person.y - 2}
                    rx="1.5"
                    ry="1.8"
                    fill="rgba(0, 0, 0, 0.8)"
                    style={{ transition: 'all 0.5s ease-in-out' }}
                  />
                  {/* Upper body/shoulders */}
                  <path
                    d={`M ${person.x + leanDistance - 1.5} ${person.y}
                        L ${person.x + leanDistance + 1.5} ${person.y}
                        L ${person.x + leanDistance + 2} ${person.y + 3}
                        L ${person.x + leanDistance - 2} ${person.y + 3} Z`}
                    fill="rgba(0, 0, 0, 0.75)"
                    style={{ transition: 'all 0.5s ease-in-out' }}
                  />
                  {/* Arm leaning on windowsill */}
                  <line
                    x1={person.x + leanDistance}
                    y1={person.y + 1}
                    x2={person.x + leanDistance + 3}
                    y2={person.y + 2}
                    stroke="rgba(0, 0, 0, 0.7)"
                    strokeWidth="0.8"
                    style={{ transition: 'all 0.5s ease-in-out' }}
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* Walking figures at ground level - charming pixel art people */}
        {walkingFigures.length > 0 && (
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="xMidYMax slice"
            style={{ opacity: baseOpacity * 0.8, pointerEvents: 'none', zIndex: 9 }}
          >
            {walkingFigures.map(figure => {
              const legPhase = `leg-${figure.id}`;
              return (
                <g key={figure.id}>
                  {/* Charming pixel art person */}

                  {/* Head - round */}
                  <circle
                    cx={figure.x}
                    cy={figure.y - 4.5}
                    r="0.8"
                    fill="rgba(0, 0, 0, 0.7)"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${figure.targetX - figure.x} 0`}
                      dur={`${Math.abs(figure.targetX - figure.x) / figure.speed / 60}s`}
                      repeatCount="1"
                    />
                  </circle>

                  {/* Body - small rectangle */}
                  <rect
                    x={figure.x - 0.6}
                    y={figure.y - 3.5}
                    width="1.2"
                    height="2"
                    fill="rgba(0, 0, 0, 0.7)"
                    rx="0.2"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${figure.targetX - figure.x} 0`}
                      dur={`${Math.abs(figure.targetX - figure.x) / figure.speed / 60}s`}
                      repeatCount="1"
                    />
                  </rect>

                  {/* Left leg - swings back and forth */}
                  <line
                    x1={figure.x - 0.2}
                    y1={figure.y - 1.5}
                    x2={figure.x - 0.2}
                    y2={figure.y}
                    stroke="rgba(0, 0, 0, 0.7)"
                    strokeWidth="0.4"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${figure.targetX - figure.x} 0`}
                      dur={`${Math.abs(figure.targetX - figure.x) / figure.speed / 60}s`}
                      repeatCount="1"
                    />
                    <animate
                      attributeName="x2"
                      values={`${figure.x - 0.2 + (figure.direction * 0.8)};${figure.x - 0.2 - (figure.direction * 0.8)};${figure.x - 0.2 + (figure.direction * 0.8)}`}
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Right leg - swings opposite to left leg */}
                  <line
                    x1={figure.x + 0.2}
                    y1={figure.y - 1.5}
                    x2={figure.x + 0.2}
                    y2={figure.y}
                    stroke="rgba(0, 0, 0, 0.7)"
                    strokeWidth="0.4"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${figure.targetX - figure.x} 0`}
                      dur={`${Math.abs(figure.targetX - figure.x) / figure.speed / 60}s`}
                      repeatCount="1"
                    />
                    <animate
                      attributeName="x2"
                      values={`${figure.x + 0.2 - (figure.direction * 0.8)};${figure.x + 0.2 + (figure.direction * 0.8)};${figure.x + 0.2 - (figure.direction * 0.8)}`}
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Left arm - tiny, swings slightly */}
                  <line
                    x1={figure.x - 0.6}
                    y1={figure.y - 3}
                    x2={figure.x - 0.6}
                    y2={figure.y - 2.2}
                    stroke="rgba(0, 0, 0, 0.6)"
                    strokeWidth="0.3"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${figure.targetX - figure.x} 0`}
                      dur={`${Math.abs(figure.targetX - figure.x) / figure.speed / 60}s`}
                      repeatCount="1"
                    />
                    <animate
                      attributeName="x2"
                      values={`${figure.x - 0.6 - (figure.direction * 0.3)};${figure.x - 0.6 + (figure.direction * 0.3)};${figure.x - 0.6 - (figure.direction * 0.3)}`}
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Right arm - tiny, swings opposite to left arm */}
                  <line
                    x1={figure.x + 0.6}
                    y1={figure.y - 3}
                    x2={figure.x + 0.6}
                    y2={figure.y - 2.2}
                    stroke="rgba(0, 0, 0, 0.6)"
                    strokeWidth="0.3"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${figure.targetX - figure.x} 0`}
                      dur={`${Math.abs(figure.targetX - figure.x) / figure.speed / 60}s`}
                      repeatCount="1"
                    />
                    <animate
                      attributeName="x2"
                      values={`${figure.x + 0.6 + (figure.direction * 0.3)};${figure.x + 0.6 - (figure.direction * 0.3)};${figure.x + 0.6 + (figure.direction * 0.3)}`}
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </line>
                </g>
              );
            })}
          </svg>
        )}

        {/* Horses and wagons at ground level */}
        {horses.length > 0 && (
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="xMidYMax slice"
            style={{ opacity: baseOpacity * 0.9, pointerEvents: 'none', zIndex: 9 }}
          >
            {horses.map(horse => {
              const moveDuration = `${Math.abs(horse.targetX - horse.x) / horse.speed / 60}s`;
              const gaitSpeed = "0.6s"; // Faster leg cycle for trotting horses

              return (
                <g key={horse.id}>
                  {/* Horse body */}
                  <ellipse
                    cx={horse.x}
                    cy={horse.y - 4.55}
                    rx="4.16"
                    ry="2.21"
                    fill="rgba(60, 40, 20, 0.8)"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${horse.targetX - horse.x} 0`}
                      dur={moveDuration}
                      repeatCount="1"
                    />
                  </ellipse>

                  {/* Horse neck */}
                  <line
                    x1={horse.direction > 0 ? horse.x + 3 : horse.x - 3}
                    y1={horse.y - 5.46}
                    x2={horse.direction > 0 ? horse.x + 3.9 : horse.x - 3.9}
                    y2={horse.y - 7.8}
                    stroke="rgba(60, 40, 20, 0.8)"
                    strokeWidth="0.91"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${horse.targetX - horse.x} 0`}
                      dur={moveDuration}
                      repeatCount="1"
                    />
                  </line>

                  {/* Horse head */}
                  <circle
                    cx={horse.direction > 0 ? horse.x + 4.16 : horse.x - 4.16}
                    cy={horse.y - 8.45}
                    r="1.17"
                    fill="rgba(60, 40, 20, 0.8)"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${horse.targetX - horse.x} 0`}
                      dur={moveDuration}
                      repeatCount="1"
                    />
                  </circle>

                  {/* Front left leg */}
                  <line
                    x1={horse.x + 1.3}
                    y1={horse.y - 2.6}
                    x2={horse.x + 1.3}
                    y2={horse.y}
                    stroke="rgba(60, 40, 20, 0.8)"
                    strokeWidth="0.65"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${horse.targetX - horse.x} 0`}
                      dur={moveDuration}
                      repeatCount="1"
                    />
                    <animate
                      attributeName="x2"
                      values={`${horse.x + 1.3 + (horse.direction * 1.04)};${horse.x + 1.3 - (horse.direction * 1.04)};${horse.x + 1.3 + (horse.direction * 1.04)}`}
                      dur={gaitSpeed}
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Front right leg */}
                  <line
                    x1={horse.x + 1.95}
                    y1={horse.y - 2.6}
                    x2={horse.x + 1.95}
                    y2={horse.y}
                    stroke="rgba(60, 40, 20, 0.8)"
                    strokeWidth="0.65"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${horse.targetX - horse.x} 0`}
                      dur={moveDuration}
                      repeatCount="1"
                    />
                    <animate
                      attributeName="x2"
                      values={`${horse.x + 1.95 - (horse.direction * 1.04)};${horse.x + 1.95 + (horse.direction * 1.04)};${horse.x + 1.95 - (horse.direction * 1.04)}`}
                      dur={gaitSpeed}
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Rear left leg */}
                  <line
                    x1={horse.x - 1.3}
                    y1={horse.y - 2.6}
                    x2={horse.x - 1.3}
                    y2={horse.y}
                    stroke="rgba(60, 40, 20, 0.8)"
                    strokeWidth="0.65"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${horse.targetX - horse.x} 0`}
                      dur={moveDuration}
                      repeatCount="1"
                    />
                    <animate
                      attributeName="x2"
                      values={`${horse.x - 1.3 + (horse.direction * 1.04)};${horse.x - 1.3 - (horse.direction * 1.04)};${horse.x - 1.3 + (horse.direction * 1.04)}`}
                      dur={gaitSpeed}
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Rear right leg */}
                  <line
                    x1={horse.x - 1.95}
                    y1={horse.y - 2.6}
                    x2={horse.x - 1.95}
                    y2={horse.y}
                    stroke="rgba(60, 40, 20, 0.8)"
                    strokeWidth="0.65"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to={`${horse.targetX - horse.x} 0`}
                      dur={moveDuration}
                      repeatCount="1"
                    />
                    <animate
                      attributeName="x2"
                      values={`${horse.x - 1.95 - (horse.direction * 1.04)};${horse.x - 1.95 + (horse.direction * 1.04)};${horse.x - 1.95 - (horse.direction * 1.04)}`}
                      dur={gaitSpeed}
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Rider (if type is 'rider') */}
                  {horse.type === 'rider' && (
                    <>
                      {/* Rider body */}
                      <rect
                        x={horse.x - 0.65}
                        y={horse.y - 7.15}
                        width="1.3"
                        height="2.34"
                        fill="rgba(0, 0, 0, 0.75)"
                        rx="0.26"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          from="0 0"
                          to={`${horse.targetX - horse.x} 0`}
                          dur={moveDuration}
                          repeatCount="1"
                        />
                      </rect>

                      {/* Rider head */}
                      <circle
                        cx={horse.x}
                        cy={horse.y - 8.45}
                        r="0.78"
                        fill="rgba(0, 0, 0, 0.75)"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          from="0 0"
                          to={`${horse.targetX - horse.x} 0`}
                          dur={moveDuration}
                          repeatCount="1"
                        />
                      </circle>
                    </>
                  )}

                  {/* Wagon (if type is 'wagon') */}
                  {horse.type === 'wagon' && (
                    <>
                      {/* Connection line from horse to wagon */}
                      <line
                        x1={horse.direction > 0 ? horse.x - 3.25 : horse.x + 3.25}
                        y1={horse.y - 2.6}
                        x2={horse.direction > 0 ? horse.x - 5.2 : horse.x + 5.2}
                        y2={horse.y - 2.6}
                        stroke="rgba(80, 60, 40, 0.7)"
                        strokeWidth="0.52"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          from="0 0"
                          to={`${horse.targetX - horse.x} 0`}
                          dur={moveDuration}
                          repeatCount="1"
                        />
                      </line>

                      {/* Wagon bed */}
                      <rect
                        x={horse.direction > 0 ? horse.x - 13 : horse.x + 5.2}
                        y={horse.y - 6.5}
                        width="7.8"
                        height="3.9"
                        fill="rgba(100, 70, 40, 0.8)"
                        rx="0.52"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          from="0 0"
                          to={`${horse.targetX - horse.x} 0`}
                          dur={moveDuration}
                          repeatCount="1"
                        />
                      </rect>

                      {/* Wheel spokes (4 spokes per wheel) - rotating */}
                      <g>
                        {/* Front wheel spokes */}
                        <line
                          x1={horse.direction > 0 ? horse.x - 7.8 : horse.x + 5.2}
                          y1={horse.y - 1.95}
                          x2={horse.direction > 0 ? horse.x - 7.8 : horse.x + 5.2}
                          y2={horse.y + 0.65}
                          stroke="rgba(80, 60, 40, 0.6)"
                          strokeWidth="0.39"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="translate"
                            from="0 0"
                            to={`${horse.targetX - horse.x} 0`}
                            dur={moveDuration}
                            repeatCount="1"
                          />
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`0 ${horse.direction > 0 ? horse.x - 7.8 : horse.x + 5.2} ${horse.y - 0.65}`}
                            to={`${horse.direction > 0 ? "360" : "-360"} ${horse.direction > 0 ? horse.x - 7.8 : horse.x + 5.2} ${horse.y - 0.65}`}
                            dur="2s"
                            repeatCount="indefinite"
                            additive="sum"
                          />
                        </line>
                        <line
                          x1={horse.direction > 0 ? horse.x - 9.1 : horse.x + 3.9}
                          y1={horse.y - 0.65}
                          x2={horse.direction > 0 ? horse.x - 6.5 : horse.x + 6.5}
                          y2={horse.y - 0.65}
                          stroke="rgba(80, 60, 40, 0.6)"
                          strokeWidth="0.39"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="translate"
                            from="0 0"
                            to={`${horse.targetX - horse.x} 0`}
                            dur={moveDuration}
                            repeatCount="1"
                          />
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`0 ${horse.direction > 0 ? horse.x - 7.8 : horse.x + 5.2} ${horse.y - 0.65}`}
                            to={`${horse.direction > 0 ? "360" : "-360"} ${horse.direction > 0 ? horse.x - 7.8 : horse.x + 5.2} ${horse.y - 0.65}`}
                            dur="2s"
                            repeatCount="indefinite"
                            additive="sum"
                          />
                        </line>

                        {/* Rear wheel spokes */}
                        <line
                          x1={horse.direction > 0 ? horse.x - 5.2 : horse.x + 7.8}
                          y1={horse.y - 1.95}
                          x2={horse.direction > 0 ? horse.x - 5.2 : horse.x + 7.8}
                          y2={horse.y + 0.65}
                          stroke="rgba(80, 60, 40, 0.6)"
                          strokeWidth="0.39"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="translate"
                            from="0 0"
                            to={`${horse.targetX - horse.x} 0`}
                            dur={moveDuration}
                            repeatCount="1"
                          />
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`0 ${horse.direction > 0 ? horse.x - 5.2 : horse.x + 7.8} ${horse.y - 0.65}`}
                            to={`${horse.direction > 0 ? "360" : "-360"} ${horse.direction > 0 ? horse.x - 5.2 : horse.x + 7.8} ${horse.y - 0.65}`}
                            dur="2s"
                            repeatCount="indefinite"
                            additive="sum"
                          />
                        </line>
                        <line
                          x1={horse.direction > 0 ? horse.x - 6.5 : horse.x + 6.5}
                          y1={horse.y - 0.65}
                          x2={horse.direction > 0 ? horse.x - 3.9 : horse.x + 9.1}
                          y2={horse.y - 0.65}
                          stroke="rgba(80, 60, 40, 0.6)"
                          strokeWidth="0.39"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="translate"
                            from="0 0"
                            to={`${horse.targetX - horse.x} 0`}
                            dur={moveDuration}
                            repeatCount="1"
                          />
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`0 ${horse.direction > 0 ? horse.x - 5.2 : horse.x + 7.8} ${horse.y - 0.65}`}
                            to={`${horse.direction > 0 ? "360" : "-360"} ${horse.direction > 0 ? horse.x - 5.2 : horse.x + 7.8} ${horse.y - 0.65}`}
                            dur="2s"
                            repeatCount="indefinite"
                            additive="sum"
                          />
                        </line>
                      </g>
                    </>
                  )}

                  {/* Grand Carriage (if type is 'carriage') - 2 horses in tandem */}
                  {horse.type === 'carriage' && (
                    <>
                      {/* SECOND HORSE (lead horse) */}
                      <ellipse cx={horse.direction > 0 ? horse.x + 6.5 : horse.x - 6.5} cy={horse.y - 3.9} rx="3.25" ry="1.69" fill="rgba(40, 25, 15, 0.8)"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /></ellipse>
                      <line x1={horse.direction > 0 ? horse.x + 8.84 : horse.x - 8.84} y1={horse.y - 4.55} x2={horse.direction > 0 ? horse.x + 9.49 : horse.x - 9.49} y2={horse.y - 6.5} stroke="rgba(40, 25, 15, 0.8)" strokeWidth="0.78"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /></line>
                      <circle cx={horse.direction > 0 ? horse.x + 9.75 : horse.x - 9.75} cy={horse.y - 7.15} r="0.91" fill="rgba(40, 25, 15, 0.8)"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /></circle>
                      <line x1={horse.direction > 0 ? horse.x + 7.8 : horse.x - 7.8} y1={horse.y - 2.6} x2={horse.direction > 0 ? horse.x + 7.8 : horse.x - 7.8} y2={horse.y} stroke="rgba(40, 25, 15, 0.8)" strokeWidth="0.65"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /><animate attributeName="x2" values={`${(horse.direction > 0 ? horse.x + 7.8 : horse.x - 7.8) + (horse.direction * 1.04)};${(horse.direction > 0 ? horse.x + 7.8 : horse.x - 7.8) - (horse.direction * 1.04)};${(horse.direction > 0 ? horse.x + 7.8 : horse.x - 7.8) + (horse.direction * 1.04)}`} dur={gaitSpeed} repeatCount="indefinite" /></line>
                      <line x1={horse.direction > 0 ? horse.x + 8.45 : horse.x - 8.45} y1={horse.y - 2.6} x2={horse.direction > 0 ? horse.x + 8.45 : horse.x - 8.45} y2={horse.y} stroke="rgba(40, 25, 15, 0.8)" strokeWidth="0.65"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /><animate attributeName="x2" values={`${(horse.direction > 0 ? horse.x + 8.45 : horse.x - 8.45) - (horse.direction * 1.04)};${(horse.direction > 0 ? horse.x + 8.45 : horse.x - 8.45) + (horse.direction * 1.04)};${(horse.direction > 0 ? horse.x + 8.45 : horse.x - 8.45) - (horse.direction * 1.04)}`} dur={gaitSpeed} repeatCount="indefinite" /></line>
                      <line x1={horse.direction > 0 ? horse.x + 5.2 : horse.x - 5.2} y1={horse.y - 2.6} x2={horse.direction > 0 ? horse.x + 5.2 : horse.x - 5.2} y2={horse.y} stroke="rgba(40, 25, 15, 0.8)" strokeWidth="0.65"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /><animate attributeName="x2" values={`${(horse.direction > 0 ? horse.x + 5.2 : horse.x - 5.2) + (horse.direction * 1.04)};${(horse.direction > 0 ? horse.x + 5.2 : horse.x - 5.2) - (horse.direction * 1.04)};${(horse.direction > 0 ? horse.x + 5.2 : horse.x - 5.2) + (horse.direction * 1.04)}`} dur={gaitSpeed} repeatCount="indefinite" /></line>
                      <line x1={horse.direction > 0 ? horse.x + 5.85 : horse.x - 5.85} y1={horse.y - 2.6} x2={horse.direction > 0 ? horse.x + 5.85 : horse.x - 5.85} y2={horse.y} stroke="rgba(40, 25, 15, 0.8)" strokeWidth="0.65"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /><animate attributeName="x2" values={`${(horse.direction > 0 ? horse.x + 5.85 : horse.x - 5.85) - (horse.direction * 1.04)};${(horse.direction > 0 ? horse.x + 5.85 : horse.x - 5.85) + (horse.direction * 1.04)};${(horse.direction > 0 ? horse.x + 5.85 : horse.x - 5.85) - (horse.direction * 1.04)}`} dur={gaitSpeed} repeatCount="indefinite" /></line>
                      <line x1={horse.direction > 0 ? horse.x - 3.25 : horse.x + 3.25} y1={horse.y - 3.25} x2={horse.direction > 0 ? horse.x - 6.5 : horse.x + 6.5} y2={horse.y - 3.9} stroke="rgba(80, 60, 40, 0.7)" strokeWidth="0.65"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /></line>

                      {/* Carriage body */}
                      <rect x={horse.direction > 0 ? horse.x - 18.85 : horse.x + 7.15} y={horse.y - 9.1} width="11.7" height="5.85" fill="rgba(80, 50, 30, 0.9)" rx="0.78"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /></rect>
                      <ellipse cx={horse.direction > 0 ? horse.x - 13 : horse.x + 13} cy={horse.y - 9.1} rx="5.85" ry="1.3" fill="rgba(60, 40, 25, 0.9)"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /></ellipse>
                      <rect x={horse.direction > 0 ? horse.x - 16.9 : horse.x + 9.1} y={horse.y - 7.8} width="2.34" height="2.86" fill="rgba(40, 30, 20, 0.6)" rx="0.52"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /></rect>
                      <rect x={horse.direction > 0 ? horse.x - 11.7 : horse.x + 14.56} y={horse.y - 7.8} width="2.34" height="2.86" fill="rgba(40, 30, 20, 0.6)" rx="0.52"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /></rect>
                      <circle cx={horse.direction > 0 ? horse.x - 19.24 : horse.x + 19.24} cy={horse.y - 7.15} r="0.65" fill="rgba(255, 200, 100, 0.7)"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /></circle>

                      {/* Carriage wheel spokes - rotating */}
                      <g>
                        <line x1={horse.direction > 0 ? horse.x - 15.6 : horse.x + 10.4} y1={horse.y - 3.64} x2={horse.direction > 0 ? horse.x - 15.6 : horse.x + 10.4} y2={horse.y + 1.04} stroke="rgba(60, 45, 30, 0.7)" strokeWidth="0.52"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /><animateTransform attributeName="transform" type="rotate" from={`0 ${horse.direction > 0 ? horse.x - 15.6 : horse.x + 10.4} ${horse.y - 1.3}`} to={`${horse.direction > 0 ? "360" : "-360"} ${horse.direction > 0 ? horse.x - 15.6 : horse.x + 10.4} ${horse.y - 1.3}`} dur="1.8s" repeatCount="indefinite" additive="sum" /></line>
                        <line x1={horse.direction > 0 ? horse.x - 17.94 : horse.x + 8.06} y1={horse.y - 1.3} x2={horse.direction > 0 ? horse.x - 13.26 : horse.x + 12.74} y2={horse.y - 1.3} stroke="rgba(60, 45, 30, 0.7)" strokeWidth="0.52"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /><animateTransform attributeName="transform" type="rotate" from={`0 ${horse.direction > 0 ? horse.x - 15.6 : horse.x + 10.4} ${horse.y - 1.3}`} to={`${horse.direction > 0 ? "360" : "-360"} ${horse.direction > 0 ? horse.x - 15.6 : horse.x + 10.4} ${horse.y - 1.3}`} dur="1.8s" repeatCount="indefinite" additive="sum" /></line>
                        <line x1={horse.direction > 0 ? horse.x - 10.4 : horse.x + 15.6} y1={horse.y - 3.64} x2={horse.direction > 0 ? horse.x - 10.4 : horse.x + 15.6} y2={horse.y + 1.04} stroke="rgba(60, 45, 30, 0.7)" strokeWidth="0.52"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /><animateTransform attributeName="transform" type="rotate" from={`0 ${horse.direction > 0 ? horse.x - 10.4 : horse.x + 15.6} ${horse.y - 1.3}`} to={`${horse.direction > 0 ? "360" : "-360"} ${horse.direction > 0 ? horse.x - 10.4 : horse.x + 15.6} ${horse.y - 1.3}`} dur="1.8s" repeatCount="indefinite" additive="sum" /></line>
                        <line x1={horse.direction > 0 ? horse.x - 12.74 : horse.x + 13.26} y1={horse.y - 1.3} x2={horse.direction > 0 ? horse.x - 8.06 : horse.x + 17.94} y2={horse.y - 1.3} stroke="rgba(60, 45, 30, 0.7)" strokeWidth="0.52"><animateTransform attributeName="transform" type="translate" from="0 0" to={`${horse.targetX - horse.x} 0`} dur={moveDuration} repeatCount="1" /><animateTransform attributeName="transform" type="rotate" from={`0 ${horse.direction > 0 ? horse.x - 10.4 : horse.x + 15.6} ${horse.y - 1.3}`} to={`${horse.direction > 0 ? "360" : "-360"} ${horse.direction > 0 ? horse.x - 10.4 : horse.x + 15.6} ${horse.y - 1.3}`} dur="1.8s" repeatCount="indefinite" additive="sum" /></line>
                      </g>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Ground/horizon line - more prominent */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '2px',
            background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        />

        {/* Atmospheric scattering - Radial gradient from horizon creating atmospheric glow - DISABLED at night */}
        {!isNight && (
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '50%',
              background: 'radial-gradient(ellipse 120% 60% at 50% 100%, rgba(255, 250, 245, 0.12) 0%, rgba(240, 235, 230, 0.08) 30%, transparent 65%)',
              pointerEvents: 'none',
              mixBlendMode: 'soft-light'
            }}
          />
        )}

 

        {/* Building hover tooltip - Rendered via portal to escape parent clipping */}
        {hoveredBuilding && NOTABLE_BUILDINGS[hoveredBuilding] && createPortal(
          <div
            style={{
              position: 'fixed',
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: 'translate(-50%, -100%)',
              background: 'rgba(13, 13, 13, 0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(245, 230, 211, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              color: '#f5e6d3',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              pointerEvents: 'none',
              zIndex: 10000,
              fontFamily: "'Cinzel', serif",
              maxWidth: '250px'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
              {NOTABLE_BUILDINGS[hoveredBuilding].name}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9, lineHeight: '1.4' }}>
              {NOTABLE_BUILDINGS[hoveredBuilding].description}
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Volcanic smoke layer - OUTSIDE horizon container for unclipped rising smoke */}
      {/* Z-INDEX 1 = Behind clouds (clouds are z-index 2) */}
      {!prefersReducedMotion && (
        <svg
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMax meet"
          style={{
            height: '100%',
            opacity: baseOpacity * 0.5, // Reduced from 0.75 - more subtle
            pointerEvents: 'none',
            mixBlendMode: 'normal',
            zIndex: 1 // BEHIND clouds (clouds are z-index 2)
          }}
        >
          <defs>
            {/* Steam/smoke gradient - time-aware colors */}
            <radialGradient id={`volcanic-smoke-${instanceId}`}>
              <stop offset="0%" stopColor={isDawn ? 'rgba(180,175,165,0.7)' : (isDusk ? 'rgba(175,165,160,0.7)' : 'rgba(160,165,170,0.7)')} />
              <stop offset="60%" stopColor={isDawn ? 'rgba(165,160,150,0.4)' : (isDusk ? 'rgba(160,150,145,0.4)' : 'rgba(145,150,155,0.4)')} />
              <stop offset="100%" stopColor="rgba(140,145,150,0)" />
            </radialGradient>
          </defs>

          {/* Volcanic smoke plume - THIN WISPS rising from Popocatépetl */}
          <g className="volcanic-smoke">
            {/* Crater base - very narrow steady emanation at peak (cy=48) */}
            <ellipse cx="480" cy="48" rx="1.5" ry="5" fill="rgba(165,170,175,0.6)">
              <animate attributeName="ry" values="5;6;5" dur="3s" repeatCount="indefinite" />
              <animate attributeName="rx" values="1.5;2;1.5" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.7;0.6" dur="3s" repeatCount="indefinite" />
            </ellipse>

            {/* Thin wisp 1 - very narrow, tall */}
            <ellipse cx="480" cy="46" rx="1.2" ry="18" fill="rgba(175,180,185,0.4)" opacity="0.6">
              <animate attributeName="cy" values="46;14;-18;-50" dur="18s" repeatCount="indefinite" />
              <animate attributeName="cx" values={`480;${480 + windDriftX * 0.5};${480 + windDriftX * 1.5};${480 + windDriftX * 3}`} dur="18s" repeatCount="indefinite" />
              <animate attributeName="rx" values="1.2;1.8;2.5;3.5" dur="18s" repeatCount="indefinite" />
              <animate attributeName="ry" values="18;22;26;30" dur="18s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.5;0.3;0" dur="18s" repeatCount="indefinite" />
            </ellipse>

            {/* Thin wisp 2 - slightly offset */}
            <ellipse cx="479" cy="44" rx="1" ry="20" fill="rgba(185,190,195,0.35)" opacity="0.55">
              <animate attributeName="cy" values="44;10;-24;-58" dur="19s" begin="0.8s" repeatCount="indefinite" />
              <animate attributeName="cx" values={`479;${479 + windDriftX * 0.6};${479 + windDriftX * 1.8};${479 + windDriftX * 3.5}`} dur="19s" begin="0.8s" repeatCount="indefinite" />
              <animate attributeName="rx" values="1;1.6;2.3;3.2" dur="19s" begin="0.8s" repeatCount="indefinite" />
              <animate attributeName="ry" values="20;24;28;32" dur="19s" begin="0.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.55;0.45;0.25;0" dur="19s" begin="0.8s" repeatCount="indefinite" />
            </ellipse>

            {/* Thin wisp 3 - very delicate */}
            <ellipse cx="481" cy="42" rx="0.8" ry="22" fill="rgba(195,200,205,0.3)" opacity="0.5">
              <animate attributeName="cy" values="42;5;-30;-65" dur="20s" begin="1.6s" repeatCount="indefinite" />
              <animate attributeName="cx" values={`481;${481 + windDriftX * 0.7};${481 + windDriftX * 2.2};${481 + windDriftX * 4}`} dur="20s" begin="1.6s" repeatCount="indefinite" />
              <animate attributeName="rx" values="0.8;1.4;2;2.8" dur="20s" begin="1.6s" repeatCount="indefinite" />
              <animate attributeName="ry" values="22;26;30;34" dur="20s" begin="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.4;0.2;0" dur="20s" begin="1.6s" repeatCount="indefinite" />
            </ellipse>

            {/* Thin wisp 4 - reaching high */}
            <ellipse cx="480" cy="40" rx="0.6" ry="25" fill="rgba(205,210,215,0.25)" opacity="0.45">
              <animate attributeName="cy" values="40;0;-40;-80" dur="21s" begin="2.4s" repeatCount="indefinite" />
              <animate attributeName="cx" values={`480;${480 + windDriftX * 0.8};${480 + windDriftX * 2.6};${480 + windDriftX * 4.5}`} dur="21s" begin="2.4s" repeatCount="indefinite" />
              <animate attributeName="rx" values="0.6;1.2;1.8;2.5" dur="21s" begin="2.4s" repeatCount="indefinite" />
              <animate attributeName="ry" values="25;30;35;40" dur="21s" begin="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.45;0.35;0.15;0" dur="21s" begin="2.4s" repeatCount="indefinite" />
            </ellipse>

            {/* Very thin wisp 5 - barely visible */}
            <ellipse cx="479.5" cy="48" rx="0.5" ry="15" fill="rgba(205,210,215,0.2)" opacity="0.4">
              <animate attributeName="cy" values="48;18;-15;-48" dur="17s" begin="3.2s" repeatCount="indefinite" />
              <animate attributeName="cx" values={`479.5;${479.5 + windDriftX * 0.4};${479.5 + windDriftX * 1.2};${479.5 + windDriftX * 2.5}`} dur="17s" begin="3.2s" repeatCount="indefinite" />
              <animate attributeName="rx" values="0.5;1;1.5;2" dur="17s" begin="3.2s" repeatCount="indefinite" />
              <animate attributeName="ry" values="15;20;25;30" dur="17s" begin="3.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.3;0.15;0" dur="17s" begin="3.2s" repeatCount="indefinite" />
            </ellipse>

            {/* Very thin wisp 6 - alternate side */}
            <ellipse cx="480.5" cy="47" rx="0.5" ry="16" fill="rgba(195,200,205,0.2)" opacity="0.4">
              <animate attributeName="cy" values="47;15;-20;-55" dur="18.5s" begin="4s" repeatCount="indefinite" />
              <animate attributeName="cx" values={`480.5;${480.5 + windDriftX * 0.45};${480.5 + windDriftX * 1.4};${480.5 + windDriftX * 2.8}`} dur="18.5s" begin="4s" repeatCount="indefinite" />
              <animate attributeName="rx" values="0.5;1.1;1.6;2.2" dur="18.5s" begin="4s" repeatCount="indefinite" />
              <animate attributeName="ry" values="16;21;26;31" dur="18.5s" begin="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.3;0.15;0" dur="18.5s" begin="4s" repeatCount="indefinite" />
            </ellipse>
          </g>
        </svg>
      )}
    </>
    );
  }

  // Simple mountains variant
  if (type === 'mountains') {
    return (
      <div
        className={`absolute bottom-0 left-0 right-0 pointer-events-none ${className}`}
        style={{ height: '20%', minHeight: '100px', zIndex: 1 }}
      >
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 240"
          preserveAspectRatio="xMidYMax slice"
          style={{ opacity: baseOpacity }}
        >
          <path
            d="M0,240 L0,120 Q200,80 400,60 L600,100 L800,40 Q1000,90 1200,70 L1200,240 Z"
            fill="var(--sky-mountain-mid, #2d3748)"
           
          />
        </svg>
      </div>
    );
  }

  // City variant
  if (type === 'city') {
    return (
      <div
        className={`absolute bottom-0 left-0 right-0 pointer-events-none ${className}`}
        style={{ height: '18%', minHeight: '90px', zIndex: 1 }}
      >
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 216"
          preserveAspectRatio="xMidYMax slice"
          style={{ opacity: baseOpacity }}
        >
          {/* Simple building silhouettes */}
          {Array.from({ length: 20 }, (_, i) => {
            const x = i * 60;
            const height = 80 + Math.sin(i * 0.7) * 40;
            const y = 216 - height;
            const width = 40 + Math.cos(i * 0.5) * 15;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={width}
                height={height}
                fill="var(--sky-mountain-near, #1a202c)"
                opacity={0.8}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  // Desert variant (for arid regions)
  if (type === 'desert') {
    return (
      <div
        className={`absolute bottom-0 left-0 right-0 pointer-events-none ${className}`}
        style={{ height: '15%', minHeight: '80px', zIndex: 1 }}
      >
        {/* Sand dunes */}
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 180"
          preserveAspectRatio="xMidYMax slice"
          style={{ opacity: baseOpacity }}
        >
          <path
            d="M0,180 Q150,120 300,150 T600,130 T900,145 T1200,125 L1200,180 Z"
            fill="var(--sky-mountain-mid, #d4a574)"
           
          />
        </svg>
      </div>
    );
  }

  // Forest variant
  if (type === 'forest') {
    return (
      <div
        className={`absolute bottom-0 left-0 right-0 pointer-events-none ${className}`}
        style={{ height: '20%', minHeight: '100px', zIndex: 1 }}
      >
        <svg
          className="absolute bottom-0 left-0 w-full h-full"
          viewBox="0 0 1200 240"
          preserveAspectRatio="xMidYMax slice"
          style={{ opacity: baseOpacity }}
        >
          {/* Tree silhouettes */}
          {Array.from({ length: 30 }, (_, i) => {
            const x = i * 40;
            const height = 60 + Math.sin(i * 1.1) * 30;
            const y = 240 - height;
            return (
              <ellipse
                key={i}
                cx={x + 20}
                cy={y + height / 2}
                rx={15 + Math.cos(i * 0.8) * 5}
                ry={height / 2}
                fill="var(--sky-mountain-near, #1a4d2e)"
                opacity={0.7}
              />
            );
          })}
        </svg>
        {/* Building hover tooltip - Rendered via portal to escape parent clipping */}
        {hoveredBuilding && NOTABLE_BUILDINGS[hoveredBuilding] && createPortal(
          <div
            style={{
              position: 'fixed',
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: 'translate(-50%, -100%)',
              background: 'rgba(13, 13, 13, 0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(245, 230, 211, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              color: '#f5e6d3',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              pointerEvents: 'none',
              zIndex: 10000,
              fontFamily: "'Cinzel', serif",
              maxWidth: '250px'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
              {NOTABLE_BUILDINGS[hoveredBuilding].name}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9, lineHeight: '1.4' }}>
              {NOTABLE_BUILDINGS[hoveredBuilding].description}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  return null;
};

/**
 * Calculate zoom targetX from building ID for background zoom effects
 * @param {string} buildingId - Key from NOTABLE_BUILDINGS
 * @returns {number} targetX percentage (0-100)
 */
export function getZoomTargetForBuilding(buildingId) {
  const building = NOTABLE_BUILDINGS[buildingId];
  if (!building) {
    console.warn(`[HorizonLine] Building not found: ${buildingId}`);
    return 50; // Default center
  }

  const centerX = building.bounds.x + (building.bounds.width / 2);
  const targetX = (centerX / 1200) * 100;

  console.log(`[HorizonLine] Zoom target for ${buildingId}:`, { centerX, targetX });
  return targetX;
}

// Export building constants for external use
export { NOTABLE_BUILDINGS };

export default HorizonLine;
