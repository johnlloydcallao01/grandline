/**
 * Shared TypeScript interfaces and types for the web application
 */

// Re-export authentication types
export * from './auth';

export interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  href?: string;
}



export interface CategoryCircleProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface CategoryCarouselProps {
  categories?: string[];
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSearch?: (query: string) => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onScroll?: (e: React.UIEvent<HTMLElement>) => void;
}



export interface LayoutProps {
  children: React.ReactNode;
}

// Icon mapping type
export type IconName =
  | 'home'
  | 'courses'
  | 'trending'
  | 'music'
  | 'gaming'
  | 'news'
  | 'sports'
  | 'growth'
  | 'strategy'
  | 'innovation'
  | 'leadership'
  | 'consulting'
  | 'settings'
  | 'help'
  | 'feedback'
  | 'notifications'
  | 'profile'
  | 'billing'
  | 'integrations'
  | 'api'
  | 'security'
  | 'backup';

// Category icon mapping type
export interface CategoryIconConfig {
  icon: any;
  bgColor: string;
}

export type CategoryName = 
  | 'All'
  | 'Business'
  | 'Technology'
  | 'Marketing'
  | 'Analytics'
  | 'E-commerce'
  | 'Growth'
  | 'Strategy'
  | 'Innovation'
  | 'Leadership';
