import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { DestinationPhoto, getDestinationPhotos } from '@/data/destination-photos';

export function DestinationBackdrop({
  location,
  title,
  compact = false,
}: {
  location: string;
  title: string;
  compact?: boolean;
}) {
  const photoKey = `${location.trim().toLowerCase()}|${title.trim().toLowerCase()}`;
  const [photoState, setPhotoState] = useState<{ key: string; photos: DestinationPhoto[] }>({
    key: '',
    photos: [],
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const photos = photoState.key === photoKey ? photoState.photos : [];

  useEffect(() => {
    let isMounted = true;
    if (!location.trim()) return () => undefined;

    void getDestinationPhotos(location, title).then((results) => {
      if (isMounted) {
        setPhotoState({ key: photoKey, photos: results });
        setActiveIndex(0);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [location, photoKey, title]);

  useEffect(() => {
    if (compact || photos.length < 2) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 8_000);
    return () => clearInterval(timer);
  }, [compact, photos.length]);

  const photo = photos[activeIndex];
  const step = (direction: -1 | 1) => {
    if (photos.length < 2) return;
    setActiveIndex((current) => (current + direction + photos.length) % photos.length);
  };

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {photo ? (
        <Image
          accessibilityLabel={`${location} destination photo: ${photo.description}`}
          contentFit="cover"
          source={{ uri: photo.imageUrl }}
          style={StyleSheet.absoluteFill}
          transition={500}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <View style={styles.fallbackOrbLarge} />
          <View style={styles.fallbackOrbSmall} />
        </View>
      )}
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />

      {!compact && photos.length > 1 ? (
        <>
          <Pressable
            accessibilityLabel="Previous destination photo"
            accessibilityRole="button"
            onPress={() => step(-1)}
            style={({ pressed }) => [styles.previousButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons color={theme.colors.white} name="chevron-left" size={20} />
          </Pressable>
          <Pressable
            accessibilityLabel="Next destination photo"
            accessibilityRole="button"
            onPress={() => step(1)}
            style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons color={theme.colors.white} name="chevron-right" size={20} />
          </Pressable>
          <View pointerEvents="none" style={styles.dots}>
            {photos.map((item, index) => (
              <View
                key={item.id}
                style={[styles.dot, index === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
        </>
      ) : null}

      {photo && compact ? (
        <View pointerEvents="none" style={[styles.credit, styles.creditCompact]}>
          <Text numberOfLines={1} style={styles.creditText}>{photo.license}</Text>
        </View>
      ) : null}
      {photo && !compact ? (
        <Pressable
          accessibilityLabel={`Photo credit: ${photo.credit}, ${photo.license}`}
          accessibilityRole="link"
          onPress={() => void Linking.openURL(photo.sourceUrl)}
          style={({ pressed }) => [styles.credit, pressed && styles.pressed]}>
          <Text numberOfLines={1} style={styles.creditText}>
            {photo.credit} · {photo.license}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: theme.colors.forest, overflow: 'hidden' },
  fallbackOrbLarge: {
    backgroundColor: theme.colors.forestSoft,
    borderRadius: 180,
    height: 340,
    position: 'absolute',
    right: -120,
    top: -130,
    width: 340,
  },
  fallbackOrbSmall: {
    backgroundColor: 'rgba(221,231,218,0.08)',
    borderRadius: 90,
    bottom: -55,
    height: 170,
    left: -40,
    position: 'absolute',
    width: 170,
  },
  scrim: { backgroundColor: 'rgba(8,28,20,0.48)' },
  previousButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: theme.radius.pill,
    height: 34,
    justifyContent: 'center',
    left: 10,
    position: 'absolute',
    top: '44%',
    width: 34,
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: theme.radius.pill,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: '44%',
    width: 34,
  },
  dots: {
    alignItems: 'center',
    bottom: 12,
    flexDirection: 'row',
    gap: 5,
    left: 0,
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
  },
  dot: { backgroundColor: 'rgba(255,255,255,0.48)', borderRadius: 4, height: 5, width: 5 },
  dotActive: { backgroundColor: theme.colors.white, width: 15 },
  credit: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: theme.radius.pill,
    bottom: 8,
    maxWidth: '58%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 8,
  },
  creditCompact: { maxWidth: '45%' },
  creditText: { color: theme.colors.white, fontSize: 8, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
