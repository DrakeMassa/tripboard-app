import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

const terminalPdf = 'https://assets.ctfassets.net/jaw4bomip9l3/7qkHp4MneaKK3PzYPDffRt/eeb3df68b8c2b9c6e0602f9fc77654bb/Terminal_Map_-_Backlit_60x54_Sept_2026_-_WEB.pdf';
const interactiveMap = 'https://maps.cltairport.com/';

export function AirportMap({ arrivingFlight, departingFlight }: { arrivingFlight: string; departingFlight: string }) {
  const [mode, setMode] = useState<'terminal' | 'wayfinding'>('terminal');
  const source = mode === 'terminal' ? `${terminalPdf}#view=FitH&toolbar=0&navpanes=0` : interactiveMap;

  return (
    <View style={styles.shell}>
      <View style={styles.topRow}>
        <View style={styles.routeBlock}>
          <Text style={styles.eyebrow}>CLT CONNECTION MAP</Text>
          <Text style={styles.route}>{arrivingFlight || 'Arrival'} → {departingFlight || 'Departure'}</Text>
          <Text style={styles.helper}>Arrival gate and departure gate will pin here when the live flight feed publishes them.</Text>
        </View>
        <View style={styles.toggle}>
          <Pressable onPress={() => setMode('terminal')} style={[styles.toggleButton, mode === 'terminal' && styles.toggleActive]}>
            <Text style={[styles.toggleText, mode === 'terminal' && styles.toggleTextActive]}>Terminal</Text>
          </Pressable>
          <Pressable onPress={() => setMode('wayfinding')} style={[styles.toggleButton, mode === 'wayfinding' && styles.toggleActive]}>
            <Text style={[styles.toggleText, mode === 'wayfinding' && styles.toggleTextActive]}>Wayfinding</Text>
          </Pressable>
        </View>
      </View>
      <iframe
        allow="geolocation"
        loading="lazy"
        src={source}
        style={{ border: 0, height: 430, width: '100%' }}
        title={mode === 'terminal' ? 'Official CLT terminal map' : 'Official CLT interactive wayfinding map'}
      />
      <View style={styles.bottomRow}>
        <Text style={styles.bottomCopy}>
          Pan and zoom in Wanderly. CLT wayfinding adds multi-level routing, estimated walk times, food, shops, and lounges.
        </Text>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(interactiveMap)} style={styles.openButton}>
          <Text style={styles.openText}>Full screen</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderRadius: theme.radius.lg, borderWidth: 1, overflow: 'hidden' },
  topRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, justifyContent: 'space-between', padding: theme.spacing.md },
  routeBlock: { flex: 1, minWidth: 220 },
  eyebrow: { color: theme.colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  route: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 18, fontWeight: '900', marginTop: 2 },
  helper: { color: theme.colors.muted, fontSize: 9, lineHeight: 13, marginTop: 3 },
  toggle: { backgroundColor: theme.colors.sand, borderRadius: theme.radius.pill, flexDirection: 'row', padding: 3 },
  toggleButton: { borderRadius: theme.radius.pill, paddingHorizontal: 10, paddingVertical: 7 },
  toggleActive: { backgroundColor: theme.colors.forest },
  toggleText: { color: theme.colors.forest, fontSize: 9, fontWeight: '900' },
  toggleTextActive: { color: theme.colors.white },
  bottomRow: { alignItems: 'center', backgroundColor: theme.colors.sand, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.md },
  bottomCopy: { color: theme.colors.muted, flex: 1, fontSize: 9, lineHeight: 14 },
  openButton: { backgroundColor: theme.colors.forest, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 9 },
  openText: { color: theme.colors.white, fontSize: 9, fontWeight: '900' },
});
