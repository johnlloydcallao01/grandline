'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User as AuthUser } from '@/types/auth';
import { getInstructorSettings, type InstructorDetails } from './actions';

interface SettingsContextValue {
  profile: AuthUser | null;
  instructor: InstructorDetails | null;
  isLoading: boolean;
  pageError: string | null;
  reload: () => Promise<void>;
  applyUpdatedProfile: (user: AuthUser) => void;
  applyUpdatedInstructor: (details: InstructorDetails) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user: authenticatedUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(authenticatedUser);
  const [instructor, setInstructor] = useState<InstructorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const result = await getInstructorSettings();
      setProfile(result.user);
      setInstructor(result.instructor);
      updateUser(result.user);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Failed to load your settings.');
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const applyUpdatedProfile = useCallback((user: AuthUser) => {
    setProfile(user);
    updateUser(user);
  }, [updateUser]);

  const applyUpdatedInstructor = useCallback((details: InstructorDetails) => {
    setInstructor(details);
  }, []);

  const value: SettingsContextValue = {
    profile,
    instructor,
    isLoading,
    pageError,
    reload,
    applyUpdatedProfile,
    applyUpdatedInstructor,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
