import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Pill } from '@/components/design';
import { theme } from '@/constants/theme';
import { getItineraryAirports } from '@/data/airports';
import { LiveTravelSegment } from '@/data/live';

export function AirportMap({ travel }: { travel: LiveTravelSegment[] }) {
  const airports = getItineraryAirports(travel);
  if (!airports.length) return null;

  return (
    <View style={styles.shell}>
      <Text style={styles.eyebrow}>YOUR AIRPORTS · SWIPE TO EXPLORE</Text>
      <ScrollView contentContainerStyle={styles.pages} horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {airports.map((airport) => (
          <View key={airport.code} style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.icon}>
                <MaterialCommunityIcons color={theme.colors.white} name="airport" size={25} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.title}>{airport.code} · {airport.name}</Text>
                <Text style={styles.city}>{airport.city}</Text>
              </View>
              {airport.isLayover ? <Pill tone="coral">LAYOVER FIRST</Pill> : null}
            </View>
            <Text style={styles.copy}>{airport.summary}</Text>
            <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(airport.officialMapUrl)} style={styles.button}>
              <Text style={styles.buttonText}>Open official airport map</Text>
              <MaterialCommunityIcons color={theme.colors.white} name="open-in-new" size={15} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { gap: theme.spacing.sm },
  eyebrow: { color: theme.colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  pages: { gap: theme.spacing.md },
  card: { backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderRadius: theme.radius.md, borderWidth: 1, gap: theme.spacing.md, padding: theme.spacing.md, width: 310 },
  topRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  icon: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.md, height: 44, justifyContent: 'center', width: 44 },
  flex: { flex: 1 },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 15, fontWeight: '800' },
  city: { color: theme.colors.muted, fontSize: 9, marginTop: 3 },
  copy: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
  button: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: theme.colors.forest, borderRadius: theme.radius.pill, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 9 },
  buttonText: { color: theme.colors.white, fontSize: 10, fontWeight: '900' },
});
