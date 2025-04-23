import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/Colors';

const EXPERIENCE_LEVELS = [
  'Just starting out',
  'I know the basics',
  'Actively trading',
  'Experienced / Pro trader',
];

const ExperienceStep = ({ onNext }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleSelect = (level) => {
    setSelectedLevel(level);
    // Automatically proceed to the next step upon selection
    onNext('experience', { experienceLevel: level });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your crypto trading experience?</Text>
      {EXPERIENCE_LEVELS.map((level) => (
        <TouchableOpacity
          key={level}
          style={[
            styles.optionButton,
            selectedLevel === level && styles.selectedOption // Highlight selected
          ]}
          onPress={() => handleSelect(level)}
        >
          <Text style={[
            styles.optionText,
            selectedLevel === level && styles.selectedOptionText
          ]}>
            {level}
          </Text>
        </TouchableOpacity>
      ))}
      {/* No explicit 'Next' button, selection triggers progression */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
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
});

export default ExperienceStep; 