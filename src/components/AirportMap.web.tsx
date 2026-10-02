import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Pill } from '@/components/design';
import { theme } from '@/constants/theme';
import { getItineraryAirports } from '@/data/airports';
import { LiveTravelSegment } from '@/data/live';

function flightContext(code: string, travel: LiveTravelSegment[]): string {
  const labels = travel
    .filter(
      (leg) =>
        leg.departurePlace.trim().toUpperCase() === code ||
        leg.arrivalPlace.trim().toUpperCase() === code,
    )
    .map((leg) => leg.serviceNumber || `${leg.departurePlace}–${leg.arrivalPlace}`);
  return [...new Set(labels)].join(' · ') || 'Gate details pending';
}

export function AirportMap({ travel }: { travel: LiveTravelSegment[] }) {
  const airports = getItineraryAirports(travel);
  const [selection, setSelection] = useState({ airportKey: '', index: 0 });
  const [pageWidth, setPageWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const airportKey = airports.map((airport) => airport.code).join('|');
  const activeIndex = selection.airportKey === airportKey && selection.index < airports.length
    ? selection.index
    : 0;

  if (!airports.length) return null;

  const selectAirport = (index: number) => {
    setSelection({ airportKey, index });
    scrollRef.current?.scrollTo({ animated: true, x: index * pageWidth });
  };

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>YOUR AIRPORTS · CONNECTION FIRST</Text>
          <Text style={styles.title}>Swipe through this itinerary</Text>
          <Text style={styles.helper}>Verified airport maps replace the old one-airport CLT panel. Gate pins appear when a live flight feed supplies gate data.</Text>
        </View>
        <Pill tone="sand">{activeIndex + 1} / {airports.length}</Pill>
      </View>

      <ScrollView contentContainerStyle={styles.tabs} horizontal showsHorizontalScrollIndicator={false}>
        {airports.map((airport, index) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: index === activeIndex }}
            key={airport.code}
            onPress={() => selectAirport(index)}
            style={[styles.tab, index === activeIndex && styles.tabActive]}>
            <Text style={[styles.tabCode, index === activeIndex && styles.tabCodeActive]}>{airport.code}</Text>
            {airport.isLayover ? <Text style={[styles.tabBadge, index === activeIndex && styles.tabBadgeActive]}>LAYOVER</Text> : null}
          </Pressable>
        ))}
      </ScrollView>

      <View onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)} style={styles.viewport}>
        <ScrollView
          decelerationRate="fast"
          horizontal
          key={airportKey}
          onMomentumScrollEnd={(event) => {
            if (!pageWidth) return;
            setSelection({
              airportKey,
              index: Math.round(event.nativeEvent.contentOffset.x / pageWidth),
            });
          }}
          pagingEnabled
          ref={scrollRef}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}>
          {airports.map((airport) => (
            <View key={airport.code} style={[styles.page, pageWidth ? { width: pageWidth } : undefined]}>
              <View style={styles.airportTop}>
                <View style={styles.codeBox}><Text style={styles.code}>{airport.code}</Text></View>
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <Text style={styles.airportName}>{airport.name}</Text>
                    {airport.isLayover ? <Pill tone="coral">LAYOVER FIRST</Pill> : null}
                  </View>
                  <Text style={styles.route}>{flightContext(airport.code, travel)}</Text>
                  <Text style={styles.city}>{airport.city}</Text>
                </View>
              </View>
              <iframe
                loading="lazy"
                referrerPolicy="no-referrer"
                src={airport.embedUrl}
                style={{ border: 0, height: 390, width: '100%' }}
                title={`${airport.code} ${airport.mapLabel}`}
              />
              <View style={styles.bottomRow}>
                <View style={styles.flex}>
                  <Text style={styles.mapLabel}>{airport.mapLabel}</Text>
                  <Text style={styles.bottomCopy}>{airport.summary}</Text>
                  <Text style={styles.fallback}>If a preview is blocked by the airport, the official-map button still works.</Text>
                </View>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => void Linking.openURL(airport.officialMapUrl)}
                  style={styles.openButton}>
                  <Text style={styles.openText}>Official map</Text>
                  <MaterialCommunityIcons color={theme.colors.white} name="open-in-new" size={14} />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderRadius: theme.radius.lg, borderWidth: 1, overflow: 'hidden' },
  header: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.md },
  flex: { flex: 1 },
  eyebrow: { color: theme.colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 18, fontWeight: '900', marginTop: 2 },
  helper: { color: theme.colors.muted, fontSize: 9, lineHeight: 13, marginTop: 3, maxWidth: 620 },
  tabs: { gap: 7, paddingBottom: theme.spacing.md, paddingHorizontal: theme.spacing.md },
  tab: { alignItems: 'center', backgroundColor: theme.colors.sand, borderRadius: theme.radius.pill, flexDirection: 'row', gap: 6, minHeight: 36, paddingHorizontal: 12 },
  tabActive: { backgroundColor: theme.colors.forest },
  tabCode: { color: theme.colors.forest, fontSize: 11, fontWeight: '900' },
  tabCodeActive: { color: theme.colors.white },
  tabBadge: { color: theme.colors.coral, fontSize: 7, fontWeight: '900', letterSpacing: 0.6 },
  tabBadgeActive: { color: theme.colors.coralSoft },
  viewport: { overflow: 'hidden', width: '100%' },
  page: { minWidth: 280 },
  airportTop: { alignItems: 'center', borderTopColor: theme.colors.line, borderTopWidth: 1, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.md },
  codeBox: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.md, height: 52, justifyContent: 'center', width: 58 },
  code: { color: theme.colors.white, fontFamily: 'serif', fontSize: 18, fontWeight: '900' },
  nameRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  airportName: { color: theme.colors.ink, flexShrink: 1, fontSize: 14, fontWeight: '900' },
  route: { color: theme.colors.forestSoft, fontSize: 10, fontWeight: '800', marginTop: 4 },
  city: { color: theme.colors.muted, fontSize: 9, marginTop: 2 },
  bottomRow: { alignItems: 'center', backgroundColor: theme.colors.sand, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.md },
  mapLabel: { color: theme.colors.ink, fontSize: 10, fontWeight: '900' },
  bottomCopy: { color: theme.colors.muted, fontSize: 9, lineHeight: 14, marginTop: 2 },
  fallback: { color: theme.colors.coral, fontSize: 8, lineHeight: 12, marginTop: 4 },
  openButton: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: 12, paddingVertical: 10 },
  openText: { color: theme.colors.white, fontSize: 9, fontWeight: '900' },
});
