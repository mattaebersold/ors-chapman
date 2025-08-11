import React from 'react';
import LoadingIndicator from '../components/LoadingIndicator';

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