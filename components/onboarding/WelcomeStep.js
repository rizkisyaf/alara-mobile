import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/Colors'; // Assuming constants are two levels up

const WelcomeStep = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Alara!</Text>
      <Text style={styles.subtitle}>Let's personalize your crypto assistant in 5 quick steps.</Text>
      {/* Add an image/icon here later if desired */}
      <TouchableOpacity style={styles.button} onPress={() => onNext('welcome', {})} >
        <Text style={styles.buttonText}>Next</Text>
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
    // backgroundColor: '#f0f0f0', // Temporary bg for visibility
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
    marginBottom: 40,
  },
  button: {
    marginTop: 30,
    backgroundColor: colors.primary, // Use primary color
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

export default WelcomeStep; 