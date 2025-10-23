/**
 * TravelCard.jsx
 *
 * Phase 3B: Travel Card Component
 * Displays animated travel progress when Maria travels to a house call
 * Phase 4: Integrated with map animation system
 */

import React, { useState, useEffect } from 'react';
import './TravelCard.css';
import { getTravelNarrative } from '../features/medical/services/travelNarratives';
import { calculatePathFromBotica, calculateTravelTime } from '../features/map/services/cityPathfinding';
import { useAnimatedTravel } from '../features/map/hooks/useAnimatedTravel';

/**
 * TravelCard Component
 *
 * @param {Object} props
 * @param {Object} props.houseCallData - Complete house call data from Phase 3A
 * @param {string} props.gameTime - Current in-game time (e.g., "10:30 AM")
 * @param {Function} props.onArrival - Callback when travel completes
 * @param {Function} props.onCancel - Callback when user cancels travel
 * @param {Function} props.onTravelUpdate - Callback with travel animation state (position, path, progress)
 */
export function TravelCard({ houseCallData, gameTime, onArrival, onCancel, onTravelUpdate }) {
  const [isComplete, setIsComplete] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [pathData, setPathData] = useState(null);

  const {
    patientEntity,
    destination,
    distance,
    travelTime,
    houseName
  } = houseCallData;

  // Phase 4: Calculate travel path on mount
  useEffect(() => {
    console.log('[TravelCard] Calculating path to:', destination);
    const result = calculatePathFromBotica(destination);
    console.log('[TravelCard] Path calculated:', result);
    setPathData(result);
  }, [destination]);

  // Phase 4: Animated travel hook
  const animationDuration = pathData ? calculateTravelTime(pathData.path) : 3000;

  const {
    currentPosition,
    currentDirection,
    progress,
    isAnimating,
    skip
  } = useAnimatedTravel({
    path: pathData?.path || null,
    duration: animationDuration,
    isActive: !!pathData,
    onComplete: () => {
      console.log('[TravelCard] Travel animation complete');
      setIsComplete(true);
    },
    onProgress: (prog) => {
      // Update parent with travel state for map rendering
      if (onTravelUpdate && pathData) {
        onTravelUpdate({
          position: currentPosition,
          direction: currentDirection,
          path: pathData.path,
          progress: prog,
          isAnimating
        });
      }
    }
  });

  // Generate narrative on mount
  useEffect(() => {
    // Parse game time to get hour (e.g., "10:30 AM" -> 10)
    let timeOfDay = 12; // Default to noon
    if (gameTime) {
      const match = gameTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hour = parseInt(match[1]);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        timeOfDay = hour;
      }
    }

    const travelNarrative = getTravelNarrative({
      patientName: patientEntity.name,
      destination,
      distance,
      travelTime,
      timeOfDay
    });
    setNarrative(travelNarrative);
  }, [patientEntity, destination, distance, travelTime, gameTime]);

  // Auto-advance after completion
  useEffect(() => {
    if (isComplete) {
      const timeout = setTimeout(() => {
        onArrival(houseCallData);
      }, 800); // Brief pause before transition
      return () => clearTimeout(timeout);
    }
  }, [isComplete, onArrival, houseCallData]);

  const handleSkip = () => {
    console.log('[TravelCard] Skipping travel animation');
    skip(); // Skip animation (will trigger onComplete)
  };

  return (
    <div className="travel-card">
      <div className="travel-card-header">
        <h3>Traveling to House Call</h3>
        <div className="travel-destination">
          <span className="destination-label">Destination:</span>
          <span className="destination-name">{destination}</span>
        </div>
      </div>

      <div className="travel-card-body">
        <div className="patient-info">
          <span className="label">Patient:</span>
          <span className="value">{patientEntity.name}</span>
        </div>

        <div className="travel-details">
          <div className="detail-item">
            <span className="label">Distance:</span>
            <span className="value">{distance}m</span>
          </div>
          <div className="detail-item">
            <span className="label">Est. Time:</span>
            <span className="value">{travelTime} min</span>
          </div>
          <div className="detail-item">
            <span className="label">Location:</span>
            <span className="value">{houseName}</span>
          </div>
        </div>

        <div className="travel-narrative">
          <p>{narrative}</p>
        </div>

        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">
            {isComplete ? 'Arriving...' : `${Math.round(progress)}%`}
          </div>
        </div>
      </div>

      <div className="travel-card-footer">
        {!isComplete && (
          <>
            <button
              className="cancel-travel-btn"
              onClick={onCancel}
              style={{
                marginRight: '8px',
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel Journey
            </button>
            <button
              className="skip-travel-btn"
              onClick={handleSkip}
            >
              Skip Travel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
