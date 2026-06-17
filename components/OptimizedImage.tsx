'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  unoptimized?: boolean;
}

const isDataUri = (src: string) => src.startsWith('data:');

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  style,
  fallbackSrc = '/logo.png',
  unoptimized = false,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  if (!imgSrc || imgSrc === '') {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  if (isDataUri(imgSrc)) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  if (hasError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        style={style}
        unoptimized={unoptimized}
        onError={() => { setImgSrc(fallbackSrc); setHasError(true); }}
        {...(props as any)}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      unoptimized={unoptimized}
      onError={() => { setImgSrc(fallbackSrc); setHasError(true); }}
      {...(props as any)}
    />
  );
}
