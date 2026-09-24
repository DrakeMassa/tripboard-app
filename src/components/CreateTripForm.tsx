import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton, Card } from '@/components/design';
import { theme } from '@/constants/theme';
import { createTrip, LiveTrip } from '@/data/live';
import { normalizeDateOnly, validateDateRange } from '@/domain/trip-input';

export function CreateTripForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (trip: LiveTrip) => void;
}) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (isSaving) return;
    if (!title.trim()) {
      setError('Give this trip a short name.');
      return;
    }
    if (!location.trim()) {
      setError('Add a destination so Wanderly can organize and personalize the trip.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const normalizedStart = normalizeDateOnly(startDate, 'start date');
      const normalizedEnd = normalizeDateOnly(endDate, 'end date');
      validateDateRange(normalizedStart, normalizedEnd);
      const trip = await createTrip({
        title,
        location,
        startDate: normalizedStart,
        endDate: normalizedEnd,
        description,
      });
      onCreated(trip);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create this trip.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card style={styles.formCard}>
      <View>
        <Text style={styles.title}>Create a new trip</Text>
        <Text style={styles.helper}>
          Start with the destination. Travel, lodging, plans, invitations, and essentials can be added next.
        </Text>
      </View>
      <TextInput
        accessibilityLabel="Trip name"
        maxLength={120}
        onChangeText={setTitle}
        placeholder="Beach weekend"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={title}
      />
      <TextInput
        accessibilityLabel="Destination"
        maxLength={160}
        onChangeText={setLocation}
        placeholder="Corona del Mar, California"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={location}
      />
      <View style={styles.dateRow}>
        <TextInput
          accessibilityLabel="Start date"
          autoCapitalize="none"
          onChangeText={setStartDate}
          placeholder="Start · YYYY-MM-DD"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.flex]}
          value={startDate}
        />
        <TextInput
          accessibilityLabel="End date"
          autoCapitalize="none"
          onChangeText={setEndDate}
          placeholder="End · YYYY-MM-DD"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.flex]}
          value={endDate}
        />
      </View>
      <TextInput
        accessibilityLabel="Trip note"
        maxLength={500}
        multiline
        onChangeText={setDescription}
        placeholder="What is this trip for? (optional)"
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, styles.multiline]}
        textAlignVertical="top"
        value={description}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <View style={styles.flex}>
          <ActionButton label="Cancel" onPress={onCancel} secondary />
        </View>
        <View style={styles.flex}>
          <ActionButton
            icon="arrow-right"
            label={isSaving ? 'Creating…' : 'Create trip'}
            onPress={isSaving ? undefined : () => void handleCreate()}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: theme.spacing.md },
  title: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 23, fontWeight: '800' },
  helper: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  input: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.ink,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  multiline: { minHeight: 92 },
  dateRow: { flexDirection: 'row', gap: theme.spacing.md },
  actions: { flexDirection: 'row', gap: theme.spacing.md },
  flex: { flex: 1 },
  error: { color: theme.colors.danger, fontSize: 12, fontWeight: '700', lineHeight: 17 },
});
