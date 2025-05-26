export interface BankingConfig {
  name: string;
  version: string;
  features: string[];
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface BankingState {
  isLoading: boolean;
  error: string | null;
  data: any;
  lastUpdated?: Date;
}

export interface BankingActions {
  loadData: () => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export interface BankingUser {
  id: string;
  name: string;
  email: string;
  preferences?: Record<string, any>;
}
