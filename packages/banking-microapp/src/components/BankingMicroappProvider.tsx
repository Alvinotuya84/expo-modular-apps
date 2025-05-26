import React, { createContext, useContext, ReactNode, useState } from 'react';

interface BankingContextType {
  microappName: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // Add your banking specific state and functions here
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

interface BankingMicroappProviderProps {
  children: ReactNode;
}

export function BankingMicroappProvider({ children }: BankingMicroappProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const contextValue: BankingContextType = {
    microappName: 'banking',
    isLoading,
    setIsLoading,
    // Add your state and functions here
  };

  return (
    <BankingContext.Provider value={contextValue}>
      {children}
    </BankingContext.Provider>
  );
}

export function useBankingContext() {
  const context = useContext(BankingContext);
  if (context === undefined) {
    throw new Error('useBankingContext must be used within a BankingMicroappProvider');
  }
  return context;
}
