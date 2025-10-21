import React, { useState, useRef, useEffect } from 'react';
import './OptimizedImage.css';

/**
 * Optimized Image Component
 *
 * High-performance image component with:
 * - Lazy loading (native or intersection observer)
 * - WebP format with fallbacks
 * - Progressive loading with blur placeholder
 * - Responsive srcset support
 * - Error handling
 * - Fade-in animation
 *
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text (required for accessibility)
 * @param {string} props.webpSrc - Optional WebP version
 * @param {string} props.placeholder - Placeholder image (low-res, base64, or solid color)
 * @param {string} props.srcSet - Responsive image sources
 * @param {string} props.sizes - Responsive sizes
 * @param {string} props.objectFit - CSS object-fit ('cover' | 'contain' | 'fill')
 * @param {string} props.aspectRatio - Aspect ratio (e.g., '16/9', '1/1')
 * @param {boolean} props.lazy - Enable lazy loading (default: true)
 * @param {Function} props.onLoad - Callback when image loads
 * @param {Function} props.onError - Callback on load error
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.fallbackSrc - Fallback image if main fails
 *
 * @example
 * <OptimizedImage
 *   src="/portraits/maria.jpg"
 *   webpSrc="/portraits/maria.webp"
 *   alt="Maria de Lima"
 *   placeholder="data:image/jpeg;base64,..."
 *   aspectRatio="1/1"
 *   lazy={true}
 * />
 */
const OptimizedImage = ({
  src,
  alt,
  webpSrc,
  placeholder,
  srcSet,
  sizes,
  objectFit = 'cover',
  aspectRatio,
  lazy = true,
  onLoad,
  onError,
  className = '',
  fallbackSrc = null,
  width,
  height
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Check if browser supports WebP
  const [supportsWebP, setSupportsWebP] = useState(false);

  useEffect(() => {
    checkWebPSupport();
  }, []);

  const checkWebPSupport = () => {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      const support = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      setSupportsWebP(support);
    }
  };

  // Determine which source to use
  const imageSrc = supportsWebP && webpSrc ? webpSrc : currentSrc;

  // Lazy loading with Intersection Observer (fallback if native not supported)
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    // Use native lazy loading if supported
    if ('loading' in HTMLImageElement.prototype) {
      return;
    }

    // Fallback to Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          const img = imgRef.current;
          if (img && img.dataset.src) {
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
          }
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    console.error('[OptimizedImage] Failed to load:', imageSrc);

    // Try fallback if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log('[OptimizedImage] Trying fallback:', fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      if (onError) onError(e);
    }
  };

  // Container style with aspect ratio
  const containerStyle = aspectRatio
    ? { aspectRatio }
    : width && height
    ? { aspectRatio: `${width} / ${height}` }
    : {};

  // Support for native lazy loading or data-src fallback
  const imgProps = lazy && !('loading' in HTMLImageElement.prototype)
    ? {
        'data-src': imageSrc,
        'data-srcset': srcSet,
        src: placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E'
      }
    : {
        src: imageSrc,
        srcSet,
        loading: lazy ? 'lazy' : 'eager'
      };

  return (
    <div
      className={`optimized-image-container ${className}`}
      style={containerStyle}
    >
      {/* Placeholder (shows until image loads) */}
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="optimized-image-placeholder"
          style={{ objectFit }}
        />
      )}

      {/* Main image */}
      {!hasError && (
        <img
          ref={imgRef}
          {...imgProps}
          alt={alt}
          sizes={sizes}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${isLoaded ? 'optimized-image--loaded' : ''}`}
          style={{ objectFit }}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="optimized-image-error">
          <span className="optimized-image-error-icon">🖼️</span>
          <span className="optimized-image-error-text">Image unavailable</span>
        </div>
      )}

      {/* Loading indicator */}
      {!isLoaded && !hasError && !placeholder && (
        <div className="optimized-image-loading">
          <div className="optimized-image-spinner" />
        </div>
      )}
    </div>
  );
};

/**
 * Progressive Image Component
 *
 * Two-stage loading: tiny placeholder → full image
 *
 * @param {Object} props
 * @param {string} props.src - Full resolution image
 * @param {string} props.thumbSrc - Tiny thumbnail (< 1KB, blurred)
 * @param {string} props.alt - Alt text
 *
 * @example
 * <ProgressiveImage
 *   src="/images/scene-large.jpg"
 *   thumbSrc="/images/scene-thumb.jpg"
 *   alt="Mexico City market"
 * />
 */
export const ProgressiveImage = ({ src, thumbSrc, alt, ...props }) => {
  return (
    <OptimizedImage
      src={src}
      placeholder={thumbSrc}
      alt={alt}
      {...props}
    />
  );
};

/**
 * Portrait Image Component
 *
 * Optimized specifically for character portraits (1:1 aspect ratio).
 *
 * @param {Object} props
 * @param {string} props.src - Portrait source
 * @param {string} props.alt - Character name
 *
 * @example
 * <PortraitImage
 *   src="/portraits/maria-happy.jpg"
 *   alt="Maria de Lima (happy)"
 * />
 */
export const PortraitImage = ({ src, alt, ...props }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="1/1"
      objectFit="cover"
      lazy={true}
      {...props}
    />
  );
};

export default OptimizedImage;
