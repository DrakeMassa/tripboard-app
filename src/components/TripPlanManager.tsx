import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ActionButton, Card, SectionTitle } from '@/components/design';
import { theme } from '@/constants/theme';
import {
  createAccommodation,
  createItineraryItem,
  createTravelSegment,
  deleteAccommodation,
  deleteItineraryItem,
  deleteTravelSegment,
  listAccommodations,
  listItineraryItems,
  listTravelSegments,
  LiveAccommodation,
  LiveItineraryItem,
  LiveTravelSegment,
  updateAccommodation,
  updateItineraryItem,
  updateTravelSegment,
} from '@/data/live';
import { buildCalendarFile, calendarFileName, CalendarEvent } from '@/domain/calendar';
import { normalizeExternalResourceUrl } from '@/domain/resources';
import {
  getDeviceTimeZone,
  isoToLocalDateTimeInput,
  localDateTimeToIso,
  optionalLocalDateTimeToIso,
} from '@/domain/trip-input';
import type { TravelKind } from '@/types/trip';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const travelKinds: { kind: TravelKind; label: string; icon: IconName }[] = [
  { kind: 'flight', label: 'Flight', icon: 'airplane' },
  { kind: 'car', label: 'Car', icon: 'car-outline' },
  { kind: 'train', label: 'Train', icon: 'train' },
  { kind: 'bus', label: 'Bus', icon: 'bus' },
  { kind: 'ferry', label: 'Ferry', icon: 'ferry' },
  { kind: 'other', label: 'Other', icon: 'map-marker-path' },
];

const travelIcons = Object.fromEntries(
  travelKinds.map(({ kind, icon }) => [kind, icon]),
) as Record<TravelKind, IconName>;

function formatMoment(value: string | null): string {
  if (!value) return 'Time to be added';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function replaceById<T extends { id: string }>(items: T[], saved: T): T[] {
  const index = items.findIndex((item) => item.id === saved.id);
  if (index === -1) return [...items, saved];
  return items.map((item) => (item.id === saved.id ? saved : item));
}

async function openCalendar(event: CalendarEvent): Promise<void> {
  const contents = buildCalendarFile(event);
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = calendarFileName(event.title);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    return;
  }
  await Linking.openURL(`data:text/calendar;charset=utf-8,${encodeURIComponent(contents)}`);
}

function IconAction({ label, name, onPress }: { label: string; name: IconName; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]}>
      <MaterialCommunityIcons color={theme.colors.forest} name={name} size={19} />
    </Pressable>
  );
}

function DeleteAction({ onDelete }: { onDelete: () => Promise<void> }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void handleDelete()}
      style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
      <MaterialCommunityIcons color={theme.colors.danger} name="trash-can-outline" size={17} />
      <Text style={styles.deleteText}>
        {isDeleting ? 'Deleting…' : isConfirming ? 'Tap again to delete' : 'Delete'}
      </Text>
    </Pressable>
  );
}

function TravelForm({
  item,
  onCancel,
  onDeleted,
  onSaved,
  tripId,
}: {
  item: LiveTravelSegment | null;
  onCancel: () => void;
  onDeleted: (id: string) => void;
  onSaved: (item: LiveTravelSegment) => void;
  tripId: string;
}) {
  const [kind, setKind] = useState<TravelKind>(item?.kind ?? 'flight');
  const [provider, setProvider] = useState(item?.provider ?? '');
  const [serviceNumber, setServiceNumber] = useState(item?.serviceNumber ?? '');
  const [departurePlace, setDeparturePlace] = useState(item?.departurePlace ?? '');
  const [arrivalPlace, setArrivalPlace] = useState(item?.arrivalPlace ?? '');
  const [departsAt, setDepartsAt] = useState(isoToLocalDateTimeInput(item?.departsAt));
  const [arrivesAt, setArrivesAt] = useState(isoToLocalDateTimeInput(item?.arrivesAt));
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!departurePlace.trim() || !arrivalPlace.trim()) {
      setError('Add both the departure and arrival locations.');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const departureIso = localDateTimeToIso(departsAt, 'departure time');
      const arrivalIso = optionalLocalDateTimeToIso(arrivesAt, 'arrival time');
      if (arrivalIso && Date.parse(arrivalIso) < Date.parse(departureIso)) {
        throw new Error('Arrival cannot be before departure.');
      }
      const shared = {
        kind,
        provider,
        serviceNumber,
        departurePlace,
        arrivalPlace,
        departsAt: departureIso,
        arrivesAt: arrivalIso,
        timeZone: getDeviceTimeZone(),
        notes,
      };
      const saved = item
        ? await updateTravelSegment({ id: item.id, ...shared })
        : await createTravelSegment({ tripId, ...shared });
      onSaved(saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this travel plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await deleteTravelSegment(item.id);
      onDeleted(item.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete this travel plan.');
    }
  };

  return (
    <Card style={styles.formCard}>
      <Text style={styles.formTitle}>{item ? 'Edit travel' : 'Add travel'}</Text>
      <View style={styles.chipRow}>
        {travelKinds.map((option) => (
          <Pressable
            accessibilityRole="button"
            key={option.kind}
            onPress={() => setKind(option.kind)}
            style={[styles.chip, kind === option.kind && styles.chipSelected]}>
            <MaterialCommunityIcons
              color={kind === option.kind ? theme.colors.white : theme.colors.forest}
              name={option.icon}
              size={16}
            />
            <Text style={[styles.chipText, kind === option.kind && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.twoColumn}>
        <TextInput
          accessibilityLabel="Travel provider"
          onChangeText={setProvider}
          placeholder="American Airlines"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={provider}
        />
        <TextInput
          accessibilityLabel="Flight or service number"
          autoCapitalize="characters"
          onChangeText={setServiceNumber}
          placeholder="AA1531"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={serviceNumber}
        />
      </View>
      <View style={styles.twoColumn}>
        <TextInput
          accessibilityLabel="Departure location"
          onChangeText={setDeparturePlace}
          placeholder="ILM"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={departurePlace}
        />
        <TextInput
          accessibilityLabel="Arrival location"
          onChangeText={setArrivalPlace}
          placeholder="CLT"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={arrivalPlace}
        />
      </View>
      <View style={styles.twoColumn}>
        <TextInput
          accessibilityLabel="Departure date and time"
          autoCapitalize="none"
          onChangeText={setDepartsAt}
          placeholder="2026-10-07 14:40"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={departsAt}
        />
        <TextInput
          accessibilityLabel="Arrival date and time"
          autoCapitalize="none"
          onChangeText={setArrivesAt}
          placeholder="2026-10-07 15:53"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={arrivesAt}
        />
      </View>
      <Text style={styles.helper}>Times use your current device time zone. Format: YYYY-MM-DD HH:MM.</Text>
      <TextInput
        accessibilityLabel="Travel notes"
        multiline
        onChangeText={setNotes}
        placeholder="Confirmation, terminal, seat, pickup instructions…"
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, styles.multiline]}
        textAlignVertical="top"
        value={notes}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {item ? <DeleteAction onDelete={handleDelete} /> : null}
      <View style={styles.actions}>
        <View style={styles.column}>
          <ActionButton label="Cancel" onPress={onCancel} secondary />
        </View>
        <View style={styles.column}>
          <ActionButton
            icon="content-save-outline"
            label={isSaving ? 'Saving…' : 'Save travel'}
            onPress={isSaving ? undefined : () => void handleSave()}
          />
        </View>
      </View>
    </Card>
  );
}

function StayForm({
  item,
  onCancel,
  onDeleted,
  onSaved,
  tripId,
}: {
  item: LiveAccommodation | null;
  onCancel: () => void;
  onDeleted: (id: string) => void;
  onSaved: (item: LiveAccommodation) => void;
  tripId: string;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [address, setAddress] = useState(item?.address ?? '');
  const [checkInAt, setCheckInAt] = useState(isoToLocalDateTimeInput(item?.checkInAt));
  const [checkOutAt, setCheckOutAt] = useState(isoToLocalDateTimeInput(item?.checkOutAt));
  const [bookingUrl, setBookingUrl] = useState(item?.bookingUrl ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Add the hotel, rental, or host name.');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const checkInIso = optionalLocalDateTimeToIso(checkInAt, 'check-in time');
      const checkOutIso = optionalLocalDateTimeToIso(checkOutAt, 'check-out time');
      if (checkInIso && checkOutIso && Date.parse(checkOutIso) < Date.parse(checkInIso)) {
        throw new Error('Checkout cannot be before check-in.');
      }
      const shared = {
        name,
        address,
        checkInAt: checkInIso,
        checkOutAt: checkOutIso,
        bookingUrl: normalizeExternalResourceUrl(bookingUrl),
        timeZone: getDeviceTimeZone(),
        notes,
      };
      const saved = item
        ? await updateAccommodation({ id: item.id, ...shared })
        : await createAccommodation({ tripId, ...shared });
      onSaved(saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this stay.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await deleteAccommodation(item.id);
      onDeleted(item.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete this stay.');
    }
  };

  return (
    <Card style={styles.formCard}>
      <Text style={styles.formTitle}>{item ? 'Edit lodging' : 'Add lodging'}</Text>
      <TextInput
        accessibilityLabel="Lodging name"
        onChangeText={setName}
        placeholder="Hotel, Airbnb, or host"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={name}
      />
      <TextInput
        accessibilityLabel="Lodging address"
        onChangeText={setAddress}
        placeholder="Address"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={address}
      />
      <View style={styles.twoColumn}>
        <TextInput
          accessibilityLabel="Check-in date and time"
          autoCapitalize="none"
          onChangeText={setCheckInAt}
          placeholder="2026-10-07 21:00"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={checkInAt}
        />
        <TextInput
          accessibilityLabel="Check-out date and time"
          autoCapitalize="none"
          onChangeText={setCheckOutAt}
          placeholder="2026-10-12 10:00"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={checkOutAt}
        />
      </View>
      <TextInput
        accessibilityLabel="Booking link"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        onChangeText={setBookingUrl}
        placeholder="https:// booking link (optional)"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={bookingUrl}
      />
      <TextInput
        accessibilityLabel="Lodging notes"
        multiline
        onChangeText={setNotes}
        placeholder="Confirmation, room, access, parking, or host notes…"
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, styles.multiline]}
        textAlignVertical="top"
        value={notes}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {item ? <DeleteAction onDelete={handleDelete} /> : null}
      <View style={styles.actions}>
        <View style={styles.column}>
          <ActionButton label="Cancel" onPress={onCancel} secondary />
        </View>
        <View style={styles.column}>
          <ActionButton
            icon="content-save-outline"
            label={isSaving ? 'Saving…' : 'Save lodging'}
            onPress={isSaving ? undefined : () => void handleSave()}
          />
        </View>
      </View>
    </Card>
  );
}

function ItineraryForm({
  item,
  onCancel,
  onDeleted,
  onSaved,
  tripId,
}: {
  item: LiveItineraryItem | null;
  onCancel: () => void;
  onDeleted: (id: string) => void;
  onSaved: (item: LiveItineraryItem) => void;
  tripId: string;
}) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [startsAt, setStartsAt] = useState(isoToLocalDateTimeInput(item?.startsAt));
  const [endsAt, setEndsAt] = useState(isoToLocalDateTimeInput(item?.endsAt));
  const [details, setDetails] = useState(item?.details ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Give this plan a short name.');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const startIso = localDateTimeToIso(startsAt, 'start time');
      const endIso = optionalLocalDateTimeToIso(endsAt, 'end time');
      if (endIso && Date.parse(endIso) < Date.parse(startIso)) {
        throw new Error('The end time cannot be before the start time.');
      }
      const shared = {
        title,
        details,
        startsAt: startIso,
        endsAt: endIso,
        timeZone: getDeviceTimeZone(),
      };
      const saved = item
        ? await updateItineraryItem({ id: item.id, ...shared })
        : await createItineraryItem({ tripId, ...shared });
      onSaved(saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await deleteItineraryItem(item.id);
      onDeleted(item.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete this plan.');
    }
  };

  return (
    <Card style={styles.formCard}>
      <Text style={styles.formTitle}>{item ? 'Edit plan' : 'Add to the itinerary'}</Text>
      <TextInput
        accessibilityLabel="Plan title"
        onChangeText={setTitle}
        placeholder="Missouri game"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={title}
      />
      <View style={styles.twoColumn}>
        <TextInput
          accessibilityLabel="Plan start date and time"
          autoCapitalize="none"
          onChangeText={setStartsAt}
          placeholder="2026-10-10 18:00"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={startsAt}
        />
        <TextInput
          accessibilityLabel="Plan end date and time"
          autoCapitalize="none"
          onChangeText={setEndsAt}
          placeholder="2026-10-10 22:00"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.column]}
          value={endsAt}
        />
      </View>
      <TextInput
        accessibilityLabel="Plan details"
        multiline
        onChangeText={setDetails}
        placeholder="Location, reservation, meeting point, or anything useful…"
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, styles.multiline]}
        textAlignVertical="top"
        value={details}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {item ? <DeleteAction onDelete={handleDelete} /> : null}
      <View style={styles.actions}>
        <View style={styles.column}>
          <ActionButton label="Cancel" onPress={onCancel} secondary />
        </View>
        <View style={styles.column}>
          <ActionButton
            icon="content-save-outline"
            label={isSaving ? 'Saving…' : 'Save plan'}
            onPress={isSaving ? undefined : () => void handleSave()}
          />
        </View>
      </View>
    </Card>
  );
}

export function TripPlanManager({ tripId, tripLocation }: { tripId: string; tripLocation?: string | null }) {
  const [travel, setTravel] = useState<LiveTravelSegment[]>([]);
  const [stays, setStays] = useState<LiveAccommodation[]>([]);
  const [itinerary, setItinerary] = useState<LiveItineraryItem[]>([]);
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [showStayForm, setShowStayForm] = useState(false);
  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [editingTravel, setEditingTravel] = useState<LiveTravelSegment | null>(null);
  const [editingStay, setEditingStay] = useState<LiveAccommodation | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<LiveItineraryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    void Promise.resolve().then(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [travelItems, stayItems, itineraryItems] = await Promise.all([
          listTravelSegments(tripId),
          listAccommodations(tripId),
          listItineraryItems(tripId),
        ]);
        if (isMounted) {
          setTravel(travelItems);
          setStays(stayItems);
          setItinerary(itineraryItems);
        }
      } catch (cause) {
        if (isMounted) setError(cause instanceof Error ? cause.message : 'Could not load the trip plan.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [tripId]);

  const exportCalendar = async (event: CalendarEvent) => {
    setError(null);
    try {
      await openCalendar(event);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the calendar entry.');
    }
  };

  const openSafeLink = async (url: string) => {
    setError(null);
    try {
      const safeUrl = normalizeExternalResourceUrl(url);
      if (safeUrl) await Linking.openURL(safeUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open this booking link safely.');
    }
  };

  if (isLoading) {
    return (
      <Card style={styles.loadingCard}>
        <ActivityIndicator color={theme.colors.forest} />
        <Text style={styles.helper}>Loading travel, lodging, and plans…</Text>
      </Card>
    );
  }

  return (
    <View style={styles.manager}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <SectionTitle action={`${travel.length} saved`}>Travel</SectionTitle>
        {travel.length ? (
          <Card style={styles.flatCard}>
            {travel.map((item, index) => (
              <View key={item.id} style={[styles.row, index > 0 && styles.divider]}>
                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons color={theme.colors.forest} name={travelIcons[item.kind]} size={20} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>
                    {item.departurePlace} → {item.arrivalPlace}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {[item.provider, item.serviceNumber].filter(Boolean).join(' · ') || travelKinds.find((option) => option.kind === item.kind)?.label}
                  </Text>
                  <Text style={styles.itemMeta}>{formatMoment(item.departsAt)}</Text>
                </View>
                <View style={styles.rowActions}>
                  <IconAction
                    label="Add travel to calendar"
                    name="calendar-plus"
                    onPress={() =>
                      void exportCalendar({
                        uid: `travel-${item.id}`,
                        title: `${item.provider || 'Travel'} ${item.serviceNumber || ''}: ${item.departurePlace} to ${item.arrivalPlace}`.trim(),
                        description: item.notes,
                        location: item.departurePlace,
                        start: item.departsAt,
                        end: item.arrivesAt,
                      })
                    }
                  />
                  <IconAction
                    label="Edit travel"
                    name="pencil-outline"
                    onPress={() => {
                      setEditingTravel(item);
                      setShowTravelForm(true);
                    }}
                  />
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons color={theme.colors.moss} name="airplane-plus" size={26} />
            <View style={styles.flex}>
              <Text style={styles.itemTitle}>Add arrival and return details</Text>
              <Text style={styles.itemMeta}>Flights, drives, trains, and pickup plans can all live here.</Text>
            </View>
          </Card>
        )}
        {!showTravelForm ? (
          <ActionButton
            icon="plus"
            label="Add travel"
            onPress={() => {
              setEditingTravel(null);
              setShowTravelForm(true);
            }}
            secondary
          />
        ) : (
          <TravelForm
            item={editingTravel}
            onCancel={() => setShowTravelForm(false)}
            onDeleted={(id) => {
              setTravel((current) => current.filter((item) => item.id !== id));
              setShowTravelForm(false);
            }}
            onSaved={(saved) => {
              setTravel((current) => replaceById(current, saved).sort((a, b) => a.departsAt.localeCompare(b.departsAt)));
              setShowTravelForm(false);
            }}
            tripId={tripId}
          />
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle action={`${itinerary.length} saved`}>Daily plan</SectionTitle>
        {itinerary.length ? (
          <Card style={styles.flatCard}>
            {itinerary.map((item, index) => (
              <View key={item.id} style={[styles.row, index > 0 && styles.divider]}>
                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons color={theme.colors.forest} name="calendar-star" size={20} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>{formatMoment(item.startsAt)}</Text>
                  {item.details ? <Text style={styles.itemMeta}>{item.details}</Text> : null}
                </View>
                <View style={styles.rowActions}>
                  <IconAction
                    label="Add plan to calendar"
                    name="calendar-plus"
                    onPress={() =>
                      void exportCalendar({
                        uid: `plan-${item.id}`,
                        title: item.title,
                        description: item.details,
                        location: tripLocation,
                        start: item.startsAt,
                        end: item.endsAt,
                      })
                    }
                  />
                  <IconAction
                    label="Edit plan"
                    name="pencil-outline"
                    onPress={() => {
                      setEditingItinerary(item);
                      setShowItineraryForm(true);
                    }}
                  />
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons color={theme.colors.moss} name="calendar-plus" size={26} />
            <View style={styles.flex}>
              <Text style={styles.itemTitle}>Build the schedule as plans firm up</Text>
              <Text style={styles.itemMeta}>Games, meals, reservations, and meeting points stay in one timeline.</Text>
            </View>
          </Card>
        )}
        {!showItineraryForm ? (
          <ActionButton
            icon="plus"
            label="Add a plan"
            onPress={() => {
              setEditingItinerary(null);
              setShowItineraryForm(true);
            }}
            secondary
          />
        ) : (
          <ItineraryForm
            item={editingItinerary}
            onCancel={() => setShowItineraryForm(false)}
            onDeleted={(id) => {
              setItinerary((current) => current.filter((item) => item.id !== id));
              setShowItineraryForm(false);
            }}
            onSaved={(saved) => {
              setItinerary((current) => replaceById(current, saved).sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
              setShowItineraryForm(false);
            }}
            tripId={tripId}
          />
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle action={`${stays.length} saved`}>Lodging</SectionTitle>
        {stays.length ? (
          <Card style={styles.flatCard}>
            {stays.map((item, index) => (
              <View key={item.id} style={[styles.row, index > 0 && styles.divider]}>
                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons color={theme.colors.forest} name="bed-king-outline" size={20} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.address || 'Address to be added'}</Text>
                  <Text style={styles.itemMeta}>{formatMoment(item.checkInAt)}</Text>
                </View>
                <View style={styles.rowActions}>
                  {item.bookingUrl ? (
                    <IconAction
                      label="Open booking"
                      name="open-in-new"
                      onPress={() => void openSafeLink(item.bookingUrl as string)}
                    />
                  ) : null}
                  {item.checkInAt ? (
                    <IconAction
                      label="Add lodging to calendar"
                      name="calendar-plus"
                      onPress={() =>
                        void exportCalendar({
                          uid: `stay-${item.id}`,
                          title: `Stay at ${item.name}`,
                          description: item.notes,
                          location: item.address,
                          start: item.checkInAt as string,
                          end: item.checkOutAt,
                        })
                      }
                    />
                  ) : null}
                  <IconAction
                    label="Edit lodging"
                    name="pencil-outline"
                    onPress={() => {
                      setEditingStay(item);
                      setShowStayForm(true);
                    }}
                  />
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons color={theme.colors.moss} name="bed-outline" size={26} />
            <View style={styles.flex}>
              <Text style={styles.itemTitle}>Keep check-in details handy</Text>
              <Text style={styles.itemMeta}>Save the address, booking link, confirmation, and access notes.</Text>
            </View>
          </Card>
        )}
        {!showStayForm ? (
          <ActionButton
            icon="plus"
            label="Add lodging"
            onPress={() => {
              setEditingStay(null);
              setShowStayForm(true);
            }}
            secondary
          />
        ) : (
          <StayForm
            item={editingStay}
            onCancel={() => setShowStayForm(false)}
            onDeleted={(id) => {
              setStays((current) => current.filter((item) => item.id !== id));
              setShowStayForm(false);
            }}
            onSaved={(saved) => {
              setStays((current) => replaceById(current, saved));
              setShowStayForm(false);
            }}
            tripId={tripId}
          />
        )}
      </View>

      <Card style={styles.calendarNote}>
        <MaterialCommunityIcons color={theme.colors.forest} name="calendar-sync" size={24} />
        <View style={styles.flex}>
          <Text style={styles.itemTitle}>Calendar-ready now</Text>
          <Text style={styles.itemMeta}>
            Use the calendar icon beside any saved item to download a standard calendar entry. Connected Google and Outlook sync comes in the import phase.
          </Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  manager: { gap: theme.spacing.xl },
  section: { gap: theme.spacing.md },
  loadingCard: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  flatCard: { paddingVertical: 4 },
  row: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md, paddingVertical: 14 },
  divider: { borderTopColor: theme.colors.line, borderTopWidth: 1 },
  itemIcon: { alignItems: 'center', backgroundColor: theme.colors.sand, borderRadius: theme.radius.md, height: 42, justifyContent: 'center', width: 42 },
  itemTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '800' },
  itemMeta: { color: theme.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  flex: { flex: 1 },
  rowActions: { flexDirection: 'row', gap: 6 },
  iconAction: { alignItems: 'center', backgroundColor: theme.colors.sage, borderRadius: theme.radius.pill, height: 36, justifyContent: 'center', width: 36 },
  emptyCard: { alignItems: 'center', backgroundColor: theme.colors.sand, flexDirection: 'row', gap: theme.spacing.md },
  formCard: { gap: theme.spacing.md },
  formTitle: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 21, fontWeight: '800' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: { alignItems: 'center', backgroundColor: theme.colors.sand, borderColor: theme.colors.sand, borderRadius: theme.radius.pill, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: 11, paddingVertical: 8 },
  chipSelected: { backgroundColor: theme.colors.forest, borderColor: theme.colors.forest },
  chipText: { color: theme.colors.forest, fontSize: 11, fontWeight: '800' },
  chipTextSelected: { color: theme.colors.white },
  input: { backgroundColor: theme.colors.white, borderColor: theme.colors.line, borderRadius: theme.radius.md, borderWidth: 1, color: theme.colors.ink, fontSize: 15, minHeight: 50, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  multiline: { minHeight: 88 },
  twoColumn: { flexDirection: 'row', gap: theme.spacing.md },
  column: { flex: 1 },
  helper: { color: theme.colors.muted, fontSize: 11, lineHeight: 16 },
  actions: { flexDirection: 'row', gap: theme.spacing.md },
  deleteButton: { alignItems: 'center', alignSelf: 'flex-start', borderColor: theme.colors.danger, borderRadius: theme.radius.pill, borderWidth: 1, flexDirection: 'row', gap: 6, minHeight: 40, paddingHorizontal: theme.spacing.md },
  deleteText: { color: theme.colors.danger, fontSize: 12, fontWeight: '800' },
  error: { color: theme.colors.danger, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  pressed: { opacity: 0.72 },
  calendarNote: { alignItems: 'center', backgroundColor: theme.colors.sage, flexDirection: 'row', gap: theme.spacing.md },
});
