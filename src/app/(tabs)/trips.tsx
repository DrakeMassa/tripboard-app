import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, Eyebrow, Heading, Pill, PreviewNotice, Screen } from '@/components/design';
import { theme } from '@/constants/theme';
import { previewTrip } from '@/data/preview';

export default function TripsScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Eyebrow>YOUR TRIPS</Eyebrow>
          <Heading>Where to next?</Heading>
        </View>
        <PreviewNotice />
      </View>

      <ActionButton icon="plus" label="Create a trip" />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>UPCOMING</Text>
        <Pressable
          onPress={() => router.push(`/trips/${previewTrip.id}`)}
          style={({ pressed }) => pressed && styles.pressed}>
          <Card style={styles.tripCard}>
            <View style={styles.cover}>
              <View style={styles.coverOrb} />
              <Pill tone="white">{previewTrip.daysUntil} DAYS AWAY</Pill>
              <MaterialCommunityIcons color={theme.colors.sage} name="map-marker-radius-outline" size={72} />
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
  cover: { alignItems: 'flex-end', backgroundColor: theme.colors.forest, flexDirection: 'row', height: 150, justifyContent: 'space-between', overflow: 'hidden', padding: theme.spacing.lg },
  coverOrb: { backgroundColor: theme.colors.forestSoft, borderRadius: 120, height: 210, position: 'absolute', right: -42, top: -86, width: 210 },
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
  pressed: { opacity: 0.78 },
});
