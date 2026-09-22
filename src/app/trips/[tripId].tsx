import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { ActionButton, Avatar, Card, Pill, PreviewNotice, RoundIcon, Screen, SectionTitle } from '@/components/design';
import { TripResources } from '@/components/TripResources';
import { theme } from '@/constants/theme';
import { getTrip, LiveTrip } from '@/data/live';
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

function getDaysUntil(startDate: string | null): number | null {
  if (!startDate) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.max(0, Math.ceil((Date.parse(`${startDate}T00:00:00Z`) - todayUtc) / 86_400_000));
}

export default function TripDetailScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { isLoading: isAuthLoading, user } = useAuth();
  const isPreview = tripId === previewTrip.id;
  const [liveTrip, setLiveTrip] = useState<LiveTrip | null>(null);
  const [isLoading, setIsLoading] = useState(!isPreview);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPreview || !tripId || !user) {
      void Promise.resolve().then(() => setIsLoading(false));
      return;
    }

    let isMounted = true;
    void Promise.resolve().then(async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);
      try {
        const trip = await getTrip(tripId);
        if (isMounted) setLiveTrip(trip);
      } catch (cause) {
        if (isMounted) setError(cause instanceof Error ? cause.message : 'Could not load this trip.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isPreview, tripId, user]);

  if (!isPreview && (isAuthLoading || isLoading)) {
    return (
      <Screen>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons color={theme.colors.forest} name="arrow-left" size={22} />
          </Pressable>
          <PreviewNotice label="LIVE TRIP" />
          <View style={styles.backButton} />
        </View>
        <Card style={styles.centerCard}>
          <ActivityIndicator color={theme.colors.forest} />
          <Text style={styles.itemMeta}>Loading your private trip…</Text>
        </Card>
      </Screen>
    );
  }

  if (!isPreview && (!user || error || !liveTrip)) {
    return (
      <Screen>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons color={theme.colors.forest} name="arrow-left" size={22} />
          </Pressable>
          <PreviewNotice label="LIVE TRIP" />
          <View style={styles.backButton} />
        </View>
        <Card style={styles.centerCard}>
          <MaterialCommunityIcons color={theme.colors.coral} name="lock-outline" size={30} />
          <Text style={styles.itemTitle}>{user ? 'Trip unavailable' : 'Sign in to open this trip'}</Text>
          <Text style={styles.itemMeta}>
            {error ?? 'Live trip details are visible only to authenticated trip members.'}
          </Text>
          {!user ? (
            <ActionButton icon="login" label="Go to sign in" onPress={() => router.push('/profile')} />
          ) : null}
        </Card>
      </Screen>
    );
  }

  const tripTitle = isPreview ? previewTrip.title : liveTrip!.title;
  const tripLocation = isPreview
    ? previewTrip.location
    : liveTrip!.location ?? 'Location to be added';
  const tripDateRange = isPreview
    ? previewTrip.dateRange
    : formatDateRange(liveTrip!.startDate, liveTrip!.endDate);
  const countdown = isPreview ? previewTrip.daysUntil : getDaysUntil(liveTrip!.startDate);

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons color={theme.colors.forest} name="arrow-left" size={22} />
        </Pressable>
        <PreviewNotice label={isPreview ? 'PRODUCT PREVIEW' : 'LIVE TRIP'} />
        <Pressable accessibilityLabel="Trip settings" style={styles.backButton}>
          <MaterialCommunityIcons color={theme.colors.forest} name="dots-horizontal" size={22} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroOrb} />
        <Pill tone="white">{countdown === null ? 'DATES PENDING' : `${countdown} DAYS AWAY`}</Pill>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{tripTitle}</Text>
          <Text style={styles.heroLocation}>{tripLocation}</Text>
          <Text style={styles.heroDates}>{tripDateRange}</Text>
        </View>
        <View style={styles.heroActions}>
          <View style={styles.avatarRow}>
            <Avatar initials="DM" />
            <Avatar initials="+2" offset />
          </View>
          <ActionButton icon="account-plus-outline" label={isPreview ? 'Invite' : 'Invites next'} />
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <RoundIcon name="airplane-landing" />
          <Text style={styles.summaryValue}>Travel to add</Text>
          <Text style={styles.summaryLabel}>Arrival and return</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <RoundIcon backgroundColor={theme.colors.coralSoft} color={theme.colors.coral} name="ticket-confirmation-outline" />
          <Text style={styles.summaryValue}>{isPreview ? 'Tickets to link' : 'Trip essentials'}</Text>
          <Text style={styles.summaryLabel}>{isPreview ? 'Game and parking' : 'Tickets, files, and links'}</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle action="Add travel">Arrival board</SectionTitle>
        <Card style={styles.flatCard}>
          {isPreview
            ? previewTrip.arrivals.map((arrival, index) => (
                <View key={arrival.id} style={[styles.arrivalRow, index > 0 && styles.divider]}>
                  <View style={styles.routeIcon}>
                    <MaterialCommunityIcons color={theme.colors.forest} name="airplane" size={18} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.itemTitle}>{arrival.name}</Text>
                    <Text style={styles.itemMeta}>{arrival.route}</Text>
                  </View>
                  <View style={styles.rightCopy}>
                    <Text style={styles.itemTitle}>{arrival.arrivalTime}</Text>
                    <Text style={styles.pendingText}>
                      {arrival.status === 'missing' ? 'ADD DETAILS' : 'PLANNED'}
                    </Text>
                  </View>
                </View>
              ))
            : null}
          <View style={[styles.arrivalRow, isPreview && styles.divider]}>
            <View style={[styles.routeIcon, styles.missingIcon]}>
              <MaterialCommunityIcons color={theme.colors.muted} name="plus" size={18} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.itemTitle}>
                {isPreview ? '3 travelers need travel details' : 'No live travel details yet'}
              </Text>
              <Text style={styles.itemMeta}>
                {isPreview ? 'Add arrival and return plans for the group' : 'Travel entry is the next pilot step'}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle action="See all days">Columbia plan</SectionTitle>
        <Card>
          {isPreview ? (
            previewTrip.itinerary.map((item, index) => (
              <View key={item.id} style={styles.planRow}>
                <View style={styles.planTimeColumn}>
                  <Text style={styles.planTime}>{item.time}</Text>
                  {index < previewTrip.itinerary.length - 1 ? <View style={styles.timeline} /> : null}
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>{item.detail}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyPlan}>
              <MaterialCommunityIcons color={theme.colors.moss} name="calendar-plus" size={28} />
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>No live itinerary items yet</Text>
                <Text style={styles.itemMeta}>Game-day and other itinerary editing comes after essentials.</Text>
              </View>
            </View>
          )}
        </Card>
      </View>

      <TripResources
        previewResources={isPreview ? previewTrip.resources : undefined}
        tripId={tripId}
      />

      <Card style={styles.stayCard}>
        <RoundIcon backgroundColor={theme.colors.forest} color={theme.colors.white} name="bed-king-outline" />
        <View style={styles.flex}>
          <Text style={styles.itemTitle}>Lodging</Text>
          <Text style={styles.itemMeta}>Add address and check-in details</Text>
        </View>
        <MaterialCommunityIcons color={theme.colors.forest} name="chevron-right" size={22} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  backButton: { alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderRadius: theme.radius.pill, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  centerCard: { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xxl },
  hero: { backgroundColor: theme.colors.forest, borderRadius: 28, minHeight: 280, overflow: 'hidden', padding: theme.spacing.xl },
  heroOrb: { backgroundColor: theme.colors.forestSoft, borderRadius: 160, height: 300, position: 'absolute', right: -100, top: -120, width: 300 },
  heroCopy: { flex: 1, justifyContent: 'center' },
  heroTitle: { color: theme.colors.white, fontFamily: 'serif', fontSize: 34, fontWeight: '800' },
  heroLocation: { color: theme.colors.sage, fontSize: 14, marginTop: 5 },
  heroDates: { color: theme.colors.white, fontSize: 13, fontWeight: '700', marginTop: 14 },
  heroActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  avatarRow: { flexDirection: 'row' },
  summaryGrid: { flexDirection: 'row', gap: theme.spacing.md },
  summaryCard: { flex: 1, gap: theme.spacing.sm },
  summaryValue: { color: theme.colors.ink, fontSize: 15, fontWeight: '800', marginTop: 3 },
  summaryLabel: { color: theme.colors.muted, fontSize: 11 },
  section: { gap: theme.spacing.md },
  flatCard: { paddingVertical: 4 },
  arrivalRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md, paddingVertical: 14 },
  divider: { borderTopColor: theme.colors.line, borderTopWidth: 1 },
  routeIcon: { alignItems: 'center', backgroundColor: theme.colors.sage, borderRadius: theme.radius.md, height: 38, justifyContent: 'center', width: 38 },
  missingIcon: { backgroundColor: theme.colors.sand },
  flex: { flex: 1 },
  rightCopy: { alignItems: 'flex-end' },
  itemTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '800' },
  itemMeta: { color: theme.colors.muted, fontSize: 12, marginTop: 3 },
  pendingText: { color: theme.colors.coral, fontSize: 9, fontWeight: '900', marginTop: 3 },
  planRow: { flexDirection: 'row', gap: theme.spacing.md, minHeight: 76 },
  planTimeColumn: { alignItems: 'center', width: 64 },
  planTime: { color: theme.colors.muted, fontSize: 11, fontWeight: '700' },
  timeline: { backgroundColor: theme.colors.line, flex: 1, marginTop: 8, width: 1 },
  emptyPlan: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  stayCard: { alignItems: 'center', backgroundColor: theme.colors.sage, flexDirection: 'row', gap: theme.spacing.md },
});
