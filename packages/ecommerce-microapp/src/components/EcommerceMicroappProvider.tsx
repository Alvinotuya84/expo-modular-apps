import React, { createContext, useContext, ReactNode, useState } from 'react';

interface EcommerceContextType {
  microappName: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // Add your ecommerce specific state and functions here
}

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

interface EcommerceMicroappProviderProps {
  children: ReactNode;
}

export function EcommerceMicroappProvider({ children }: EcommerceMicroappProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const contextValue: EcommerceContextType = {
    microappName: 'ecommerce',
    isLoading,
    setIsLoading,
    // Add your state and functions here
  };

  return (
    <EcommerceContext.Provider value={contextValue}>
      {children}
    </EcommerceContext.Provider>
  );
}

export function useEcommerceContext() {
  const context = useContext(EcommerceContext);
  if (context === undefined) {
    throw new Error('useEcommerceContext must be used within a EcommerceMicroappProvider');
  }
  return context;
}
