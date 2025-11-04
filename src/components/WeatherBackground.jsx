/**
 * WeatherBackground.jsx - Orchestrator component for the complete weather system
 * Combines TimeAwareBackground, HorizonLine, and WeatherEffects into a single component
 *
 * Usage:
 * <WeatherBackground
 *   gameTime="3:00 PM"
 *   gameDate="August 22, 1680"
 *   location="Mexico City"
 * />
 *
 * This component should be placed behind all UI panels with z-index: -10
 */

import React, { useState, useEffect, useMemo } from 'react';
import TimeAwareBackground from './TimeAwareBackground';
import HorizonLine from './HorizonLine';
import WeatherEffects from './WeatherEffects';
import CloudLayer from './CloudLayer';
import { parseGameTime, getSeasonFromDate, getTimeOfDay } from '../utils/timeUtils';
import { generateWeather, getWeatherDescription } from '../services/weatherService';
import { generateCloudConfig } from '../services/cloudService';

const WeatherBackground = ({
  gameTime = '12:00 PM',
  gameDate = 'August 22, 1680',
  location = 'Mexico City',
  viewMode = 'standard', // 'standard' or 'interior'
  enabled = true, // Allow disabling for performance
  onWeatherChange = null, // Callback for weather description updates
  testWeatherOverride = null, // DEV: Override weather type (e.g., 'thunderstorm', 'clear')
  testHorizonOverride = null, // DEV: Override horizon type (e.g., 'mountains', 'city')
  travelZoom = null, // House call zoom state { isActive, progress, targetX }
  isWeatherViewActive = false // When true, enable pointer events for building tooltips
}) => {
  const [weather, setWeather] = useState(null);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  // Parse time and date
  const { hours, minutes } = useMemo(() => parseGameTime(gameTime), [gameTime]);
  const season = useMemo(() => getSeasonFromDate(gameDate), [gameDate]);
  const timeOfDay = useMemo(() => getTimeOfDay(hours), [hours]);

  // Memoize cloud config to prevent unnecessary regeneration
  // Only regenerates when hours change (once per hour), not every minute
  const cloudConfig = useMemo(() => {
    if (!enabled || !weather) {
      return { enabled: false, layers: [], seed: 0 };
    }
    const seed = hours * 100;
    return generateCloudConfig(weather, seed);
  }, [weather, hours, enabled]);

  // Helper function to generate test weather from override string
  const generateTestWeather = (weatherType) => {
    const weatherConfigs = {
      'clear': { precipitation: 'none', intensity: 0, cloudCover: 0.1, windSpeed: 5, windDirection: 180, visibility: 1, special: null },
      'partly-cloudy': { precipitation: 'none', intensity: 0, cloudCover: 0.4, windSpeed: 8, windDirection: 180, visibility: 1, special: null },
      'overcast': { precipitation: 'none', intensity: 0, cloudCover: 0.9, windSpeed: 10, windDirection: 180, visibility: 0.8, special: null },
      'light-rain': { precipitation: 'rain', intensity: 0.3, cloudCover: 0.8, windSpeed: 12, windDirection: 180, visibility: 0.7, special: null },
      'rain': { precipitation: 'rain', intensity: 0.6, cloudCover: 0.9, windSpeed: 15, windDirection: 180, visibility: 0.5, special: null },
      'heavy-rain': { precipitation: 'rain', intensity: 0.9, cloudCover: 1.0, windSpeed: 20, windDirection: 180, visibility: 0.3, special: null },
      'thunderstorm': { precipitation: 'rain', intensity: 0.8, cloudCover: 1.0, windSpeed: 25, windDirection: 180, visibility: 0.4, special: 'thunderstorm' },
      'fog': { precipitation: 'none', intensity: 0, cloudCover: 0.3, windSpeed: 3, windDirection: 180, visibility: 0.2, special: 'fog' },
      'mist': { precipitation: 'none', intensity: 0, cloudCover: 0.5, windSpeed: 5, windDirection: 180, visibility: 0.4, special: 'mist' },
      'snow': { precipitation: 'snow', intensity: 0.5, cloudCover: 0.9, windSpeed: 10, windDirection: 180, visibility: 0.6, special: null }
    };

    const baseWeather = weatherConfigs[weatherType] || weatherConfigs['clear'];

    return {
      ...baseWeather,
      fx: {
        dropletSize: baseWeather.precipitation === 'rain' ? baseWeather.intensity * 3 : 0,
        flakeSize: baseWeather.precipitation === 'snow' ? baseWeather.intensity * 2 : 0,
        fogDensity: baseWeather.special === 'fog' ? 0.8 : (baseWeather.special === 'mist' ? 0.4 : 0),
        hazeDensity: baseWeather.cloudCover > 0.5 ? 0.2 : 0,
        surfaceWetnessNow: baseWeather.precipitation === 'rain' ? baseWeather.intensity : 0,
        lightningProbability: baseWeather.special === 'thunderstorm' ? 0.8 : 0,
        heatShimmer: 0,
        // Rainbow ONLY after rain ends (meteorologically accurate - requires sun, not active precipitation)
        rainbowProbability: baseWeather.precipitation === 'none' && baseWeather.cloudCover > 0.3 && baseWeather.cloudCover < 0.7 ? 0.6 : 0,
        fireflyProbability: 0,
        auroraProbability: 0,
        airborneParticles: null,
        blossoms: null,
        leavesActivity: baseWeather.windSpeed > 15 ? 0.5 : 0,
        leafPalette: []
      }
    };
  };

  // Generate weather (updates when time changes significantly)
  useEffect(() => {
    if (!enabled) return;

    // Use hour as seed for semi-deterministic weather (same hour = same weather)
    // Only change seed every hour to prevent cloud restarts
    const seed = hours * 100;

    try {
      // Use test override if provided, otherwise generate normally
      const newWeather = testWeatherOverride
        ? generateTestWeather(testWeatherOverride)
        : generateWeather(gameTime, gameDate, location, seed);
      setWeather(newWeather);

      // Cloud config is now generated via useMemo, not here

      // Notify parent of weather description AND full weather state
      if (onWeatherChange) {
        const description = getWeatherDescription(newWeather);
        onWeatherChange(description, newWeather); // Pass full weather state as 2nd parameter
      }
    } catch (error) {
      console.error('[WeatherBackground] Error generating weather:', error);
      // Fallback to clear weather
      const fallbackWeather = {
        precipitation: 'none',
        intensity: 0,
        cloudCover: 0.2,
        windSpeed: 5,
        windDirection: 180,
        visibility: 1,
        special: null,
        fx: {
          dropletSize: 0,
          flakeSize: 0,
          fogDensity: 0,
          hazeDensity: 0,
          surfaceWetnessNow: 0,
          lightningProbability: 0,
          heatShimmer: 0,
          rainbowProbability: 0,
          fireflyProbability: 0,
          auroraProbability: 0,
          airborneParticles: null,
          blossoms: null,
          leavesActivity: 0,
          leafPalette: []
        }
      };
      setWeather(fallbackWeather);
      // Cloud config will be generated via useMemo when weather updates

      // Notify parent even with fallback (pass fallback weather state)
      if (onWeatherChange) {
        onWeatherChange('Clear', fallbackWeather); // Pass fallback weather state as 2nd parameter
      }
    }
  }, [gameTime, gameDate, location, enabled, hours, testWeatherOverride]); // Removed onWeatherChange to prevent infinite loop from callback recreation

  // Update dimensions on window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger random lightning flashes during storms
  useEffect(() => {
    if (!weather || !weather.fx || weather.fx.lightningProbability < 0.3) {
      return;
    }

    let isActive = true;
    const timeouts = [];

    // Calculate flash interval based on probability
    // Higher probability = more frequent flashes
    const baseInterval = 8000; // 8 seconds base
    const intervalVariance = 6000; // Random variance
    const probabilityMultiplier = 1 / weather.fx.lightningProbability;

    const scheduleNextFlash = () => {
      if (!isActive) return;

      const nextFlashDelay = (baseInterval + Math.random() * intervalVariance) * probabilityMultiplier;

      const timeoutId = setTimeout(() => {
        if (!isActive) return;

        // Trigger flash
        setLightningFlash(true);

        // Flash duration: 100-300ms
        const flashDuration = 100 + Math.random() * 200;

        const flashOffTimeout = setTimeout(() => {
          if (!isActive) return;
          setLightningFlash(false);

          // Sometimes double flash (30% chance)
          if (Math.random() < 0.3) {
            const doubleFlashTimeout = setTimeout(() => {
              if (!isActive) return;
              setLightningFlash(true);
              const doubleFlashOffTimeout = setTimeout(() => {
                if (!isActive) return;
                setLightningFlash(false);
              }, 80 + Math.random() * 120);
              timeouts.push(doubleFlashOffTimeout);
            }, 150 + Math.random() * 200);
            timeouts.push(doubleFlashTimeout);
          }
        }, flashDuration);
        timeouts.push(flashOffTimeout);

        // Schedule next flash
        scheduleNextFlash();
      }, nextFlashDelay);

      timeouts.push(timeoutId);
    };

    scheduleNextFlash();

    return () => {
      isActive = false;
      timeouts.forEach(id => clearTimeout(id));
    };
  }, [weather]);

  // Calculate zoom transform for house call travel (MUST BE BEFORE EARLY RETURN - Rules of Hooks)
  const zoomTransform = useMemo(() => {
    if (!travelZoom?.isActive) {
      return {
        transform: 'scale(1) translateY(0%) translateX(0%)',
        transition: 'transform 0.1s linear' // Smooth frame-by-frame animation
      };
    }

    const progress = travelZoom.progress / 100; // 0 to 1

    // Zoom: 1.0 → 2.0 (double size at end)
    const scale = 1.0 + (progress * 1.0);

    // Pan UP to focus on houses (bottom of horizon)
    // Negative translateY moves content UP, revealing bottom section where houses are
    const translateY = progress * -50; // 0% → -50% (pan up to show houses at Y: 270-300)

    // Pan to specific building location
    const translateX = (travelZoom.targetX - 50) * progress * 0.5; // Subtle horizontal pan

    return {
      transform: `scale(${scale}) translateY(${translateY}%) translateX(${translateX}%)`,
      transition: 'transform 0.1s linear',
      willChange: 'transform' // Performance hint for GPU acceleration
    };
  }, [travelZoom]);

  // Don't render if disabled or weather not ready
  if (!enabled || !weather) {
    return null;
  }

  // Determine horizon type based on location
  const getHorizonType = (location) => {
    const loc = location.toLowerCase();
    if (loc.includes('mexico city') || loc.includes('botica')) {
      return 'mountains-city'; // Mexico City: mountains + colonial buildings
    }
    if (loc.includes('chapultepec') || loc.includes('forest')) {
      return 'forest';
    }
    if (loc.includes('desert') || loc.includes('arid')) {
      return 'desert';
    }
    return 'mountains-city'; // Default for Mexico City
  };

  // Use test horizon override if provided, otherwise compute from location
  const horizonType = testHorizonOverride || getHorizonType(location);

  // Climate for Mexico City (subtropical highland)
  const climate = 'subtropical';

  return (
    <div
      className="absolute inset-0"
      style={{
        ...zoomTransform,
        zIndex: 0,
        pointerEvents: isWeatherViewActive ? 'auto' : 'none' // Enable interactions when weather view active
      }}
      aria-hidden="true"
    >
      {/* Sky gradient with stars (deepest layer) */}
      <TimeAwareBackground
        gameTimeHours={hours}
        gameTimeMinutes={minutes}
        viewMode={viewMode}
        weather={weather}
        season={season}
        climate={climate}
      />

      {/* Animated clouds (above sky, below horizon) */}
      {viewMode !== 'interior' && (
        <CloudLayer
          cloudConfig={cloudConfig}
          width={dimensions.width}
          height={dimensions.height}
          timeOfDay={timeOfDay}
        />
      )}

      {/* Lightning flashes during storms */}
      {weather.fx?.lightningProbability > 0.3 && lightningFlash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${Math.random() * 100}% ${Math.random() * 40}%,
              rgba(255, 255, 255, 0.4) 0%,
              rgba(220, 230, 255, 0.3) 20%,
              rgba(180, 200, 240, 0.15) 40%,
              transparent 70%)`,
            mixBlendMode: 'screen',
            zIndex: 5,
            animation: 'lightning-flicker 0.1s ease-in-out'
          }}
        />
      )}

      {/* Horizon silhouettes (mountains + city) */}
      {viewMode !== 'interior' && (
        <HorizonLine
          type={horizonType}
          timeOfDay={timeOfDay}
          weather={weather}
          travelZoom={travelZoom}
        />
      )}

      {/* Weather particle effects (top layer) */}
      {viewMode !== 'interior' && (
        <WeatherEffects
          weather={weather}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}

      {/* Debug info (optional, remove in production) */}
      {process.env.NODE_ENV === 'development' && false && (
        <div
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded pointer-events-auto"
          style={{ zIndex: 1000 }}
        >
          <div>Time: {gameTime} ({timeOfDay})</div>
          <div>Season: {season}</div>
          <div>Weather: {weather.precipitation} ({(weather.intensity * 100).toFixed(0)}%)</div>
          <div>Clouds: {(weather.cloudCover * 100).toFixed(0)}%</div>
          <div>Wind: {weather.windSpeed.toFixed(1)} km/h</div>
          {weather.special && <div>Special: {weather.special}</div>}
        </div>
      )}
    </div>
  );
};

export default WeatherBackground;
