'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';

interface UseOcrPollingOptions {
  documentId: string | null;
  enabled?: boolean;
  intervalMs?: number;
}

interface OcrResult {
  id: string;
  documentType: string;
  ocrStatus: string;
  ocrExtracted: Record<string, unknown> | null;
  ocrConfirmed: Record<string, unknown> | null;
  ocrError: string | null;
}

export function useOcrPolling({ documentId, enabled = true, intervalMs = 3000 }: UseOcrPollingOptions) {
  const [result, setResult] = useState<OcrResult | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (!documentId || !enabled) {
      stopPolling();
      return;
    }

    const poll = async () => {
      try {
        const data = await api<OcrResult>(`/documents/${documentId}/ocr`);
        setResult(data);
        if (data.ocrStatus === 'done' || data.ocrStatus === 'failed' || data.ocrStatus === 'not_applicable') {
          stopPolling();
        }
      } catch {
        stopPolling();
      }
    };

    setIsPolling(true);
    poll(); // Initial fetch
    intervalRef.current = setInterval(poll, intervalMs);

    return () => stopPolling();
  }, [documentId, enabled, intervalMs, stopPolling]);

  return { ocrResult: result, isPolling };
}
