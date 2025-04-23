import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/Colors';

const StartStep = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're all set!</Text>
      <Text style={styles.subtitle}>
        Ready to unlock your personalized crypto assistant and connect your exchanges?
      </Text>
      {/* Optional: Add a relevant graphic or animation */}
      <TouchableOpacity style={styles.button} onPress={() => onNext('start', {})}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30, // Ensure button is not at the very bottom edge
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 60, // More space before the final button
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
   },
   buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
   },
});

export default StartStep; 