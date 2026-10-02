import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ChangeEvent, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';

export type SelectedTripFile = {
  blob: Blob;
  name: string;
  size: number;
  type: string;
};

export function TripFilePicker({
  disabled = false,
  onSelected,
}: {
  disabled?: boolean;
  onSelected: (file: SelectedTripFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelected({ blob: file, name: file.name, size: file.size, type: file.type });
    event.target.value = '';
  };

  return (
    <>
      <input
        accept=".pdf,.pkpass,application/pdf,application/vnd.apple.pkpass,image/jpeg,image/png,image/webp"
        aria-label="Choose a boarding pass or trip document"
        disabled={disabled}
        onChange={handleChange}
        ref={inputRef}
        style={{ display: 'none' }}
        type="file"
      />
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => inputRef.current?.click()}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}>
        <MaterialCommunityIcons color={theme.colors.forest} name="file-upload-outline" size={19} />
        <Text style={styles.label}>Upload boarding pass or trip file</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: theme.colors.sage, borderColor: theme.colors.forest, borderRadius: theme.radius.md, borderStyle: 'dashed', borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 50, paddingHorizontal: theme.spacing.md },
  label: { color: theme.colors.forest, fontSize: 11, fontWeight: '900' },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.48 },
});
