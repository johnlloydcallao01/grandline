import React from 'react';
import { SecurityAlert as SecurityAlert$1 } from '@grandline/auth-core';

interface IconProps {
    className?: string;
}
interface SecurityAlertProps extends SecurityAlert$1 {
    onClose?: () => void;
    autoRedirect?: boolean;
    redirectDelay?: number;
    loginPath?: string;
    ShieldIcon?: React.ComponentType<IconProps>;
    AlertTriangleIcon?: React.ComponentType<IconProps>;
    XIcon?: React.ComponentType<IconProps>;
}
/**
 * Security Alert Component
 * Shows critical security alerts when user access is revoked
 * Configurable for different apps with different login paths and icons
 */
declare function SecurityAlert({ type, message, onClose, autoRedirect, redirectDelay, loginPath, ShieldIcon, AlertTriangleIcon, XIcon }: SecurityAlertProps): React.JSX.Element;

export { SecurityAlert, SecurityAlert as SecurityAlertDefault };
