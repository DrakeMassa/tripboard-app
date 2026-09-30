import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

const interactiveMap = 'https://maps.cltairport.com/';

export function AirportMap({ arrivingFlight, departingFlight }: { arrivingFlight: string; departingFlight: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <MaterialCommunityIcons color={theme.colors.white} name="airport" size={25} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.eyebrow}>CLT CONNECTION MAP</Text>
        <Text style={styles.title}>{arrivingFlight || 'Arrival'} → {departingFlight || 'Departure'}</Text>
        <Text style={styles.copy}>Open CLT’s official multi-level wayfinding map for gates, walk times, food, shops, and lounges.</Text>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(interactiveMap)} style={styles.button}>
          <Text style={styles.buttonText}>Open airport map</Text>
          <MaterialCommunityIcons color={theme.colors.white} name="open-in-new" size={15} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'flex-start', backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderRadius: theme.radius.md, borderWidth: 1, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.md },
  icon: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.md, height: 44, justifyContent: 'center', width: 44 },
  flex: { flex: 1 },
  eyebrow: { color: theme.colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 17, fontWeight: '800', marginTop: 2 },
  copy: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  button: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: theme.colors.forest, borderRadius: theme.radius.pill, flexDirection: 'row', gap: 6, marginTop: theme.spacing.sm, paddingHorizontal: 12, paddingVertical: 9 },
  buttonText: { color: theme.colors.white, fontSize: 10, fontWeight: '900' },
});
