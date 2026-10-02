import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { GuideVideo } from '@/data/destination-guides';

export function EmbeddedVideoFeed({ videos }: { videos: GuideVideo[] }) {
  const playable = videos.filter((video) => video.provider === 'youtube' && video.embedId);
  if (!playable.length) return null;

  return (
    <div
      aria-label="Destination video carousel"
      style={{
        display: 'flex',
        gap: 14,
        overflowX: 'auto',
        paddingBottom: 8,
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}>
      {playable.map((video) => (
        <View key={video.id} style={styles.card}>
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.embedId as string)}?playsinline=1&rel=0`}
            style={{ border: 0, height: 356, width: '100%' }}
            title={video.title}
          />
          <View style={styles.copyBlock}>
            <Text style={styles.label}>{video.label}</Text>
            <Text style={styles.title}>{video.title}</Text>
            <Text style={styles.creator}>{video.creator}</Text>
          </View>
        </View>
      ))}
    </div>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.forest, borderRadius: theme.radius.lg, flexBasis: 286, flexGrow: 0, flexShrink: 0, maxWidth: 320, minWidth: 270, overflow: 'hidden' },
  copyBlock: { gap: 4, padding: theme.spacing.md },
  label: { color: theme.colors.coralSoft, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.white, fontFamily: 'serif', fontSize: 16, fontWeight: '800', lineHeight: 20 },
  creator: { color: theme.colors.sage, fontSize: 9, lineHeight: 13 },
});
