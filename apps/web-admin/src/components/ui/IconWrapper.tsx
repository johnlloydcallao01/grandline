/**
 * Icon Wrapper Component
 *
 * Wraps Lucide React icons to fix React 19 JSX compatibility issues
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Create wrapper function for any Lucide icon
function createIconWrapper(IconComponent: React.ComponentType<IconProps>) {
  const WrappedIcon = (props: IconProps) => React.createElement(IconComponent, props);
  WrappedIcon.displayName = `Wrapped${IconComponent.displayName || IconComponent.name || 'Icon'}`;
  return WrappedIcon;
}

// Export wrapped icons directly
export const Shield = createIconWrapper(LucideIcons.Shield);
export const Award = createIconWrapper(LucideIcons.Award);
export const Eye = createIconWrapper(LucideIcons.Eye);
export const EyeOff = createIconWrapper(LucideIcons.EyeOff);
export const AlertCircle = createIconWrapper(LucideIcons.AlertCircle);
export const HelpCircle = createIconWrapper(LucideIcons.HelpCircle);
export const LifeBuoy = createIconWrapper(LucideIcons.LifeBuoy);
export const Loader2 = createIconWrapper(LucideIcons.Loader2);
export const Users = createIconWrapper(LucideIcons.Users);
export const FileText = createIconWrapper(LucideIcons.FileText);
export const TrendingUp = createIconWrapper(LucideIcons.TrendingUp);
export const MessageSquare = createIconWrapper(LucideIcons.MessageSquare);
export const BarChart3 = createIconWrapper(LucideIcons.BarChart3);
export const Heart = createIconWrapper(LucideIcons.Heart);
export const Share2 = createIconWrapper(LucideIcons.Share2);
export const Plus = createIconWrapper(LucideIcons.Plus);
export const Search = createIconWrapper(LucideIcons.Search);
export const Filter = createIconWrapper(LucideIcons.Filter);
export const Grid = createIconWrapper(LucideIcons.Grid);
export const List = createIconWrapper(LucideIcons.List);
export const Calendar = createIconWrapper(LucideIcons.Calendar);
export const User = createIconWrapper(LucideIcons.User);
export const Edit = createIconWrapper(LucideIcons.Edit);
export const Trash2 = createIconWrapper(LucideIcons.Trash2);
export const MoreHorizontal = createIconWrapper(LucideIcons.MoreHorizontal);
export const Check = createIconWrapper(LucideIcons.Check);
export const X = createIconWrapper(LucideIcons.X);
export const ChevronDown = createIconWrapper(LucideIcons.ChevronDown);
export const Settings = createIconWrapper(LucideIcons.Settings);
export const LogOut = createIconWrapper(LucideIcons.LogOut);
export const Upload = createIconWrapper(LucideIcons.Upload);
export const Download = createIconWrapper(LucideIcons.Download);
export const Image = createIconWrapper(LucideIcons.Image);
export const Video = createIconWrapper(LucideIcons.Video);
export const Music = createIconWrapper(LucideIcons.Music);
export const File = createIconWrapper(LucideIcons.File);
export const Globe = createIconWrapper(LucideIcons.Globe);
export const Lock = createIconWrapper(LucideIcons.Lock);
export const ExternalLink = createIconWrapper(LucideIcons.ExternalLink);
export const Hash = createIconWrapper(LucideIcons.Hash);
export const Folder = createIconWrapper(LucideIcons.Folder);
export const MessageCircle = createIconWrapper(LucideIcons.MessageCircle);
export const Flag = createIconWrapper(LucideIcons.Flag);
export const Reply = createIconWrapper(LucideIcons.Reply);
export const AlertTriangle = createIconWrapper(LucideIcons.AlertTriangle);
export const CheckCircle = createIconWrapper(LucideIcons.CheckCircle);
export const Mail = createIconWrapper(LucideIcons.Mail);
export const ArrowUpRight = createIconWrapper(LucideIcons.ArrowUpRight);
export const ArrowDownRight = createIconWrapper(LucideIcons.ArrowDownRight);
export const Monitor = createIconWrapper(LucideIcons.Monitor);
export const Smartphone = createIconWrapper(LucideIcons.Smartphone);
export const Link = createIconWrapper(LucideIcons.Link);
export const Save = createIconWrapper(LucideIcons.Save);
export const Undo = createIconWrapper(LucideIcons.Undo);
export const Redo = createIconWrapper(LucideIcons.Redo);
export const Bold = createIconWrapper(LucideIcons.Bold);
export const Italic = createIconWrapper(LucideIcons.Italic);
export const Underline = createIconWrapper(LucideIcons.Underline);
export const GripVertical = createIconWrapper(LucideIcons.GripVertical);
export const Tag = createIconWrapper(LucideIcons.Tag);
export const Clock = createIconWrapper(LucideIcons.Clock);
export const Type = createIconWrapper(LucideIcons.Type);
export const Heading1 = createIconWrapper(LucideIcons.Heading1);
export const Heading2 = createIconWrapper(LucideIcons.Heading2);
export const Heading3 = createIconWrapper(LucideIcons.Heading3);
export const Quote = createIconWrapper(LucideIcons.Quote);
export const Code = createIconWrapper(LucideIcons.Code);
export const ListOrdered = createIconWrapper(LucideIcons.ListOrdered);
export const DollarSign = createIconWrapper(LucideIcons.DollarSign);
export const Bell = createIconWrapper(LucideIcons.Bell);
export const Palette = createIconWrapper(LucideIcons.Palette);
export const Star = createIconWrapper(LucideIcons.Star);
export const CreditCard = createIconWrapper(LucideIcons.CreditCard);
export const Phone = createIconWrapper(LucideIcons.Phone);
export const XCircle = createIconWrapper(LucideIcons.XCircle);
export const BookOpen = createIconWrapper(LucideIcons.BookOpen);
export const RefreshCw = createIconWrapper(LucideIcons.RefreshCw);
export const HardDrive = createIconWrapper(LucideIcons.HardDrive);
export const FolderPlus = createIconWrapper(LucideIcons.FolderPlus);
export const FileCheck = createIconWrapper(LucideIcons.FileCheck);
export const Send = createIconWrapper(LucideIcons.Send);
export const LayoutTemplate = createIconWrapper(LucideIcons.LayoutTemplate);
export const Copy = createIconWrapper(LucideIcons.Copy);
export const ThumbsUp = createIconWrapper(LucideIcons.ThumbsUp);
export const Landmark = createIconWrapper(LucideIcons.Landmark);
export const Wallet = createIconWrapper(LucideIcons.Wallet);
export const Briefcase = createIconWrapper(LucideIcons.Briefcase);
export const PieChart = createIconWrapper(LucideIcons.PieChart);
export const Activity = createIconWrapper(LucideIcons.Activity);
export const Megaphone = createIconWrapper(LucideIcons.Megaphone);
export const Ticket = createIconWrapper(LucideIcons.Ticket);
export const PenTool = createIconWrapper(LucideIcons.PenTool);
export const Key = createIconWrapper(LucideIcons.Key);
export const Server = createIconWrapper(LucideIcons.Server);
export const Database = createIconWrapper(LucideIcons.Database);

// Type for icon components
export type LucideIcon = React.ComponentType<IconProps>;
