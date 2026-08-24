import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Avatar, Card, Eyebrow, Heading, PreviewNotice, Screen, SectionTitle } from '@/components/design';
import { theme } from '@/constants/theme';
import { isSupabaseConfigured } from '@/lib/supabase';

const checklist = [
  { label: 'Universal app foundation', done: true },
  { label: 'Review database migration', done: false },
  { label: 'Connect Supabase environment', done: isSupabaseConfigured },
  { label: 'Enable native share extension', done: false },
];

export default function ProfileScreen() {
  return (
    <Screen>
      <View style={styles.noticeRow}>
        <Eyebrow>YOUR SPACE</Eyebrow>
        <PreviewNotice />
      </View>
      <Heading>Ready when your{`\n`}next trip is.</Heading>

      <Card style={styles.profileCard}>
        <Avatar initials="DM" />
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>Drake Massa</Text>
          <Text style={styles.profileMeta}>Trip organizer · Preview workspace</Text>
        </View>
        <MaterialCommunityIcons color={theme.colors.muted} name="chevron-right" size={23} />
      </Card>

      <View style={styles.section}>
        <SectionTitle>Build checkpoint</SectionTitle>
        <Card style={styles.checklistCard}>
          {checklist.map((item, index) => (
            <View key={item.label} style={[styles.checkRow, index > 0 && styles.divider]}>
              <MaterialCommunityIcons
                color={item.done ? theme.colors.forestSoft : theme.colors.muted}
                name={item.done ? 'check-circle' : 'circle-outline'}
                size={21}
              />
              <Text style={[styles.checkText, item.done && styles.checkTextDone]}>{item.label}</Text>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle>Family-friendly by design</SectionTitle>
        <Card style={styles.familyCard}>
          <MaterialCommunityIcons color={theme.colors.coral} name="account-group-outline" size={32} />
          <Text style={styles.familyTitle}>Short, contextual onboarding</Text>
          <Text style={styles.familyText}>
            Instead of one long tutorial, Wanderly will teach each feature the first time someone reaches it—with a replayable two-minute tour.
          </Text>
        </Card>
      </View>

      <ActionButton label="Sign in setup comes next" secondary />
    </Screen>
  );
}

const styles = StyleSheet.create({
  noticeRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  profileCard: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  profileCopy: { flex: 1 },
  profileName: { color: theme.colors.ink, fontSize: 16, fontWeight: '800' },
  profileMeta: { color: theme.colors.muted, fontSize: 12, marginTop: 3 },
  section: { gap: theme.spacing.md },
  checklistCard: { paddingVertical: 4 },
  checkRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md, paddingVertical: 14 },
  divider: { borderTopColor: theme.colors.line, borderTopWidth: 1 },
  checkText: { color: theme.colors.muted, flex: 1, fontSize: 13 },
  checkTextDone: { color: theme.colors.ink, fontWeight: '700' },
  familyCard: { backgroundColor: theme.colors.coralSoft, gap: theme.spacing.sm },
  familyTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' },
  familyText: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
});
