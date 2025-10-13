/**
 * useReputation Hook
 *
 * React hook for managing reputation state
 */

import { useState, useCallback } from 'react';
import { INITIAL_REPUTATION, updateFactionReputation, getReputationTier } from '../systems/reputationSystem';

export function useReputation() {
  const [reputation, setReputation] = useState(INITIAL_REPUTATION);

  /**
   * Update a faction's reputation
   */
  const updateReputation = useCallback((faction, delta, reason = '') => {
    setReputation(current => updateFactionReputation(current, faction, delta, reason));
  }, []);

  /**
   * Get current reputation tier and emoji
   */
  const reputationTier = getReputationTier(reputation.overall);

  /**
   * Set reputation directly (for loading saves)
   */
  const setReputationDirect = useCallback((newReputation) => {
    setReputation(newReputation);
  }, []);

  return {
    reputation,
    updateReputation,
    setReputation: setReputationDirect,
    reputationTier,
    // Backward compatibility - return emoji for old code
    reputationEmoji: reputationTier.emoji
  };
}
