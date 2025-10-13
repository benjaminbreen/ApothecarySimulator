/**
 * Fast Travel Modal
 *
 * Menu-based destination selection system.
 * Unlocks locations based on Riding and Etiquette skill levels:
 * - Riding L1: Valley of Mexico locations
 * - Riding L3: Distant cities (Veracruz, Puebla, Oaxaca)
 * - Etiquette L3: Elite spaces (Viceregal Palace, Cathedral, University)
 *
 * Shows travel time and energy costs for each destination.
 */

import React, { useState, useMemo } from 'react';
import { performSkillCheck, DIFFICULTY } from '../../../core/systems/skillCheckSystem';

/**
 * Travel Destination Categories
 */
const DESTINATION_CATEGORIES = {
  LOCAL: {
    id: 'local',
    name: 'Within the City',
    description: 'Quick travel to nearby locations',
    color: 'emerald',
    skillRequired: null // Always available
  },
  VALLEY: {
    id: 'valley',
    name: 'Valley of Mexico',
    description: 'Requires Riding Level 1',
    color: 'blue',
    skillRequired: { skill: 'riding', level: 1 }
  },
  DISTANT: {
    id: 'distant',
    name: 'Distant Cities',
    description: 'Requires Riding Level 3',
    color: 'purple',
    skillRequired: { skill: 'riding', level: 3 }
  },
  ELITE: {
    id: 'elite',
    name: 'Elite Spaces',
    description: 'Requires Etiquette Level 3',
    color: 'amber',
    skillRequired: { skill: 'etiquette', level: 3 }
  }
};

/**
 * Travel Destinations
 */
const DESTINATIONS = [
  // LOCAL (always available)
  {
    id: 'botica',
    name: 'Botica de la Amargura',
    category: 'local',
    description: 'Your apothecary shop',
    travelTime: 0,
    energyCost: 0
  },
  {
    id: 'la-merced',
    name: 'La Merced Market',
    category: 'local',
    description: 'Bustling marketplace with vendors',
    travelTime: 15, // minutes
    energyCost: 5
  },
  {
    id: 'plaza-mayor',
    name: 'Plaza Mayor',
    category: 'local',
    description: 'Central square of Mexico City',
    travelTime: 20,
    energyCost: 5
  },
  {
    id: 'alameda',
    name: 'The Alameda',
    category: 'local',
    description: 'Public garden and promenade',
    travelTime: 25,
    energyCost: 5
  },
  {
    id: 'san-hipolito',
    name: 'San Hipólito',
    category: 'local',
    description: 'Hospital for the mentally ill',
    travelTime: 30,
    energyCost: 5
  },
  {
    id: 'hospital-real',
    name: 'Hospital Real de los Naturales',
    category: 'local',
    description: 'Indigenous hospital',
    travelTime: 35,
    energyCost: 10
  },

  // VALLEY OF MEXICO (Riding L1)
  {
    id: 'chapultepec',
    name: 'Chapultepec Forest',
    category: 'valley',
    description: 'Ancient forest with sacred springs',
    travelTime: 60, // 1 hour
    energyCost: 15
  },
  {
    id: 'xochimilco',
    name: 'Xochimilco',
    category: 'valley',
    description: 'Floating gardens and canals',
    travelTime: 90, // 1.5 hours
    energyCost: 20
  },
  {
    id: 'tlatelolco',
    name: 'Tlatelolco',
    category: 'valley',
    description: 'Indigenous marketplace and ruins',
    travelTime: 45,
    energyCost: 15
  },
  {
    id: 'texcoco',
    name: 'Lake Texcoco Shore',
    category: 'valley',
    description: 'Eastern lake shore',
    travelTime: 75,
    energyCost: 20
  },

  // DISTANT CITIES (Riding L3)
  {
    id: 'puebla',
    name: 'Puebla de los Ángeles',
    category: 'distant',
    description: 'Second-largest city in New Spain',
    travelTime: 480, // 8 hours
    energyCost: 40
  },
  {
    id: 'veracruz',
    name: 'Veracruz',
    category: 'distant',
    description: 'Port city on the Gulf coast',
    travelTime: 720, // 12 hours
    energyCost: 50
  },
  {
    id: 'oaxaca',
    name: 'Oaxaca',
    category: 'distant',
    description: 'Southern city rich in indigenous culture',
    travelTime: 600, // 10 hours
    energyCost: 45
  },
  {
    id: 'guadalajara',
    name: 'Guadalajara',
    category: 'distant',
    description: 'Western colonial city',
    travelTime: 540, // 9 hours
    energyCost: 45
  },

  // ELITE SPACES (Etiquette L3)
  {
    id: 'viceregal-palace',
    name: 'Viceregal Palace',
    category: 'elite',
    description: 'Seat of the Spanish Viceroy',
    travelTime: 25,
    energyCost: 5
  },
  {
    id: 'cathedral',
    name: 'Metropolitan Cathedral',
    category: 'elite',
    description: 'Largest cathedral in the Americas',
    travelTime: 20,
    energyCost: 5
  },
  {
    id: 'university',
    name: 'Royal and Pontifical University',
    category: 'elite',
    description: 'Center of learning and theology',
    travelTime: 30,
    energyCost: 5
  },
  {
    id: 'inquisition-palace',
    name: 'Inquisition Palace',
    category: 'elite',
    description: 'Headquarters of the Holy Office (dangerous!)',
    travelTime: 25,
    energyCost: 5
  }
];

/**
 * Get color classes for category
 */
function getCategoryColorClasses(color) {
  const colors = {
    emerald: {
      bg: 'bg-emerald-600',
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      textLight: 'text-emerald-600',
      hover: 'hover:bg-emerald-100',
      disabled: 'bg-gray-200'
    },
    blue: {
      bg: 'bg-blue-600',
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      textLight: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      disabled: 'bg-gray-200'
    },
    purple: {
      bg: 'bg-purple-600',
      bgLight: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      textLight: 'text-purple-600',
      hover: 'hover:bg-purple-100',
      disabled: 'bg-gray-200'
    },
    amber: {
      bg: 'bg-amber-600',
      bgLight: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      textLight: 'text-amber-600',
      hover: 'hover:bg-amber-100',
      disabled: 'bg-gray-200'
    }
  };
  return colors[color] || colors.emerald;
}

/**
 * Format travel time as readable string
 */
function formatTravelTime(minutes) {
  if (minutes === 0) return 'Instant';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function FastTravelModal({
  isOpen,
  onClose,
  playerSkills,
  currentLocation,
  currentEnergy,
  onTravel
}) {
  const [selectedCategory, setSelectedCategory] = useState('local');
  const [hoveredDestination, setHoveredDestination] = useState(null);

  // Check which categories are unlocked
  const categoryAccessMap = useMemo(() => {
    const access = {};
    Object.entries(DESTINATION_CATEGORIES).forEach(([key, category]) => {
      if (!category.skillRequired) {
        access[category.id] = { unlocked: true, message: '' };
      } else {
        const { skill, level } = category.skillRequired;
        const playerLevel = playerSkills?.knownSkills?.[skill]?.level || 0;
        access[category.id] = {
          unlocked: playerLevel >= level,
          message: playerLevel >= level
            ? `Unlocked with ${skill} Level ${level}`
            : `Requires ${skill} Level ${level} (you have ${playerLevel})`
        };
      }
    });
    return access;
  }, [playerSkills]);

  // Get destinations for selected category
  const availableDestinations = useMemo(() => {
    return DESTINATIONS.filter(dest => dest.category === selectedCategory);
  }, [selectedCategory]);

  // Handle travel
  const handleTravel = (destination) => {
    // Check energy
    if (currentEnergy < destination.energyCost) {
      alert(`Not enough energy! This journey requires ${destination.energyCost} energy, but you only have ${currentEnergy}.`);
      return;
    }

    // Confirm travel
    const confirmMessage = destination.travelTime === 0
      ? `You are already at ${destination.name}.`
      : `Travel to ${destination.name}?\n\nTime: ${formatTravelTime(destination.travelTime)}\nEnergy Cost: ${destination.energyCost}`;

    if (!window.confirm(confirmMessage)) return;

    // Execute travel
    onTravel({
      destination: destination.name,
      travelTime: destination.travelTime,
      energyCost: destination.energyCost
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="modal-content bg-white rounded-2xl shadow-elevation-4 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4">
            <div className="text-5xl">🗺️</div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold mb-2">Fast Travel</h1>
              <p className="text-white/90 font-serif text-sm">
                Select a destination to travel quickly. Distant locations require higher skills.
              </p>
              <div className="mt-3 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/70">Current:</span>
                  <span className="font-semibold">{currentLocation || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/70">Energy:</span>
                  <span className="font-semibold">{currentEnergy || 0}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          {Object.values(DESTINATION_CATEGORIES).map((category) => {
            const access = categoryAccessMap[category.id];
            const isLocked = !access.unlocked;
            const colors = getCategoryColorClasses(category.color);

            return (
              <button
                key={category.id}
                onClick={() => !isLocked && setSelectedCategory(category.id)}
                disabled={isLocked}
                className={`
                  flex-1 px-6 py-4 font-sans text-sm font-medium transition-all min-w-[150px]
                  ${selectedCategory === category.id
                    ? `${colors.bg} text-white border-b-2 border-b-white shadow-md`
                    : isLocked
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : `text-gray-700 hover:bg-gray-100`
                  }
                `}
                title={access.message}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">{category.name}</span>
                  <span className="text-xs opacity-80">
                    {isLocked ? '🔒 Locked' : category.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Destinations Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableDestinations.map((destination) => {
              const isCurrentLocation = currentLocation === destination.name;
              const hasEnoughEnergy = currentEnergy >= destination.energyCost;
              const colors = getCategoryColorClasses(DESTINATION_CATEGORIES[destination.category.toUpperCase()].color);

              return (
                <button
                  key={destination.id}
                  onClick={() => handleTravel(destination)}
                  onMouseEnter={() => setHoveredDestination(destination.id)}
                  onMouseLeave={() => setHoveredDestination(null)}
                  disabled={isCurrentLocation || !hasEnoughEnergy}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${isCurrentLocation
                      ? 'bg-gray-100 border-gray-300 cursor-default opacity-60'
                      : !hasEnoughEnergy
                      ? 'bg-red-50 border-red-300 cursor-not-allowed opacity-60'
                      : `${colors.bgLight} ${colors.border} ${colors.hover} cursor-pointer`
                    }
                    ${hoveredDestination === destination.id && hasEnoughEnergy && !isCurrentLocation
                      ? 'shadow-lg scale-105 -translate-y-1'
                      : ''
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-serif text-lg font-bold ${colors.text}`}>
                      {destination.name}
                    </h3>
                    {isCurrentLocation && (
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 font-serif leading-relaxed">
                    {destination.description}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTravelTime(destination.travelTime)}
                      </span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {destination.energyCost} energy
                      </span>
                    </div>
                  </div>

                  {!hasEnoughEnergy && !isCurrentLocation && (
                    <div className="mt-2 text-xs text-red-600 font-semibold">
                      ⚠️ Not enough energy
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">Travel Tips:</span>
              <span>🐴 Riding skill unlocks distant locations</span>
              <span>🎩 Etiquette skill unlocks elite spaces</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
