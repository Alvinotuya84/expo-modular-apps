export interface MicroappConfig {
    name: string;
    displayName: string;
    icon: string;
    route: string;
  }
  
  export interface NavigationProps {
    onNavigate?: (route: string) => void;
    currentRoute?: string;
  }
  
  export interface MicroappProps extends NavigationProps {
    microappName: string;
  }