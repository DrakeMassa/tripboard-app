import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { ActionButton, Avatar, Card, Pill, PreviewNotice, RoundIcon, Screen } from '@/components/design';
import { DestinationBackdrop } from '@/components/DestinationBackdrop';
import { DestinationGuide } from '@/components/DestinationGuide';
import { TripDetailsEditor } from '@/components/TripDetailsEditor';
import { TripInvitation } from '@/components/TripInvitation';
import { TripPlanManager } from '@/components/TripPlanManager';
import { TripResources } from '@/components/TripResources';
import { theme } from '@/constants/theme';
import { getTrip, LiveTrip } from '@/data/live';

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
  const [liveTrip, setLiveTrip] = useState<LiveTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openTravelRequest, setOpenTravelRequest] = useState(0);
  const [openEssentialsRequest, setOpenEssentialsRequest] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const travelOffset = useRef(0);
  const essentialsOffset = useRef(0);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  const scrollTo = (offset: number) => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ animated: true, y: Math.max(0, offset - 12) }));
  };
  const openTravel = () => {
    setOpenTravelRequest((current) => current + 1);
    scrollTo(travelOffset.current);
  };
  const openEssentials = () => {
    setOpenEssentialsRequest((current) => current + 1);
    scrollTo(essentialsOffset.current);
  };

  useEffect(() => {
    if (!tripId || !user) {
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
  }, [tripId, user]);

  if (isAuthLoading || isLoading) {
    return (
      <Screen scrollRef={scrollRef}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" onPress={goBack} style={styles.backButton}>
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

  if (!user || error || !liveTrip) {
    return (
      <Screen scrollRef={scrollRef}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" onPress={goBack} style={styles.backButton}>
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
            <ActionButton
              icon="login"
              label="Go to sign in"
              onPress={() =>
                router.push({ pathname: '/profile', params: { redirect: `/trips/${tripId}` } })
              }
            />
          ) : null}
        </Card>
      </Screen>
    );
  }

  const tripTitle = liveTrip.title;
  const tripLocation = liveTrip.location ?? 'Location to be added';
  const tripDateRange = formatDateRange(liveTrip.startDate, liveTrip.endDate);
  const countdown = getDaysUntil(liveTrip.startDate);

  return (
    <Screen scrollRef={scrollRef}>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Go back" onPress={goBack} style={styles.backButton}>
          <MaterialCommunityIcons color={theme.colors.forest} name="arrow-left" size={22} />
        </Pressable>
        <PreviewNotice label="LIVE TRIP" />
        <Pressable
          accessibilityLabel="Edit trip details"
          onPress={() => setIsEditingTrip((current) => !current)}
          style={styles.backButton}>
          <MaterialCommunityIcons color={theme.colors.forest} name="dots-horizontal" size={22} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <DestinationBackdrop location={tripLocation} title={tripTitle} />
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
          <ActionButton
            icon="account-plus-outline"
            label="Invite traveler"
            onPress={() => setIsInviting((current) => !current)}
          />
        </View>
      </View>

      {isInviting ? (
        <TripInvitation
          onClose={() => setIsInviting(false)}
          tripId={tripId}
          tripTitle={tripTitle}
        />
      ) : null}

      {isEditingTrip ? (
        <TripDetailsEditor
          onCancel={() => setIsEditingTrip(false)}
          onSaved={(saved) => {
            setLiveTrip(saved);
            setIsEditingTrip(false);
          }}
          trip={liveTrip}
        />
      ) : null}

      {liveTrip.description ? (
        <Card style={styles.tripNoteCard}>
          <View style={styles.tripNoteIcon}>
            <MaterialCommunityIcons color={theme.colors.forest} name="notebook-edit-outline" size={22} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.tripNoteLabel}>TRIP NOTE</Text>
            <Text style={styles.tripNoteText}>{liveTrip.description}</Text>
          </View>
          <Pressable
            accessibilityLabel="Edit trip note"
            accessibilityRole="button"
            onPress={() => setIsEditingTrip(true)}
            style={styles.noteEditButton}>
            <MaterialCommunityIcons color={theme.colors.forest} name="pencil-outline" size={17} />
            <Text style={styles.noteEditText}>Edit</Text>
          </Pressable>
        </Card>
      ) : null}

      <View style={styles.summaryGrid}>
        <Pressable
          accessibilityHint="Opens the itinerary importer"
          accessibilityRole="button"
          onPress={openTravel}
          style={({ pressed }) => [styles.summaryPressable, pressed && styles.pressed]}>
          <Card style={styles.summaryCard}>
            <RoundIcon name="airplane-landing" />
            <Text style={styles.summaryValue}>Travel details</Text>
            <Text style={styles.summaryLabel}>Tap to import, add, or edit flights and connections</Text>
            <MaterialCommunityIcons color={theme.colors.forest} name="chevron-right" size={20} style={styles.summaryChevron} />
          </Card>
        </Pressable>
        <Pressable
          accessibilityHint="Opens tickets, boarding passes, files, and links"
          accessibilityRole="button"
          onPress={openEssentials}
          style={({ pressed }) => [styles.summaryPressable, pressed && styles.pressed]}>
          <Card style={styles.summaryCard}>
            <RoundIcon backgroundColor={theme.colors.coralSoft} color={theme.colors.coral} name="ticket-confirmation-outline" />
            <Text style={styles.summaryValue}>Trip essentials</Text>
            <Text style={styles.summaryLabel}>Tap for tickets, boarding passes, and links</Text>
            <MaterialCommunityIcons color={theme.colors.forest} name="chevron-right" size={20} style={styles.summaryChevron} />
          </Card>
        </Pressable>
      </View>

      <View onLayout={(event) => { travelOffset.current = event.nativeEvent.layout.y; }}>
        <TripPlanManager
          initialTravelOpen={openTravelRequest > 0}
          key={`travel-${openTravelRequest}`}
          onOpenEssentials={openEssentials}
          tripId={tripId}
          tripLocation={liveTrip.location}
        />
      </View>

      <View onLayout={(event) => { essentialsOffset.current = event.nativeEvent.layout.y; }}>
        <TripResources
          initialOpen={openEssentialsRequest > 0}
          key={`essentials-${openEssentialsRequest}`}
          tripId={tripId}
        />
      </View>

      <DestinationGuide location={liveTrip.location} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  backButton: { alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderRadius: theme.radius.pill, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  centerCard: { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xxl },
  hero: { backgroundColor: theme.colors.forest, borderRadius: 28, minHeight: 320, overflow: 'hidden', padding: theme.spacing.xl },
  heroCopy: { flex: 1, justifyContent: 'center' },
  heroTitle: { color: theme.colors.white, fontFamily: 'serif', fontSize: 34, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 8 },
  heroLocation: { color: theme.colors.white, fontSize: 14, fontWeight: '700', marginTop: 5, textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 6 },
  heroDates: { color: theme.colors.white, fontSize: 13, fontWeight: '700', marginTop: 14, textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 6 },
  heroActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  avatarRow: { flexDirection: 'row' },
  summaryGrid: { flexDirection: 'row', gap: theme.spacing.md },
  summaryPressable: { flex: 1 },
  summaryCard: { flex: 1, gap: theme.spacing.sm, minHeight: 164, position: 'relative' },
  summaryChevron: { position: 'absolute', right: theme.spacing.md, top: theme.spacing.md },
  summaryValue: { color: theme.colors.ink, fontSize: 15, fontWeight: '800', marginTop: 3 },
  summaryLabel: { color: theme.colors.muted, fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.72 },
  tripNoteCard: { alignItems: 'flex-start', backgroundColor: theme.colors.sage, flexDirection: 'row', gap: theme.spacing.md },
  tripNoteIcon: { alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.radius.md, height: 42, justifyContent: 'center', width: 42 },
  tripNoteLabel: { color: theme.colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  tripNoteText: { color: theme.colors.ink, fontSize: 13, lineHeight: 19, marginTop: 4 },
  noteEditButton: { alignItems: 'center', borderColor: theme.colors.line, borderRadius: theme.radius.pill, borderWidth: 1, flexDirection: 'row', gap: 5, minHeight: 36, paddingHorizontal: 10 },
  noteEditText: { color: theme.colors.forest, fontSize: 10, fontWeight: '900' },
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
