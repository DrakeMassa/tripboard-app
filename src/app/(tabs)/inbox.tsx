import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Eyebrow, Heading, Pill, PreviewNotice, Screen } from '@/components/design';
import { theme } from '@/constants/theme';
import { previewClips } from '@/data/preview';

export default function InboxScreen() {
  return (
    <Screen>
      <View style={styles.headingBlock}>
        <View style={styles.noticeRow}>
          <Eyebrow>TRIP INBOX</Eyebrow>
          <PreviewNotice label="PHASE 2 PREVIEW" />
        </View>
        <Heading>Save inspiration{`\n`}where it belongs.</Heading>
        <Text style={styles.intro}>
          Share a TikTok, Reel, or link to Wanderly. Everyone’s finds become one trip feed—and useful places can be added to the map.
        </Text>
      </View>

      <Card style={styles.howCard}>
        <View style={styles.stepIcon}>
          <MaterialCommunityIcons color={theme.colors.white} name="share-variant-outline" size={21} />
        </View>
        <View style={styles.howCopy}>
          <Text style={styles.howTitle}>From any app, tap Share</Text>
          <Text style={styles.howText}>Choose Wanderly, then select the trip. The native share extension is planned for Phase 2.</Text>
        </View>
      </Card>

      <View style={styles.filterRow}>
        <Pill>ALL · 24</Pill>
        <Pill tone="sand">ROME · 11</Pill>
        <Pill tone="sand">FLORENCE · 8</Pill>
      </View>

      <View style={styles.feed}>
        {previewClips.map((clip, index) => (
          <Card key={clip.id} style={styles.clipCard}>
            <View style={[styles.clipVisual, { backgroundColor: clip.accent }]}>
              <View style={styles.playButton}>
                <MaterialCommunityIcons color={theme.colors.white} name="play" size={28} />
              </View>
              <View style={styles.sourceChip}>
                <Text style={styles.sourceText}>{clip.source}</Text>
              </View>
              <Text style={styles.clipNumber}>{String(index + 1).padStart(2, '0')}</Text>
            </View>
            <View style={styles.clipCopy}>
              <Text style={styles.clipTitle}>{clip.title}</Text>
              <View style={styles.placeRow}>
                <MaterialCommunityIcons color={theme.colors.coral} name="map-marker-outline" size={16} />
                <Text style={styles.placeText}>{clip.place}</Text>
              </View>
              <Text style={styles.addedText}>Added by {clip.addedBy}</Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headingBlock: { gap: theme.spacing.md },
  noticeRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  intro: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  howCard: { alignItems: 'center', backgroundColor: theme.colors.sage, flexDirection: 'row', gap: theme.spacing.md },
  stepIcon: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.md, height: 46, justifyContent: 'center', width: 46 },
  howCopy: { flex: 1 },
  howTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: '800' },
  howText: { color: theme.colors.forestSoft, fontSize: 12, lineHeight: 17, marginTop: 3 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  feed: { gap: theme.spacing.lg },
  clipCard: { flexDirection: 'row', gap: theme.spacing.lg, padding: theme.spacing.md },
  clipVisual: { borderRadius: theme.radius.md, height: 145, justifyContent: 'center', overflow: 'hidden', width: 108 },
  playButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: theme.radius.pill, height: 48, justifyContent: 'center', width: 48 },
  sourceChip: { backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: theme.radius.pill, left: 8, paddingHorizontal: 8, paddingVertical: 4, position: 'absolute', top: 8 },
  sourceText: { color: theme.colors.white, fontSize: 9, fontWeight: '800' },
  clipNumber: { bottom: -8, color: 'rgba(255,255,255,0.18)', fontFamily: 'serif', fontSize: 52, fontWeight: '900', position: 'absolute', right: 5 },
  clipCopy: { flex: 1, justifyContent: 'center' },
  clipTitle: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 18, fontWeight: '800', lineHeight: 22 },
  placeRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 11 },
  placeText: { color: theme.colors.forestSoft, flex: 1, fontSize: 12, fontWeight: '700' },
  addedText: { color: theme.colors.muted, fontSize: 10, marginTop: 8 },
});
