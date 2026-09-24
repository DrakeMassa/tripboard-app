import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { CreateTripForm } from '@/components/CreateTripForm';
import { ActionButton, Card, Eyebrow, Heading, Pill, PreviewNotice, Screen } from '@/components/design';
import { DestinationBackdrop } from '@/components/DestinationBackdrop';
import { theme } from '@/constants/theme';
import { listTrips, LiveTrip } from '@/data/live';
import { previewTrip } from '@/data/preview';

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) return 'Dates to be added';

  const format = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00Z`));

  if (!endDate || endDate === startDate) return format(startDate);
  return `${format(startDate)} – ${format(endDate)}`;
}

function daysUntil(startDate: string | null): number | null {
  if (!startDate) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const start = Date.parse(`${startDate}T00:00:00Z`);
  return Math.max(0, Math.ceil((start - todayUtc) / 86_400_000));
}

export default function TripsScreen() {
  const router = useRouter();
  const { isLoading: isAuthLoading, user } = useAuth();
  const [liveTrips, setLiveTrips] = useState<LiveTrip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTrips = useCallback(async () => {
    if (!user) {
      setLiveTrips([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setLiveTrips(await listTrips());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load trips.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(refreshTrips);
  }, [refreshTrips]);

  const handlePrimaryAction = () => {
    if (!user) {
      router.push('/profile');
      return;
    }
    setError(null);
    setIsCreateFormOpen((current) => !current);
  };

  const isLive = Boolean(user);
  const trips = isLive ? liveTrips : [];

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Eyebrow>YOUR TRIPS</Eyebrow>
          <Heading>Where to next?</Heading>
        </View>
        <PreviewNotice label={isLive ? 'LIVE WORKSPACE' : 'PRODUCT PREVIEW'} />
      </View>

      <ActionButton
        icon={user ? 'plus' : 'login'}
        label={
          isAuthLoading
            ? 'Checking sign-in…'
            : !user
              ? 'Sign in to start the pilot'
              : isCreateFormOpen
                ? 'Close new trip form'
                : 'Create a new trip'
        }
        onPress={isAuthLoading ? undefined : handlePrimaryAction}
        secondary={Boolean(user && isCreateFormOpen)}
      />

      {user && isCreateFormOpen ? (
        <CreateTripForm
          onCancel={() => setIsCreateFormOpen(false)}
          onCreated={(trip) => {
            setLiveTrips((current) => [...current, trip]);
            setIsCreateFormOpen(false);
            router.push(`/trips/${trip.id}`);
          }}
        />
      ) : null}

      {error ? (
        <Card style={styles.errorCard}>
          <MaterialCommunityIcons color={theme.colors.danger} name="alert-circle-outline" size={22} />
          <View style={styles.errorCopy}>
            <Text style={styles.errorTitle}>Live data is not ready yet</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Card>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>UPCOMING</Text>
        {isLive && isLoading ? <ActivityIndicator color={theme.colors.forest} /> : null}
        {!isLive ? (
          <Pressable
            onPress={() => router.push(`/trips/${previewTrip.id}`)}
            style={({ pressed }) => pressed && styles.pressed}>
            <Card style={styles.tripCard}>
              <View style={styles.cover}>
                <DestinationBackdrop
                  compact
                  location={previewTrip.location}
                  title={previewTrip.title}
                />
                <Pill tone="white">{previewTrip.daysUntil} DAYS AWAY</Pill>
              </View>
              <View style={styles.tripCopy}>
                <Text style={styles.tripTitle}>{previewTrip.title}</Text>
                <Text style={styles.tripLocation}>{previewTrip.location}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons color={theme.colors.muted} name="calendar-blank-outline" size={16} />
                    <Text style={styles.metaText}>{previewTrip.dateRange}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons color={theme.colors.muted} name="account-multiple-outline" size={16} />
                    <Text style={styles.metaText}>{previewTrip.travelerCount}</Text>
                  </View>
                </View>
              </View>
            </Card>
          </Pressable>
        ) : null}
        {trips.map((trip) => {
          const countdown = daysUntil(trip.startDate);
          return (
            <Pressable
              key={trip.id}
              onPress={() => router.push(`/trips/${trip.id}`)}
              style={({ pressed }) => pressed && styles.pressed}>
              <Card style={styles.tripCard}>
                <View style={styles.cover}>
                  <DestinationBackdrop
                    compact
                    location={trip.location ?? ''}
                    title={trip.title}
                  />
                  <Pill tone="white">
                    {countdown === null ? 'DATES PENDING' : `${countdown} DAYS AWAY`}
                  </Pill>
                </View>
                <View style={styles.tripCopy}>
                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <Text style={styles.tripLocation}>{trip.location ?? 'Location to be added'}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons color={theme.colors.muted} name="calendar-blank-outline" size={16} />
                      <Text style={styles.metaText}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons color={theme.colors.muted} name="lock-outline" size={16} />
                      <Text style={styles.metaText}>Private pilot</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
        {isLive && !isLoading && trips.length === 0 && !error ? (
          <Card style={styles.emptyLiveCard}>
            <Text style={styles.emptyTitle}>Your live workspace is empty</Text>
            <Text style={styles.emptyText}>Create a trip above, then add travel, lodging, plans, tickets, and guests.</Text>
          </Card>
        ) : null}
      </View>

      <Card style={styles.emptyCard}>
        <MaterialCommunityIcons color={theme.colors.moss} name="postage-stamp" size={38} />
        <View style={styles.emptyCopy}>
          <Text style={styles.emptyTitle}>Past trips will live here</Text>
          <Text style={styles.emptyText}>A searchable memory of plans, places, clips, and shared costs.</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.md, justifyContent: 'space-between' },
  headerCopy: { flex: 1, gap: theme.spacing.sm },
  section: { gap: theme.spacing.md },
  sectionLabel: { color: theme.colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  tripCard: { padding: 0, overflow: 'hidden' },
  cover: { alignItems: 'flex-start', backgroundColor: theme.colors.forest, height: 170, justifyContent: 'flex-start', overflow: 'hidden', padding: theme.spacing.lg },
  tripCopy: { gap: 5, padding: theme.spacing.lg },
  tripTitle: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 25, fontWeight: '800' },
  tripLocation: { color: theme.colors.muted, fontSize: 13 },
  metaRow: { flexDirection: 'row', gap: theme.spacing.lg, marginTop: 10 },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  metaText: { color: theme.colors.muted, fontSize: 12, fontWeight: '600' },
  emptyCard: { alignItems: 'center', backgroundColor: theme.colors.sand, flexDirection: 'row', gap: theme.spacing.lg },
  emptyCopy: { flex: 1 },
  emptyTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' },
  emptyText: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  emptyLiveCard: { backgroundColor: theme.colors.sage },
  errorCard: { alignItems: 'flex-start', backgroundColor: theme.colors.coralSoft, flexDirection: 'row', gap: theme.spacing.md },
  errorCopy: { flex: 1 },
  errorTitle: { color: theme.colors.danger, fontSize: 14, fontWeight: '800' },
  errorText: { color: theme.colors.ink, fontSize: 12, lineHeight: 17, marginTop: 3 },
  pressed: { opacity: 0.78 },
});
