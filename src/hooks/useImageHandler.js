import { useCallback, useMemo } from 'react';

/**
 * Custom hook for handling image processing and URL generation
 * Provides consistent image handling patterns across components
 */
export const useImageHandler = (imageData, fallbackIcon = 'camera') => {
  // Generate image source URL
  const getImageSource = useCallback((image) => {
    if (!image) return null;

    // Handle string URLs
    if (typeof image === 'string') {
      if (image.startsWith('http')) {
        return image;
      }
      // Assume it's a filename from our CDN
      return `https://d2481n2uw7a0p.cloudfront.net/${image}`;
    }

    // Handle object with different URL properties
    if (typeof image === 'object') {
      if (image.uri) return image.uri;
      if (image.url) return image.url;
      if (image.filename) {
        return `https://d2481n2uw7a0p.cloudfront.net/${image.filename}`;
      }
    }

    return null;
  }, []);

  // Process gallery array
  const processGallery = useCallback((gallery) => {
    if (!Array.isArray(gallery) || gallery.length === 0) {
      return [];
    }

    return gallery.map((image, index) => ({
      id: image.id || image._id || index,
      source: getImageSource(image),
      original: image,
    })).filter(item => item.source);
  }, [getImageSource]);

  // Main image processing
  const processedImages = useMemo(() => {
    if (!imageData) {
      return {
        primary: null,
        gallery: [],
        hasPrimary: false,
        hasGallery: false,
        count: 0,
      };
    }

    // Handle single image
    if (typeof imageData === 'string' || (typeof imageData === 'object' && !Array.isArray(imageData))) {
      const primarySource = getImageSource(imageData);
      return {
        primary: primarySource,
        gallery: primarySource ? [{ id: 0, source: primarySource, original: imageData }] : [],
        hasPrimary: !!primarySource,
        hasGallery: !!primarySource,
        count: primarySource ? 1 : 0,
      };
    }

    // Handle gallery array
    if (Array.isArray(imageData)) {
      const gallery = processGallery(imageData);
      return {
        primary: gallery.length > 0 ? gallery[0].source : null,
        gallery,
        hasPrimary: gallery.length > 0,
        hasGallery: gallery.length > 0,
        count: gallery.length,
      };
    }

    return {
      primary: null,
      gallery: [],
      hasPrimary: false,
      hasGallery: false,
      count: 0,
    };
  }, [imageData, getImageSource, processGallery]);

  // Helper functions
  const getPlaceholderConfig = useCallback(() => ({
    icon: fallbackIcon,
    text: 'No Image',
  }), [fallbackIcon]);

  const getImageAtIndex = useCallback((index) => {
    if (index < 0 || index >= processedImages.gallery.length) {
      return null;
    }
    return processedImages.gallery[index];
  }, [processedImages.gallery]);

  const getThumbnails = useCallback((maxCount = 4) => {
    return processedImages.gallery.slice(0, maxCount);
  }, [processedImages.gallery]);

  return {
    ...processedImages,
    getImageSource,
    processGallery,
    getPlaceholderConfig,
    getImageAtIndex,
    getThumbnails,
  };
};

export default useImageHandler;