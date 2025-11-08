# Biome Horizon PNG Assets

This directory contains static PNG horizon silhouettes for different biomes/locations in the game.

## Required Files

The following PNG files are needed (1920x1080 recommended resolution):

1. **colonial_city_horizon.png** - Colonial cities (most common)
   - Silhouette of colonial Spanish/Portuguese architecture
   - Churches, plazas, colonial buildings
   - Used for: Puebla, Veracruz, Havana, Cartagena, etc.

2. **european_city_horizon.png** - European cities
   - Silhouette of European architecture
   - Gothic churches, city walls, towers
   - Used for: Seville, Madrid, Lisbon, etc.

3. **coastal_horizon.png** - Coastal/port locations
   - Silhouette with ships, harbor structures
   - Water horizon line, masts, docks
   - Used for: Acapulco, Veracruz (port), etc.

4. **ocean_horizon.png** - Open ocean/sea passages
   - Simple water horizon, possibly distant ships
   - Minimal detail, mostly empty horizon
   - Used for: Atlantic crossings, Pacific routes

5. **mountain_horizon.png** - Mountain/mining towns
   - Silhouette of mountain peaks and ridges
   - Mining structures on hills
   - Used for: Taxco, Zacatecas, Potosí, etc.

6. **desert_horizon.png** - Desert/arid regions
   - Silhouette of mesas, cacti, sparse vegetation
   - Flat horizon with occasional buttes
   - Used for: Sonora, Chihuahua, Durango

7. **grassland_horizon.png** - Countryside/rural areas
   - Silhouette of rolling hills, trees, farmland
   - Simple pastoral scene
   - Used for: Outskirts, countryside, rural locations

## Image Specifications

- **Format**: PNG with transparency
- **Resolution**: 1920x1080 (or higher for retina displays)
- **Style**: Black silhouettes with alpha transparency
  - Silhouettes should be pure black (#000000)
  - Background should be fully transparent
  - This allows TimeAwareBackground sky colors to show through
  - mix-blend-mode: darken is applied in code to blend with sky

- **Composition**:
  - Horizon line should be in bottom 30-40% of image
  - Top 60-70% should be transparent (for sky)
  - Foreground silhouettes can be more detailed
  - Background silhouettes should be simpler/lighter

- **Time-of-Day Integration**:
  - PNGs don't need time variants
  - TimeAwareBackground handles sky color transitions
  - BiomeHorizon.jsx applies time-based darkening via opacity
  - mix-blend-mode: darken ensures silhouettes stay dark

## Placeholder Status

⚠️ **Currently, no PNG assets have been created yet.**

The biome system is fully implemented and will work as soon as these PNG files are added.

To test the system without real assets:
1. Create simple placeholder PNGs (even solid black rectangles work)
2. Place them in this directory with the exact filenames listed above
3. The system will automatically use them when traveling to different locations

## Implementation Details

- Biome detection: `src/pages/GamePage.jsx` (lines ~1443-1476)
- Biome rendering: `src/components/BiomeHorizon.jsx`
- Integration: `src/components/WeatherBackground.jsx` (lines ~350-366)
- Animations: `src/index.css` (lines ~996-1021)
