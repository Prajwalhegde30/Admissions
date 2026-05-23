'use client';

import { useRef, useCallback, useState } from 'react';
import { api } from '../lib/api';

interface UseAutoSaveOptions {
  debounceMs?: number;
  onSaved?: (savedAt: string) => void;
  onError?: (error: Error) => void;
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const { debounceMs = 500, onSaved, onError } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ fieldPath: string; value: unknown } | null>(null);

  const save = useCallback(
    async (fieldPath: string, value: unknown) => {
      // Clear any pending debounce
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      pendingRef.current = { fieldPath, value };

      timerRef.current = setTimeout(async () => {
        const pending = pendingRef.current;
        if (!pending) return;
        pendingRef.current = null;

        setIsSaving(true);
        setSaveError(null);

        try {
          const result = await api<{ savedAt: string }>('/applications/mine/draft', {
            method: 'PATCH',
            body: JSON.stringify({ fieldPath: pending.fieldPath, value: pending.value }),
          });
          setLastSaved(result.savedAt);
          onSaved?.(result.savedAt);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Save failed';
          setSaveError(msg);
          onError?.(err instanceof Error ? err : new Error(msg));
        } finally {
          setIsSaving(false);
        }
      }, debounceMs);
    },
    [debounceMs, onSaved, onError],
  );

  const saveBatch = useCallback(
    async (fields: { fieldPath: string; value: unknown }[]) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const result = await api<{ savedAt: string }>('/applications/mine/draft', {
          method: 'PATCH',
          body: JSON.stringify({ fields }),
        });
        setLastSaved(result.savedAt);
        onSaved?.(result.savedAt);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Save failed';
        setSaveError(msg);
        onError?.(err instanceof Error ? err : new Error(msg));
      } finally {
        setIsSaving(false);
      }
    },
    [onSaved, onError],
  );

  return { save, saveBatch, isSaving, lastSaved, saveError };
}
