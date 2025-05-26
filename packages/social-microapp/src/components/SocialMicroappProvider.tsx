import React, { createContext, useContext, ReactNode, useState } from 'react';

interface SocialContextType {
  microappName: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // Add your social specific state and functions here
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

interface SocialMicroappProviderProps {
  children: ReactNode;
}

export function SocialMicroappProvider({ children }: SocialMicroappProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const contextValue: SocialContextType = {
    microappName: 'social',
    isLoading,
    setIsLoading,
    // Add your state and functions here
  };

  return (
    <SocialContext.Provider value={contextValue}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocialContext() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocialContext must be used within a SocialMicroappProvider');
  }
  return context;
}
