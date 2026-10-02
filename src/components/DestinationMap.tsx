import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { GuideRecommendation } from '@/data/destination-guides';

function mapUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function DestinationMap({
  destination,
  items,
  onSelect,
  selectedId,
}: {
  destination: string;
  items: GuideRecommendation[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  if (!selected) return null;
  const query = `${selected.name}, ${destination}`;

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons color={theme.colors.white} name="google-maps" size={28} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.title}>Explore {destination}</Text>
        <Text style={styles.copy}>Choose a place, then open the live Google map for reviews, hours, photos, and directions.</Text>
        <View style={styles.pins}>
          {items.map((item) => (
            <Pressable key={item.id} onPress={() => onSelect(item.id)} style={[styles.pin, item.id === selected.id && styles.pinSelected]}>
              <Text style={[styles.pinText, item.id === selected.id && styles.pinTextSelected]}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(mapUrl(query))} style={styles.button}>
          <Text style={styles.buttonText}>Open {selected.name} in Google Maps</Text>
          <MaterialCommunityIcons color={theme.colors.white} name="open-in-new" size={15} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'flex-start', backgroundColor: theme.colors.sage, borderColor: theme.colors.line, borderRadius: theme.radius.lg, borderWidth: 1, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.lg },
  iconBox: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.md, height: 48, justifyContent: 'center', width: 48 },
  flex: { flex: 1 },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 18, fontWeight: '800' },
  copy: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  pins: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: theme.spacing.md },
  pin: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.pill, paddingHorizontal: 9, paddingVertical: 7 },
  pinSelected: { backgroundColor: theme.colors.coral },
  pinText: { color: theme.colors.forest, fontSize: 9, fontWeight: '800' },
  pinTextSelected: { color: theme.colors.white },
  button: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: theme.colors.forest, borderRadius: theme.radius.pill, flexDirection: 'row', gap: 6, marginTop: theme.spacing.md, paddingHorizontal: 13, paddingVertical: 10 },
  buttonText: { color: theme.colors.white, fontSize: 10, fontWeight: '900' },
});
