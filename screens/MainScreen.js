import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TODO: Replace this with a Tab Navigator (e.g., Bottom Tabs)

function MainScreen() {
  return (
    <View style={styles.container}>
      <Text>Main Application Screen (Placeholder)</Text>
      {/* Future Tab Navigator will render content here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainScreen; 