// Barrel export for core agents
// Makes imports cleaner: import { generateNarrative, extractGameState } from '../core/agents'

export { generateNarrative } from './NarrativeAgent';
export { extractGameState, validateGameState } from './StateAgent';
export {
  selectContextAwareEntity,
  NPCTracker,
  EntityStateManager
} from './EntityAgent';
