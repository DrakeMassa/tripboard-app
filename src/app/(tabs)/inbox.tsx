import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { ActionButton, Card, Eyebrow, Heading, Pill, PreviewNotice, Screen } from '@/components/design';
import { theme } from '@/constants/theme';
import { listTrips, LiveTrip } from '@/data/live';

const nextImports = [
  {
    icon: 'email-fast-outline' as const,
    title: 'Forward booking emails',
    copy: 'Send airline, hotel, rental-car, and ticket confirmations to a private trip address. Wanderly will extract the details and ask you to approve them.',
  },
  {
    icon: 'calendar-sync' as const,
    title: 'Connect one calendar',
    copy: 'Authorize only the calendar you choose. Google and Outlook come first; Apple Calendar can use standard calendar files without mailbox access.',
  },
  {
    icon: 'wallet-outline' as const,
    title: 'Open passes at the source',
    copy: 'Keep the secure airline, hotel, Ticketmaster, or wallet link with the trip so the current pass opens without Wanderly copying the credential.',
  },
];

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [trip, setTrip] = useState<LiveTrip | null>(null);

  useEffect(() => {
    if (!user) {
      void Promise.resolve().then(() => setTrip(null));
      return;
    }
    let isMounted = true;
    void listTrips()
      .then((trips) => {
        if (isMounted) setTrip(trips[0] ?? null);
      })
      .catch(() => {
        if (isMounted) setTrip(null);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <Screen>
      <View style={styles.headingBlock}>
        <View style={styles.noticeRow}>
          <Eyebrow>TRIP INBOX</Eyebrow>
          <PreviewNotice label="IMPORT ROADMAP" />
        </View>
        <Heading>Bring it in.{`\n`}Don’t type it twice.</Heading>
        <Text style={styles.intro}>
          The goal is simple: confirmations arrive in Wanderly, you approve what was found, and the useful details land in the right trip.
        </Text>
      </View>

      <View style={styles.availableGrid}>
        <Card style={styles.availableCard}>
          <Pill>AVAILABLE NOW</Pill>
          <MaterialCommunityIcons color={theme.colors.forest} name="calendar-export" size={30} />
          <Text style={styles.cardTitle}>Calendar export</Text>
          <Text style={styles.cardCopy}>Save a flight, stay, or plan, then use its calendar icon to add a standard calendar entry.</Text>
        </Card>
        <Card style={styles.availableCard}>
          <Pill>AVAILABLE NOW</Pill>
          <MaterialCommunityIcons color={theme.colors.coral} name="ticket-confirmation-outline" size={30} />
          <Text style={styles.cardTitle}>Ticket and pass links</Text>
          <Text style={styles.cardCopy}>Save a secure provider link once, then open the current boarding pass, game ticket, or booking from the trip.</Text>
        </Card>
      </View>

      {trip ? (
        <ActionButton
          icon="bag-suitcase-outline"
          label={`Open ${trip.title}`}
          onPress={() => router.push(`/trips/${trip.id}`)}
        />
      ) : (
        <ActionButton
          icon={user ? 'plus' : 'login'}
          label={user ? 'Create a trip first' : 'Sign in to use Trip Inbox'}
          onPress={() => router.push(user ? '/trips' : '/profile')}
          secondary
        />
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>The automatic import layer</Text>
          <Pill tone="sand">NEXT</Pill>
        </View>
        {nextImports.map((item) => (
          <Card key={item.title} style={styles.importCard}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons color={theme.colors.white} name={item.icon} size={22} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardCopy}>{item.copy}</Text>
            </View>
          </Card>
        ))}
      </View>

      <Card style={styles.privacyCard}>
        <MaterialCommunityIcons color={theme.colors.forest} name="shield-check-outline" size={26} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>Personal, not creepy</Text>
          <Text style={styles.cardCopy}>
            Destination imagery and suggestions should use the trip context and interests you explicitly choose—sports, hiking, food, culture—not hidden browsing or search tracking.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headingBlock: { gap: theme.spacing.md },
  noticeRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  intro: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  availableGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  availableCard: { flex: 1, gap: theme.spacing.sm, minWidth: 240 },
  cardTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' },
  cardCopy: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  section: { gap: theme.spacing.md },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 23, fontWeight: '700' },
  importCard: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  iconBox: { alignItems: 'center', backgroundColor: theme.colors.forest, borderRadius: theme.radius.md, height: 46, justifyContent: 'center', width: 46 },
  privacyCard: { alignItems: 'center', backgroundColor: theme.colors.sage, flexDirection: 'row', gap: theme.spacing.md },
  flex: { flex: 1 },
});
