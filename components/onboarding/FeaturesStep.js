import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/Colors';
// Could potentially import icons here
// import { Ionicons } from '@expo/vector-icons';

const FeaturesStep = ({ onNext }) => {
  // TODO: Potentially personalize text based on onboardingData from previous steps

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Awesome!</Text>
      <Text style={styles.subtitle}>
        Alara will help you achieve your goals by connecting your exchanges for:
      </Text>

      <View style={styles.featureList}>
        {/* Feature 1 */}
        <View style={styles.featureItem}>
           {/* <Ionicons name="sync-circle-outline" size={24} color={colors.primary} style={styles.icon} /> */}
           <Text style={styles.featureText}>Real-time data & portfolio tracking</Text>
        </View>
        {/* Feature 2 */}
        <View style={styles.featureItem}>
            {/* <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} style={styles.icon} /> */}
            <Text style={styles.featureText}>Direct chat analysis & insights</Text>
        </View>
         {/* Feature 3 */}
        <View style={styles.featureItem}>
            {/* <Ionicons name="search-circle-outline" size={24} color={colors.primary} style={styles.icon} /> */}
            <Text style={styles.featureText}>Market scanning & opportunity discovery</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => onNext('features', {})}>
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
    paddingBottom: 30, // Space for button
    paddingTop: 60, // More top padding for title
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
    lineHeight: 24,
  },
  featureList: {
    flex: 1, // Allow list to take up space
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 15,
  },
  featureText: {
    fontSize: 18,
    color: colors.text,
    flex: 1, // Allow text to wrap
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
   buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
   },
});

export default FeaturesStep; 