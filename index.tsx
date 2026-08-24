import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Avatar,
  Card,
  Eyebrow,
  Heading,
  Pill,
  PreviewNotice,
  RoundIcon,
  Screen,
  SectionTitle,
} from '@/components/design';
import { theme } from '@/constants/theme';
import { previewTrip } from '@/data/preview';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.brandRow}>
        <View>
          <Text style={styles.wordmark}>wanderly</Text>
          <Text style={styles.tagline}>TRIPS, TOGETHER</Text>
        </View>
        <PreviewNotice />
      </View>

      <View style={styles.intro}>
        <Eyebrow>GOOD MORNING, DRAKE</Eyebrow>
        <Heading>Your whole trip,{`\n`}one calm place.</Heading>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/trips/${previewTrip.id}`)}
        style={({ pressed }) => [styles.hero, pressed && styles.pressed]}>
        <View style={styles.heroGlow} />
        <View style={styles.heroTop}>
          <Pill tone="white">NEXT TRIP · {previewTrip.daysUntil} DAYS</Pill>
          <MaterialCommunityIcons color={theme.colors.white} name="arrow-top-right" size={22} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{previewTrip.title}</Text>
          <Text style={styles.heroLocation}>{previewTrip.location}</Text>
          <Text style={styles.heroDates}>{previewTrip.dateRange}</Text>
        </View>
        <View style={styles.heroFooter}>
          <View style={styles.avatarRow}>
            <Avatar initials="DM" />
            <Avatar initials="CL" offset />
            <Avatar initials="MY" offset />
            <Avatar initials="+3" offset />
          </View>
          <Text style={styles.heroPeople}>{previewTrip.travelerCount} travelers</Text>
        </View>
      </Pressable>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <RoundIcon name="airplane-landing" />
          <Text style={styles.statValue}>9:40 AM</Text>
          <Text style={styles.statLabel}>First arrival</Text>
        </Card>
        <Card style={styles.statCard}>
          <RoundIcon backgroundColor={theme.colors.coralSoft} color={theme.colors.coral} name="home-city-outline" />
          <Text style={styles.statValue}>Casa Oliva</Text>
          <Text style={styles.statLabel}>Stay confirmed</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle action="All arrivals">Who lands when</SectionTitle>
        <Card style={styles.arrivalCard}>
          {previewTrip.arrivals.map((arrival, index) => (
            <View
              key={arrival.id}
              style={[styles.arrivalRow, index > 0 && styles.rowDivider]}>
              <Avatar initials={arrival.initials} />
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{arrival.name}</Text>
                <Text style={styles.rowDetail}>{arrival.route}</Text>
              </View>
              <View style={styles.arrivalTime}>
                <Text style={styles.rowTitle}>{arrival.arrivalTime}</Text>
                <Text style={styles.statusText}>{arrival.status === 'on-time' ? 'On time' : 'Later'}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle action="Full itinerary">Arrival day</SectionTitle>
        <Card>
          {previewTrip.itinerary.map((item, index) => (
            <View key={item.id} style={styles.planRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.planTime}>{item.time}</Text>
                {index < previewTrip.itinerary.length - 1 ? <View style={styles.timeline} /> : null}
              </View>
              <RoundIcon
                backgroundColor={item.category === 'food' ? theme.colors.coralSoft : theme.colors.sage}
                color={item.category === 'food' ? theme.colors.coral : theme.colors.forest}
                name={
                  item.category === 'food'
                    ? 'silverware-fork-knife'
                    : item.category === 'stay'
                      ? 'bed-king-outline'
                      : 'airplane'
                }
                size={18}
              />
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowDetail}>{item.detail}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.assistantCard}>
        <RoundIcon backgroundColor="rgba(255,255,255,0.13)" color={theme.colors.white} name="creation-outline" />
        <View style={styles.flex}>
          <Text style={styles.assistantTitle}>Ask Wanderly</Text>
          <Text style={styles.assistantCopy}>“When does Clay arrive in Rome?”</Text>
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
  assistantCard: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.lg, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.lg },
  assistantTitle: { color: theme.colors.white, fontSize: 15, fontWeight: '800' },
  assistantCopy: { color: theme.colors.sage, fontSize: 12, marginTop: 3 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
});
