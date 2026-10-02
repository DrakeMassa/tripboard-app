import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, SectionTitle } from '@/components/design';
import { DestinationMap } from '@/components/DestinationMap';
import { EmbeddedVideoFeed } from '@/components/EmbeddedVideoFeed';
import { theme } from '@/constants/theme';
import {
  getDestinationGuide,
  GuideRecommendation,
  GuideSectionId,
  guideSections,
} from '@/data/destination-guides';
import { normalizeExternalResourceUrl } from '@/domain/resources';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const sectionIcons: Record<GuideSectionId, IconName> = {
  'game-day': 'stadium-outline',
  coffee: 'coffee-outline',
  breakfast: 'food-croissant',
  lunch: 'food-outline',
  dinner: 'silverware-fork-knife',
  'hidden-gems': 'diamond-stone',
  outdoors: 'pine-tree',
  shopping: 'shopping-outline',
  practical: 'information-outline',
  'fun-facts': 'lightbulb-on-outline',
};

function googleMapsUrl(item: GuideRecommendation): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name}, Columbia, Missouri`)}`;
}

function RecommendationActions({ item, openUrl }: { item: GuideRecommendation; openUrl: (url: string) => Promise<void> }) {
  return (
    <View style={styles.cardActions}>
      <Pressable accessibilityRole="link" onPress={() => void openUrl(item.sourceUrl)} style={styles.smallAction}>
        <MaterialCommunityIcons color={theme.colors.forest} name="check-decagram-outline" size={15} />
        <Text style={styles.smallActionText}>Official info</Text>
      </Pressable>
      {item.mapArea ? (
        <Pressable accessibilityRole="link" onPress={() => void openUrl(googleMapsUrl(item))} style={styles.smallAction}>
          <MaterialCommunityIcons color={theme.colors.forest} name="google-maps" size={15} />
          <Text style={styles.smallActionText}>Current reviews & hours</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function RecommendationRating({ item, openUrl }: { item: GuideRecommendation; openUrl: (url: string) => Promise<void> }) {
  if (!item.rating) return null;
  return (
    <View style={styles.ratingRow}>
      <Pressable
        accessibilityLabel={`${item.name} rating ${item.rating.score.toFixed(1)} out of 5`}
        accessibilityRole="link"
        onPress={() => void openUrl(item.rating?.sourceUrl ?? '')}
        style={({ pressed }) => [styles.ratingBadge, pressed && styles.pressed]}>
        <MaterialCommunityIcons color={theme.colors.coral} name="star" size={15} />
        <Text style={styles.ratingScore}>{item.rating.score.toFixed(1)} / 5</Text>
      </Pressable>
      <Text style={styles.ratingMeta}>
        {item.rating.source} snapshot{item.rating.countLabel ? ` · ${item.rating.countLabel}` : ''} · checked {item.rating.checkedAt}
      </Text>
    </View>
  );
}

export function DestinationGuide({ location }: { location: string | null | undefined }) {
  const guide = useMemo(() => getDestinationGuide(location), [location]);
  const [activeSection, setActiveSection] = useState<GuideSectionId>('game-day');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  if (!guide) return null;

  const visible = guide.recommendations.filter((item) => item.section === activeSection);
  const mappable = visible.filter((item) => item.mapArea);
  const selectedMapItem = mappable.find((item) => item.id === selectedMapId) ?? mappable[0];
  const activeLabel = guideSections.find((section) => section.id === activeSection)?.label;

  const openUrl = async (sourceUrl: string) => {
    const safeUrl = normalizeExternalResourceUrl(sourceUrl);
    if (safeUrl) await Linking.openURL(safeUrl);
  };

  return (
    <View style={styles.section}>
      <SectionTitle action={`Updated ${guide.updatedAt}`}>Wanderly local edit</SectionTitle>
      <Card style={styles.introCard}>
        <View style={styles.introTop}>
          <View style={styles.sparkle}>
            <MaterialCommunityIcons color={theme.colors.white} name="creation-outline" size={22} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.heading}>{guide.destination}, like a local</Text>
            <Text style={styles.intro}>{guide.intro}</Text>
          </View>
          <Pill tone="white">CURATED PILOT</Pill>
        </View>
        <Text style={styles.transparency}>
          AI-assisted summaries grounded in current official tourism and venue sources. No hidden search-history profiling.
        </Text>
      </Card>

      <View accessibilityRole="tablist" style={styles.chips}>
        {guideSections.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              key={section.id}
              onPress={() => {
                setActiveSection(section.id);
                setSelectedMapId(null);
              }}
              style={({ pressed }) => [styles.chip, isActive && styles.chipActive, pressed && styles.pressed]}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{section.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.viewToggle}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'list' }}
          onPress={() => setViewMode('list')}
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}>
          <MaterialCommunityIcons color={viewMode === 'list' ? theme.colors.white : theme.colors.forest} name="format-list-bulleted" size={17} />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>Local list</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'map' }}
          onPress={() => setViewMode('map')}
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}>
          <MaterialCommunityIcons color={viewMode === 'map' ? theme.colors.white : theme.colors.forest} name="map-outline" size={17} />
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>Map</Text>
        </Pressable>
      </View>

      {viewMode === 'list' ? (
        <View style={styles.list}>
          <Text style={styles.activeLabel}>{activeLabel?.toUpperCase()} · {visible.length} PICKS</Text>
          {visible.map((item) => (
            <Card key={item.id} style={styles.recommendationCard}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons color={theme.colors.forest} name={sectionIcons[item.section]} size={21} />
              </View>
              <View style={styles.flex}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <RecommendationRating item={item} openUrl={openUrl} />
                </View>
                <View style={styles.tagRow}>
                  {item.tags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}
                </View>
                <Text style={styles.localTake}>{item.localTake}</Text>
                {item.practicalNote ? (
                  <View style={styles.noteRow}>
                    <MaterialCommunityIcons color={theme.colors.coral} name="map-marker-alert-outline" size={16} />
                    <Text style={styles.note}>{item.practicalNote}</Text>
                  </View>
                ) : null}
                <RecommendationActions item={item} openUrl={openUrl} />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <View style={styles.flex}>
              <Text style={styles.activeLabel}>{activeLabel?.toUpperCase()} MAP</Text>
              <Text style={styles.mapHelper}>Choose a local pick to move the free area map. Reviews, current hours, and turn-by-turn directions open only when requested.</Text>
            </View>
            <Pill tone="sand">AREA VIEW</Pill>
          </View>
          {mappable.length ? (
            <>
              <DestinationMap
                destination={guide.destination}
                items={mappable}
                onSelect={setSelectedMapId}
                selectedId={selectedMapItem?.id ?? null}
              />
              {selectedMapItem ? (
                <Card style={styles.mapSelection}>
                  <View style={styles.flex}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{selectedMapItem.name}</Text>
                      <RecommendationRating item={selectedMapItem} openUrl={openUrl} />
                    </View>
                    <Text style={styles.localTake}>{selectedMapItem.localTake}</Text>
                    <RecommendationActions item={selectedMapItem} openUrl={openUrl} />
                  </View>
                </Card>
              ) : null}
            </>
          ) : (
            <Card style={styles.mapEmpty}>
              <MaterialCommunityIcons color={theme.colors.moss} name="map-marker-off-outline" size={26} />
              <Text style={styles.localTake}>This category is advice rather than a physical place. Switch to Local list to read it.</Text>
            </Card>
          )}
        </View>
      )}

      <View style={styles.videoSection}>
        <View style={styles.videoHeadingRow}>
          <View style={styles.flex}>
            <Text style={styles.activeLabel}>WATCH BEFORE YOU GO</Text>
            <Text style={styles.videoHeading}>Short inspiration, only if you want it</Text>
          </View>
          <MaterialCommunityIcons color={theme.colors.coral} name="play-box-multiple-outline" size={25} />
        </View>
        <EmbeddedVideoFeed videos={guide.videos} />
      </View>
      <Text style={styles.footerNote}>Ratings shown in the cards are dated public snapshots, not invented live data. Wanderly keeps the map free and opens current reviews, photos, hours, and directions only when you ask for them.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.md },
  introCard: { backgroundColor: theme.colors.forest, gap: theme.spacing.md },
  introTop: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  sparkle: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: theme.radius.md, height: 44, justifyContent: 'center', width: 44 },
  heading: { color: theme.colors.white, fontFamily: 'serif', fontSize: 21, fontWeight: '800' },
  intro: { color: theme.colors.sage, fontSize: 12, lineHeight: 18, marginTop: 4 },
  transparency: { borderTopColor: 'rgba(255,255,255,0.16)', borderTopWidth: 1, color: theme.colors.sage, fontSize: 10, lineHeight: 15, paddingTop: theme.spacing.md },
  flex: { flex: 1, minWidth: 210 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: { backgroundColor: theme.colors.sand, borderColor: theme.colors.sand, borderRadius: theme.radius.pill, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  chipActive: { backgroundColor: theme.colors.forest, borderColor: theme.colors.forest },
  chipText: { color: theme.colors.forest, fontSize: 11, fontWeight: '800' },
  chipTextActive: { color: theme.colors.white },
  viewToggle: { alignSelf: 'flex-start', backgroundColor: theme.colors.sand, borderRadius: theme.radius.pill, flexDirection: 'row', padding: 4 },
  toggleButton: { alignItems: 'center', borderRadius: theme.radius.pill, flexDirection: 'row', gap: 6, paddingHorizontal: 13, paddingVertical: 8 },
  toggleButtonActive: { backgroundColor: theme.colors.forest },
  toggleText: { color: theme.colors.forest, fontSize: 11, fontWeight: '800' },
  toggleTextActive: { color: theme.colors.white },
  list: { gap: theme.spacing.md },
  activeLabel: { color: theme.colors.coral, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  recommendationCard: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.md },
  iconBox: { alignItems: 'center', backgroundColor: theme.colors.sage, borderRadius: theme.radius.md, height: 42, justifyContent: 'center', width: 42 },
  nameRow: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  name: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' },
  ratingRow: { alignItems: 'flex-end', gap: 3 },
  ratingBadge: { alignItems: 'center', backgroundColor: theme.colors.coralSoft, borderRadius: theme.radius.pill, flexDirection: 'row', gap: 4, minHeight: 28, paddingHorizontal: 9 },
  ratingScore: { color: theme.colors.coral, fontSize: 11, fontWeight: '900' },
  ratingMeta: { color: theme.colors.muted, fontSize: 8, lineHeight: 11, maxWidth: 210, textAlign: 'right' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 },
  tag: { backgroundColor: theme.colors.coralSoft, borderRadius: theme.radius.pill, color: theme.colors.coral, fontSize: 9, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, textTransform: 'uppercase' },
  localTake: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 9 },
  noteRow: { alignItems: 'flex-start', backgroundColor: theme.colors.sand, borderRadius: theme.radius.sm, flexDirection: 'row', gap: 7, marginTop: 10, padding: 9 },
  note: { color: theme.colors.ink, flex: 1, fontSize: 10, lineHeight: 15 },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.md },
  smallAction: { alignItems: 'center', borderColor: theme.colors.line, borderRadius: theme.radius.pill, borderWidth: 1, flexDirection: 'row', gap: 5, minHeight: 34, paddingHorizontal: 10 },
  smallActionText: { color: theme.colors.forest, fontSize: 10, fontWeight: '800' },
  mapSection: { gap: theme.spacing.md },
  mapHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.md, justifyContent: 'space-between' },
  mapHelper: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4, maxWidth: 430 },
  mapSelection: { borderColor: theme.colors.coral, flexDirection: 'row' },
  mapEmpty: { alignItems: 'center', backgroundColor: theme.colors.sand, flexDirection: 'row', gap: theme.spacing.md },
  videoSection: { backgroundColor: theme.colors.sand, borderRadius: theme.radius.lg, gap: theme.spacing.md, padding: theme.spacing.lg },
  videoHeadingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  videoHeading: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 18, fontWeight: '800', marginTop: 3 },
  footerNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  pressed: { opacity: 0.74 },
});
