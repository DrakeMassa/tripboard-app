import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import {
  ActionButton,
  Avatar,
  Card,
  Eyebrow,
  Heading,
  Pill,
  PreviewNotice,
  RoundIcon,
  Screen,
} from '@/components/design';
import { DestinationBackdrop } from '@/components/DestinationBackdrop';
import { theme } from '@/constants/theme';
import { listTrips, LiveTrip } from '@/data/live';

function formatDateRange(trip: LiveTrip): string {
  if (!trip.startDate) return 'Dates to be added';
  const format = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00Z`));
  if (!trip.endDate || trip.endDate === trip.startDate) return format(trip.startDate);
  return `${format(trip.startDate)} – ${format(trip.endDate)}`;
}

function getDaysUntil(startDate: string | null): number | null {
  if (!startDate) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.max(0, Math.ceil((Date.parse(`${startDate}T00:00:00Z`) - todayUtc) / 86_400_000));
}

export default function HomeScreen() {
  const router = useRouter();
  const { isLoading: isAuthLoading, user } = useAuth();
  const [liveTrip, setLiveTrip] = useState<LiveTrip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      void Promise.resolve().then(() => setLiveTrip(null));
      return;
    }

    let isMounted = true;
    void Promise.resolve().then(async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);
      try {
        const trips = await listTrips();
        if (isMounted) setLiveTrip(trips[0] ?? null);
      } catch (cause) {
        if (isMounted) {
          setLiveTrip(null);
          setError(cause instanceof Error ? cause.message : 'Could not load your trips.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (isAuthLoading) {
    return (
      <Screen>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.wordmark}>wanderly</Text>
            <Text style={styles.tagline}>TRIPS, TOGETHER</Text>
          </View>
          <PreviewNotice label="CHECKING SESSION" />
        </View>
        <Card style={styles.stateCard}>
          <ActivityIndicator color={theme.colors.forest} />
          <Text style={styles.rowDetail}>Opening your private workspace…</Text>
        </Card>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.wordmark}>wanderly</Text>
            <Text style={styles.tagline}>TRIPS, TOGETHER</Text>
          </View>
          <PreviewNotice label="SIGN-IN REQUIRED" />
        </View>
        <View style={styles.intro}>
          <Eyebrow>YOUR PRIVATE TRIP WORKSPACE</Eyebrow>
          <Heading>Your whole trip,{`\n`}one calm place.</Heading>
        </View>
        <Card style={styles.signInCard}>
          <RoundIcon backgroundColor={theme.colors.forest} color={theme.colors.white} name="lock-outline" />
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>Sign in to open the real Columbia trip</Text>
            <Text style={styles.rowDetail}>
              Wanderly no longer substitutes a read-only sample trip. Once signed in, every button here works against your private Supabase workspace.
            </Text>
          </View>
          <ActionButton icon="login" label="Sign in" onPress={() => router.push('/profile')} />
        </Card>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <Card style={styles.stateCard}>
          <ActivityIndicator color={theme.colors.forest} />
          <Text style={styles.rowDetail}>Loading your trips…</Text>
        </Card>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <Card style={styles.errorCard}>
          <MaterialCommunityIcons color={theme.colors.coral} name="alert-circle-outline" size={28} />
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>Your live trips did not load</Text>
            <Text style={styles.rowDetail}>{error}</Text>
          </View>
          <ActionButton label="Open trips" onPress={() => router.push('/trips')} />
        </Card>
      </Screen>
    );
  }

  if (!liveTrip) {
    return (
      <Screen>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.wordmark}>wanderly</Text>
            <Text style={styles.tagline}>TRIPS, TOGETHER</Text>
          </View>
          <PreviewNotice label="LIVE WORKSPACE" />
        </View>
        <View style={styles.intro}>
          <Eyebrow>WELCOME, DRAKE</Eyebrow>
          <Heading>Let’s make the first trip real.</Heading>
        </View>
        <Card style={styles.signInCard}>
          <RoundIcon name="bag-suitcase-outline" />
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>No live trip exists for this account yet</Text>
            <Text style={styles.rowDetail}>Create Columbia game weekend, then add travel, lodging, plans, tickets, and guests.</Text>
          </View>
          <ActionButton icon="plus" label="Create trip" onPress={() => router.push('/trips')} />
        </Card>
      </Screen>
    );
  }

  const tripId = liveTrip.id;
  const tripTitle = liveTrip.title;
  const tripLocation = liveTrip.location ?? 'Location to be added';
  const tripDateRange = formatDateRange(liveTrip);
  const countdown = getDaysUntil(liveTrip.startDate);

  return (
    <Screen>
      <View style={styles.brandRow}>
        <View>
          <Text style={styles.wordmark}>wanderly</Text>
          <Text style={styles.tagline}>TRIPS, TOGETHER</Text>
        </View>
        <PreviewNotice label="LIVE WORKSPACE" />
      </View>

      <View style={styles.intro}>
        <Eyebrow>GOOD MORNING, DRAKE</Eyebrow>
        <Heading>Your whole trip,{`\n`}one calm place.</Heading>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/trips/${tripId}`)}
        style={({ pressed }) => [styles.hero, pressed && styles.pressed]}>
        <DestinationBackdrop location={tripLocation} title={tripTitle} />
        <View style={styles.heroTop}>
          <Pill tone="white">
            {countdown === null ? 'NEXT TRIP · DATES PENDING' : `NEXT TRIP · ${countdown} DAYS`}
          </Pill>
          <MaterialCommunityIcons color={theme.colors.white} name="arrow-top-right" size={22} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{tripTitle}</Text>
          <Text style={styles.heroLocation}>{tripLocation}</Text>
          <Text style={styles.heroDates}>{tripDateRange}</Text>
        </View>
        <View style={styles.heroFooter}>
          <View style={styles.avatarRow}>
            <Avatar initials="DM" />
            <Avatar initials="+2" offset />
          </View>
          <Text style={styles.heroPeople}>
            Private pilot
          </Text>
        </View>
      </Pressable>

      <View style={styles.statsRow}>
        <Pressable
          onPress={() => router.push(`/trips/${tripId}`)}
          style={({ pressed }) => [styles.statPressable, pressed && styles.pressed]}>
          <Card style={styles.statCard}>
            <RoundIcon name="airplane-landing" />
            <Text style={styles.statValue}>Manage travel</Text>
            <Text style={styles.statLabel}>Arrival and return</Text>
          </Card>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/trips/${tripId}`)}
          style={({ pressed }) => [styles.statPressable, pressed && styles.pressed]}>
          <Card style={styles.statCard}>
            <RoundIcon backgroundColor={theme.colors.coralSoft} color={theme.colors.coral} name="ticket-confirmation-outline" />
            <Text style={styles.statValue}>Tickets & links</Text>
            <Text style={styles.statLabel}>Open or update</Text>
          </Card>
        </Pressable>
      </View>

      <Card style={styles.liveWorkspaceCard}>
        <RoundIcon backgroundColor={theme.colors.forest} color={theme.colors.white} name="pencil-outline" />
        <View style={styles.flex}>
          <Text style={styles.rowTitle}>Your live trip is ready to edit</Text>
          <Text style={styles.rowDetail}>
            Add or update travel, lodging, daily plans, tickets, parking, confirmations, and album links.
          </Text>
        </View>
        <ActionButton label="Open trip" onPress={() => router.push(`/trips/${tripId}`)} />
      </Card>

      <View style={styles.assistantCard}>
        <RoundIcon backgroundColor="rgba(255,255,255,0.13)" color={theme.colors.white} name="creation-outline" />
        <View style={styles.flex}>
          <Text style={styles.assistantTitle}>Ask Wanderly</Text>
          <Text style={styles.assistantCopy}>“Where are the game tickets?”</Text>
        </View>
        <Pill tone="white">PHASE 3</Pill>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  wordmark: { color: theme.colors.forest, fontFamily: 'serif', fontSize: 24, fontWeight: '800' },
  tagline: { color: theme.colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1.8 },
  intro: { gap: theme.spacing.sm },
  stateCard: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  signInCard: { alignItems: 'center', backgroundColor: theme.colors.sage, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  errorCard: { alignItems: 'center', backgroundColor: theme.colors.coralSoft, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  hero: {
    backgroundColor: theme.colors.forest,
    borderRadius: 28,
    minHeight: 300,
    overflow: 'hidden',
    padding: theme.spacing.xl,
    ...theme.shadow,
  },
  heroGlow: {
    backgroundColor: theme.colors.forestSoft,
    borderRadius: 180,
    height: 290,
    opacity: 0.78,
    position: 'absolute',
    right: -120,
    top: -90,
    width: 290,
  },
  heroTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heroCopy: { flex: 1, justifyContent: 'center' },
  heroTitle: { color: theme.colors.white, fontFamily: 'serif', fontSize: 33, fontWeight: '800' },
  heroLocation: { color: theme.colors.sage, fontSize: 15, marginTop: 6 },
  heroDates: { color: theme.colors.white, fontSize: 14, fontWeight: '700', marginTop: 16 },
  heroFooter: { alignItems: 'center', flexDirection: 'row' },
  avatarRow: { flexDirection: 'row' },
  heroPeople: { color: theme.colors.white, fontSize: 12, fontWeight: '700', marginLeft: 10 },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  statPressable: { flex: 1 },
  statCard: { flex: 1, gap: theme.spacing.sm },
  statValue: { color: theme.colors.ink, fontSize: 16, fontWeight: '800', marginTop: 3 },
  statLabel: { color: theme.colors.muted, fontSize: 12 },
  section: { gap: theme.spacing.md },
  arrivalCard: { paddingVertical: 4 },
  arrivalRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md, paddingVertical: 14 },
  rowDivider: { borderTopColor: theme.colors.line, borderTopWidth: 1 },
  flex: { flex: 1 },
  rowTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '800' },
  rowDetail: { color: theme.colors.muted, fontSize: 12, marginTop: 3 },
  arrivalTime: { alignItems: 'flex-end' },
  statusText: { color: theme.colors.forestSoft, fontSize: 10, fontWeight: '800', marginTop: 3, textTransform: 'uppercase' },
  planRow: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.md, minHeight: 82 },
  timeColumn: { alignItems: 'center', width: 66 },
  planTime: { color: theme.colors.muted, fontSize: 11, fontWeight: '700', paddingTop: 13 },
  timeline: { backgroundColor: theme.colors.line, flex: 1, marginTop: 7, width: 1 },
  liveWorkspaceCard: { alignItems: 'center', backgroundColor: theme.colors.sage, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  assistantCard: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.lg, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.lg },
  assistantTitle: { color: theme.colors.white, fontSize: 15, fontWeight: '800' },
  assistantCopy: { color: theme.colors.sage, fontSize: 12, marginTop: 3 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
});
