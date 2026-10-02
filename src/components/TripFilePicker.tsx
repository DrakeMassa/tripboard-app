import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export type SelectedTripFile = {
  blob: Blob;
  name: string;
  size: number;
  type: string;
};

export function TripFilePicker(_props: {
  disabled?: boolean;
  onSelected: (file: SelectedTripFile) => void;
}) {
  return (
    <View style={styles.note}>
      <MaterialCommunityIcons color={theme.colors.forest} name="cellphone-link" size={19} />
      <Text style={styles.copy}>File upload is available in the web pilot. On this device, paste the airline or ticket provider’s secure link.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { alignItems: 'center', backgroundColor: theme.colors.sage, borderRadius: theme.radius.md, flexDirection: 'row', gap: 8, padding: theme.spacing.md },
  copy: { color: theme.colors.forest, flex: 1, fontSize: 10, lineHeight: 15 },
});
