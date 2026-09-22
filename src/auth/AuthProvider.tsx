import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

type AuthState = {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let isMounted = true;

    void client.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setIsLoading(false);
    });

    const exchangeCode = async (url: string | null) => {
      if (!url) return;
      const code = Linking.parse(url).queryParams?.code;
      if (typeof code === 'string' && code) {
        await client.auth.exchangeCodeForSession(code);
      }
    };

    const linkSubscription =
      Platform.OS === 'web'
        ? null
        : Linking.addEventListener('url', ({ url }) => {
            void exchangeCode(url).catch(() => undefined);
          });

    if (Platform.OS !== 'web') {
      void Linking.getInitialURL().then(exchangeCode).catch(() => undefined);
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      linkSubscription?.remove();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({ isLoading, session, user: session?.user ?? null }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
