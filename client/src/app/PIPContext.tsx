"use client"

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Create a Context for PiP State
interface PiPContextType {
  isPiPEnabled: boolean;
  togglePiP: () => void;
}

const PiPContext = createContext<PiPContextType | undefined>(undefined);

// Define the type for the children prop
interface PiPProviderProps {
  children: ReactNode;
}

// Context Provider to manage PiP state
export const PiPProvider: React.FC<PiPProviderProps> = ({ children }) => {
  const [isPiPEnabled, setIsPiPEnabled] = useState(false);

  const togglePiP = () => {
    setIsPiPEnabled((prev) => !prev);
  };

  return (
    <PiPContext.Provider value={{ isPiPEnabled, togglePiP }}>
      {children}
    </PiPContext.Provider>
  );
};

// Custom hook to use PiP context
export const usePiP = (): PiPContextType => {
  const context = useContext(PiPContext);
  if (!context) {
    throw new Error('usePiP must be used within a PiPProvider');
  }
  return context;
};
