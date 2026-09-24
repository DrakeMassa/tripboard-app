import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { ActionButton, Card, SectionTitle } from '@/components/design';
import { theme } from '@/constants/theme';
import {
  createTripResource,
  deleteTripResource,
  listTripResources,
  LiveTripResource,
  updateTripResource,
} from '@/data/live';
import { normalizeExternalResourceUrl } from '@/domain/resources';
import type { TripResourceKind, TripResourcePreview } from '@/types/trip';

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const resourceIcons: Record<TripResourceKind, MaterialIconName> = {
  ticket: 'ticket-confirmation-outline',
  confirmation: 'check-decagram-outline',
  parking_pass: 'parking',
  reservation: 'calendar-check-outline',
  document: 'file-document-outline',
  photo_album: 'image-multiple-outline',
  link: 'link-variant',
  other: 'bookmark-outline',
};

const resourceKinds: { kind: TripResourceKind; label: string }[] = [
  { kind: 'ticket', label: 'Ticket' },
  { kind: 'parking_pass', label: 'Parking' },
  { kind: 'confirmation', label: 'Confirmation' },
  { kind: 'reservation', label: 'Reservation' },
  { kind: 'document', label: 'Document' },
  { kind: 'photo_album', label: 'Shared album' },
  { kind: 'link', label: 'Link' },
];

type DisplayResource = {
  id: string;
  kind: TripResourceKind;
  title: string;
  detail: string;
  details: string;
  externalUrl: string | null;
  isPlaceholder: boolean;
};

function toLiveDisplay(resource: LiveTripResource): DisplayResource {
  return {
    id: resource.id,
    kind: resource.kind,
    title: resource.title,
    detail: resource.details || resource.provider || 'Saved with this trip',
    details: resource.details ?? '',
    externalUrl: resource.externalUrl,
    isPlaceholder: false,
  };
}

function toPreviewDisplay(resource: TripResourcePreview): DisplayResource {
  return { ...resource, details: resource.detail, isPlaceholder: true };
}

export function TripResources({
  tripId,
  previewResources,
}: {
  tripId: string;
  previewResources?: TripResourcePreview[];
}) {
  const { user } = useAuth();
  const isPreview = Boolean(previewResources);
  const [resources, setResources] = useState<DisplayResource[]>(
    () => previewResources?.map(toPreviewDisplay) ?? [],
  );
  const [isLoading, setIsLoading] = useState(!isPreview);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editingResource, setEditingResource] = useState<DisplayResource | null>(null);
  const [kind, setKind] = useState<TripResourceKind>('ticket');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPreview || !user) return;

    let isMounted = true;
    void Promise.resolve().then(async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);
      try {
        const items = await listTripResources(tripId);
        if (isMounted) setResources(items.map(toLiveDisplay));
      } catch (cause) {
        if (isMounted) {
          setError(cause instanceof Error ? cause.message : 'Could not load tickets and links.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isPreview, tripId, user]);

  const resetForm = () => {
    setKind('ticket');
    setTitle('');
    setDetails('');
    setExternalUrl('');
    setError(null);
    setEditingResource(null);
    setIsConfirmingDelete(false);
    setIsAdding(false);
  };

  const startAdding = () => {
    setEditingResource(null);
    setKind('ticket');
    setTitle('');
    setDetails('');
    setExternalUrl('');
    setError(null);
    setIsConfirmingDelete(false);
    setIsAdding(true);
  };

  const startEditing = (resource: DisplayResource) => {
    setEditingResource(resource);
    setKind(resource.kind);
    setTitle(resource.title);
    setDetails(resource.details);
    setExternalUrl(resource.externalUrl ?? '');
    setError(null);
    setIsConfirmingDelete(false);
    setIsAdding(true);
  };

  const handleSave = async () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError('Give this item a short title, such as “Game tickets.”');
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    setError(null);
    try {
      const shared = {
        kind,
        title: normalizedTitle,
        details,
        externalUrl: normalizeExternalResourceUrl(externalUrl),
      };
      const resource = editingResource
        ? await updateTripResource({ id: editingResource.id, ...shared })
        : await createTripResource({ tripId, ...shared });
      const display = toLiveDisplay(resource);
      setResources((current) => {
        const exists = current.some((item) => item.id === display.id);
        return exists ? current.map((item) => (item.id === display.id ? display : item)) : [...current, display];
      });
      resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this trip item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingResource || isDeleting) return;
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTripResource(editingResource.id);
      setResources((current) => current.filter((item) => item.id !== editingResource.id));
      resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete this trip item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openResource = async (url: string) => {
    try {
      const safeUrl = normalizeExternalResourceUrl(url);
      if (safeUrl) await Linking.openURL(safeUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This link could not be opened safely.');
    }
  };

  return (
    <View style={styles.section}>
      <SectionTitle action={resources.length ? `${resources.length} saved` : undefined}>
        Tickets, files & links
      </SectionTitle>

      {isLoading ? (
        <Card>
          <Text style={styles.loadingText}>Loading saved trip items…</Text>
        </Card>
      ) : null}

      {!isLoading && resources.length > 0 ? (
        <Card style={styles.flatCard}>
          {resources.map((resource, index) => (
            <View key={resource.id} style={[styles.resourceRow, index > 0 && styles.divider]}>
              <Pressable
                accessibilityHint={resource.externalUrl ? 'Opens the linked item' : undefined}
                accessibilityRole={resource.externalUrl ? 'link' : undefined}
                onPress={resource.externalUrl ? () => void openResource(resource.externalUrl as string) : undefined}
                style={({ pressed }) => [styles.resourceMain, pressed && resource.externalUrl && styles.pressed]}>
                <View style={styles.resourceIcon}>
                  <MaterialCommunityIcons
                    color={theme.colors.forest}
                    name={resourceIcons[resource.kind]}
                    size={20}
                  />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{resource.title}</Text>
                  <Text style={styles.itemMeta}>{resource.detail}</Text>
                </View>
                <View style={styles.resourceStatus}>
                  <Text
                    style={
                      resource.externalUrl
                        ? styles.linkedText
                        : resource.isPlaceholder
                          ? styles.needsDetailsText
                          : styles.savedText
                    }>
                    {resource.externalUrl ? 'OPEN' : resource.isPlaceholder ? 'ADD DETAILS' : 'SAVED'}
                  </Text>
                  <MaterialCommunityIcons
                    color={
                      resource.externalUrl
                        ? theme.colors.forestSoft
                        : resource.isPlaceholder
                          ? theme.colors.coral
                          : theme.colors.muted
                    }
                    name={
                      resource.externalUrl
                        ? 'open-in-new'
                        : resource.isPlaceholder
                          ? 'plus-circle-outline'
                          : 'check-circle-outline'
                    }
                    size={18}
                  />
                </View>
              </Pressable>
              {!isPreview ? (
                <Pressable
                  accessibilityLabel={`Edit ${resource.title}`}
                  accessibilityRole="button"
                  onPress={() => startEditing(resource)}
                  style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
                  <MaterialCommunityIcons color={theme.colors.forest} name="pencil-outline" size={18} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </Card>
      ) : null}

      {!isLoading && !isPreview && resources.length === 0 ? (
        <Card style={styles.emptyCard}>
          <MaterialCommunityIcons color={theme.colors.coral} name="ticket-confirmation-outline" size={28} />
          <View style={styles.flex}>
            <Text style={styles.itemTitle}>Everything important, easy to find</Text>
            <Text style={styles.itemMeta}>
              Save ticket and parking details, confirmations, documents, or a shared photo-album link.
            </Text>
          </View>
        </Card>
      ) : null}

      {!isPreview && user && !isAdding ? (
        <ActionButton icon="plus" label="Add ticket, file, or link" onPress={startAdding} />
      ) : null}

      {!isPreview && user && isAdding ? (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>{editingResource ? 'Edit trip item' : 'Add a trip item'}</Text>
          <View style={styles.kindRow}>
            {resourceKinds.map((option) => (
              <Pressable
                accessibilityRole="button"
                key={option.kind}
                onPress={() => setKind(option.kind)}
                style={[styles.kindChip, kind === option.kind && styles.kindChipSelected]}>
                <Text style={[styles.kindText, kind === option.kind && styles.kindTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            accessibilityLabel="Item title"
            maxLength={160}
            onChangeText={setTitle}
            placeholder="Game tickets"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            value={title}
          />
          <TextInput
            accessibilityLabel="Item details"
            multiline
            onChangeText={setDetails}
            placeholder="Provider, section, row, seats, confirmation number…"
            placeholderTextColor={theme.colors.muted}
            style={[styles.input, styles.multilineInput]}
            textAlignVertical="top"
            value={details}
          />
          <TextInput
            accessibilityLabel="Secure link"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={setExternalUrl}
            placeholder="https://… (optional)"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            value={externalUrl}
          />
          <Text style={styles.helperText}>
            For Apple Photos or Google Photos, paste the shared-album link. Only secure HTTPS links are accepted.
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {editingResource ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void handleDelete()}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons color={theme.colors.danger} name="trash-can-outline" size={17} />
              <Text style={styles.deleteText}>
                {isDeleting ? 'Deleting…' : isConfirmingDelete ? 'Tap again to delete' : 'Delete'}
              </Text>
            </Pressable>
          ) : null}
          <View style={styles.formActions}>
            <View style={styles.flex}>
              <ActionButton label="Cancel" onPress={resetForm} secondary />
            </View>
            <View style={styles.flex}>
              <ActionButton
                icon="content-save-outline"
                label={isSaving ? 'Saving…' : editingResource ? 'Update item' : 'Save item'}
                onPress={isSaving ? undefined : () => void handleSave()}
              />
            </View>
          </View>
        </Card>
      ) : null}

      {error && !isAdding ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.md },
  flatCard: { paddingVertical: 4 },
  resourceRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm, paddingVertical: 14 },
  resourceMain: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: theme.spacing.md },
  divider: { borderTopColor: theme.colors.line, borderTopWidth: 1 },
  resourceIcon: { alignItems: 'center', backgroundColor: theme.colors.sand, borderRadius: theme.radius.md, height: 42, justifyContent: 'center', width: 42 },
  resourceStatus: { alignItems: 'flex-end', gap: 5 },
  linkedText: { color: theme.colors.forestSoft, fontSize: 9, fontWeight: '900' },
  needsDetailsText: { color: theme.colors.coral, fontSize: 9, fontWeight: '900' },
  savedText: { color: theme.colors.muted, fontSize: 9, fontWeight: '900' },
  itemTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '800' },
  itemMeta: { color: theme.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  flex: { flex: 1 },
  editButton: { alignItems: 'center', backgroundColor: theme.colors.sage, borderRadius: theme.radius.pill, height: 36, justifyContent: 'center', width: 36 },
  pressed: { opacity: 0.72 },
  loadingText: { color: theme.colors.muted, fontSize: 13 },
  emptyCard: { alignItems: 'center', backgroundColor: theme.colors.coralSoft, flexDirection: 'row', gap: theme.spacing.md },
  formCard: { gap: theme.spacing.md },
  formTitle: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 21, fontWeight: '800' },
  kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  kindChip: { backgroundColor: theme.colors.sand, borderColor: theme.colors.sand, borderRadius: theme.radius.pill, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  kindChipSelected: { backgroundColor: theme.colors.forest, borderColor: theme.colors.forest },
  kindText: { color: theme.colors.forest, fontSize: 11, fontWeight: '800' },
  kindTextSelected: { color: theme.colors.white },
  input: { backgroundColor: theme.colors.white, borderColor: theme.colors.line, borderRadius: theme.radius.md, borderWidth: 1, color: theme.colors.ink, fontSize: 15, minHeight: 50, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  multilineInput: { minHeight: 96 },
  helperText: { color: theme.colors.muted, fontSize: 11, lineHeight: 16 },
  errorText: { color: theme.colors.danger, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  deleteButton: { alignItems: 'center', alignSelf: 'flex-start', borderColor: theme.colors.danger, borderRadius: theme.radius.pill, borderWidth: 1, flexDirection: 'row', gap: 6, minHeight: 40, paddingHorizontal: theme.spacing.md },
  deleteText: { color: theme.colors.danger, fontSize: 12, fontWeight: '800' },
  formActions: { flexDirection: 'row', gap: theme.spacing.md },
});
