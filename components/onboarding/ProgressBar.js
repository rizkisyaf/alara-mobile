import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/Colors';

const ProgressBar = ({ current, total }) => {
  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${progressPercent}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8, // Height of the progress bar
    backgroundColor: colors.backgroundSecondary, // Background of the bar
    borderRadius: 4,
    overflow: 'hidden', // Ensure progress stays within bounds
    marginHorizontal: 20, // Add some horizontal margin
    marginTop: 40, // Increase top margin significantly
    marginBottom: 20, // Increase bottom margin slightly too
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary, // Color of the progress indicator
    borderRadius: 4,
  },
});

export default ProgressBar;
