import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from '@/constants/Colors';
import React from 'react';

// This screen should ideally never be seen, as _layout.tsx redirects.
// If it is seen, it indicates a problem with the redirection logic in _layout.
export default function RootIndexScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
