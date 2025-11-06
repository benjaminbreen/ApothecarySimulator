/**
 * weatherService.js - Weather state generator for dynamic weather effects
 * Generates realistic weather patterns based on location, season, time of day, and random variation
 *
 * Climate Profile: 1680 Mexico City (Subtropical Highland)
 * - Rainy Season: June-September (afternoon thunderstorms common)
 * - Dry Season: October-May (clear skies, hot springs)
 * - Elevation: 2,240m (7,350 ft) - cooler than tropical lowlands
 * - Temperature: Mild year-round (10-25°C typical range)
 */

import { getSeasonFromDate, parseGameTime, getTimeOfDay } from '../utils/timeUtils';

// Weather constants
const WINDY_KMH = 18; // Wind speed threshold for visible effects

/**
 * @typedef {Object} WeatherFX
 * @property {number} dropletSize - Rain droplet size multiplier (0-1)
 * @property {number} flakeSize - Snow flake size multiplier (0-1)
 * @property {number} fogDensity - Fog density (0-1)
 * @property {number} hazeDensity - Atmospheric haze (0-1)
 * @property {number} surfaceWetnessNow - Ground wetness snapshot (0-1)
 * @property {number} lightningProbability - Lightning occurrence chance (0-1)
 * @property {number} heatShimmer - Heat distortion effect (0-1)
 * @property {number} rainbowProbability - Rainbow appearance chance (0-1)
 * @property {number} fireflyProbability - Firefly density for summer nights (0-1)
 * @property {number} auroraProbability - Aurora visibility (0-1, always 0 for Mexico City)
 * @property {Object|null} airborneParticles - Dust/pollen particles
 * @property {Object|null} blossoms - Spring blossom particles
 * @property {number} leavesActivity - Autumn leaves (0-1)
 * @property {Array<string>} leafPalette - Autumn leaf colors
 */

/**
 * @typedef {Object} WeatherState
 * @property {'none'|'rain'|'drizzle'|'snow'} precipitation - Precipitation type
 * @property {number} intensity - Precipitation intensity (0-1)
 * @property {number} cloudCover - Cloud coverage (0-1, 0=clear, 1=overcast)
 * @property {number} windSpeed - Wind speed in km/h
 * @property {number} windDirection - Wind direction in degrees (0-360)
 * @property {number} visibility - Atmospheric visibility (0-1, 1=clear)
 * @property {'fog'|'mist'|'heatwave'|'rainbow'|'frost'|null} special - Special weather conditions
 * @property {WeatherFX} fx - Extended weather effects data
 */

/**
 * Generate weather state based on game conditions
 * @param {string} gameTime - Time string from game state (e.g., "3:00 PM")
 * @param {string} gameDate - Date string from game state (e.g., "August 22, 1680")
 * @param {string} location - Current location (for future multi-location support)
 * @param {number} seed - Optional seed for deterministic weather
 * @returns {WeatherState}
 */
export const generateWeather = (gameTime, gameDate, location = 'Mexico City', seed = null) => {
  const { hours, minutes } = parseGameTime(gameTime);
  const season = getSeasonFromDate(gameDate);
  const timeOfDay = getTimeOfDay(hours);

  // Use seed for deterministic weather, or random
  const rng = seed !== null ? seededRandom(seed) : Math.random;

  // Base weather patterns for Mexico City
  const weatherPattern = getWeatherPattern(season, hours, rng);

  // Generate weather state
  const state = {
    precipitation: weatherPattern.precipitation,
    intensity: weatherPattern.intensity,
    cloudCover: weatherPattern.cloudCover,
    windSpeed: weatherPattern.windSpeed,
    windDirection: weatherPattern.windDirection,
    visibility: weatherPattern.visibility,
    special: weatherPattern.special,
    fx: generateWeatherEffects(weatherPattern, season, hours, timeOfDay, rng)
  };

  return state;
};

/**
 * Get weather pattern for Mexico City based on season and time
 * @private
 */
const getWeatherPattern = (season, hours, rng) => {
  const roll = rng();

  // SUMMER (June-August): Rainy season
  if (season === 'summer') {
    // Afternoon thunderstorms (2-6 PM) are very common
    if (hours >= 14 && hours < 18) {
      if (roll < 0.6) {
        // 60% chance of afternoon rain
        return {
          precipitation: 'rain',
          intensity: 0.5 + rng() * 0.4, // Moderate to heavy
          cloudCover: 0.7 + rng() * 0.2,
          windSpeed: 15 + rng() * 20,
          windDirection: rng() * 360,
          visibility: 0.4 + rng() * 0.3,
          special: roll < 0.3 ? 'rainbow' : null // Rainbow after storms
        };
      }
    }

    // Morning: clear to partly cloudy, humid
    if (hours >= 6 && hours < 14) {
      return {
        precipitation: 'none',
        intensity: 0,
        cloudCover: 0.2 + rng() * 0.4,
        windSpeed: 5 + rng() * 10,
        windDirection: rng() * 360,
        visibility: 0.7 + rng() * 0.2,
        special: null
      };
    }

    // Evening/night: clear after storms
    return {
      precipitation: 'none',
      intensity: 0,
      cloudCover: 0.1 + rng() * 0.3,
      windSpeed: 3 + rng() * 8,
      windDirection: rng() * 360,
      visibility: 0.8 + rng() * 0.2,
      special: null
    };
  }

  // FALL (September-November): Transition, decreasing rain
  if (season === 'fall') {
    if (roll < 0.25 && hours >= 14 && hours < 18) {
      // 25% chance of afternoon showers (decreasing)
      return {
        precipitation: roll < 0.15 ? 'rain' : 'drizzle',
        intensity: 0.3 + rng() * 0.4,
        cloudCover: 0.5 + rng() * 0.3,
        windSpeed: 10 + rng() * 15,
        windDirection: rng() * 360,
        visibility: 0.5 + rng() * 0.3,
        special: null
      };
    }

    // Otherwise clear to partly cloudy, pleasant
    return {
      precipitation: 'none',
      intensity: 0,
      cloudCover: 0.1 + rng() * 0.4,
      windSpeed: 5 + rng() * 12,
      windDirection: rng() * 360,
      visibility: 0.8 + rng() * 0.2,
      special: null
    };
  }

  // WINTER (December-February): Dry season, cool mornings
  if (season === 'winter') {
    // Very rare rain
    if (roll < 0.05) {
      return {
        precipitation: 'drizzle',
        intensity: 0.2 + rng() * 0.3,
        cloudCover: 0.6 + rng() * 0.2,
        windSpeed: 8 + rng() * 12,
        windDirection: rng() * 360,
        visibility: 0.6 + rng() * 0.3,
        special: null
      };
    }

    // Morning fog possible (cool mornings)
    if (hours >= 5 && hours < 9 && roll < 0.3) {
      return {
        precipitation: 'none',
        intensity: 0,
        cloudCover: 0.3 + rng() * 0.3,
        windSpeed: 2 + rng() * 5,
        windDirection: rng() * 360,
        visibility: 0.4 + rng() * 0.3,
        special: 'fog'
      };
    }

    // Clear, mild days
    return {
      precipitation: 'none',
      intensity: 0,
      cloudCover: 0.05 + rng() * 0.25,
      windSpeed: 4 + rng() * 10,
      windDirection: rng() * 360,
      visibility: 0.9 + rng() * 0.1,
      special: null
    };
  }

  // SPRING (March-May): Hot and dry, dust storms possible
  if (season === 'spring') {
    // Very little rain
    if (roll < 0.03) {
      return {
        precipitation: 'drizzle',
        intensity: 0.15 + rng() * 0.25,
        cloudCover: 0.4 + rng() * 0.3,
        windSpeed: 10 + rng() * 15,
        windDirection: rng() * 360,
        visibility: 0.6 + rng() * 0.3,
        special: null
      };
    }

    // Hot afternoons with dust
    if (hours >= 12 && hours < 17 && roll < 0.4) {
      return {
        precipitation: 'none',
        intensity: 0,
        cloudCover: 0.05 + rng() * 0.2,
        windSpeed: 15 + rng() * 20, // Windy, dusty
        windDirection: rng() * 360,
        visibility: 0.5 + rng() * 0.3, // Reduced by dust
        special: null
      };
    }

    // Clear, warm days
    return {
      precipitation: 'none',
      intensity: 0,
      cloudCover: 0.05 + rng() * 0.25,
      windSpeed: 8 + rng() * 15,
      windDirection: rng() * 360,
      visibility: 0.7 + rng() * 0.25,
      special: null
    };
  }

  // Default: clear weather
  return {
    precipitation: 'none',
    intensity: 0,
    cloudCover: 0.2,
    windSpeed: 8,
    windDirection: 180,
    visibility: 0.9,
    special: null
  };
};

/**
 * Generate extended weather effects
 * @private
 */
const generateWeatherEffects = (pattern, season, hours, timeOfDay, rng) => {
  const fx = {
    dropletSize: pattern.precipitation === 'rain' ? 0.5 + rng() * 0.4 : 0.2,
    flakeSize: 0, // No snow in Mexico City
    fogDensity: pattern.special === 'fog' ? 0.6 + rng() * 0.3 : 0,
    hazeDensity: 1 - pattern.visibility,
    surfaceWetnessNow: pattern.precipitation !== 'none' ? pattern.intensity : 0,
    lightningProbability: pattern.precipitation === 'rain' && pattern.intensity > 0.6 ? 0.3 + rng() * 0.4 : 0,
    heatShimmer: pattern.special === 'heatwave' ? 0.4 + rng() * 0.4 : 0,
    rainbowProbability: pattern.special === 'rainbow' ? 0.7 + rng() * 0.3 : 0,
    fireflyProbability: 0, // Rare in Mexico City
    auroraProbability: 0, // Impossible at this latitude
    airborneParticles: null,
    blossoms: null,
    leavesActivity: 0,
    leafPalette: []
  };

  // Dust particles in hot, dry, windy conditions (spring)
  if (season === 'spring' && pattern.windSpeed > WINDY_KMH && pattern.precipitation === 'none') {
    fx.airborneParticles = {
      type: 'dust',
      density: 0.3 + rng() * 0.4,
      size: [0.8, 2.0]
    };
  }

  // Pollen in spring (mornings)
  if (season === 'spring' && hours >= 7 && hours < 11 && pattern.windSpeed > 10) {
    fx.airborneParticles = {
      type: 'pollen',
      density: 0.2 + rng() * 0.3,
      size: [1.0, 2.5]
    };
  }

  // Jacaranda blossoms in spring (Mexico City's famous purple trees)
  if (season === 'spring' && pattern.windSpeed >= WINDY_KMH && pattern.precipitation === 'none') {
    fx.blossoms = {
      activity: 0.3 + rng() * 0.4,
      palette: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'], // Jacaranda purple
      sizeRange: [3, 6]
    };
  }

  // Autumn leaves (less common in subtropical Mexico City, but some trees do change)
  if (season === 'fall' && pattern.windSpeed >= WINDY_KMH) {
    fx.leavesActivity = 0.2 + rng() * 0.3;
    fx.leafPalette = ['#d97706', '#ea580c', '#dc2626', '#92400e'];
  }

  return fx;
};

/**
 * Seeded random number generator for deterministic weather
 * @private
 */
const seededRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
};

/**
 * Get weather description for UI display
 * @param {WeatherState} weather
 * @returns {string}
 */
export const getWeatherDescription = (weather) => {
  if (weather.precipitation === 'rain') {
    if (weather.intensity > 0.7) return 'Heavy Rain';
    if (weather.intensity > 0.4) return 'Rain';
    return 'Light Rain';
  }

  if (weather.precipitation === 'drizzle') {
    return 'Drizzle';
  }

  if (weather.special === 'fog') return 'Foggy';
  if (weather.special === 'mist') return 'Misty';
  if (weather.special === 'heatwave') return 'Hot & Clear';

  if (weather.cloudCover > 0.7) return 'Overcast';
  if (weather.cloudCover > 0.4) return 'Partly Cloudy';
  if (weather.cloudCover > 0.2) return 'Mostly Clear';
  return 'Clear';
};

/**
 * Check if weather is severe (affects gameplay)
 * @param {WeatherState} weather
 * @returns {boolean}
 */
export const isSevereWeather = (weather) => {
  return (
    (weather.precipitation === 'rain' && weather.intensity > 0.7) ||
    weather.special === 'fog' ||
    (weather.windSpeed > 35) ||
    weather.visibility < 0.3
  );
};

/**
 * Get atmospheric color tint for UI elements
 * @param {WeatherState} weather
 * @returns {string} - CSS filter string
 */
export const getAtmosphericTint = (weather) => {
  if (weather.precipitation === 'rain') {
    return 'brightness(0.85) saturate(0.8) hue-rotate(-5deg)';
  }

  if (weather.special === 'fog') {
    return 'brightness(0.9) saturate(0.6) contrast(0.9)';
  }

  if (weather.special === 'heatwave') {
    return 'brightness(1.1) saturate(1.2) hue-rotate(5deg)';
  }

  return 'none';
};

/**
 * React hook for weather state management
 * @param {string} gameTime - Current game time
 * @param {string} gameDate - Current game date
 * @param {string} location - Current location
 * @returns {WeatherState}
 */
export const useWeather = (gameTime, gameDate, location = 'Mexico City') => {
  const [weather, setWeather] = React.useState(() =>
    generateWeather(gameTime, gameDate, location)
  );

  React.useEffect(() => {
    // Regenerate weather when time changes significantly (every hour)
    const { hours } = parseGameTime(gameTime);
    const newWeather = generateWeather(gameTime, gameDate, location, hours * 100);
    setWeather(newWeather);
  }, [gameTime, gameDate, location]);

  return weather;
};

// Named export for React import
import React from 'react';

export default {
  generateWeather,
  getWeatherDescription,
  isSevereWeather,
  getAtmosphericTint,
  useWeather
};
