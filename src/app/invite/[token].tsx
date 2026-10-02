import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { ActionButton, Card, Eyebrow, Heading, Screen } from '@/components/design';
import { theme } from '@/constants/theme';
import { acceptTripInvitation } from '@/data/live';

export default function AcceptInvitationScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { isLoading: isAuthLoading, user } = useAuth();
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!token || isAccepting) return;
    setIsAccepting(true);
    setError(null);
    try {
      const tripId = await acceptTripInvitation(token);
      router.replace(`/trips/${tripId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not accept this invitation.');
    } finally {
      setIsAccepting(false);
    }
  };

  const signInPath = `/invite/${token ?? ''}`;

  return (
    <Screen>
      <View style={styles.headingBlock}>
        <Eyebrow>PRIVATE TRIP INVITATION</Eyebrow>
        <Heading>You’re invited{`\n`}to Wanderly.</Heading>
        <Text style={styles.intro}>
          Sign in with the invited email address, then accept to add this trip to your private workspace.
        </Text>
      </View>
      <Card style={styles.card}>
        <View style={styles.icon}>
          <MaterialCommunityIcons color={theme.colors.white} name="account-multiple-plus-outline" size={28} />
        </View>
        {isAuthLoading ? <ActivityIndicator color={theme.colors.forest} /> : null}
        {!isAuthLoading && !user ? (
          <>
            <Text style={styles.title}>Sign in first</Text>
            <Text style={styles.copy}>
              Wanderly will return you to this invitation after the secure email sign-in.
            </Text>
            <ActionButton
              icon="login"
              label="Sign in to continue"
              onPress={() =>
                router.push({ pathname: '/profile', params: { redirect: signInPath } })
              }
            />
          </>
        ) : null}
        {!isAuthLoading && user ? (
          <>
            <Text style={styles.title}>Accept this trip invitation?</Text>
            <Text style={styles.copy}>Signed in as {user.email ?? 'a verified Wanderly member'}.</Text>
            <ActionButton
              icon="check"
              label={isAccepting ? 'Joining trip…' : 'Accept invitation'}
              onPress={isAccepting ? undefined : () => void handleAccept()}
            />
          </>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headingBlock: { gap: theme.spacing.md },
  intro: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  card: { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xxl },
  icon: {
    alignItems: 'center',
    backgroundColor: theme.colors.forest,
    borderRadius: theme.radius.pill,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 22, fontWeight: '800' },
  copy: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  error: { color: theme.colors.danger, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
