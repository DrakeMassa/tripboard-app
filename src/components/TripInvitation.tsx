import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton, Card } from '@/components/design';
import { theme } from '@/constants/theme';
import {
  createTripInvitation,
  listTripInvitations,
  LiveTripInvitation,
  revokeTripInvitation,
} from '@/data/live';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildInvitationUrl(token: string): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return new URL(`/invite/${encodeURIComponent(token)}`, window.location.origin).toString();
  }
  return Linking.createURL(`/invite/${token}`);
}

export function TripInvitation({
  tripId,
  tripTitle,
  onClose,
}: {
  tripId: string;
  tripTitle: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<LiveTripInvitation[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = async () => {
    try {
      const items = await listTripInvitations(tripId);
      setInvitations(items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load existing invitations.');
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void listTripInvitations(tripId)
      .then((items) => {
        if (!cancelled) setInvitations(items);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not load existing invitations.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingInvitations(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const handleCreate = async () => {
    const invitedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(invitedEmail)) {
      setError('Enter the email address your guest will use to sign in.');
      return;
    }
    if (isCreating) return;

    setIsCreating(true);
    setError(null);
    setMessage(null);
    try {
      const token = await createTripInvitation({ tripId, invitedEmail });
      setInviteUrl(buildInvitationUrl(token));
      setMessage('Secure one-person invitation created. It expires in 7 days.');
      await loadInvitations();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the invitation.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (revokingId) return;
    setRevokingId(invitationId);
    setError(null);
    try {
      await revokeTripInvitation(invitationId);
      setInvitations((current) => current.map((item) => (
        item.id === invitationId
          ? { ...item, isActive: false, revokedAt: new Date().toISOString() }
          : item
      )));
      setMessage('Invitation revoked. Its link can no longer be used.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not revoke this invitation.');
    } finally {
      setRevokingId(null);
    }
  };

  const activeInvitations = invitations.filter((item) => item.isActive);

  const handleShare = async () => {
    if (!inviteUrl) return;
    const shareMessage = `Join my ${tripTitle} trip in Wanderly: ${inviteUrl}`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
        setMessage('Invitation copied. Send it directly to your guest.');
        return;
      }
      await Share.share({ message: shareMessage, title: `Join ${tripTitle}` });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not share this invitation.');
    }
  };

  return (
    <Card style={styles.card}>
      <View>
        <Text style={styles.title}>Invite a traveler</Text>
        <Text style={styles.helper}>
          Enter the email they will use for Wanderly. The link is single-use, expires in 7 days, and cannot grant organizer access.
        </Text>
      </View>
      {!inviteUrl ? (
        <TextInput
          accessibilityLabel="Guest email address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          onSubmitEditing={() => void handleCreate()}
          placeholder="guest@example.com"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          value={email}
        />
      ) : (
        <View style={styles.linkBox}>
          <Text style={styles.linkLabel}>INVITATION LINK</Text>
          <Text selectable style={styles.linkText}>{inviteUrl}</Text>
        </View>
      )}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoadingInvitations ? (
        <Text style={styles.invitationMeta}>Checking active invitations…</Text>
      ) : activeInvitations.length ? (
        <View style={styles.invitationList}>
          <Text style={styles.linkLabel}>ACTIVE INVITATIONS</Text>
          {activeInvitations.map((invitation) => (
            <View key={invitation.id} style={styles.invitationRow}>
              <View style={styles.flex}>
                <Text style={styles.invitationEmail}>{invitation.invitedEmail ?? 'Guest link'}</Text>
                <Text style={styles.invitationMeta}>
                  Expires {new Date(invitation.expiresAt).toLocaleString()} · {invitation.useCount}/{invitation.maxUses} used
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={Boolean(revokingId)}
                onPress={() => void handleRevoke(invitation.id)}
                style={({ pressed }) => [styles.revokeButton, pressed && styles.pressed]}>
                <Text style={styles.revokeText}>{revokingId === invitation.id ? 'Revoking…' : 'Revoke'}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.actions}>
        <View style={styles.flex}>
          <ActionButton label={inviteUrl ? 'Done' : 'Cancel'} onPress={onClose} secondary />
        </View>
        <View style={styles.flex}>
          <ActionButton
            icon={inviteUrl ? 'share-variant-outline' : 'account-plus-outline'}
            label={inviteUrl ? 'Copy invitation' : isCreating ? 'Creating…' : 'Create invitation'}
            onPress={
              isCreating
                ? undefined
                : inviteUrl
                  ? () => void handleShare()
                  : () => void handleCreate()
            }
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.sage, gap: theme.spacing.md },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 22, fontWeight: '800' },
  helper: { color: theme.colors.forestSoft, fontSize: 12, lineHeight: 18, marginTop: 5 },
  input: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.ink,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: theme.spacing.lg,
  },
  linkBox: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 5,
    padding: theme.spacing.md,
  },
  linkLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  linkText: { color: theme.colors.forest, fontSize: 11, lineHeight: 17 },
  invitationList: { backgroundColor: theme.colors.white, borderColor: theme.colors.line, borderRadius: theme.radius.md, borderWidth: 1, gap: theme.spacing.sm, padding: theme.spacing.md },
  invitationRow: { alignItems: 'center', borderTopColor: theme.colors.line, borderTopWidth: 1, flexDirection: 'row', gap: theme.spacing.md, paddingTop: theme.spacing.sm },
  invitationEmail: { color: theme.colors.ink, fontSize: 11, fontWeight: '800' },
  invitationMeta: { color: theme.colors.muted, fontSize: 9, lineHeight: 13, marginTop: 2 },
  revokeButton: { borderColor: theme.colors.danger, borderRadius: theme.radius.pill, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  revokeText: { color: theme.colors.danger, fontSize: 9, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: theme.spacing.md },
  flex: { flex: 1 },
  pressed: { opacity: 0.72 },
  success: { color: theme.colors.forestSoft, fontSize: 12, fontWeight: '700' },
  error: { color: theme.colors.danger, fontSize: 12, fontWeight: '700' },
});
