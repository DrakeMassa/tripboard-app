import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton, Card } from '@/components/design';
import { theme } from '@/constants/theme';
import { LiveTrip, updateTrip } from '@/data/live';
import { normalizeDateOnly, validateDateRange } from '@/domain/trip-input';

export function TripDetailsEditor({
  onCancel,
  onSaved,
  trip,
}: {
  onCancel: () => void;
  onSaved: (trip: LiveTrip) => void;
  trip: LiveTrip;
}) {
  const [title, setTitle] = useState(trip.title);
  const [location, setLocation] = useState(trip.location ?? '');
  const [startDate, setStartDate] = useState(trip.startDate ?? '');
  const [endDate, setEndDate] = useState(trip.endDate ?? '');
  const [description, setDescription] = useState(trip.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Give the trip a name.');
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    setError(null);
    try {
      const normalizedStart = normalizeDateOnly(startDate, 'the start date');
      const normalizedEnd = normalizeDateOnly(endDate, 'the end date');
      validateDateRange(normalizedStart, normalizedEnd);
      const saved = await updateTrip({
        tripId: trip.id,
        title,
        location,
        description,
        startDate: normalizedStart,
        endDate: normalizedEnd,
      });
      onSaved(saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update this trip.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View>
        <Text style={styles.title}>Edit trip details</Text>
        <Text style={styles.helper}>These details appear everywhere the trip is shown.</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Trip name</Text>
        <TextInput
          accessibilityLabel="Trip name"
          maxLength={120}
          onChangeText={setTitle}
          placeholder="Columbia game weekend"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          value={title}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          accessibilityLabel="Trip destination"
          maxLength={160}
          onChangeText={setLocation}
          placeholder="Columbia, Missouri"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          value={location}
        />
      </View>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.label}>Start date</Text>
          <TextInput
            accessibilityLabel="Trip start date"
            autoCapitalize="none"
            maxLength={10}
            onChangeText={setStartDate}
            placeholder="2026-10-07"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            value={startDate}
          />
        </View>
        <View style={styles.dateField}>
          <Text style={styles.label}>End date</Text>
          <TextInput
            accessibilityLabel="Trip end date"
            autoCapitalize="none"
            maxLength={10}
            onChangeText={setEndDate}
            placeholder="2026-10-12"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            value={endDate}
          />
        </View>
      </View>
      <Text style={styles.helper}>Use YYYY-MM-DD for now. A calendar picker is planned for the native app.</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Trip note</Text>
        <TextInput
          accessibilityLabel="Trip description"
          maxLength={600}
          multiline
          onChangeText={setDescription}
          placeholder="Who is coming and what is this trip about?"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.multiline]}
          textAlignVertical="top"
          value={description}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <View style={styles.flex}>
          <ActionButton label="Cancel" onPress={onCancel} secondary />
        </View>
        <View style={styles.flex}>
          <ActionButton
            icon="content-save-outline"
            label={isSaving ? 'Saving…' : 'Save trip'}
            onPress={isSaving ? undefined : () => void handleSave()}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.spacing.md },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 22, fontWeight: '800' },
  helper: { color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  field: { gap: 6 },
  label: { color: theme.colors.ink, fontSize: 11, fontWeight: '800' },
  input: { backgroundColor: theme.colors.white, borderColor: theme.colors.line, borderRadius: theme.radius.md, borderWidth: 1, color: theme.colors.ink, fontSize: 15, minHeight: 50, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  multiline: { minHeight: 88 },
  dateRow: { flexDirection: 'row', gap: theme.spacing.md },
  dateField: { flex: 1, gap: 6 },
  actions: { flexDirection: 'row', gap: theme.spacing.md },
  flex: { flex: 1 },
  error: { color: theme.colors.danger, fontSize: 12, fontWeight: '700', lineHeight: 17 },
});
