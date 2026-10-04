import React, { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';

// Global cache tracking URLs that are already confirmed loaded and decoded in memory
export const loadedImageGlobalCache = new Set<string>();

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fallbackSources?: string[];
  className?: string;
  fallbackIcon?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  width?: number | string;
  height?: number | string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc,
  fallbackSources,
  alt,
  className = '',
  fallbackIcon,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  referrerPolicy = 'no-referrer',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fallbackListRef = useRef<string[]>([]);
  const fallbackIdxRef = useRef<number>(0);

  useEffect(() => {
    const list: string[] = [];
    if (fallbackSources && fallbackSources.length > 0) {
      list.push(...fallbackSources);
    } else if (fallbackSrc) {
      list.push(fallbackSrc);
    }
    fallbackListRef.current = list.filter(item => item !== src);
    fallbackIdxRef.current = 0;

    setCurrentSrc(src);
    setHasError(false);
  }, [src, fallbackSrc, fallbackSources]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      loadedImageGlobalCache.add(currentSrc);
    }
  }, [currentSrc]);

  const handleError = () => {
    if (fallbackIdxRef.current < fallbackListRef.current.length) {
      const nextCandidate = fallbackListRef.current[fallbackIdxRef.current];
      fallbackIdxRef.current += 1;
      if (nextCandidate && nextCandidate !== currentSrc) {
        setCurrentSrc(nextCandidate);
        return;
      }
    }
    setHasError(true);
  };

  const handleLoad = () => {
    loadedImageGlobalCache.add(currentSrc);
  };

  if (hasError) {
    return (
      <div className={`w-full h-full min-h-[140px] flex flex-col items-center justify-center p-4 bg-slate-100/80 text-slate-400 rounded-xl ${className}`}>
        {fallbackIcon || <BookOpen className="w-8 h-8 opacity-40 mb-1" />}
        <span className="text-[11px] text-slate-400 font-medium text-center line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      // @ts-ignore
      fetchPriority={fetchPriority}
      referrerPolicy={referrerPolicy}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage;
