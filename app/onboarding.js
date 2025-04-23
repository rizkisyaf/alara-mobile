import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Import useRouter

// Assuming components are now relative to the app directory structure
// Need to adjust paths based on where components/constants actually live relative to app/
import ProgressBar from '@/components/onboarding/ProgressBar';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import GoalStep from '@/components/onboarding/GoalStep';
import ExperienceStep from '@/components/onboarding/ExperienceStep';
import MotivationStep from '@/components/onboarding/MotivationStep';
import FeaturesStep from '@/components/onboarding/FeaturesStep';
import StartStep from '@/components/onboarding/StartStep';
import { colors } from '@/constants/Colors'; // Use alias path if configured

const { width } = Dimensions.get('window');

const steps = [
  { id: 'welcome', component: WelcomeStep },
  { id: 'goal', component: GoalStep },
  { id: 'experience', component: ExperienceStep },
  { id: 'motivation', component: MotivationStep },
  { id: 'features', component: FeaturesStep },
  { id: 'start', component: StartStep },
];

const OnboardingScreen = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const router = useRouter(); // Use router from Expo Router

  const handleNext = (stepId, data) => {
    if (data && Object.keys(data).length > 0) {
        setOnboardingData(prevData => ({ ...prevData, [stepId]: data }));
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    console.log("Onboarding Complete! Data:", onboardingData);
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      // Navigate to Auth flow using Expo Router
      // Replace directs user to the login screen within the (auth) group
      router.replace({ pathname: '/(auth)/login' });
    } catch (error) {
      console.error("Failed to save onboarding status or navigate:", error);
    }
  };

  const CurrentStepComponent = steps[currentStepIndex].component;

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar current={currentStepIndex + 1} total={steps.length} />
      <View style={styles.content}>
        {CurrentStepComponent ? (
          <CurrentStepComponent onNext={handleNext} />
        ) : (
          <View>
             <Text style={styles.title}>Step Not Found</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Reuse styles from previous OnboardingScreen, adjust if needed
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Use imported colors
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: { // Fallback title style
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text,
  },
});

export default OnboardingScreen; 