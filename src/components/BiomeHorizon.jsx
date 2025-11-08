/**
 * BiomeHorizon.jsx
 * Displays static PNG horizon silhouettes for different biomes
 * Used for non-Mexico City locations (Mexico City uses complex SVG HorizonLine)
 */

import React, { useMemo } from 'react';

/**
 * Get PNG filename for biome
 * @param {string} biome - Biome type
 * @returns {string} Filename in /public/horizons/
 */
const getBiomeHorizonFile = (biome) => {
  const biomeFiles = {
    'city-mexico': null, // Use HorizonLine instead
    'city-colonial': 'colonial_city_horizon.png',
    'city-european': 'european_city_horizon.png',
    'coastal': 'coastal_horizon.png',
    'ocean': 'ocean_horizon.png',
    'mountain': 'mountain_horizon.png',
    'desert': 'desert_horizon.png',
    'grassland': 'grassland_horizon.png'
  };

  return biomeFiles[biome] || biomeFiles['grassland']; // Default to grassland
};

/**
 * Calculate opacity based on time of day for darkening effect
 * Works with mix-blend-mode: darken to simulate lighting
 * @param {string} gameTime - Time string like "8:00 AM"
 * @returns {number} Opacity 0-1 (0 = noon/bright, 1 = night/dark)
 */
const getTimeOpacity = (gameTime) => {
  if (!gameTime) return 0.2;

  const timeMatch = gameTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return 0.2;

  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const period = timeMatch[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  const totalMinutes = hours * 60 + minutes;

  // Opacity curve (0 = bright, 1 = dark)
  // Noon (12:00 PM = 720 min): 0.0 (brightest)
  // 6 AM (360 min): 0.3
  // 6 PM (1080 min): 0.3
  // Midnight (0/1440 min): 0.7 (darkest)
  // 3 AM (180 min): 0.6
  // 9 PM (1260 min): 0.6

  if (totalMinutes >= 360 && totalMinutes <= 1080) {
    // Daytime (6 AM - 6 PM): parabola curve
    const noonMinutes = 720; // 12:00 PM
    const dayRange = 360; // 6 hours on either side
    const distanceFromNoon = Math.abs(totalMinutes - noonMinutes);
    const normalizedDistance = distanceFromNoon / dayRange; // 0 at noon, 1 at 6 AM/PM
    return normalizedDistance * 0.3; // 0 at noon, 0.3 at dawn/dusk
  } else {
    // Nighttime (6 PM - 6 AM): darker
    let nightMinutes = totalMinutes;
    if (nightMinutes < 360) {
      // After midnight (0-360): approach midnight
      nightMinutes = 360 - nightMinutes; // Distance from 6 AM
    } else {
      // Before midnight (1080-1440): approach midnight
      nightMinutes = nightMinutes - 1080; // Distance from 6 PM
    }

    const midnightDistance = 360; // Max distance from 6 PM/AM to midnight
    const normalizedNightDistance = nightMinutes / midnightDistance; // 0 at dusk/dawn, 1 at midnight
    return 0.3 + (normalizedNightDistance * 0.4); // 0.3 at dusk/dawn, 0.7 at midnight
  }
};

const BiomeHorizon = ({ currentBiome, previousBiome, gameTime }) => {
  // Get horizon files
  const currentFile = useMemo(() => getBiomeHorizonFile(currentBiome), [currentBiome]);
  const previousFile = useMemo(() => getBiomeHorizonFile(previousBiome), [previousBiome]);

  // Calculate time-based opacity for darkening
  const timeOpacity = useMemo(() => getTimeOpacity(gameTime), [gameTime]);

  // Don't render for Mexico City (uses HorizonLine instead)
  if (!currentFile) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
      {/* Previous biome (fading out) */}
      {previousBiome && previousFile && previousFile !== currentFile && (
        <div
          className="biome-horizon-fade-out absolute inset-0 bg-cover bg-bottom"
          style={{
            backgroundImage: `url(/horizons/${previousFile})`,
            mixBlendMode: 'darken',
            opacity: timeOpacity,
          }}
        />
      )}

      {/* Current biome (fading in) */}
      <div
        className="biome-horizon-fade-in absolute inset-0 bg-cover bg-bottom transition-opacity duration-1000"
        style={{
          backgroundImage: `url(/horizons/${currentFile})`,
          mixBlendMode: 'darken',
          opacity: timeOpacity,
        }}
      />
    </div>
  );
};

export default BiomeHorizon;
