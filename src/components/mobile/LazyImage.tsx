import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LazyLoader, ImageOptimizer, usePerformanceMonitoring } from '../../utils/mobilePerformance';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality,
  format,
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { shouldOptimize } = usePerformanceMonitoring();

  // Optimize image URL based on performance conditions
  const optimizedSrc = React.useMemo(() => {
    return ImageOptimizer.optimizeImageUrl(src, {
      width,
      height,
      quality: shouldOptimize ? Math.min(quality || 0.7, 0.5) : quality,
      format
    });
  }, [src, width, height, quality, format, shouldOptimize]);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(imgElement);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(imgElement);

    return () => {
      observer.unobserve(imgElement);
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: isInView ? 0.5 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
        </motion.div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      <motion.img
        ref={imgRef}
        src={isInView ? optimizedSrc : undefined}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.1
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        loading="lazy"
        decoding="async"
      />

      {/* Loading indicator overlay */}
      {isInView && !isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </div>
  );
};

// Progressive image component with multiple quality levels
export const ProgressiveImage: React.FC<LazyImageProps & {
  lowQualitySrc?: string;
  mediumQualitySrc?: string;
}> = ({
  src,
  lowQualitySrc,
  mediumQualitySrc,
  alt,
  className = '',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());
  const { shouldOptimize } = usePerformanceMonitoring();

  useEffect(() => {
    // Progressive loading strategy
    const sources = shouldOptimize 
      ? [lowQualitySrc, src].filter(Boolean)
      : [lowQualitySrc, mediumQualitySrc, src].filter(Boolean);

    let currentIndex = 0;
    const loadNextImage = () => {
      if (currentIndex >= sources.length) return;
      
      const nextSrc = sources[currentIndex];
      if (loadedSources.has(nextSrc)) {
        setCurrentSrc(nextSrc);
        currentIndex++;
        loadNextImage();
        return;
      }

      const img = new Image();
      img.onload = () => {
        setLoadedSources(prev => new Set([...prev, nextSrc]));
        setCurrentSrc(nextSrc);
        currentIndex++;
        
        // Continue loading higher quality versions
        setTimeout(loadNextImage, 100);
      };
      img.onerror = () => {
        currentIndex++;
        loadNextImage();
      };
      img.src = nextSrc;
    };

    loadNextImage();
  }, [src, lowQualitySrc, mediumQualitySrc, shouldOptimize, loadedSources]);

  return (
    <LazyImage
      {...props}
      src={currentSrc}
      alt={alt}
      className={className}
    />
  );
};

// Image gallery component with lazy loading
export const LazyImageGallery: React.FC<{
  images: Array<{
    src: string;
    alt: string;
    thumbnail?: string;
  }>;
  className?: string;
  itemClassName?: string;
  onImageClick?: (index: number) => void;
}> = ({ images, className = '', itemClassName = '', onImageClick }) => {
  const { shouldOptimize } = usePerformanceMonitoring();

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ${className}`}>
      {images.map((image, index) => (
        <motion.div
          key={index}
          className={`aspect-square cursor-pointer ${itemClassName}`}
          whileHover={{ scale: shouldOptimize ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onImageClick?.(index)}
        >
          <LazyImage
            src={image.thumbnail || image.src}
            alt={image.alt}
            className="w-full h-full rounded-lg"
            quality={shouldOptimize ? 0.6 : 0.8}
            width={200}
            height={200}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default LazyImage;