// Centralized feature flag management
// Flags default to conservative values; override via Vite env (VITE_FEATURE_FLAGNAME)

const DEFAULT_FLAGS = {
  revisedInteractionPipeline: false,
  interactionDebugLogging: false
};

const envOverrides = (() => {
  if (typeof import.meta === 'undefined' || !import.meta.env) return {};
  const entries = Object.keys(DEFAULT_FLAGS).map(flagName => {
    const envKey = `VITE_${flagName.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
    const raw = import.meta.env[envKey];
    if (raw === undefined) return [flagName, undefined];
    return [flagName, raw === 'true'];
  });

  return Object.fromEntries(entries.filter(([, value]) => value !== undefined));
})();

const runtimeOverrides = typeof window !== 'undefined' && window.__APOTHECARY_FLAGS__
  ? window.__APOTHECARY_FLAGS__
  : {};

const flags = { ...DEFAULT_FLAGS, ...envOverrides, ...runtimeOverrides };

export function isFeatureEnabled(flagName) {
  return Boolean(flags[flagName]);
}

export function getAllFlags() {
  return { ...flags };
}

export default {
  isFeatureEnabled,
  getAllFlags
};
