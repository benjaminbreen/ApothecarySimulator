/**
 * Quest Validator
 *
 * Validates quest data structures.
 * Prevents runtime errors from malformed quests.
 *
 * @module QuestValidator
 */

/**
 * Validate quest object structure
 * @param {Object} quest
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateQuest(quest) {
  const errors = [];

  // Required fields
  if (!quest.id) errors.push('Quest missing id');
  if (!quest.templateId) errors.push('Quest missing templateId');
  if (!quest.type) errors.push('Quest missing type');
  if (!quest.status) errors.push('Quest missing status');

  // Status validation
  const validStatuses = ['active', 'completed', 'failed', 'expired'];
  if (quest.status && !validStatuses.includes(quest.status)) {
    errors.push(`Quest status must be one of: ${validStatuses.join(', ')}`);
  }

  // Type validation
  const validTypes = ['medical', 'acquisition', 'research', 'crisis', 'social', 'economic', 'ethical'];
  if (quest.type && !validTypes.includes(quest.type)) {
    errors.push(`Quest type must be one of: ${validTypes.join(', ')}`);
  }

  // Giver validation
  if (!quest.giver) {
    errors.push('Quest missing giver');
  } else {
    if (!quest.giver.npcId) errors.push('Quest giver missing npcId');
    if (!quest.giver.name) errors.push('Quest giver missing name');
    if (!quest.giver.type) errors.push('Quest giver missing type');
  }

  // Objective validation
  if (!quest.objective) {
    errors.push('Quest missing objective');
  } else {
    if (!quest.objective.description) {
      errors.push('Quest objective missing description');
    }

    if (!Array.isArray(quest.objective.steps)) {
      errors.push('Quest objective.steps must be array');
    } else {
      if (quest.objective.steps.length === 0) {
        errors.push('Quest must have at least one step');
      }

      // Validate each step
      quest.objective.steps.forEach((step, i) => {
        if (!step.description) {
          errors.push(`Step ${i + 1} missing description`);
        }
        if (typeof step.stepNumber !== 'number') {
          errors.push(`Step ${i + 1} missing or invalid stepNumber`);
        }
        if (!step.completion) {
          errors.push(`Step ${i + 1} missing completion criteria`);
        } else {
          if (!step.completion.action) {
            errors.push(`Step ${i + 1} completion missing action`);
          }
        }
        if (typeof step.completed !== 'boolean') {
          errors.push(`Step ${i + 1} missing or invalid completed flag`);
        }
      });
    }

    if (!quest.objective.completion) {
      errors.push('Quest objective missing completion rules');
    }
  }

  // Progress validation
  if (!quest.progress) {
    errors.push('Quest missing progress');
  } else {
    if (typeof quest.progress.currentStep !== 'number') {
      errors.push('Quest progress.currentStep must be number');
    }
    if (typeof quest.progress.turnsActive !== 'number') {
      errors.push('Quest progress.turnsActive must be number');
    }
    if (!quest.progress.stepData || typeof quest.progress.stepData !== 'object') {
      errors.push('Quest progress.stepData must be object');
    }
  }

  // Rewards validation
  if (!quest.rewards) {
    errors.push('Quest missing rewards');
  } else {
    if (typeof quest.rewards.wealth !== 'number') {
      errors.push('Rewards wealth must be number');
    }
    if (typeof quest.rewards.reputation !== 'number') {
      errors.push('Rewards reputation must be number');
    }
    if (!Array.isArray(quest.rewards.items)) {
      errors.push('Rewards items must be array');
    }
    if (!Array.isArray(quest.rewards.knowledge)) {
      errors.push('Rewards knowledge must be array');
    }

    // Validate reward values are reasonable
    if (quest.rewards.wealth < 0) {
      errors.push('Rewards wealth cannot be negative');
    }
    if (quest.rewards.wealth > 500) {
      errors.push('Rewards wealth seems too high (max 500)');
    }
    if (quest.rewards.reputation < 0) {
      errors.push('Rewards reputation cannot be negative');
    }
    if (quest.rewards.reputation > 50) {
      errors.push('Rewards reputation seems too high (max 50)');
    }
  }

  // Constraints validation
  if (!quest.constraints) {
    errors.push('Quest missing constraints');
  } else {
    if (quest.constraints.turnLimit !== null && quest.constraints.turnLimit !== undefined) {
      if (typeof quest.constraints.turnLimit !== 'number') {
        errors.push('Constraints turnLimit must be number or null');
      }
      if (quest.constraints.turnLimit < 1) {
        errors.push('Constraints turnLimit must be at least 1');
      }
    }

    if (!Array.isArray(quest.constraints.failureConditions)) {
      errors.push('Constraints failureConditions must be array');
    }
  }

  // Narrative validation
  if (!quest.narrative) {
    errors.push('Quest missing narrative');
  } else {
    // Narrative fields can be null (not generated yet)
    // But must be present
    if (!('intro' in quest.narrative)) {
      errors.push('Quest narrative missing intro field');
    }
    if (!('completion' in quest.narrative)) {
      errors.push('Quest narrative missing completion field');
    }
    if (!('failure' in quest.narrative)) {
      errors.push('Quest narrative missing failure field');
    }
  }

  // Metadata validation
  if (!quest.metadata) {
    errors.push('Quest missing metadata');
  } else {
    if (typeof quest.metadata.startTurn !== 'number') {
      errors.push('Metadata startTurn must be number');
    }
    if (!quest.metadata.scenarioId) {
      errors.push('Metadata missing scenarioId');
    }
    if (typeof quest.metadata.difficulty !== 'number') {
      errors.push('Metadata difficulty must be number');
    }

    // completedTurn can be null
    if (quest.metadata.completedTurn !== null && typeof quest.metadata.completedTurn !== 'number') {
      errors.push('Metadata completedTurn must be number or null');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate quest template structure
 * @param {Object} template
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateQuestTemplate(template) {
  const errors = [];

  if (!template.id) errors.push('Template missing id');
  if (!template.type) errors.push('Template missing type');
  if (!template.category) errors.push('Template missing category');
  if (!template.triggers) errors.push('Template missing triggers');
  if (!template.generation) errors.push('Template missing generation');
  if (!template.llm) errors.push('Template missing llm settings');

  // Type validation
  const validTypes = ['medical', 'acquisition', 'research', 'crisis', 'social', 'economic', 'ethical'];
  if (template.type && !validTypes.includes(template.type)) {
    errors.push(`Template type must be one of: ${validTypes.join(', ')}`);
  }

  // Category validation
  const validCategories = ['medical', 'economic', 'social', 'research'];
  if (template.category && !validCategories.includes(template.category)) {
    errors.push(`Template category must be one of: ${validCategories.join(', ')}`);
  }

  // Triggers validation
  if (template.triggers) {
    if (typeof template.triggers.baseChance !== 'number') {
      errors.push('Template triggers.baseChance must be number');
    } else {
      if (template.triggers.baseChance < 0 || template.triggers.baseChance > 1) {
        errors.push('Template triggers.baseChance must be between 0 and 1');
      }
    }

    // Conditions are optional
    if (template.triggers.conditions && typeof template.triggers.conditions !== 'object') {
      errors.push('Template triggers.conditions must be object');
    }

    // Evaluate function is optional
    if (template.triggers.evaluate && typeof template.triggers.evaluate !== 'function') {
      errors.push('Template triggers.evaluate must be function');
    }
  }

  // Generation validation
  if (template.generation) {
    if (typeof template.generation.selectNPC !== 'function') {
      errors.push('Template generation.selectNPC must be function');
    }
    if (typeof template.generation.generateObjective !== 'function') {
      errors.push('Template generation.generateObjective must be function');
    }
    if (typeof template.generation.generateRewards !== 'function') {
      errors.push('Template generation.generateRewards must be function');
    }

    // Optional functions
    if (template.generation.getFailureConditions && typeof template.generation.getFailureConditions !== 'function') {
      errors.push('Template generation.getFailureConditions must be function');
    }

    // Base rewards are optional but should be object if present
    if (template.generation.baseRewards) {
      if (typeof template.generation.baseRewards !== 'object') {
        errors.push('Template generation.baseRewards must be object');
      } else {
        if (typeof template.generation.baseRewards.wealth !== 'number') {
          errors.push('Template generation.baseRewards.wealth must be number');
        }
        if (typeof template.generation.baseRewards.reputation !== 'number') {
          errors.push('Template generation.baseRewards.reputation must be number');
        }
      }
    }
  }

  // LLM validation
  if (template.llm) {
    if (typeof template.llm.generateIntro !== 'boolean') {
      errors.push('Template llm.generateIntro must be boolean');
    }
    if (typeof template.llm.generateOutcome !== 'boolean') {
      errors.push('Template llm.generateOutcome must be boolean');
    }

    // Prompt template is optional
    if (template.llm.promptTemplate && typeof template.llm.promptTemplate !== 'string') {
      errors.push('Template llm.promptTemplate must be string');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate game quest state structure
 * @param {Object} questState
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateQuestState(questState) {
  const errors = [];

  if (!questState) {
    errors.push('Quest state is null or undefined');
    return { valid: false, errors };
  }

  if (!Array.isArray(questState.active)) {
    errors.push('Quest state.active must be array');
  }

  if (!Array.isArray(questState.completed)) {
    errors.push('Quest state.completed must be array');
  }

  if (!Array.isArray(questState.failed)) {
    errors.push('Quest state.failed must be array');
  }

  if (typeof questState.cooldowns !== 'object' || questState.cooldowns === null) {
    errors.push('Quest state.cooldowns must be object');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  validateQuest,
  validateQuestTemplate,
  validateQuestState
};
