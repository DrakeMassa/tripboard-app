import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { GuideVideo } from '@/data/destination-guides';

export function EmbeddedVideoFeed({ videos }: { videos: GuideVideo[] }) {
  return (
    <View style={styles.list}>
      {videos.map((video) => (
        <Pressable accessibilityRole="link" key={video.id} onPress={() => void Linking.openURL(video.url)} style={styles.card}>
          <View style={styles.play}>
            <MaterialCommunityIcons color={theme.colors.white} name="play" size={20} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.label}>{video.label}</Text>
            <Text style={styles.title}>{video.title}</Text>
            <Text style={styles.creator}>{video.creator}</Text>
          </View>
          <MaterialCommunityIcons color={theme.colors.sage} name="open-in-new" size={18} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: theme.spacing.md },
  card: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.md, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.md },
  play: { alignItems: 'center', backgroundColor: theme.colors.coral, borderRadius: theme.radius.pill, height: 38, justifyContent: 'center', width: 38 },
  flex: { flex: 1 },
  label: { color: theme.colors.coralSoft, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.white, fontSize: 14, fontWeight: '800', marginTop: 3 },
  creator: { color: theme.colors.sage, fontSize: 9, marginTop: 3 },
});
