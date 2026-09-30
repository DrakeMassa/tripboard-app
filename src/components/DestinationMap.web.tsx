import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { GuideRecommendation, GuideSectionId } from '@/data/destination-guides';

type LatLngLiteral = { lat: number; lng: number };

type MapInstance = {
  fitBounds: (bounds: BoundsInstance, padding?: number) => void;
  getZoom: () => number | undefined;
  setCenter: (position: LatLngLiteral) => void;
  setZoom: (zoom: number) => void;
};

type BoundsInstance = {
  extend: (position: LatLngLiteral) => void;
};

type MapConstructor = new (
  element: HTMLElement,
  options: Record<string, unknown>,
) => MapInstance;

type BoundsConstructor = new () => BoundsInstance;

type MarkerInstance = {
  map: MapInstance | null;
  addListener: (eventName: string, listener: () => void) => void;
};

type MarkerConstructor = new (options: {
  content?: HTMLElement;
  map: MapInstance;
  position: LatLngLiteral;
  title: string;
  zIndex?: number;
}) => MarkerInstance;

type PinElementConstructor = new (options: {
  background: string;
  borderColor: string;
  glyph: string;
  glyphColor: string;
  scale?: number;
}) => { element: HTMLElement };

type PlaceResult = {
  displayName?: string;
  formattedAddress?: string;
  googleMapsURI?: string;
  location?: LatLngLiteral;
  rating?: number;
  userRatingCount?: number;
};

type PlaceSearchClass = {
  searchByText: (request: {
    fields: string[];
    includedType?: string;
    language?: string;
    maxResultCount: number;
    region?: string;
    textQuery: string;
  }) => Promise<{ places: PlaceResult[] }>;
};

type GoogleMapsNamespace = {
  importLibrary: (name: string) => Promise<unknown>;
};

type GoogleWindow = Window & {
  google?: { maps?: GoogleMapsNamespace };
  __wanderlyGoogleMapsReady?: () => void;
};

type ResolvedPlace = PlaceResult & { id: string };

const sectionGlyphs: Record<GuideSectionId, string> = {
  'game-day': '★',
  coffee: '☕',
  breakfast: '☀',
  lunch: '●',
  dinner: '◆',
  'hidden-gems': '✦',
  outdoors: '▲',
  shopping: '▣',
  practical: 'i',
  'fun-facts': '!',
};

let mapsPromise: Promise<GoogleMapsNamespace> | null = null;

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsNamespace> {
  const googleWindow = window as GoogleWindow;
  if (googleWindow.google?.maps) return Promise.resolve(googleWindow.google.maps);
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const callbackName = '__wanderlyGoogleMapsReady';
    googleWindow[callbackName] = () => {
      if (googleWindow.google?.maps) resolve(googleWindow.google.maps);
      else reject(new Error('Google Maps loaded without the Maps library.'));
      delete googleWindow[callbackName];
    };

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      mapsPromise = null;
      reject(new Error('Google Maps could not load. Check the API key and website restrictions.'));
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=${callbackName}`;
    document.head.appendChild(script);
  });

  return mapsPromise;
}

function previewMapUrl(destination: string): string {
  const isColumbia = /\bcolumbia\b/i.test(destination) && /\b(missouri|mo)\b/i.test(destination);
  const center = isColumbia ? '38.9517%2C-92.3341' : '39.8283%2C-98.5795';
  const bounds = isColumbia
    ? '-92.4300%2C38.8900%2C-92.2400%2C39.0200'
    : '-125.0000%2C24.0000%2C-66.0000%2C50.0000';
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bounds}&layer=mapnik&marker=${center}`;
}

function liveMapUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function DestinationMap({
  destination,
  items,
  onSelect,
  selectedId,
}: {
  destination: string;
  items: GuideRecommendation[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const mapId = process.env.EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || 'DEMO_MAP_ID';
  const mapElement = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapInstance | null>(null);
  const markers = useRef<MarkerInstance[]>([]);
  const cache = useRef(new Map<string, ResolvedPlace>());
  const onSelectRef = useRef(onSelect);
  const [resolvedPlaces, setResolvedPlaces] = useState<ResolvedPlace[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const selectedItem = items.find((item) => item.id === selectedId) ?? items[0];
  const selectedPlace = resolvedPlaces.find((place) => place.id === selectedItem?.id);
  const itemKey = useMemo(() => items.map((item) => `${item.id}:${item.name}`).join('|'), [items]);

  useEffect(() => {
    if (!apiKey || !mapElement.current || !items.length) return;
    let cancelled = false;

    const renderMap = async () => {
      setStatus('loading');
      setMessage(null);
      try {
        const maps = await loadGoogleMaps(apiKey);
        const [{ Map, LatLngBounds }, { AdvancedMarkerElement, PinElement }, { Place }] = await Promise.all([
          maps.importLibrary('maps') as Promise<{ Map: MapConstructor; LatLngBounds: BoundsConstructor }>,
          maps.importLibrary('marker') as Promise<{
            AdvancedMarkerElement: MarkerConstructor;
            PinElement: PinElementConstructor;
          }>,
          maps.importLibrary('places') as Promise<{ Place: PlaceSearchClass }>,
        ]);
        if (cancelled || !mapElement.current) return;

        if (!map.current) {
          map.current = new Map(mapElement.current, {
            center: { lat: 38.9517, lng: -92.3341 },
            clickableIcons: true,
            controlSize: 30,
            fullscreenControl: true,
            mapId,
            mapTypeControl: false,
            rotateControl: true,
            streetViewControl: true,
            tilt: 45,
            zoom: 13,
          });
        }

        const places = await Promise.all(
          items.map(async (item): Promise<ResolvedPlace | null> => {
            const cached = cache.current.get(item.id);
            if (cached) return cached;
            const response = await Place.searchByText({
              fields: [
                'displayName',
                'formattedAddress',
                'googleMapsURI',
                'location',
                'rating',
                'userRatingCount',
              ],
              language: 'en',
              maxResultCount: 1,
              region: 'us',
              textQuery: `${item.name}, ${destination}`,
            });
            const place = response.places[0];
            if (!place?.location) return null;
            const resolved = { ...place, id: item.id };
            cache.current.set(item.id, resolved);
            return resolved;
          }),
        );
        if (cancelled || !map.current) return;

        markers.current.forEach((marker) => {
          marker.map = null;
        });
        markers.current = [];

        const validPlaces = places.filter((place): place is ResolvedPlace => Boolean(place?.location));
        const bounds = new LatLngBounds();
        validPlaces.forEach((place) => {
          const item = items.find((candidate) => candidate.id === place.id);
          if (!item || !place.location || !map.current) return;
          const isSelected = item.id === selectedId || (!selectedId && item.id === items[0]?.id);
          const pin = new PinElement({
            background: isSelected ? theme.colors.coral : theme.colors.forest,
            borderColor: theme.colors.white,
            glyph: sectionGlyphs[item.section],
            glyphColor: theme.colors.white,
            scale: isSelected ? 1.15 : 0.94,
          });
          const marker = new AdvancedMarkerElement({
            content: pin.element,
            map: map.current,
            position: place.location,
            title: item.name,
            zIndex: isSelected ? 10 : 1,
          });
          marker.addListener('click', () => onSelectRef.current(item.id));
          markers.current.push(marker);
          bounds.extend(place.location);
        });

        if (validPlaces.length === 1 && validPlaces[0].location) {
          map.current.setCenter(validPlaces[0].location);
          map.current.setZoom(15);
        } else if (validPlaces.length > 1) {
          map.current.fitBounds(bounds, 54);
          if ((map.current.getZoom() ?? 13) > 15) map.current.setZoom(15);
        }

        setResolvedPlaces(validPlaces);
        setStatus('ready');
      } catch (cause) {
        if (cancelled) return;
        setStatus('error');
        setMessage(cause instanceof Error ? cause.message : 'Google Maps could not load.');
      }
    };

    void renderMap();
    return () => {
      cancelled = true;
    };
  }, [apiKey, destination, itemKey, items, mapId, selectedId]);

  if (!items.length) return null;

  if (!apiKey || status === 'error') {
    const query = `${selectedItem?.name ?? destination}, ${destination}`;
    return (
      <View style={styles.shell}>
        <iframe
          allowFullScreen
          aria-label={`Map of ${query}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={previewMapUrl(destination)}
          style={{ border: 0, height: 344, width: '100%' }}
          title={`Map of ${query}`}
        />
        <View style={styles.previewBanner}>
          <View style={styles.flex}>
            <Text style={styles.bannerTitle}>{status === 'error' ? 'Google connection needs attention' : 'Map preview'}</Text>
            <Text style={styles.bannerCopy}>
              {message ?? 'Add the restricted Maps + Places browser key to unlock every category pin, live ratings, and review counts.'}
            </Text>
          </View>
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(liveMapUrl(query))} style={styles.openButton}>
            <Text style={styles.openButtonText}>Open live</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <div
        aria-label={`Interactive Google map of ${destination}`}
        ref={mapElement}
        role="application"
        style={{ height: 390, width: '100%' }}
      />
      <View style={styles.liveBanner}>
        <View style={styles.flex}>
          <Text style={styles.bannerTitle}>
            {status === 'loading' ? 'Loading live places…' : selectedPlace?.displayName ?? selectedItem?.name}
          </Text>
          {selectedPlace?.rating ? (
            <Text style={styles.rating}>
              {selectedPlace.rating.toFixed(1)} ★ · {(selectedPlace.userRatingCount ?? 0).toLocaleString()} Google reviews
            </Text>
          ) : (
            <Text style={styles.bannerCopy}>Select a pin for live Google place details.</Text>
          )}
          {selectedPlace?.formattedAddress ? <Text style={styles.address}>{selectedPlace.formattedAddress}</Text> : null}
        </View>
        {selectedPlace?.googleMapsURI ? (
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(selectedPlace.googleMapsURI as string)} style={styles.openButton}>
            <Text style={styles.openButtonText}>Directions</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderRadius: theme.radius.lg, borderWidth: 1, overflow: 'hidden' },
  previewBanner: { alignItems: 'center', backgroundColor: theme.colors.sand, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.md },
  liveBanner: { alignItems: 'center', backgroundColor: theme.colors.surface, borderTopColor: theme.colors.line, borderTopWidth: 1, flexDirection: 'row', gap: theme.spacing.md, padding: theme.spacing.md },
  flex: { flex: 1 },
  bannerTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: '900' },
  bannerCopy: { color: theme.colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  rating: { color: theme.colors.coral, fontSize: 11, fontWeight: '900', marginTop: 3 },
  address: { color: theme.colors.muted, fontSize: 9, lineHeight: 13, marginTop: 3 },
  openButton: { backgroundColor: theme.colors.forest, borderRadius: theme.radius.pill, paddingHorizontal: 13, paddingVertical: 10 },
  openButtonText: { color: theme.colors.white, fontSize: 10, fontWeight: '900' },
});
