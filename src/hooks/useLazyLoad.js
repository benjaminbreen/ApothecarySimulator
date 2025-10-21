import { useState, useEffect, useRef } from 'react';

/**
 * Lazy Load Hook
 *
 * Dynamically imports components when needed, with loading states and error handling.
 * Useful for code-splitting heavy modals and reducing initial bundle size.
 *
 * @param {Function} importFunc - Dynamic import function () => import('./Component')
 * @param {Object} options - Configuration options
 * @returns {Object} - { Component, isLoading, error, retry }
 *
 * @example
 * const { Component, isLoading, error } = useLazyLoad(
 *   () => import('../components/HeavyModal')
 * );
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <Component {...props} />;
 */
export function useLazyLoad(importFunc, options = {}) {
  const {
    preload = false,        // Preload component immediately
    retryDelay = 1000,      // Delay between retries in ms
    maxRetries = 3          // Maximum retry attempts
  } = options;

  const [Component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);
  const importedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadComponent = async () => {
    // Already loaded
    if (importedRef.current && Component) {
      return Component;
    }

    setIsLoading(true);
    setError(null);

    try {
      const module = await importFunc();
      const LoadedComponent = module.default || module;

      if (mountedRef.current) {
        setComponent(() => LoadedComponent);
        importedRef.current = true;
        setIsLoading(false);
        setRetryCount(0);
      }

      return LoadedComponent;
    } catch (err) {
      console.error('[useLazyLoad] Failed to load component:', err);

      if (mountedRef.current) {
        setError(err);
        setIsLoading(false);

        // Auto-retry if under max retries
        if (retryCount < maxRetries) {
          setTimeout(() => {
            if (mountedRef.current) {
              setRetryCount(prev => prev + 1);
              loadComponent();
            }
          }, retryDelay);
        }
      }

      return null;
    }
  };

  const retry = () => {
    setRetryCount(0);
    loadComponent();
  };

  // Preload on mount if requested
  useEffect(() => {
    if (preload) {
      loadComponent();
    }
  }, [preload]);

  return {
    Component,
    isLoading,
    error,
    retry,
    load: loadComponent
  };
}

/**
 * Preload Hook
 *
 * Preloads a component without rendering it. Useful for preloading on hover/focus.
 *
 * @param {Function} importFunc - Dynamic import function
 * @returns {Function} - Preload function
 *
 * @example
 * const preloadModal = usePreload(() => import('./HeavyModal'));
 *
 * <button onMouseEnter={preloadModal}>
 *   Open Modal
 * </button>
 */
export function usePreload(importFunc) {
  const cacheRef = useRef(null);

  const preload = async () => {
    if (cacheRef.current) {
      return cacheRef.current;
    }

    try {
      const module = await importFunc();
      cacheRef.current = module.default || module;
      return cacheRef.current;
    } catch (err) {
      console.error('[usePreload] Failed to preload component:', err);
      return null;
    }
  };

  return preload;
}

/**
 * Intersection Observer Lazy Load Hook
 *
 * Loads component when element enters viewport (useful for below-the-fold content).
 *
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - IntersectionObserver options
 * @returns {Object} - { Component, ref, isLoading, error }
 *
 * @example
 * const { Component, ref, isLoading } = useIntersectionLazyLoad(
 *   () => import('./BelowTheFold')
 * );
 *
 * <div ref={ref}>
 *   {isLoading ? 'Loading...' : <Component />}
 * </div>
 */
export function useIntersectionLazyLoad(importFunc, options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px'
  } = options;

  const [Component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasLoadedRef.current) return;

    const loadComponent = async () => {
      if (hasLoadedRef.current) return;

      hasLoadedRef.current = true;
      setIsLoading(true);

      try {
        const module = await importFunc();
        const LoadedComponent = module.default || module;
        setComponent(() => LoadedComponent);
        setIsLoading(false);
      } catch (err) {
        console.error('[useIntersectionLazyLoad] Failed to load:', err);
        setError(err);
        setIsLoading(false);
        hasLoadedRef.current = false; // Allow retry
      }
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadComponent();
          observerRef.current?.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [importFunc, threshold, rootMargin]);

  return {
    Component,
    ref: elementRef,
    isLoading,
    error
  };
}

export default useLazyLoad;
