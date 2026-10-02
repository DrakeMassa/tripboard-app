import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton, Card, Pill } from '@/components/design';
import { theme } from '@/constants/theme';
import { createTravelSegments, LiveTravelSegment } from '@/data/live';
import {
  columbiaOutboundTemplate,
  formatAirportMoment,
  formatDuration,
  getLayoverMinutes,
  ImportedTravelLeg,
  parsePastedFlights,
} from '@/domain/travel-itinerary';

function LegPreview({ leg }: { leg: ImportedTravelLeg }) {
  return (
    <View style={styles.legPreview}>
      <View style={styles.planeIcon}>
        <MaterialCommunityIcons color={theme.colors.forest} name="airplane" size={18} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.route}>{leg.departurePlace} → {leg.arrivalPlace}</Text>
        <Text style={styles.meta}>{leg.provider} · {leg.serviceNumber}</Text>
        <Text style={styles.meta}>
          {formatAirportMoment(leg.departsAt, leg.departurePlace)} – {formatAirportMoment(leg.arrivesAt, leg.arrivalPlace)}
        </Text>
      </View>
    </View>
  );
}

export function SmartTravelImport({
  existingTravel,
  onCancel,
  onImported,
  onManual,
  tripId,
  tripLocation,
}: {
  existingTravel: LiveTravelSegment[];
  onCancel: () => void;
  onImported: (items: LiveTravelSegment[]) => void;
  onManual: () => void;
  tripId: string;
  tripLocation?: string | null;
}) {
  const [pastedText, setPastedText] = useState('');
  const [preview, setPreview] = useState<ImportedTravelLeg[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isColumbia = /\bcolumbia\b/i.test(tripLocation ?? '');
  const hasPilotOutbound = useMemo(
    () => existingTravel.some((item) => item.serviceNumber?.replace(/\s/g, '').toUpperCase() === 'AA1531'),
    [existingTravel],
  );

  const saveLegs = async (legs: ImportedTravelLeg[]) => {
    if (isSaving) return;
    const existingKeys = new Set(
      existingTravel.map((item) => `${item.serviceNumber?.replace(/\s/g, '').toUpperCase()}|${item.departsAt}`),
    );
    const unsaved = legs.filter(
      (leg) => !existingKeys.has(`${leg.serviceNumber.replace(/\s/g, '').toUpperCase()}|${leg.departsAt}`),
    );
    if (!unsaved.length) {
      setError('Those flight legs are already saved on this trip.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const saved = await createTravelSegments({ tripId, segments: unsaved });
      onImported(saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this itinerary.');
    } finally {
      setIsSaving(false);
    }
  };

  const parseFlights = () => {
    setError(null);
    try {
      setPreview(parsePastedFlights(pastedText));
    } catch (cause) {
      setPreview([]);
      setError(cause instanceof Error ? cause.message : 'Could not read those flights.');
    }
  };

  const pilotLayover = getLayoverMinutes(columbiaOutboundTemplate[0], columbiaOutboundTemplate[1]);

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.sparkle}>
          <MaterialCommunityIcons color={theme.colors.white} name="creation-outline" size={20} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.title}>Add the whole itinerary</Text>
          <Text style={styles.intro}>Start from confirmed details, including connections, instead of retyping every field.</Text>
        </View>
        <Pressable accessibilityLabel="Close itinerary import" onPress={onCancel} style={styles.closeButton}>
          <MaterialCommunityIcons color={theme.colors.forest} name="close" size={19} />
        </Pressable>
      </View>

      {isColumbia && !hasPilotOutbound ? (
        <View style={styles.pilotCard}>
          <View style={styles.pilotTop}>
            <Pill tone="coral">READY FOR THIS TRIP</Pill>
            <Text style={styles.pilotDate}>Wed, Oct 7</Text>
          </View>
          <Text style={styles.pilotRoute}>ILM → CLT → STL</Text>
          <Text style={styles.pilotMeta}>American · AA1531 + AA2686 · Economy</Text>
          <View style={styles.connectionRow}>
            <MaterialCommunityIcons color={theme.colors.coral} name="clock-outline" size={17} />
            <Text style={styles.connectionText}>{formatDuration(pilotLayover ?? 0)} connection in Charlotte</Text>
          </View>
          <ActionButton
            icon="airplane-plus"
            label={isSaving ? 'Adding both flights…' : 'Add both flights'}
            onPress={isSaving ? undefined : () => void saveLegs(columbiaOutboundTemplate)}
          />
        </View>
      ) : null}

      <View style={styles.divider} />
      <Text style={styles.label}>PASTE FLIGHTS</Text>
      <TextInput
        accessibilityLabel="Pasted flight itinerary"
        autoCapitalize="characters"
        autoCorrect={false}
        multiline
        onChangeText={(value) => {
          setPastedText(value);
          setPreview([]);
        }}
        placeholder={'AA1531 ILM -> CLT 2026-10-07 14:40 -> 15:53\nAA2686 CLT -> STL 2026-10-07 18:17 -> 19:18'}
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        textAlignVertical="top"
        value={pastedText}
      />
      <Text style={styles.helper}>One flight per line. Times stay local to each airport; overnight arrivals are handled automatically.</Text>
      {preview.length ? (
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>{preview.length} flight {preview.length === 1 ? 'leg' : 'legs'} found</Text>
          {preview.map((leg) => <LegPreview key={`${leg.serviceNumber}-${leg.departsAt}`} leg={leg} />)}
          <ActionButton
            icon="content-save-outline"
            label={isSaving ? 'Saving itinerary…' : `Save ${preview.length} ${preview.length === 1 ? 'flight' : 'flights'}`}
            onPress={isSaving ? undefined : () => void saveLegs(preview)}
          />
        </View>
      ) : (
        <ActionButton icon="text-box-search-outline" label="Read flight details" onPress={parseFlights} secondary />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={onManual} style={styles.manualButton}>
        <MaterialCommunityIcons color={theme.colors.forest} name="pencil-outline" size={17} />
        <Text style={styles.manualText}>Add one segment manually instead</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.spacing.md },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.md },
  sparkle: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.md, height: 42, justifyContent: 'center', width: 42 },
  closeButton: { alignItems: 'center', backgroundColor: theme.colors.sand, borderRadius: theme.radius.pill, height: 34, justifyContent: 'center', width: 34 },
  flex: { flex: 1 },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 21, fontWeight: '800' },
  intro: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  pilotCard: { backgroundColor: theme.colors.sage, borderRadius: theme.radius.md, gap: theme.spacing.sm, padding: theme.spacing.lg },
  pilotTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  pilotDate: { color: theme.colors.muted, fontSize: 11, fontWeight: '800' },
  pilotRoute: { color: theme.colors.forest, fontFamily: 'serif', fontSize: 25, fontWeight: '900', marginTop: 3 },
  pilotMeta: { color: theme.colors.ink, fontSize: 12, fontWeight: '700' },
  connectionRow: { alignItems: 'center', flexDirection: 'row', gap: 7, marginBottom: theme.spacing.sm },
  connectionText: { color: theme.colors.coral, fontSize: 11, fontWeight: '800' },
  divider: { borderTopColor: theme.colors.line, borderTopWidth: 1 },
  label: { color: theme.colors.coral, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  input: { backgroundColor: theme.colors.white, borderColor: theme.colors.line, borderRadius: theme.radius.md, borderWidth: 1, color: theme.colors.ink, fontSize: 14, minHeight: 104, padding: theme.spacing.md },
  helper: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
  previewBox: { backgroundColor: theme.colors.sand, borderRadius: theme.radius.md, gap: theme.spacing.sm, padding: theme.spacing.md },
  previewTitle: { color: theme.colors.ink, fontSize: 12, fontWeight: '900' },
  legPreview: { alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.radius.sm, flexDirection: 'row', gap: theme.spacing.sm, padding: theme.spacing.sm },
  planeIcon: { alignItems: 'center', backgroundColor: theme.colors.sage, borderRadius: theme.radius.pill, height: 34, justifyContent: 'center', width: 34 },
  route: { color: theme.colors.ink, fontSize: 13, fontWeight: '900' },
  meta: { color: theme.colors.muted, fontSize: 10, lineHeight: 14, marginTop: 2 },
  manualButton: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: 7, padding: theme.spacing.sm },
  manualText: { color: theme.colors.forest, fontSize: 12, fontWeight: '800' },
  error: { color: theme.colors.danger, fontSize: 12, fontWeight: '700', lineHeight: 17 },
});
