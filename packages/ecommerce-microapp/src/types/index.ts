export interface EcommerceConfig {
  name: string;
  version: string;
  features: string[];
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface EcommerceState {
  isLoading: boolean;
  error: string | null;
  data: any;
  lastUpdated?: Date;
}

export interface EcommerceActions {
  loadData: () => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export interface EcommerceUser {
  id: string;
  name: string;
  email: string;
  preferences?: Record<string, any>;
}
