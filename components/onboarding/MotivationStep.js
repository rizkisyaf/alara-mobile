import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../constants/Colors';

const MOTIVATIONS = [
  { id: 'time', text: 'Save time managing assets ⏱️' },
  { id: 'decisions', text: 'Make more informed decisions 📊' },
  { id: 'emotion', text: 'Reduce FOMO / emotional trading 🙏' },
  { id: 'organize', text: 'Organize my trading data 🗂️' },
  { id: 'explore', text: 'Explore new strategies ✨' },
];

const MAX_SELECTIONS = 2;

const MotivationStep = ({ onNext }) => {
  const [selectedMotivations, setSelectedMotivations] = useState([]);

  const handleSelect = (motivationId) => {
    setSelectedMotivations(prevSelected => {
      const isSelected = prevSelected.includes(motivationId);
      if (isSelected) {
        // Deselect
        return prevSelected.filter(id => id !== motivationId);
      } else {
        // Select, but respect MAX_SELECTIONS
        if (prevSelected.length < MAX_SELECTIONS) {
          return [...prevSelected, motivationId];
        } else {
          // Optional: Provide feedback that max selection is reached (e.g., toast)
          console.log(`Maximum ${MAX_SELECTIONS} selections allowed.`);
          return prevSelected; // Keep current selection if max reached
        }
      }
    });
  };

  const isNextDisabled = selectedMotivations.length === 0;

  return (
    <View style={styles.container}>
       <Text style={styles.title}>What are you hoping Alara will help you achieve?</Text>
       <Text style={styles.subtitle}>(Select up to {MAX_SELECTIONS})</Text>
       <ScrollView contentContainerStyle={styles.optionsContainer}>
        {MOTIVATIONS.map((motivation) => {
            const isSelected = selectedMotivations.includes(motivation.id);
            return (
                <TouchableOpacity
                  key={motivation.id}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(motivation.id)}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {motivation.text}
                  </Text>
                </TouchableOpacity>
            );
        })}
       </ScrollView>
       <TouchableOpacity
         style={[styles.button, isNextDisabled && styles.disabledButton]}
         onPress={() => onNext('motivation', { motivations: selectedMotivations })}
         disabled={isNextDisabled}
       >
         <Text style={styles.buttonText}>Next</Text>
       </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between', // Push button to bottom
    paddingHorizontal: 20,
    paddingBottom: 30, // Space for the button
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: 40, // Add some top margin
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    // Allow options to take available space, but scroll if needed
  },
  optionButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#000',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
   },
   disabledButton: {
    backgroundColor: colors.disabled,
   },
   buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
   },
});

export default MotivationStep; 