import React from 'react';
import LoadingIndicator from '../components/ui/LoadingIndicator';

const LoadingScreen = () => {
  return (
    <LoadingIndicator 
      size="large" 
      text="Loading..." 
      fullScreen={true}
    />
  );
};

export default LoadingScreen;