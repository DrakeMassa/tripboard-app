import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Pill, SectionTitle } from '@/components/design';
import { theme } from '@/constants/theme';
import {
  getDestinationGuide,
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

export function DestinationGuide({ location }: { location: string | null | undefined }) {
  const guide = useMemo(() => getDestinationGuide(location), [location]);
  const [activeSection, setActiveSection] = useState<GuideSectionId>('game-day');

  if (!guide) return null;

  const visible = guide.recommendations.filter((item) => item.section === activeSection);
  const activeLabel = guideSections.find((section) => section.id === activeSection)?.label;

  const openSource = async (sourceUrl: string) => {
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
              onPress={() => setActiveSection(section.id)}
              style={({ pressed }) => [
                styles.chip,
                isActive && styles.chipActive,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{section.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        <Text style={styles.activeLabel}>{activeLabel?.toUpperCase()}</Text>
        {visible.map((item) => (
          <Pressable
            accessibilityHint="Opens the current source for this recommendation"
            accessibilityRole="link"
            key={item.id}
            onPress={() => void openSource(item.sourceUrl)}
            style={({ pressed }) => pressed && styles.pressed}>
            <Card style={styles.recommendationCard}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  color={theme.colors.forest}
                  name={sectionIcons[item.section]}
                  size={21}
                />
              </View>
              <View style={styles.flex}>
                <View style={styles.titleRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <MaterialCommunityIcons color={theme.colors.muted} name="open-in-new" size={16} />
                </View>
                <View style={styles.tagRow}>
                  {item.tags.map((tag) => (
                    <Text key={tag} style={styles.tag}>{tag}</Text>
                  ))}
                </View>
                <Text style={styles.localTake}>{item.localTake}</Text>
                {item.practicalNote ? (
                  <View style={styles.noteRow}>
                    <MaterialCommunityIcons color={theme.colors.coral} name="map-marker-alert-outline" size={16} />
                    <Text style={styles.note}>{item.practicalNote}</Text>
                  </View>
                ) : null}
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
      <Text style={styles.footerNote}>Open the source to verify current hours, reservations, closures, and game-day rules.</Text>
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
  list: { gap: theme.spacing.md },
  activeLabel: { color: theme.colors.coral, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  recommendationCard: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.md },
  iconBox: { alignItems: 'center', backgroundColor: theme.colors.sage, borderRadius: theme.radius.md, height: 42, justifyContent: 'center', width: 42 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm, justifyContent: 'space-between' },
  name: { color: theme.colors.ink, flex: 1, fontSize: 15, fontWeight: '800' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 },
  tag: { backgroundColor: theme.colors.coralSoft, borderRadius: theme.radius.pill, color: theme.colors.coral, fontSize: 9, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, textTransform: 'uppercase' },
  localTake: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 9 },
  noteRow: { alignItems: 'flex-start', backgroundColor: theme.colors.sand, borderRadius: theme.radius.sm, flexDirection: 'row', gap: 7, marginTop: 10, padding: 9 },
  note: { color: theme.colors.ink, flex: 1, fontSize: 10, lineHeight: 15 },
  footerNote: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  pressed: { opacity: 0.74 },
});
