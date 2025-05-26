export interface TestConfig {
  name: string;
  version: string;
  features: string[];
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface TestState {
  isLoading: boolean;
  error: string | null;
  data: any;
  lastUpdated?: Date;
}

export interface TestActions {
  loadData: () => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export interface TestUser {
  id: string;
  name: string;
  email: string;
  preferences?: Record<string, any>;
}
