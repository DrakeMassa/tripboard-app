import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, SectionTitle } from '@/components/design';
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

const areaAnchors = {
  campus: { left: 51, top: 59 },
  downtown: { left: 42, top: 38 },
  arcade: { left: 67, top: 31 },
  south: { left: 62, top: 76 },
  west: { left: 20, top: 55 },
  nature: { left: 45, top: 87 },
  river: { left: 18, top: 86 },
} as const;

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
          <Text style={styles.smallActionText}>Live Google reviews</Text>
        </Pressable>
      ) : null}
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
                <Text style={styles.name}>{item.name}</Text>
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
              <Text style={styles.mapHelper}>Tap a category pin, then open Google Maps for live rating, reviews, hours, and directions.</Text>
            </View>
            <Pill tone="sand">AREA VIEW</Pill>
          </View>
          {mappable.length ? (
            <>
              <View style={styles.mapCanvas}>
                <View style={[styles.road, styles.roadHorizontal]} />
                <View style={[styles.road, styles.roadVertical]} />
                <View style={[styles.road, styles.roadDiagonal]} />
                <Text style={[styles.areaLabel, { left: '34%', top: '22%' }]}>DOWNTOWN</Text>
                <Text style={[styles.areaLabel, { left: '48%', top: '64%' }]}>CAMPUS</Text>
                <Text style={[styles.areaLabel, { left: '67%', top: '17%' }]}>ARCADE</Text>
                <Text style={[styles.areaLabel, { left: '12%', top: '67%' }]}>WEST</Text>
                {mappable.map((item, index) => {
                  const anchor = areaAnchors[item.mapArea as keyof typeof areaAnchors];
                  const isSelected = item.id === selectedMapItem?.id;
                  const shift = (index % 3) * 7;
                  return (
                    <Pressable
                      accessibilityLabel={`Show ${item.name} on the area map`}
                      key={item.id}
                      onPress={() => setSelectedMapId(item.id)}
                      style={[
                        styles.mapPin,
                        { left: `${Math.min(86, anchor.left + shift)}%`, top: `${Math.min(88, anchor.top + shift / 2)}%` },
                        isSelected && styles.mapPinSelected,
                      ]}>
                      <MaterialCommunityIcons color={isSelected ? theme.colors.white : theme.colors.forest} name={sectionIcons[item.section]} size={18} />
                    </Pressable>
                  );
                })}
              </View>
              {selectedMapItem ? (
                <Card style={styles.mapSelection}>
                  <View style={styles.flex}>
                    <Text style={styles.name}>{selectedMapItem.name}</Text>
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
        <View style={styles.videoGrid}>
          {guide.videos.map((video) => (
            <Pressable
              accessibilityRole="link"
              key={video.id}
              onPress={() => void openUrl(video.url)}
              style={({ pressed }) => [styles.videoCard, pressed && styles.pressed]}>
              <View style={styles.videoPlay}>
                <MaterialCommunityIcons color={theme.colors.white} name="play" size={20} />
              </View>
              <Text style={styles.videoLabel}>{video.label}</Text>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoCreator}>{video.creator}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={styles.footerNote}>Official pages ground the edit; Google Maps opens separately for live ratings and review counts so Wanderly never freezes an outdated score.</Text>
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
  name: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' },
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
  mapCanvas: { backgroundColor: '#e5eadf', borderColor: theme.colors.line, borderRadius: theme.radius.lg, borderWidth: 1, height: 300, overflow: 'hidden', position: 'relative' },
  road: { backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'rgba(33,70,54,0.10)', borderWidth: 1, position: 'absolute' },
  roadHorizontal: { height: 17, left: '-5%', top: '45%', transform: [{ rotate: '-8deg' }], width: '110%' },
  roadVertical: { height: '115%', left: '52%', top: '-8%', transform: [{ rotate: '12deg' }], width: 14 },
  roadDiagonal: { height: 12, left: '-10%', top: '70%', transform: [{ rotate: '22deg' }], width: '125%' },
  areaLabel: { color: 'rgba(33,70,54,0.48)', fontSize: 8, fontWeight: '900', letterSpacing: 1, position: 'absolute' },
  mapPin: { alignItems: 'center', backgroundColor: theme.colors.white, borderColor: theme.colors.forest, borderRadius: theme.radius.pill, borderWidth: 2, height: 38, justifyContent: 'center', marginLeft: -19, marginTop: -19, position: 'absolute', width: 38, ...theme.shadow },
  mapPinSelected: { backgroundColor: theme.colors.coral, borderColor: theme.colors.coral, transform: [{ scale: 1.13 }] },
  mapSelection: { borderColor: theme.colors.coral, flexDirection: 'row' },
  mapEmpty: { alignItems: 'center', backgroundColor: theme.colors.sand, flexDirection: 'row', gap: theme.spacing.md },
  videoSection: { backgroundColor: theme.colors.sand, borderRadius: theme.radius.lg, gap: theme.spacing.md, padding: theme.spacing.lg },
  videoHeadingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  videoHeading: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 18, fontWeight: '800', marginTop: 3 },
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  videoCard: { backgroundColor: theme.colors.forest, borderRadius: theme.radius.md, flexBasis: 180, flexGrow: 1, minHeight: 150, padding: theme.spacing.md },
  videoPlay: { alignItems: 'center', backgroundColor: theme.colors.coral, borderRadius: theme.radius.pill, height: 36, justifyContent: 'center', marginBottom: theme.spacing.md, width: 36 },
  videoLabel: { color: theme.colors.sage, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  videoTitle: { color: theme.colors.white, fontFamily: 'serif', fontSize: 16, fontWeight: '800', lineHeight: 20, marginTop: 5 },
  videoCreator: { color: theme.colors.sage, fontSize: 9, lineHeight: 13, marginTop: 6 },
  footerNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  pressed: { opacity: 0.74 },
});
