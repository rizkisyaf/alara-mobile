import React, { useState } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { Colors } from '../constants/Colors';
import { typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { requestPasswordReset } from '../api/auth'; // Import the new API helper

function SettingsScreen() {
  const { user, logout } = useAuth(); // Get user info and logout function
  const [isLoadingReset, setIsLoadingReset] = useState(false); // Loading state for password reset

  const handlePasswordReset = async () => {
    if (!user || !user.email) {
      Alert.alert('Error', 'Could not get user email for password reset.');
      return;
    }
    setIsLoadingReset(true);
    try {
      const response = await requestPasswordReset(user.email);
      Alert.alert('Password Reset Requested', response.message || 'If an account exists for this email, a password reset link has been sent.');
    } catch (error) {
      console.error("Failed to request password reset:", error);
      Alert.alert('Error', error.message || 'Could not request password reset.');
    } finally {
      setIsLoadingReset(false);
    }
  };

  const handleLogout = () => {
      Alert.alert(
          "Confirm Logout",
          "Are you sure you want to log out?",
          [
              { text: "Cancel", style: "cancel" },
              { 
                  text: "Logout", 
                  style: "destructive", 
                  onPress: async () => {
                      try {
                          await logout();
                          // Navigation back to Auth screens is handled by AppNavigator automatically
                      } catch (error) {
                          console.error("Logout failed:", error);
                          Alert.alert("Logout Failed", error.message || "An error occurred during logout.");
                      }
                  }
              }
          ]
      )
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile Info Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
        </View>
         <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity 
            style={[styles.button, styles.actionButton, isLoadingReset && styles.buttonDisabled]}
            onPress={handlePasswordReset}
            disabled={isLoadingReset}
        >
          {isLoadingReset ? (
              <ActivityIndicator size="small" color={Colors.dark.tint} />
          ) : (
              <Text style={styles.actionButtonText}>Request Password Reset</Text>
          )}
        </TouchableOpacity>
         {/* TODO: Add 2FA setup button here */}
      </View>

       {/* Logout Button */}
        <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
        >
             <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.dark.background,
  },
   title: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.bold,
    color: Colors.dark.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionContainer: {
      marginBottom: 30,
      backgroundColor: Colors.dark.card, // Card background
      borderRadius: 8,
      padding: 15,
  },
  sectionTitle: {
      fontSize: typography.fontSizes.h4,
      fontWeight: typography.fontWeights.medium,
      color: Colors.dark.text,
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: Colors.dark.tint,
      paddingBottom: 5,
  },
  infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
  },
  infoLabel: {
      fontSize: typography.fontSizes.body,
      color: Colors.dark.textSecondary,
      marginRight: 10,
  },
  infoValue: {
      fontSize: typography.fontSizes.body,
      color: Colors.dark.text,
      fontWeight: typography.fontWeights.regular,
      flexShrink: 1, // Allow text to wrap if long
      textAlign: 'right',
  },
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: '100%', // Make buttons full width within their container
  },
  actionButton: {
      backgroundColor: 'transparent', // Use background from card
      borderWidth: 1,
      borderColor: Colors.dark.tint,
      marginBottom: 10, // Space between actions
  },
  actionButtonText: {
      color: Colors.dark.tint,
      fontSize: typography.fontSizes.body,
      fontWeight: typography.fontWeights.medium,
  },
  logoutButton: {
      backgroundColor: Colors.errorBackground || '#ffebee', // Error-like background
      marginTop: 20, // Space from sections above
  },
  logoutButtonText: {
      color: Colors.error || '#b71c1c',
      fontSize: typography.fontSizes.large,
      fontWeight: typography.fontWeights.bold,
  },
  buttonDisabled: {
      opacity: 0.5,
  },
});

export default SettingsScreen; 