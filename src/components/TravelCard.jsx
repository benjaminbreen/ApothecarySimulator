/**
 * TravelCard.jsx
 *
 * Phase 3B: Travel Card Component
 * Displays animated travel progress when Maria travels to a house call
 * Phase 4: Integrated with map animation system
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const cleanupTimerRef = useRef(null);
  const hasCalledArrivalRef = useRef(false); // FIX: Guard flag to prevent duplicate onArrival calls

  const {
    patientEntity,
    destination,
    distance,
    travelTime,
    houseName
  } = houseCallData;

  // Store onTravelUpdate in ref to avoid recreating callbacks
  const onTravelUpdateRef = useRef(onTravelUpdate);
  useEffect(() => {
    onTravelUpdateRef.current = onTravelUpdate;
  }, [onTravelUpdate]);

  // Phase 4: Calculate travel path on mount
  useEffect(() => {
    console.log('[TravelCard] Calculating path to:', destination);
    const result = calculatePathFromBotica(destination);
    console.log('[TravelCard] Path calculated:', result);
    setPathData(result);
  }, [destination]);

  // Report initial travel state once path exists
  useEffect(() => {
    if (pathData && pathData.path && pathData.path.length > 0 && onTravelUpdateRef.current) {
      const start = pathData.path[0];
      onTravelUpdateRef.current({
        position: start,
        direction: 180,
        path: pathData.path,
        progress: 0,
        isAnimating: true
      });
    }
  }, [pathData]);

  // Phase 4: Animated travel hook
  const animationDuration = pathData ? calculateTravelTime(pathData.path) : 3000;

  // Stable onComplete callback
  const handleComplete = useCallback(() => {
    console.log('[TravelCard] Travel animation complete');
    setIsComplete(true);
  }, []);

  // Stable onProgress callback - doesn't reference changing state
  const handleProgress = useCallback((prog) => {
    // Note: We can't access currentPosition/direction here without causing loop
    // Parent will get this data from the animation state returned by hook
  }, []);

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
    onComplete: handleComplete,
    onProgress: handleProgress
  });

  // Separate effect to update parent with travel state
  // This runs AFTER animation state updates, not during animation loop
  // FIXED: Stop sending updates after completion to prevent infinite loop
  useEffect(() => {
    // Don't send updates after travel is complete
    if (isComplete) return;

    if (onTravelUpdateRef.current && pathData) {
      onTravelUpdateRef.current({
        position: currentPosition || pathData.path?.[0] || null,
        direction: currentDirection,
        path: pathData.path,
        progress,
        isAnimating
      });
    }
  }, [currentPosition, currentDirection, progress, isAnimating, pathData, isComplete]);

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
  // FIXED: Use guard flag + single timer to prevent duplicate onArrival calls
  // Race condition fix: currentDirection can update after isComplete=true, causing effect to re-run
  useEffect(() => {
    if (isComplete && !hasCalledArrivalRef.current) {
      console.log('[TravelCard] Animation complete, scheduling arrival in 800ms');

      // Clear any existing timer (from previous effect runs)
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }

      // Single timer to call onArrival once
      cleanupTimerRef.current = setTimeout(() => {
        // Double-check guard flag (in case of race condition)
        if (hasCalledArrivalRef.current) {
          console.warn('[TravelCard] onArrival already called, skipping duplicate');
          return;
        }

        console.log('[TravelCard] Calling onArrival callback');
        hasCalledArrivalRef.current = true; // Mark as called BEFORE calling (prevent re-entry)

        try {
          // Send final state update before arrival
          if (onTravelUpdateRef.current) {
            onTravelUpdateRef.current({
              position: pathData?.path?.[pathData.path.length - 1] || null,
              direction: currentDirection,
              path: pathData?.path || null,
              progress: 100,
              isAnimating: false
            });
          }

          // Call arrival handler
          onArrival(houseCallData);
        } catch (error) {
          console.error('[TravelCard] onArrival error:', error);
        } finally {
          cleanupTimerRef.current = null;
        }
      }, 800);

      return () => {
        if (cleanupTimerRef.current) {
          clearTimeout(cleanupTimerRef.current);
          cleanupTimerRef.current = null;
        }
      };
    }
  }, [isComplete, onArrival, houseCallData, pathData, currentDirection]);

  useEffect(() => {
    const isAnimationStalled = pathData && !isAnimating && progress === 0 && !isComplete && pathData.path?.length > 1;

    if (isAnimationStalled) {
      const timer = setTimeout(() => {
        console.warn('[TravelCard] Animation stalled at 0%, triggering skip');
        skip();
      }, Math.max(animationDuration, 3000));
      return () => clearTimeout(timer);
    }
  }, [pathData, isAnimating, progress, isComplete, skip, animationDuration]);

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
