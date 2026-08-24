import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Eyebrow({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return <Text style={[styles.eyebrow, inverse && styles.eyebrowInverse]}>{children}</Text>;
}

export function Heading({ children }: { children: ReactNode }) {
  return <Text style={styles.heading}>{children}</Text>;
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({
  children,
  tone = 'sage',
}: {
  children: ReactNode;
  tone?: 'sage' | 'sand' | 'coral' | 'white';
}) {
  return (
    <View
      style={[
        styles.pill,
        tone === 'sage' && styles.pillSage,
        tone === 'sand' && styles.pillSand,
        tone === 'coral' && styles.pillCoral,
        tone === 'white' && styles.pillWhite,
      ]}>
      <Text style={[styles.pillText, tone === 'white' && styles.pillTextWhite]}>{children}</Text>
    </View>
  );
}

export function RoundIcon({
  name,
  color = theme.colors.forest,
  backgroundColor = theme.colors.sage,
  size = 20,
}: {
  name: IconName;
  color?: string;
  backgroundColor?: string;
  size?: number;
}) {
  return (
    <View style={[styles.roundIcon, { backgroundColor }]}>
      <MaterialCommunityIcons color={color} name={name} size={size} />
    </View>
  );
}

export function ActionButton({
  label,
  icon,
  onPress,
  secondary = false,
}: {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        secondary && styles.actionButtonSecondary,
        pressed && styles.pressed,
      ]}>
      {icon ? (
        <MaterialCommunityIcons
          color={secondary ? theme.colors.forest : theme.colors.white}
          name={icon}
          size={18}
        />
      ) : null}
      <Text style={[styles.actionButtonText, secondary && styles.actionButtonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Avatar({ initials, offset = false }: { initials: string; offset?: boolean }) {
  return (
    <View style={[styles.avatar, offset && styles.avatarOffset]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

export function PreviewNotice({ label = 'PRODUCT PREVIEW' }: { label?: string }) {
  return (
    <View style={styles.previewNotice}>
      <MaterialCommunityIcons color={theme.colors.coral} name="flask-outline" size={15} />
      <Text style={styles.previewNoticeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.canvas,
    flex: 1,
  },
  screenContent: {
    alignSelf: 'center',
    gap: theme.spacing.xl,
    maxWidth: 720,
    paddingBottom: 120,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    width: '100%',
  },
  eyebrow: {
    color: theme.colors.coral,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  eyebrowInverse: {
    color: theme.colors.sage,
  },
  heading: {
    color: theme.colors.ink,
    fontFamily: 'serif',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1.1,
    lineHeight: 41,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontFamily: 'serif',
    fontSize: 23,
    fontWeight: '700',
  },
  sectionAction: {
    color: theme.colors.forestSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillSage: { backgroundColor: theme.colors.sage },
  pillSand: { backgroundColor: theme.colors.sand },
  pillCoral: { backgroundColor: theme.colors.coralSoft },
  pillWhite: { backgroundColor: 'rgba(255,255,255,0.14)' },
  pillText: {
    color: theme.colors.forest,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  pillTextWhite: { color: theme.colors.white },
  roundIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.coral,
    borderColor: theme.colors.coral,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.spacing.lg,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.forest,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  actionButtonTextSecondary: { color: theme.colors.forest },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.sky,
    borderColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarOffset: { marginLeft: -8 },
  avatarText: {
    color: theme.colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  previewNotice: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.coralSoft,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewNoticeText: {
    color: theme.colors.coral,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
});
