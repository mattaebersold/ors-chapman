import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const openNotificationModal = () => setIsNotificationModalOpen(true);
  const closeNotificationModal = () => setIsNotificationModalOpen(false);

  const value = {
    isNotificationModalOpen,
    openNotificationModal,
    closeNotificationModal,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
