import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { ActionButton, Avatar, Card, Eyebrow, Heading, PreviewNotice, Screen, SectionTitle } from '@/components/design';
import { theme } from '@/constants/theme';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

const checklist = [
  { label: 'Universal app foundation', done: true },
  { label: 'Review database migration', done: false },
  { label: 'Connect Supabase environment', done: isSupabaseConfigured },
  { label: 'Enable native share extension', done: false },
];

export default function ProfileScreen() {
  const { isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || isSubmitting || !isSupabaseConfigured) return;

    setIsSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const { error: signInError } = await requireSupabase().auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: Linking.createURL('/') },
      });
      if (signInError) throw signInError;
      setMessage(`Check ${normalizedEmail} for your secure Wanderly sign-in link.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send the sign-in link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const { error: signOutError } = await requireSupabase().auth.signOut();
      if (signOutError) throw signOutError;
      setEmail('');
      setMessage('Signed out safely.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign out.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName =
    (typeof user?.user_metadata.full_name === 'string' && user.user_metadata.full_name) ||
    user?.email ||
    'Drake Massa';

  return (
    <Screen>
      <View style={styles.noticeRow}>
        <Eyebrow>YOUR SPACE</Eyebrow>
        <PreviewNotice label={user ? 'SIGNED IN' : 'PILOT SETUP'} />
      </View>
      <Heading>Ready when your{`\n`}next trip is.</Heading>

      <Card style={styles.profileCard}>
        <Avatar initials="DM" />
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileMeta}>
            {user ? 'Trip organizer · Live workspace' : 'Trip organizer · Preview workspace'}
          </Text>
        </View>
        <MaterialCommunityIcons color={theme.colors.muted} name="chevron-right" size={23} />
      </Card>

      <View style={styles.section}>
        <SectionTitle>Build checkpoint</SectionTitle>
        <Card style={styles.checklistCard}>
          {checklist.map((item, index) => (
            <View key={item.label} style={[styles.checkRow, index > 0 && styles.divider]}>
              <MaterialCommunityIcons
                color={item.done ? theme.colors.forestSoft : theme.colors.muted}
                name={item.done ? 'check-circle' : 'circle-outline'}
                size={21}
              />
              <Text style={[styles.checkText, item.done && styles.checkTextDone]}>{item.label}</Text>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle>{user ? 'Account' : 'Make the pilot live'}</SectionTitle>
        <Card style={styles.authCard}>
          {isLoading ? <ActivityIndicator color={theme.colors.forest} /> : null}
          {!isLoading && !user ? (
            <>
              <Text style={styles.authTitle}>Sign in without a password</Text>
              <Text style={styles.authText}>
                Enter your email and Supabase will send a one-time secure link. Only signed-in trip members can see live trip data.
              </Text>
              <TextInput
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                onSubmitEditing={() => void handleSignIn()}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.muted}
                returnKeyType="send"
                style={styles.input}
                value={email}
              />
              <ActionButton
                icon="email-fast-outline"
                label={isSubmitting ? 'Sending link…' : 'Email me a sign-in link'}
                onPress={isSubmitting || !email.trim() ? undefined : () => void handleSignIn()}
              />
            </>
          ) : null}
          {!isLoading && user ? (
            <>
              <View style={styles.signedInRow}>
                <MaterialCommunityIcons color={theme.colors.forestSoft} name="shield-check-outline" size={25} />
                <View style={styles.profileCopy}>
                  <Text style={styles.authTitle}>Signed in</Text>
                  <Text style={styles.authText}>{user.email ?? 'Verified Wanderly account'}</Text>
                </View>
              </View>
              <ActionButton
                icon="logout"
                label={isSubmitting ? 'Signing out…' : 'Sign out'}
                onPress={isSubmitting ? undefined : () => void handleSignOut()}
                secondary
              />
            </>
          ) : null}
          {message ? <Text style={styles.successText}>{message}</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle>Family-friendly by design</SectionTitle>
        <Card style={styles.familyCard}>
          <MaterialCommunityIcons color={theme.colors.coral} name="account-group-outline" size={32} />
          <Text style={styles.familyTitle}>Short, contextual onboarding</Text>
          <Text style={styles.familyText}>
            Instead of one long tutorial, Wanderly will teach each feature the first time someone reaches it—with a replayable two-minute tour.
          </Text>
        </Card>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  noticeRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  profileCard: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  profileCopy: { flex: 1 },
  profileName: { color: theme.colors.ink, fontSize: 16, fontWeight: '800' },
  profileMeta: { color: theme.colors.muted, fontSize: 12, marginTop: 3 },
  section: { gap: theme.spacing.md },
  checklistCard: { paddingVertical: 4 },
  checkRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md, paddingVertical: 14 },
  divider: { borderTopColor: theme.colors.line, borderTopWidth: 1 },
  checkText: { color: theme.colors.muted, flex: 1, fontSize: 13 },
  checkTextDone: { color: theme.colors.ink, fontWeight: '700' },
  familyCard: { backgroundColor: theme.colors.coralSoft, gap: theme.spacing.sm },
  familyTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' },
  familyText: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
  authCard: { gap: theme.spacing.md },
  authTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' },
  authText: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
  input: { backgroundColor: theme.colors.white, borderColor: theme.colors.line, borderRadius: theme.radius.md, borderWidth: 1, color: theme.colors.ink, fontSize: 16, minHeight: 50, paddingHorizontal: theme.spacing.lg },
  signedInRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  successText: { color: theme.colors.forestSoft, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  errorText: { color: theme.colors.danger, fontSize: 12, fontWeight: '700', lineHeight: 17 },
});
