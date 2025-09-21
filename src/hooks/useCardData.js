import { useMemo } from 'react';

/**
 * Custom hook for processing card data consistently
 * Handles common card data transformations and formatting
 */
export const useCardData = (item, type = 'post') => {
  return useMemo(() => {
    if (!item) return null;

    const cardData = {
      id: item._id || item.id,
      title: item.title || 'Untitled',
      description: item.description || item.body,
      type: item.type || type,
      category: item.category,
      createdAt: item.created_at,
      userId: item.user_id,
      carId: item.car_id,
    };

    // Image processing
    cardData.imageSource = null;
    if (item.gallery && item.gallery.length > 0) {
      cardData.imageSource = `https://d2481n2uw7a0p.cloudfront.net/${item.gallery[0].filename}`;
    }

    // Date formatting
    cardData.formattedDate = item.created_at
      ? new Date(item.created_at).toLocaleDateString()
      : '';

    // Car-specific data
    if (type === 'car') {
      const carParts = [item.year, item.make, item.model].filter(Boolean);
      cardData.displayName = carParts.length > 0 ? carParts.join(' ') : cardData.title;
    }

    // Post-specific data
    if (type === 'post') {
      cardData.price = item.price;
      cardData.previousPrice = item.previous_price;
      cardData.condition = item.condition;
      cardData.isMarketplace = item.type === 'listing' || item.type === 'want';
    }

    return cardData;
  }, [item, type]);
};

export default useCardData;