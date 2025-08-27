/**
 * Shared TypeScript interfaces and types for the web application
 */

export interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  href?: string;
}

export interface VideoCardProps {
  thumbnail: string;
  title: string;
  channel: string;
  views: string;
  time: string;
  duration: string;
  onClick?: () => void;
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

export interface VideoGridProps {
  videos?: VideoCardProps[];
}

export interface LayoutProps {
  children: React.ReactNode;
}

// Icon mapping type
export type IconName = 
  | 'home' 
  | 'shorts' 
  | 'subscriptions' 
  | 'history' 
  | 'playlists' 
  | 'watch-later' 
  | 'liked' 
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
