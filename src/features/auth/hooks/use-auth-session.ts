import { useEffect } from 'react';
import { authStorageKey, getAuthArea, useAuthStore } from '@/stores/auth.store';
import { clearAuth } from '@/services/api';
import { initializeSession } from '@/features/auth/services/auth.service';
import { subscribeToLiveDataChanges } from '@/services/live-data-sync';

export function useAuthSession() {
  const loading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.initializationError);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const version = useAuthStore((state) => state.sessionVersion);
  const restricted = useAuthStore((state) =>
    Boolean(state.user?.mustChangePassword || state.user?.onboardingRequired)
  );
  useEffect(() => {
    if (authenticated && !restricted && getAuthArea() === 'admin')
      return subscribeToLiveDataChanges();
  }, [authenticated, restricted, version]);
  useEffect(() => {
    void initializeSession();
  }, []);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== authStorageKey() && event.key !== null) return;
      if (event.key === authStorageKey() && event.newValue) {
        try {
          const saved = JSON.parse(event.newValue);
          const current = useAuthStore.getState();
          // Token/profile updates persist the same marker; they do not change identity.
          if (
            saved?.version === 2 &&
            saved.state?.hasSession === current.hasSession &&
            saved.state?.sessionId === current.sessionId
          )
            return;
        } catch {
          // Re-bootstrap on malformed or removed identity markers.
        }
      }
      window.location.reload();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return { loading, error, retry: initializeSession, clear: clearAuth };
}
