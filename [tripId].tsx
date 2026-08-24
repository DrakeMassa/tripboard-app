import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Avatar, Card, Pill, PreviewNotice, RoundIcon, Screen, SectionTitle } from '@/components/design';
import { theme } from '@/constants/theme';
import { previewTrip } from '@/data/preview';

export default function TripDetailScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons color={theme.colors.forest} name="arrow-left" size={22} />
        </Pressable>
        <PreviewNotice label={tripId === previewTrip.id ? 'PRODUCT PREVIEW' : 'TRIP'} />
        <Pressable accessibilityLabel="Trip settings" style={styles.backButton}>
          <MaterialCommunityIcons color={theme.colors.forest} name="dots-horizontal" size={22} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroOrb} />
        <Pill tone="white">{previewTrip.daysUntil} DAYS AWAY</Pill>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{previewTrip.title}</Text>
          <Text style={styles.heroLocation}>{previewTrip.location}</Text>
          <Text style={styles.heroDates}>{previewTrip.dateRange}</Text>
        </View>
        <View style={styles.heroActions}>
          <View style={styles.avatarRow}>
            <Avatar initials="DM" />
            <Avatar initials="CL" offset />
            <Avatar initials="MY" offset />
            <Avatar initials="+3" offset />
          </View>
          <ActionButton icon="account-plus-outline" label="Invite" />
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <RoundIcon name="airplane-landing" />
          <Text style={styles.summaryValue}>2 arrivals</Text>
          <Text style={styles.summaryLabel}>Sep 12 · Rome</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <RoundIcon backgroundColor={theme.colors.coralSoft} color={theme.colors.coral} name="wallet-outline" />
          <Text style={styles.summaryValue}>€128</Text>
          <Text style={styles.summaryLabel}>Your balance</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle action="Add travel">Arrival board</SectionTitle>
        <Card style={styles.flatCard}>
          {previewTrip.arrivals.map((arrival, index) => (
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
                <Text style={styles.onTime}>ON TIME</Text>
              </View>
            </View>
          ))}
          <View style={[styles.arrivalRow, styles.divider]}>
            <View style={[styles.routeIcon, styles.missingIcon]}>
              <MaterialCommunityIcons color={theme.colors.muted} name="plus" size={18} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.itemTitle}>3 travelers need travel details</Text>
              <Text style={styles.itemMeta}>Send them a gentle reminder</Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle action="See all days">Day 1 · Rome</SectionTitle>
        <Card>
          {previewTrip.itinerary.map((item, index) => (
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
          ))}
        </Card>
      </View>

      <Card style={styles.stayCard}>
        <RoundIcon backgroundColor={theme.colors.forest} color={theme.colors.white} name="bed-king-outline" />
        <View style={styles.flex}>
          <Text style={styles.itemTitle}>Casa Oliva</Text>
          <Text style={styles.itemMeta}>Sep 12–15 · 3 nights · Rome</Text>
        </View>
        <MaterialCommunityIcons color={theme.colors.forest} name="chevron-right" size={22} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  backButton: { alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderRadius: theme.radius.pill, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
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
  onTime: { color: theme.colors.forestSoft, fontSize: 9, fontWeight: '900', marginTop: 3 },
  planRow: { flexDirection: 'row', gap: theme.spacing.md, minHeight: 76 },
  planTimeColumn: { alignItems: 'center', width: 64 },
  planTime: { color: theme.colors.muted, fontSize: 11, fontWeight: '700' },
  timeline: { backgroundColor: theme.colors.line, flex: 1, marginTop: 8, width: 1 },
  stayCard: { alignItems: 'center', backgroundColor: theme.colors.sage, flexDirection: 'row', gap: theme.spacing.md },
});
