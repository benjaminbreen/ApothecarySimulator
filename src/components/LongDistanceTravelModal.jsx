import React, { useEffect, useMemo, useState } from 'react';
import { FiGlobe, FiMap, FiList, FiX, FiNavigation } from 'react-icons/fi';
import WorldMap from '../features/map/components/WorldMap';

const TRAVEL_MODES = {
  foot: {
    id: 'foot',
    label: 'Overland on foot',
    speedKmPerDay: 28,
    costPerKm: 0.05,
    baseCost: 4,
    paymentRecipient: 'hire local porters and purchase trail provisions',
    description: 'Travel with porters on established caminos; slow but inexpensive.',
    allowedRegions: ['New Spain', 'Central America']
  },
  wagon: {
    id: 'wagon',
    label: 'Wagon caravan',
    speedKmPerDay: 55,
    costPerKm: 0.08,
    baseCost: 8,
    paymentRecipient: 'pay the wagon master for a place in the caravan',
    description: 'Join a wagon convoy or train of cargadores heading along the Royal Roads.',
    allowedRegions: ['New Spain', 'Central America']
  },
  horse: {
    id: 'horse',
    label: 'Horseback courier',
    speedKmPerDay: 85,
    costPerKm: 0.12,
    baseCost: 12,
    paymentRecipient: 'rent a mount and compensate a guide',
    description: 'Hire a mount and guide; fastest overland option but costly.',
    allowedRegions: ['New Spain', 'Central America']
  },
  river: {
    id: 'river',
    label: 'River transport',
    speedKmPerDay: 110,
    costPerKm: 0.07,
    baseCost: 10,
    paymentRecipient: 'pay the riverboat pilot and crew',
    description: 'Travel by canoe, trajinera, or river barge where navigable waterways exist.',
    allowedRegions: ['Central America', 'South America']
  },
  sea: {
    id: 'sea',
    label: 'Sea voyage',
    speedKmPerDay: 220,
    costPerKm: 0.012,
    baseCost: 25,
    paymentRecipient: 'pay the ship’s purser for passage and victuals',
    description: 'Secure passage on a coastal or transoceanic vessel.',
    allowedRegions: [
      'New Spain',
      'Central America',
      'Caribbean',
      'South America',
      'Atlantic',
      'Europe',
      'West Africa',
      'Southern Africa',
      'Indian Ocean',
      'Pacific',
      'Southeast Asia',
      'East Asia',
      'North Africa',
      'South Asia'
    ]
  }
};

const DEFAULT_REGION_MODES = {
  'New Spain': ['wagon', 'horse', 'foot'],
  'Central America': ['wagon', 'horse', 'river', 'sea'],
  Caribbean: ['sea'],
  'South America': ['sea', 'river'],
  Atlantic: ['sea'],
  Europe: ['sea'],
  'West Africa': ['sea'],
  'Southern Africa': ['sea'],
  'North Africa': ['sea'],
  'South Asia': ['sea'],
  'Indian Ocean': ['sea'],
  Pacific: ['sea'],
  'Southeast Asia': ['sea'],
  'East Asia': ['sea']
};

const formatNumber = (value) => value.toLocaleString('en-US');

const formatCurrency = (value) => `${formatNumber(Math.max(0, Math.round(value)))}`;

const pluralize = (value, unit) => `${value} ${unit}${value === 1 ? '' : 's'}`;

const toDate = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const candidate = new Date(`${dateStr} ${timeStr || '08:00 AM'}`);
  if (!Number.isNaN(candidate.getTime())) {
    return candidate;
  }
  const fallback = new Date(dateStr);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }
  return null;
};

const addDays = (date, days) => {
  if (!date) return null;
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
};

const formatDate = (date) => {
  if (!date) return 'unknown date';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (date) => {
  if (!date) return 'unknown time';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const getRegionModes = (region) => {
  if (region && DEFAULT_REGION_MODES[region]) {
    return DEFAULT_REGION_MODES[region];
  }
  return ['sea'];
};

const clampCost = (cost) => Math.max(2, Math.round(cost));

const calculateTravelPlan = ({
  destination,
  mode,
  currentDate,
  currentTime
}) => {
  const distanceKm = destination.distanceKm ?? 0;
  const speed = mode.speedKmPerDay || 40;
  const durationDays = Math.max(1, Math.ceil(distanceKm / speed));
  let cost = clampCost(distanceKm * (mode.costPerKm || 0.05) + (mode.baseCost || 0));

  if (mode.id === 'sea') {
    cost = clampCost(cost + 20);
  }

  const departureDate = toDate(currentDate, currentTime);
  const arrivalDate = addDays(departureDate, durationDays);

  return {
    distanceKm,
    durationDays,
    costReales: cost,
    departureDate,
    arrivalDate,
    departureDateLabel: departureDate ? `${formatDate(departureDate)} (${formatTime(departureDate)})` : 'immediately',
    arrivalDateLabel: arrivalDate ? `${formatDate(arrivalDate)} (${formatTime(arrivalDate)})` : 'after several days'
  };
};

const buildTravelCommand = ({
  destination,
  mode,
  plan,
  customNote,
  origin
}) => {
  const distanceLabel = plan.distanceKm ? `${Math.round(plan.distanceKm)} km` : 'the journey';
  const durationLabel = pluralize(plan.durationDays, 'day');
  const paymentLine = `Pay ${plan.costReales} reales to ${mode.paymentRecipient}.`;
  const departureLine = plan.departureDate
    ? `Depart from ${origin?.fullName || 'Mexico City'} on ${formatDate(plan.departureDate)} at ${formatTime(plan.departureDate)}.`
    : `Depart immediately from ${origin?.fullName || 'Mexico City'}.`;
  const arrivalLine = plan.arrivalDate
    ? `Arrive in ${destination.fullName} after ${durationLabel}, around ${formatDate(plan.arrivalDate)}.`
    : `Expect to arrive after ${durationLabel}.`;
  const noteLine = customNote ? `Additional instructions: ${customNote.trim()}.` : '';

  return [
    paymentLine,
    `Secure ${mode.label.toLowerCase()} passage to ${destination.fullName}, covering roughly ${distanceLabel}.`,
    `The ${mode.label.toLowerCase()} route is estimated to take ${durationLabel}.`,
    departureLine,
    arrivalLine,
    noteLine
  ].filter(Boolean).join(' ');
};

const ModeSelect = ({ availableModes, selectedModeId, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {availableModes.map(mode => (
      <button
        key={mode.id}
        onClick={() => onChange(mode.id)}
        className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
          selectedModeId === mode.id
            ? 'bg-emerald-600 text-white border-emerald-500'
            : 'bg-white/70 dark:bg-slate-900/60 text-ink-700 dark:text-parchment-100 border-emerald-600/30 dark:border-sky-400/30 hover:border-emerald-500/60 dark:hover:border-sky-400/60'
        }`}
      >
        {mode.label}
      </button>
    ))}
  </div>
);

export function LongDistanceTravelModal({
  isOpen,
  onClose,
  onSubmit,
  origin,
  options = [],
  trigger = 'manual',
  currentDate,
  currentTime,
  worldMapData
}) {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedDestinationId, setSelectedDestinationId] = useState(options[0]?.id || null);
  const [selectedModeId, setSelectedModeId] = useState(null);
  const [customNote, setCustomNote] = useState('');
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: worldMapData?.bounds?.width / 2 || 0, y: worldMapData?.bounds?.height / 2 || 0 });

  useEffect(() => {
    if (isOpen) {
      setActiveTab('list');
      setSelectedDestinationId(options[0]?.id || null);
      setSelectedModeId(null);
      setCustomNote('');
      if (worldMapData?.bounds) {
        setMapZoom(1);
        setMapCenter({
          x: origin?.position?.x ?? worldMapData.bounds.width / 2,
          y: origin?.position?.y ?? worldMapData.bounds.height / 2
        });
      }
    }
  }, [isOpen, options, origin, worldMapData]);

  const selectedDestination = useMemo(
    () => options.find(opt => opt.id === selectedDestinationId) || null,
    [options, selectedDestinationId]
  );

  const availableModes = useMemo(() => {
    if (!selectedDestination) return [];
    const allowedIds = getRegionModes(selectedDestination.region);
    const resolved = allowedIds
      .map(id => TRAVEL_MODES[id])
      .filter(Boolean);

    if (resolved.length === 0) {
      return [TRAVEL_MODES.sea];
    }
    return resolved;
  }, [selectedDestination]);

  const effectiveModeId = selectedModeId && availableModes.some(m => m.id === selectedModeId)
    ? selectedModeId
    : availableModes[0]?.id || null;

  const selectedMode = useMemo(
    () => availableModes.find(mode => mode.id === effectiveModeId) || null,
    [availableModes, effectiveModeId]
  );

  const travelPlan = useMemo(() => {
    if (!selectedDestination || !selectedMode) return null;
    return calculateTravelPlan({
      destination: selectedDestination,
      mode: selectedMode,
      currentDate,
      currentTime
    });
  }, [selectedDestination, selectedMode, currentDate, currentTime]);

  const destinationMarkers = useMemo(() => options.map(opt => ({
    id: opt.id,
    name: opt.fullName,
    position: opt.position,
    distanceKm: opt.distanceKm,
    isSelected: opt.id === selectedDestinationId
  })), [options, selectedDestinationId]);

  useEffect(() => {
    if (!selectedDestination?.position || !worldMapData?.bounds) return;
    setMapCenter({
      x: selectedDestination.position.x,
      y: selectedDestination.position.y
    });
    setMapZoom(2.5);
  }, [selectedDestination?.id, selectedDestination?.position, worldMapData]);

  const mapViewBox = useMemo(() => {
    if (!worldMapData?.bounds) {
      return null;
    }
    const { width, height } = worldMapData.bounds;
    const zoom = Math.min(Math.max(mapZoom, 1), 8);
    const viewWidth = width / zoom;
    const viewHeight = height / zoom;
    const halfW = viewWidth / 2;
    const halfH = viewHeight / 2;
    const centerX = Math.min(Math.max(mapCenter.x, halfW), width - halfW);
    const centerY = Math.min(Math.max(mapCenter.y, halfH), height - halfH);
    return {
      x: centerX - halfW,
      y: centerY - halfH,
      width: viewWidth,
      height: viewHeight
    };
  }, [mapCenter, mapZoom, worldMapData?.bounds]);

  const zoomIn = () => setMapZoom(prev => Math.min(prev * 1.35, 8));
  const zoomOut = () => setMapZoom(prev => Math.max(prev / 1.35, 1));

  const centerOnOrigin = () => {
    if (!origin?.position) return;
    setMapCenter(origin.position);
    setMapZoom(2.5);
  };

  const centerOnSelection = () => {
    if (!selectedDestination?.position) return;
    setMapCenter(selectedDestination.position);
    setMapZoom(3.2);
  };

  const panMap = (dx, dy) => {
    if (!worldMapData?.bounds || !mapViewBox) return;
    const scaleX = mapViewBox.width / 280;
    const scaleY = mapViewBox.height / 280;
    setMapCenter(prev => ({
      x: prev.x + dx * scaleX,
      y: prev.y + dy * scaleY
    }));
  };

  const handleConfirm = () => {
    if (!selectedDestination || !selectedMode || !travelPlan) return;

    const command = buildTravelCommand({
      destination: selectedDestination,
      mode: selectedMode,
      plan: travelPlan,
      customNote,
      origin
    });

    onSubmit({
      command,
      destination: selectedDestination,
      mode: selectedMode,
      cost: travelPlan.costReales,
      durationDays: travelPlan.durationDays,
      arrivalDate: travelPlan.arrivalDate
    });
  };

  const legendMessage = trigger === 'map-boundary'
    ? 'You have reached the edge of the city map. Choose a destination to continue your journey.'
    : 'Plan a journey beyond Mexico City. Select a destination and travel method.';

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[12000] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center px-4 py-6">
      <div className="relative w-full max-w-5xl bg-parchment-50 dark:bg-slate-950 border border-emerald-800/40 dark:border-sky-400/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-800/10 dark:border-sky-400/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-sky-900/30 text-emerald-700 dark:text-sky-300 flex items-center justify-center text-2xl">
              <FiGlobe />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink-900 dark:text-parchment-50">
                Long-distance travel planner
              </h2>
              <p className="text-sm text-ink-500 dark:text-slate-300">
                {legendMessage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-ink-400 hover:text-ink-700 hover:bg-emerald-100/80 dark:text-slate-400 dark:hover:text-parchment-200 dark:hover:bg-slate-800/70 transition-colors"
            aria-label="Close travel planner"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab controls */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-emerald-800/10 dark:border-sky-400/20 bg-white/60 dark:bg-slate-900/40">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'list'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-ink-600 dark:text-slate-200 border border-emerald-600/30 dark:border-sky-400/30 hover:border-emerald-500/60 dark:hover:border-sky-400/60'
              }`}
            >
              <FiList /> Destinations
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-ink-600 dark:text-slate-200 border border-emerald-600/30 dark:border-sky-400/30 hover:border-emerald-500/60 dark:hover:border-sky-400/60'
              }`}
            >
              <FiMap /> Map
            </button>
          </div>
          {origin && (
            <div className="text-xs text-ink-500 dark:text-slate-400">
              Departing from <span className="font-semibold text-ink-700 dark:text-parchment-200">{origin.fullName}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'list' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 h-full">
              {/* Destination list */}
              <div className="border-r border-emerald-800/10 dark:border-sky-400/20 overflow-y-auto">
                {options.map(dest => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      setSelectedDestinationId(dest.id);
                      if (dest.id !== selectedDestinationId) {
                        setSelectedModeId(null);
                      }
                    }}
                    className={`w-full text-left px-5 py-4 border-b border-emerald-800/10 dark:border-sky-400/10 transition-colors ${
                      dest.id === selectedDestinationId
                        ? 'bg-emerald-600/10 dark:bg-sky-900/30'
                        : 'hover:bg-emerald-100/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <div className="text-sm font-semibold text-ink-900 dark:text-parchment-50">
                          {dest.fullName}
                        </div>
                        <div className="text-xs text-ink-500 dark:text-slate-400">
                          {dest.region} • {dest.importance?.replace(/-/g, ' ') || 'destination'}
                        </div>
                      </div>
                      {dest.distanceKm && (
                        <div className="text-xs font-medium text-emerald-700 dark:text-sky-300">
                          {formatNumber(Math.round(dest.distanceKm))} km
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Details panel */}
              <div className="px-6 py-5 overflow-y-auto">
                {selectedDestination && selectedMode ? (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-semibold text-ink-900 dark:text-parchment-50">
                        {selectedDestination.fullName}
                      </h3>
                      <p className="text-sm text-ink-500 dark:text-slate-300">
                        Approximately {formatNumber(Math.round(selectedDestination.distanceKm ?? 0))} km from {origin?.fullName || 'Mexico City'}.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-ink-700 dark:text-parchment-200 mb-2">
                        Travel method
                      </h4>
                      <ModeSelect
                        availableModes={availableModes}
                        selectedModeId={effectiveModeId}
                        onChange={setSelectedModeId}
                      />
                      <p className="mt-2 text-xs text-ink-500 dark:text-slate-400">
                        {selectedMode.description}
                      </p>
                    </div>

                    {travelPlan && (
                      <div className="space-y-3 bg-white/80 dark:bg-slate-900/70 border border-emerald-600/20 dark:border-sky-400/20 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-ink-500 dark:text-slate-400">Estimated duration</span>
                          <span className="font-semibold text-ink-900 dark:text-parchment-50">
                            {pluralize(travelPlan.durationDays, 'day')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-ink-500 dark:text-slate-400">Cost of passage</span>
                          <span className="font-semibold text-ink-900 dark:text-parchment-50">
                            {formatCurrency(travelPlan.costReales)} reales
                          </span>
                        </div>
                        <div className="text-xs text-ink-500 dark:text-slate-400">
                          Depart: <span className="font-medium text-ink-700 dark:text-parchment-100">{travelPlan.departureDateLabel}</span>
                          <br />
                          Arrive: <span className="font-medium text-ink-700 dark:text-parchment-100">{travelPlan.arrivalDateLabel}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="travel-note" className="block text-sm font-semibold text-ink-700 dark:text-parchment-200 mb-2">
                        Add instructions (optional)
                      </label>
                      <textarea
                        id="travel-note"
                        rows={3}
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        className="w-full rounded-xl border border-emerald-600/20 dark:border-sky-400/20 bg-white/80 dark:bg-slate-900/70 text-sm text-ink-900 dark:text-parchment-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 dark:focus:ring-sky-400/60"
                        placeholder="Barter tinctures, request an escort, arrange storage for cargo, etc."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-ink-500 dark:text-slate-400">
                    Select a destination to view travel details.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative h-full bg-white/70 dark:bg-slate-900/70">
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={zoomIn}
                  className="w-10 h-10 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-emerald-600/40 dark:border-sky-400/40 text-2xl font-semibold flex items-center justify-center shadow hover:bg-emerald-100/80 dark:hover:bg-slate-800/70 transition-colors"
                  title="Zoom in"
                >
                  +
                </button>
                <button
                  onClick={zoomOut}
                  className="w-10 h-10 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-emerald-600/40 dark:border-sky-400/40 text-2xl font-semibold flex items-center justify-center shadow hover:bg-emerald-100/80 dark:hover:bg-slate-800/70 transition-colors"
                  title="Zoom out"
                >
                  −
                </button>
                <button
                  onClick={() => panMap(0, -40)}
                  className="w-10 h-10 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-emerald-600/40 dark:border-sky-400/40 flex items-center justify-center shadow hover:bg-emerald-100/80 dark:hover:bg-slate-800/70 transition-colors"
                  title="Pan north"
                >
                  ↑
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => panMap(-40, 0)}
                    className="w-10 h-10 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-emerald-600/40 dark:border-sky-400/40 flex items-center justify-center shadow hover:bg-emerald-100/80 dark:hover:bg-slate-800/70 transition-colors"
                    title="Pan west"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => panMap(40, 0)}
                    className="w-10 h-10 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-emerald-600/40 dark:border-sky-400/40 flex items-center justify-center shadow hover:bg-emerald-100/80 dark:hover:bg-slate-800/70 transition-colors"
                    title="Pan east"
                  >
                    →
                  </button>
                </div>
                <button
                  onClick={() => panMap(0, 40)}
                  className="w-10 h-10 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-emerald-600/40 dark:border-sky-400/40 flex items-center justify-center shadow hover:bg-emerald-100/80 dark:hover:bg-slate-800/70 transition-colors"
                  title="Pan south"
                >
                  ↓
                </button>
              </div>
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <button
                  onClick={centerOnOrigin}
                  className="px-3 py-2 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-emerald-600/40 dark:border-sky-400/40 text-xs font-semibold text-emerald-700 dark:text-sky-300 shadow hover:bg-emerald-100/80 dark:hover:bg-slate-800/70 transition-colors"
                >
                  Center on origin
                </button>
                <button
                  onClick={centerOnSelection}
                  disabled={!selectedDestination}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold shadow transition-colors ${
                    selectedDestination
                      ? 'bg-white/90 dark:bg-slate-900/80 border-emerald-600/40 dark:border-sky-400/40 text-emerald-700 dark:text-sky-300 hover:bg-emerald-100/80 dark:hover:bg-slate-800/70'
                      : 'bg-white/50 border-emerald-600/20 dark:bg-slate-900/40 dark:border-sky-400/20 text-ink-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Center on destination
                </button>
              </div>
              {worldMapData ? (
                <WorldMap
                  mapData={worldMapData}
                  originLocation={origin}
                  destinationMarkers={destinationMarkers}
                  onDestinationSelect={(id) => {
                    setSelectedDestinationId(id);
                    setSelectedModeId(null);
                  }}
                  selectedDestinationId={selectedDestinationId}
                  viewBox={mapViewBox}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-ink-500 dark:text-slate-400">
                  World map data unavailable.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-emerald-800/10 dark:border-sky-400/20 bg-white/70 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-ink-500 dark:text-slate-400 flex items-center gap-2">
            <FiNavigation className="text-emerald-600 dark:text-sky-300" />
            Journeys advance time and may incur additional narrative costs. The State Agent will adjudicate feasibility.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-emerald-600/30 dark:border-sky-400/40 text-ink-700 dark:text-parchment-200 hover:bg-emerald-100/70 dark:hover:bg-slate-800/60 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDestination || !selectedMode || !travelPlan}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                selectedDestination && selectedMode && travelPlan
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-emerald-400/60 cursor-not-allowed'
              }`}
            >
              Confirm journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LongDistanceTravelModal;
