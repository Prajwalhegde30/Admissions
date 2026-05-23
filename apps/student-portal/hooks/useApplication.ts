'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface Application {
  id: string;
  studentId: string;
  admissionType: string;
  category: string;
  status: string;
  formData: Record<string, unknown>;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  id: string;
  userId: string;
  admissionType: string | null;
  category: string | null;
  boardType: string | null;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  [key: string]: unknown;
}

export function useApplication() {
  const [application, setApplication] = useState<Application | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [appData, profileData] = await Promise.all([
        api<Application>('/applications/mine'),
        api<Profile>('/applications/mine/profile'),
      ]);
      setApplication(appData);
      setProfile(profileData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Get a nested value from formData using dot notation.
   */
  function getFormValue<T = string>(path: string, defaultValue: T = '' as T): T {
    if (!application?.formData) return defaultValue;
    const keys = path.split('.');
    let current: unknown = application.formData;
    for (const key of keys) {
      if (current == null || typeof current !== 'object') return defaultValue;
      current = (current as Record<string, unknown>)[key];
    }
    return (current as T) ?? defaultValue;
  }

  /**
   * Update local state optimistically after auto-save.
   */
  function updateFormData(path: string, value: unknown) {
    setApplication((prev) => {
      if (!prev) return prev;
      const newData = { ...prev.formData };
      const keys = path.split('.');
      let current: Record<string, unknown> = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        }
        current = { ...(current[keys[i]] as Record<string, unknown>) };
        // Rebuild the path immutably
        let parent: Record<string, unknown> = newData;
        for (let j = 0; j < i; j++) {
          parent = parent[keys[j]] as Record<string, unknown>;
        }
        parent[keys[i]] = current;
      }
      current[keys[keys.length - 1]] = value;
      return { ...prev, formData: newData };
    });
  }

  return {
    application,
    profile,
    isLoading,
    error,
    getFormValue,
    updateFormData,
    refetch: fetchData,
  };
}
