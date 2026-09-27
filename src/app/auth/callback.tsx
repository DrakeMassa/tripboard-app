import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { ActionButton, Card, Eyebrow, Heading, Screen } from '@/components/design';
import { theme } from '@/constants/theme';
import { getSafeInternalPath } from '@/domain/auth-redirect';

function getBrowserAuthError(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return fragment.get('error_description') || fragment.get('error');
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    next?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();
  const { isLoading, user } = useAuth();
  const [didTimeOut, setDidTimeOut] = useState(false);
  const nextPath = getSafeInternalPath(params.next);
  const callbackError = useMemo(() => {
    const description = Array.isArray(params.error_description)
      ? params.error_description[0]
      : params.error_description;
    const error = Array.isArray(params.error) ? params.error[0] : params.error;
    return description || error || getBrowserAuthError();
  }, [params.error, params.error_description]);

  useEffect(() => {
    if (user) router.replace(nextPath as Href);
  }, [nextPath, router, user]);

  useEffect(() => {
    if (user || callbackError) return undefined;
    const timer = setTimeout(() => setDidTimeOut(true), 8_000);
    return () => clearTimeout(timer);
  }, [callbackError, user]);

  const hasFailed = Boolean(callbackError || (!isLoading && didTimeOut));

  return (
    <Screen>
      <View style={styles.headingBlock}>
        <Eyebrow>SECURE SIGN-IN</Eyebrow>
        <Heading>{hasFailed ? 'The sign-in link did not finish.' : 'Opening your Wanderly workspace…'}</Heading>
      </View>
      <Card style={styles.card}>
        {hasFailed ? (
          <MaterialCommunityIcons color={theme.colors.coral} name="alert-circle-outline" size={34} />
        ) : (
          <ActivityIndicator color={theme.colors.forest} size="large" />
        )}
        <Text style={styles.title}>
          {hasFailed ? 'Authentication needs attention' : 'Verifying your secure link'}
        </Text>
        <Text style={styles.copy}>
          {callbackError ??
            (hasFailed
              ? 'The link may have expired, been opened on a different browser, or the callback URL may not be allowed in Supabase.'
              : 'This should take only a moment. You will be sent directly to your real trips.')}
        </Text>
        {hasFailed ? (
          <ActionButton
            icon="email-fast-outline"
            label="Request a new sign-in link"
            onPress={() => router.replace({ pathname: '/profile', params: { redirect: nextPath } })}
          />
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headingBlock: { gap: theme.spacing.md },
  card: { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xxl },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 22, fontWeight: '800' },
  copy: { color: theme.colors.muted, fontSize: 13, lineHeight: 20, maxWidth: 480, textAlign: 'center' },
});
