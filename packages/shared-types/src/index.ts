export interface MicroappConfig {
    name: string;
    displayName: string;
    version: string;
    route: string;
  }
  
  export interface NavigationProps {
    onNavigate?: (route: string) => void;
    currentRoute?: string;
  }
  
  export interface MicroappProps extends NavigationProps {
    microappName: string;
  }
  
  export interface BaseScreenProps {
    title?: string;
    subtitle?: string;
  }
  
  export interface TabConfig {
    name: string;
    title: string;
    icon: string;
  }
  