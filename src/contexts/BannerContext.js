import React, { createContext, useContext, useState } from 'react';
import FloatingBanner from '../components/FloatingBanner';

const BannerContext = createContext();

export const useBanner = () => {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
};

export const BannerProvider = ({ children }) => {
  const [banner, setBanner] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showSuccess = (message) => {
    setBanner({
      visible: true,
      message,
      type: 'success',
    });
  };

  const showError = (message) => {
    setBanner({
      visible: true,
      message,
      type: 'error',
    });
  };

  const hideBanner = () => {
    setBanner(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const value = {
    showSuccess,
    showError,
    hideBanner,
  };

  return (
    <BannerContext.Provider value={value}>
      {children}
      <FloatingBanner
        visible={banner.visible}
        message={banner.message}
        type={banner.type}
        onHide={hideBanner}
      />
    </BannerContext.Provider>
  );
};

export default BannerContext;