export interface SocialConfig {
  name: string;
  version: string;
  features: string[];
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface SocialState {
  isLoading: boolean;
  error: string | null;
  data: any;
  lastUpdated?: Date;
}

export interface SocialActions {
  loadData: () => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export interface SocialUser {
  id: string;
  name: string;
  email: string;
  preferences?: Record<string, any>;
}
