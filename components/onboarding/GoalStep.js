import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/Colors';

const GOALS = [
  'Track my portfolio across exchanges',
  'Analyze market trends & data',
  'Discover trading opportunities',
  'Improve my trading skills',
  'Stay informed on crypto news',
];

const GoalStep = ({ onNext }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleSelect = (goal) => {
    setSelectedGoal(goal);
    // Automatically proceed to the next step upon selection
    onNext('goal', { primaryGoal: goal });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your primary goal with Alara?</Text>
      {GOALS.map((goal) => (
        <TouchableOpacity
          key={goal}
          style={[
            styles.optionButton,
            selectedGoal === goal && styles.selectedOption // Highlight selected
          ]}
          onPress={() => handleSelect(goal)}
        >
          <Text style={[
            styles.optionText,
            selectedGoal === goal && styles.selectedOptionText
          ]}>
            {goal}
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
    // alignItems: 'center', // Align items to start for list feel
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
    color: '#fff', // White text for selected option
    fontWeight: 'bold',
  },
});

export default GoalStep; 