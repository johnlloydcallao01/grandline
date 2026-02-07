/**
 * Shared TypeScript interfaces and types for the web-admin application
 */

export interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  href?: string;
}

export interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSearch?: (query: string) => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export interface LayoutProps {
  children: React.ReactNode;
}

// Icon mapping type for admin icons
export type IconName =
  | 'dashboard'
  | 'posts'
  | 'settings'
  | 'users'

  | 'content'
  | 'media'

  | 'orders'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'payments'
  | 'shipping'
  | 'campaigns'
  | 'email'
  | 'social'
  | 'seo'
  | 'ads'
  | 'team'
  | 'roles'
  | 'permissions'
  | 'audit'
  | 'logs'
  | 'backup'
  | 'security'
  | 'api'
  | 'integrations'
  | 'analytics'
  | 'overview'
  | 'report'
  | 'grade'
  | 'certificate'
  | 'bank'
  | 'promotion'
  | 'invoice'
  | 'transaction'
  | 'payout'
  | 'instructor'
  | 'trainee'
  | 'announcement'
  | 'review'
  | 'notifications'
  | 'help'
  | 'support'
  | 'billing'
  | 'profile';
