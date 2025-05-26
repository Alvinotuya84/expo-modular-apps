import React, { createContext, useContext, ReactNode, useState } from 'react';

interface TestContextType {
  microappName: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // Add your test specific state and functions here
}

const TestContext = createContext<TestContextType | undefined>(undefined);

interface TestMicroappProviderProps {
  children: ReactNode;
}

export function TestMicroappProvider({ children }: TestMicroappProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const contextValue: TestContextType = {
    microappName: 'test',
    isLoading,
    setIsLoading,
    // Add your state and functions here
  };

  return (
    <TestContext.Provider value={contextValue}>
      {children}
    </TestContext.Provider>
  );
}

export function useTestContext() {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTestContext must be used within a TestMicroappProvider');
  }
  return context;
}
