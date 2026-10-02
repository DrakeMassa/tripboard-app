import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AirportMap } from '@/components/AirportMap';
import { Card, Pill } from '@/components/design';
import { theme } from '@/constants/theme';
import { LiveTravelSegment } from '@/data/live';
import { formatDuration, getLayoverMinutes } from '@/domain/travel-itinerary';

const priorityPassUrl = 'https://www.prioritypass.com/lounges/usa/charlotte-douglas-international/clt12-the-club-clt';
const cltMapUrl = 'https://www.cltairport.com/airport-info/airport-maps/';

export function AirportLoungeGuide({ travel }: { travel: LiveTravelSegment[] }) {
  const sorted = [...travel].sort((a, b) => a.departsAt.localeCompare(b.departsAt));
  const arrivingIndex = sorted.findIndex(
    (item, index) => item.arrivalPlace.trim().toUpperCase() === 'CLT' && sorted[index + 1]?.departurePlace.trim().toUpperCase() === 'CLT',
  );
  if (!sorted.some((item) => item.kind === 'flight')) return null;

  const hasCltConnection = arrivingIndex >= 0;
  const layover = hasCltConnection ? getLayoverMinutes(sorted[arrivingIndex], sorted[arrivingIndex + 1]) : null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons color={theme.colors.forest} name="sofa-single-outline" size={22} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>AIRPORT GUIDE</Text>
          <Text style={styles.title}>Maps for every airport in this trip</Text>
        </View>
        {layover !== null ? <Pill tone="coral">{formatDuration(layover)}</Pill> : null}
      </View>
      <AirportMap travel={sorted} />
      {hasCltConnection ? (
        <>
          <Text style={styles.copy}>
            CLT lounge note: The Club CLT is in Concourse A near gates A21–A22. Venture X cardholders should check that Priority Pass enrollment is active; access, guests, hours, and capacity can change.
          </Text>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons color={theme.colors.forestSoft} name="credit-card-check-outline" size={18} />
            <Text style={styles.statusText}>Card-aware guidance is a reminder, not an access guarantee. Verify the live membership screen before walking over.</Text>
          </View>
          <View style={styles.actions}>
            <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(priorityPassUrl)} style={styles.linkButton}>
              <Text style={styles.linkText}>Check live lounge access</Text>
              <MaterialCommunityIcons color={theme.colors.forest} name="open-in-new" size={15} />
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(cltMapUrl)} style={styles.linkButton}>
              <Text style={styles.linkText}>CLT wayfinding</Text>
              <MaterialCommunityIcons color={theme.colors.forest} name="map-outline" size={15} />
            </Pressable>
          </View>
          <Text style={styles.disclaimer}>Benefits and lounge admission can change. Wanderly never treats a card on file as proof of entry.</Text>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.sage, gap: theme.spacing.md },
  header: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  iconBox: { alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.radius.md, height: 42, justifyContent: 'center', width: 42 },
  flex: { flex: 1 },
  eyebrow: { color: theme.colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 18, fontWeight: '800', marginTop: 2 },
  copy: { color: theme.colors.ink, fontSize: 12, lineHeight: 18 },
  statusRow: { alignItems: 'flex-start', backgroundColor: theme.colors.white, borderRadius: theme.radius.sm, flexDirection: 'row', gap: 8, padding: theme.spacing.sm },
  statusText: { color: theme.colors.muted, flex: 1, fontSize: 10, lineHeight: 15 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  linkButton: { alignItems: 'center', backgroundColor: theme.colors.white, borderColor: theme.colors.line, borderRadius: theme.radius.pill, borderWidth: 1, flexDirection: 'row', gap: 6, minHeight: 38, paddingHorizontal: theme.spacing.md },
  linkText: { color: theme.colors.forest, fontSize: 11, fontWeight: '800' },
  disclaimer: { color: theme.colors.muted, fontSize: 9, lineHeight: 13 },
});
