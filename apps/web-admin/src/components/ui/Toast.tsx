'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    title: string;
    message?: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(({ title, message, type, duration = 5000 }: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const dismissAll = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            {toasts.length > 0 && (
                <div 
                    className="fixed inset-0 z-[9998] bg-transparent"
                    onClick={dismissAll}
                    aria-hidden="true"
                />
            )}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-start p-4 rounded-lg shadow-lg border transition-all animate-in slide-in-from-right-full
                            ${toast.type === 'success' ? 'bg-white border-green-200 text-green-800' : ''}
                            ${toast.type === 'error' ? 'bg-white border-red-200 text-red-800' : ''}
                            ${toast.type === 'warning' ? 'bg-white border-yellow-200 text-yellow-800' : ''}
                            ${toast.type === 'info' ? 'bg-white border-blue-200 text-blue-800' : ''}
                        `}
                    >
                        <div className="flex-shrink-0 mr-3">
                            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                            {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="flex-1 mr-2">
                            <h3 className="font-medium text-sm">{toast.title}</h3>
                            {toast.message && <p className="text-sm mt-1 opacity-90">{toast.message}</p>}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
