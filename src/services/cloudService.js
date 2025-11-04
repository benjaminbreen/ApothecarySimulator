/**
 * cloudService.js - Cloud generation and configuration based on weather conditions
 *
 * Determines cloud types, density, speed, and appearance based on current weather state
 *
 * Cloud Types:
 * - Cirrus: High, wispy clouds (clear/fair weather)
 * - Cumulus: Fluffy white clouds (fair weather)
 * - Stratocumulus: Low, patchy clouds (partly cloudy)
 * - Stratus: Flat gray layer (overcast)
 * - Nimbostratus: Dark rain clouds (light rain)
 * - Cumulonimbus: Towering storm clouds (thunderstorms)
 */

/**
 * Generate cloud configuration based on weather state
 * @param {Object} weather - Weather state from weatherService
 * @param {number} seed - Random seed for deterministic clouds
 * @returns {Object} Cloud configuration with seed
 */
export const generateCloudConfig = (weather, seed = 0) => {
  if (!weather) {
    return { enabled: false, layers: [], seed };
  }

  const { precipitation, intensity, cloudCover, windSpeed, special } = weather;

  // Performance optimization: limit max clouds per layer
  const MAX_CLOUDS_PER_LAYER = 16;

  // No clouds in very clear conditions
  if (cloudCover < 0.15 && precipitation === 'none') {
    return {
      enabled: true,
      seed,
      layers: [
        {
          type: 'cirrus',
          count: Math.min(3, MAX_CLOUDS_PER_LAYER),
          opacity: 0.98,
          speed: Math.max(4, windSpeed * 0.55),
          altitude: 'high',
          color: '#f8fbff',
          size: 'large'
        },
        {
          type: 'cumulus',
          count: Math.min(2, MAX_CLOUDS_PER_LAYER),
          opacity: 0.55,
          speed: Math.max(2, windSpeed * 0.5),
          altitude: 'medium',
          color: '#f5f8ff',
          size: 'small'
        }
      ]
    };
  }

  // Light cloud cover - fair weather cumulus
  if (cloudCover < 0.4 && precipitation === 'none') {
    return {
      enabled: true,
      seed,
      layers: [
        {
          type: 'cirrus',
          count: Math.min(4, MAX_CLOUDS_PER_LAYER),
          opacity: 0.48,
          speed: Math.max(5, windSpeed * 0.05),
          altitude: 'high',
          color: '#f6f9ff',
          size: 'medium'
        },
        {
          type: 'cumulus',
          count: Math.min(5, MAX_CLOUDS_PER_LAYER),
          opacity: 0.72,
          speed: Math.max(3, windSpeed * 0.2),
          altitude: 'medium',
          color: '#f8fafc',
          size: 'medium'
        },
        {
          type: 'stratocumulus',
          count: Math.min(2, MAX_CLOUDS_PER_LAYER),
          opacity: 0.75,
          speed: Math.max(4, windSpeed * 0.25),
          altitude: 'low',
          color: '#e6ecf6',
          size: 'medium'
        }
      ]
    };
  }

  // Partly cloudy - mix of cumulus and stratocumulus
  if (cloudCover < 0.6 && precipitation === 'none') {
    return {
      enabled: true,
      seed,
      layers: [
        {
          type: 'cirrus',
          count: Math.min(3, MAX_CLOUDS_PER_LAYER),
          opacity: 0.54,
          speed: Math.max(5, windSpeed * 0.75),
          altitude: 'high',
          color: '#eef3ff',
          size: 'small'
        },
        {
          type: 'cumulus',
          count: Math.min(6, MAX_CLOUDS_PER_LAYER),
          opacity: 0.8,
          speed: Math.max(3, windSpeed * 0.6),
          altitude: 'medium',
          color: '#f1f5f9',
          size: 'medium'
        },
        {
          type: 'stratocumulus',
          count: Math.min(3, MAX_CLOUDS_PER_LAYER),
          opacity: 0.7,
          speed: Math.max(2, windSpeed * 0.4),
          altitude: 'low',
          color: '#dce4f2',
          size: 'medium'
        }
      ]
    };
  }

  // Overcast - flat stratus layer
  if (cloudCover >= 0.6 && precipitation === 'none') {
    return {
      enabled: true,
      seed,
      layers: [
        {
          type: 'cirrus',
          count: Math.min(2, MAX_CLOUDS_PER_LAYER),
          opacity: 0.78,
          speed: Math.max(4, windSpeed * 0.65),
          altitude: 'high',
          color: '#eef3fb',
          size: 'small'
        },
        {
          type: 'stratus',
          count: Math.min(6, MAX_CLOUDS_PER_LAYER),
          opacity: 0.85,
          speed: Math.max(1.5, windSpeed * 0.3),
          altitude: 'low',
          color: '#cbd5e1',
          size: 'xlarge'
        },
        {
          type: 'stratocumulus',
          count: Math.min(4, MAX_CLOUDS_PER_LAYER),
          opacity: 0.88,
          speed: Math.max(2, windSpeed * 0.35),
          altitude: 'low',
          color: '#94a3b8',
          size: 'large'
        }
      ]
    };
  }

  // Light rain/drizzle - nimbostratus
  if (precipitation === 'drizzle' || (precipitation === 'rain' && intensity < 0.5)) {
    return {
      enabled: true,
      seed,
      layers: [
        {
          type: 'cirrus',
          count: Math.min(2, MAX_CLOUDS_PER_LAYER),
          opacity: 0.22,
          speed: Math.max(4.5, windSpeed * 0.7),
          altitude: 'high',
          color: '#e3e7ef',
          size: 'small'
        },
        {
          type: 'nimbostratus',
          count: Math.min(5, MAX_CLOUDS_PER_LAYER),
          opacity: 0.9,
          speed: Math.max(2.5, windSpeed * 0.4),
          altitude: 'low',
          color: '#64748b',
          size: 'xlarge'
        },
        {
          type: 'stratus',
          count: Math.min(4, MAX_CLOUDS_PER_LAYER),
          opacity: 0.7,
          speed: Math.max(2, windSpeed * 0.5),
          altitude: 'medium',
          color: '#475569',
          size: 'large'
        }
      ]
    };
  }

  // Heavy rain/thunderstorms - cumulonimbus
  if (precipitation === 'rain' && intensity >= 0.5) {
    return {
      enabled: true,
      seed,
      layers: [
        {
          type: 'cumulonimbus',
          count: Math.min(3, MAX_CLOUDS_PER_LAYER),
          opacity: 0.95,
          speed: Math.max(4, windSpeed * 0.6),
          altitude: 'high',
          color: '#334155',
          size: 'massive',
          dark: true
        },
        {
          type: 'nimbostratus',
          count: Math.min(4, MAX_CLOUDS_PER_LAYER),
          opacity: 0.86,
          speed: Math.max(3, windSpeed * 0.5),
          altitude: 'medium',
          color: '#475569',
          size: 'xlarge'
        },
        {
          type: 'stratus',
          count: Math.min(3, MAX_CLOUDS_PER_LAYER),
          opacity: 0.6,
          speed: Math.max(2, windSpeed * 0.45),
          altitude: 'low',
          color: '#4b5566',
          size: 'large',
          blur: true
        }
      ]
    };
  }

  // Fog/mist - very low stratus
  if (special === 'fog' || special === 'mist') {
    return {
      enabled: true,
      seed,
      layers: [
        {
          type: 'stratus',
          count: Math.min(6, MAX_CLOUDS_PER_LAYER),
          opacity: 0.6,
          speed: Math.max(1.5, windSpeed * 0.2),
          altitude: 'verylow',
          color: '#e2e8f0',
          size: 'xlarge',
          blur: true
        },
        {
          type: 'cirrus',
          count: Math.min(2, MAX_CLOUDS_PER_LAYER),
          opacity: 0.18,
          speed: Math.max(4, windSpeed * 0.6),
          altitude: 'high',
          color: '#e7edf6',
          size: 'small'
        }
      ]
    };
  }

  // Default fallback
  return {
    enabled: false,
    seed,
    layers: []
  };
};

/**
 * Get cloud shape data for different cloud types
 * Returns composite cloud data with multiple elements for depth
 */
export const getCloudShapes = () => {
  return {
    cirrus: [
      // Wispy, streaky shapes - each cloud has multiple overlapping wisps with more organic variation
      {
        main: 'M 10,25 Q 20,18 35,20 Q 50,22 65,18 Q 80,15 95,17 Q 110,19 125,16 Q 140,14 155,18 Q 165,20 175,17',
        wisps: [
          'M 15,28 Q 30,22 45,24 Q 60,26 75,23',
          'M 100,20 Q 115,17 130,19 Q 145,21 160,19'
        ]
      },
      {
        main: 'M 5,30 Q 18,22 30,24 Q 45,26 60,23 Q 75,20 90,22 Q 105,24 120,21 Q 135,18 150,22 Q 160,25 170,23',
        wisps: [
          'M 12,32 Q 28,26 42,28',
          'M 80,25 Q 95,22 110,24 Q 125,26 140,24'
        ]
      },
      {
        main: 'M 15,28 Q 28,20 42,22 Q 58,24 72,21 Q 88,18 102,21 Q 116,24 130,22',
        wisps: [
          'M 20,30 Q 35,25 50,27',
          'M 90,23 Q 105,20 120,23'
        ]
      },
      {
        // Thicker, more broken strand
        main: 'M 8,22 Q 25,16 40,19 Q 55,21 70,17 Q 82,14 95,19',
        wisps: [
          'M 110,20 Q 128,16 145,18 Q 160,20 172,18',
          'M 18,26 Q 35,20 50,23',
          'M 125,22 Q 138,19 152,21'
        ]
      },
      {
        // Very thin, delicate wisps
        main: 'M 20,28 Q 38,24 55,26 Q 72,28 88,25 Q 105,22 122,24 Q 138,26 155,23',
        wisps: [
          'M 28,31 Q 45,28 62,30',
          'M 95,27 Q 112,24 130,26'
        ]
      },
      {
        // Irregular, fragmented cirrus
        main: 'M 12,24 Q 28,20 44,23 Q 58,25 72,22',
        wisps: [
          'M 85,26 Q 100,23 115,25 Q 130,27 145,24',
          'M 155,28 Q 165,26 175,28',
          'M 22,27 Q 35,24 48,26'
        ]
      }
    ],
    cumulus: [
      // Fluffy clouds with multiple puffs - more varied arrangements and puff counts
      {
        puffs: [
          // Main body (large center puffs)
          { cx: 85, cy: 45, rx: 32, ry: 24 },
          { cx: 65, cy: 48, rx: 28, ry: 22 },
          { cx: 105, cy: 48, rx: 28, ry: 22 },
          // Top highlights (smaller, higher puffs)
          { cx: 75, cy: 38, rx: 18, ry: 16 },
          { cx: 95, cy: 36, rx: 20, ry: 18 },
          // Bottom volume
          { cx: 70, cy: 56, rx: 22, ry: 18 },
          { cx: 90, cy: 58, rx: 24, ry: 20 },
          { cx: 110, cy: 56, rx: 20, ry: 16 }
        ]
      },
      {
        puffs: [
          { cx: 80, cy: 42, rx: 30, ry: 26 },
          { cx: 58, cy: 46, rx: 26, ry: 20 },
          { cx: 102, cy: 46, rx: 26, ry: 20 },
          { cx: 70, cy: 34, rx: 20, ry: 18 },
          { cx: 90, cy: 32, rx: 22, ry: 20 },
          { cx: 64, cy: 54, rx: 20, ry: 16 },
          { cx: 86, cy: 56, rx: 22, ry: 18 },
          { cx: 106, cy: 54, rx: 18, ry: 14 }
        ]
      },
      {
        puffs: [
          { cx: 90, cy: 48, rx: 34, ry: 28 },
          { cx: 68, cy: 50, rx: 30, ry: 24 },
          { cx: 112, cy: 50, rx: 28, ry: 22 },
          { cx: 78, cy: 40, rx: 22, ry: 20 },
          { cx: 102, cy: 38, rx: 24, ry: 22 },
          { cx: 72, cy: 58, rx: 24, ry: 20 },
          { cx: 94, cy: 60, rx: 26, ry: 22 },
          { cx: 116, cy: 58, rx: 22, ry: 18 }
        ]
      },
      {
        // Asymmetric with more vertical development on left
        puffs: [
          { cx: 70, cy: 40, rx: 28, ry: 26 },
          { cx: 88, cy: 48, rx: 32, ry: 24 },
          { cx: 108, cy: 52, rx: 26, ry: 20 },
          { cx: 65, cy: 32, rx: 18, ry: 20 },
          { cx: 78, cy: 30, rx: 16, ry: 18 },
          { cx: 80, cy: 58, rx: 20, ry: 16 },
          { cx: 98, cy: 60, rx: 18, ry: 14 }
        ]
      },
      {
        // Small, compact cumulus
        puffs: [
          { cx: 85, cy: 46, rx: 26, ry: 22 },
          { cx: 70, cy: 50, rx: 22, ry: 18 },
          { cx: 100, cy: 50, rx: 20, ry: 16 },
          { cx: 78, cy: 38, rx: 16, ry: 16 },
          { cx: 92, cy: 36, rx: 18, ry: 18 }
        ]
      },
      {
        // Wider, flatter cumulus
        puffs: [
          { cx: 60, cy: 50, rx: 28, ry: 18 },
          { cx: 88, cy: 48, rx: 32, ry: 20 },
          { cx: 116, cy: 50, rx: 28, ry: 18 },
          { cx: 74, cy: 42, rx: 20, ry: 16 },
          { cx: 102, cy: 40, rx: 22, ry: 18 },
          { cx: 44, cy: 56, rx: 18, ry: 12 },
          { cx: 132, cy: 56, rx: 16, ry: 12 }
        ]
      },
      {
        // Tall, towering cumulus
        puffs: [
          { cx: 82, cy: 52, rx: 30, ry: 24 },
          { cx: 98, cy: 54, rx: 28, ry: 22 },
          { cx: 75, cy: 42, rx: 24, ry: 22 },
          { cx: 90, cy: 40, rx: 26, ry: 24 },
          { cx: 105, cy: 44, rx: 22, ry: 20 },
          { cx: 82, cy: 30, rx: 20, ry: 20 },
          { cx: 95, cy: 28, rx: 18, ry: 18 },
          { cx: 85, cy: 62, rx: 22, ry: 16 }
        ]
      }
    ],
    stratocumulus: [
      // Flatter puffs with spread-out arrangement - more varied patterns
      {
        puffs: [
          { cx: 40, cy: 52, rx: 38, ry: 16 },
          { cx: 85, cy: 54, rx: 42, ry: 18 },
          { cx: 130, cy: 52, rx: 36, ry: 15 },
          { cx: 60, cy: 48, rx: 28, ry: 12 },
          { cx: 110, cy: 50, rx: 30, ry: 14 }
        ]
      },
      {
        puffs: [
          { cx: 45, cy: 50, rx: 40, ry: 17 },
          { cx: 92, cy: 52, rx: 44, ry: 19 },
          { cx: 138, cy: 50, rx: 38, ry: 16 },
          { cx: 68, cy: 46, rx: 30, ry: 13 },
          { cx: 115, cy: 48, rx: 32, ry: 15 }
        ]
      },
      {
        // More fragmented, broken pattern
        puffs: [
          { cx: 35, cy: 54, rx: 32, ry: 14 },
          { cx: 75, cy: 52, rx: 36, ry: 16 },
          { cx: 118, cy: 56, rx: 40, ry: 17 },
          { cx: 160, cy: 54, rx: 30, ry: 13 },
          { cx: 55, cy: 48, rx: 24, ry: 11 },
          { cx: 140, cy: 50, rx: 26, ry: 12 }
        ]
      },
      {
        // Denser, more merged pattern
        puffs: [
          { cx: 50, cy: 50, rx: 44, ry: 18 },
          { cx: 98, cy: 52, rx: 48, ry: 20 },
          { cx: 146, cy: 50, rx: 42, ry: 17 },
          { cx: 72, cy: 46, rx: 32, ry: 14 },
          { cx: 122, cy: 48, rx: 34, ry: 15 },
          { cx: 28, cy: 54, rx: 28, ry: 13 }
        ]
      },
      {
        // Irregular spacing
        puffs: [
          { cx: 38, cy: 51, rx: 36, ry: 15 },
          { cx: 82, cy: 55, rx: 40, ry: 17 },
          { cx: 135, cy: 49, rx: 44, ry: 19 },
          { cx: 60, cy: 47, rx: 26, ry: 12 },
          { cx: 108, cy: 53, rx: 28, ry: 13 },
          { cx: 160, cy: 52, rx: 32, ry: 14 }
        ]
      }
    ],
    stratus: [
      // Very elongated, flat layers with subtle variation - more irregular patterns
      {
        puffs: [
          { cx: 60, cy: 55, rx: 80, ry: 10 },
          { cx: 140, cy: 56, rx: 70, ry: 9 },
          { cx: 100, cy: 53, rx: 60, ry: 8 }
        ]
      },
      {
        puffs: [
          { cx: 70, cy: 54, rx: 75, ry: 11 },
          { cx: 150, cy: 55, rx: 65, ry: 10 },
          { cx: 110, cy: 52, rx: 55, ry: 9 }
        ]
      },
      {
        // More broken, less uniform
        puffs: [
          { cx: 50, cy: 56, rx: 70, ry: 9 },
          { cx: 125, cy: 54, rx: 65, ry: 10 },
          { cx: 165, cy: 55, rx: 45, ry: 8 },
          { cx: 85, cy: 52, rx: 50, ry: 7 }
        ]
      },
      {
        // Thinner, more diffuse
        puffs: [
          { cx: 65, cy: 55, rx: 85, ry: 8 },
          { cx: 145, cy: 56, rx: 75, ry: 9 },
          { cx: 105, cy: 53, rx: 55, ry: 7 },
          { cx: 35, cy: 57, rx: 40, ry: 6 }
        ]
      },
      {
        // Very flat, continuous layer
        puffs: [
          { cx: 55, cy: 54, rx: 90, ry: 11 },
          { cx: 140, cy: 55, rx: 80, ry: 10 },
          { cx: 100, cy: 56, rx: 70, ry: 9 }
        ]
      }
    ],
    nimbostratus: [
      // Dark, heavy clouds with irregular bottom - more variations
      {
        puffs: [
          { cx: 50, cy: 48, rx: 60, ry: 20 },
          { cx: 120, cy: 50, rx: 70, ry: 24 },
          { cx: 85, cy: 55, rx: 55, ry: 22 },
          { cx: 160, cy: 52, rx: 50, ry: 20 },
          // Bottom irregularities
          { cx: 40, cy: 62, rx: 30, ry: 12 },
          { cx: 90, cy: 64, rx: 35, ry: 14 },
          { cx: 140, cy: 63, rx: 32, ry: 13 }
        ]
      },
      {
        // More dramatic bottom variation
        puffs: [
          { cx: 55, cy: 46, rx: 65, ry: 22 },
          { cx: 125, cy: 48, rx: 68, ry: 25 },
          { cx: 90, cy: 53, rx: 58, ry: 23 },
          { cx: 165, cy: 50, rx: 52, ry: 21 },
          { cx: 35, cy: 60, rx: 28, ry: 14 },
          { cx: 75, cy: 66, rx: 32, ry: 16 },
          { cx: 115, cy: 64, rx: 38, ry: 15 },
          { cx: 155, cy: 62, rx: 30, ry: 13 }
        ]
      },
      {
        // Lower, heavier base
        puffs: [
          { cx: 48, cy: 50, rx: 62, ry: 24 },
          { cx: 118, cy: 52, rx: 72, ry: 26 },
          { cx: 82, cy: 57, rx: 60, ry: 25 },
          { cx: 158, cy: 54, rx: 55, ry: 22 },
          { cx: 38, cy: 66, rx: 34, ry: 14 },
          { cx: 88, cy: 68, rx: 40, ry: 16 },
          { cx: 138, cy: 67, rx: 36, ry: 15 }
        ]
      },
      {
        // More uniform top, ragged bottom
        puffs: [
          { cx: 60, cy: 45, rx: 58, ry: 18 },
          { cx: 122, cy: 46, rx: 66, ry: 20 },
          { cx: 92, cy: 48, rx: 54, ry: 19 },
          { cx: 32, cy: 58, rx: 30, ry: 16 },
          { cx: 70, cy: 62, rx: 36, ry: 18 },
          { cx: 110, cy: 64, rx: 42, ry: 20 },
          { cx: 150, cy: 60, rx: 34, ry: 15 },
          { cx: 170, cy: 56, rx: 28, ry: 14 }
        ]
      }
    ],
    cumulonimbus: [
      // Towering storm clouds with vertical development - more dramatic variations
      {
        puffs: [
          // Anvil top
          { cx: 85, cy: 25, rx: 50, ry: 12 },
          { cx: 75, cy: 22, rx: 35, ry: 10 },
          { cx: 95, cy: 23, rx: 38, ry: 11 },
          // Upper tower
          { cx: 80, cy: 35, rx: 40, ry: 22 },
          { cx: 90, cy: 38, rx: 38, ry: 24 },
          // Mid section
          { cx: 75, cy: 50, rx: 44, ry: 28 },
          { cx: 95, cy: 52, rx: 42, ry: 26 },
          // Lower base
          { cx: 70, cy: 68, rx: 48, ry: 24 },
          { cx: 90, cy: 70, rx: 50, ry: 26 },
          { cx: 110, cy: 68, rx: 46, ry: 24 }
        ]
      },
      {
        // Asymmetric tower leaning slightly right
        puffs: [
          // Anvil top (offset right)
          { cx: 95, cy: 24, rx: 52, ry: 11 },
          { cx: 82, cy: 21, rx: 32, ry: 9 },
          { cx: 108, cy: 22, rx: 40, ry: 10 },
          // Upper tower
          { cx: 88, cy: 36, rx: 38, ry: 24 },
          { cx: 98, cy: 39, rx: 36, ry: 26 },
          // Mid section
          { cx: 82, cy: 52, rx: 42, ry: 30 },
          { cx: 100, cy: 54, rx: 40, ry: 28 },
          // Lower base
          { cx: 72, cy: 70, rx: 50, ry: 26 },
          { cx: 94, cy: 72, rx: 52, ry: 28 },
          { cx: 116, cy: 70, rx: 48, ry: 25 }
        ]
      },
      {
        // Narrower tower, more dramatic anvil spread
        puffs: [
          // Wide anvil top
          { cx: 85, cy: 26, rx: 58, ry: 10 },
          { cx: 70, cy: 23, rx: 38, ry: 8 },
          { cx: 100, cy: 24, rx: 42, ry: 9 },
          { cx: 55, cy: 28, rx: 28, ry: 8 },
          { cx: 115, cy: 27, rx: 30, ry: 7 },
          // Narrow upper tower
          { cx: 82, cy: 38, rx: 34, ry: 20 },
          { cx: 92, cy: 40, rx: 32, ry: 22 },
          // Mid section
          { cx: 78, cy: 54, rx: 40, ry: 26 },
          { cx: 96, cy: 56, rx: 38, ry: 24 },
          // Lower base
          { cx: 72, cy: 70, rx: 46, ry: 22 },
          { cx: 92, cy: 72, rx: 48, ry: 24 },
          { cx: 112, cy: 70, rx: 44, ry: 22 }
        ]
      }
    ]
  };
};

/**
 * Get size multipliers for different cloud sizes
 */
export const getCloudSizeMultiplier = (size) => {
  const multipliers = {
    small: 0.6,
    medium: 1.0,
    large: 1.4,
    xlarge: 1.8,
    massive: 2.5
  };
  return multipliers[size] || 1.0;
};

/**
 * Get altitude Y-position ranges for cloud layers
 */
export const getAltitudeRange = (altitude) => {
  const ranges = {
    verylow: { min: 0.7, max: 0.85 },  // 70-85% from top
    low: { min: 0.5, max: 0.7 },       // 50-70% from top
    medium: { min: 0.3, max: 0.5 },    // 30-50% from top
    high: { min: 0.1, max: 0.3 }       // 10-30% from top
  };
  return ranges[altitude] || ranges.medium;
};

/**
 * Get parallax speed multiplier for altitude
 * Higher altitude = slower apparent motion (farther away)
 * Lower altitude = faster apparent motion (closer)
 */
export const getAltitudeSpeedMultiplier = (altitude) => {
  const multipliers = {
    verylow: 1.4,   // Closest, fastest
    low: 1.0,       // Base speed
    medium: 0.7,    // Slower (farther)
    high: 0.4       // Slowest (farthest)
  };
  return multipliers[altitude] || 1.0;
};
