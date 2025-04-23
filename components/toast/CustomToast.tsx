import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message'; // Import props type
import { colors } from '@/constants/Colors'; // Adjust path if needed
import { Ionicons } from '@expo/vector-icons'; // Import icons

// Custom Success Toast
export const SuccessToast = ({ text1, text2, ...rest }: BaseToastProps) => (
  <View style={[styles.base, styles.successContainer]}>
    {<Ionicons name="checkmark-circle-outline" size={24} color={colors.success} style={styles.icon} />}
    <View style={styles.textContainer}>
      {text1 && <Text style={[styles.text1, styles.successText1]}>{text1}</Text>}
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  </View>
);

// Custom Error Toast
export const ErrorToast = ({ text1, text2, ...rest }: BaseToastProps) => (
  <View style={[styles.base, styles.errorContainer]}>
    {<Ionicons name="alert-circle-outline" size={24} color={colors.error} style={styles.icon} />}
    <View style={styles.textContainer}>
      {text1 && <Text style={[styles.text1, styles.errorText1]}>{text1}</Text>}
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    width: '90%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    backgroundColor: 'rgba(50, 50, 50, 0.9)', // Dark semi-transparent background
    borderLeftWidth: 5,
  },
  successContainer: {
    borderLeftColor: colors.success,
  },
  errorContainer: {
    borderLeftColor: colors.error,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  successText1: {
     color: colors.success, // Use success color for title
  },
   errorText1: {
     color: colors.error, // Use error color for title
  },
  text2: {
    fontSize: 14,
    color: colors.text, // Use standard light text color
    marginTop: 3,
  },
}); 