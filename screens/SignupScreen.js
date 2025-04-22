import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { registerUser } from '../api/auth';

// TODO: Add navigation prop type if using TypeScript
function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
        console.log('Calling registerUser API...');
        const response = await registerUser(name, email, password);

        console.log('Signup successful:', response.message);
        Alert.alert(
            'Signup Successful',
            response.message || 'Please check your email to verify your account.',
            [
                { text: "OK", onPress: () => navigation.navigate('Login') }
            ]
        );
        // Clear fields after successful signup and navigation?
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

    } catch (error) {
        console.error('Signup failed:', error);
        Alert.alert('Signup Error', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login'); // Navigate back to Login screen
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={colors.text}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.text}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 8 characters)"
          placeholderTextColor={colors.text}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={colors.text}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          textContentType="newPassword"
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
             <ActivityIndicator size="small" color={colors.buttonTextPrimary} />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
            onPress={handleGoToLogin}
            style={styles.linkContainer}
            disabled={isLoading}
        >
          <Text style={[styles.linkText, isLoading && styles.linkTextDisabled]}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: typography.fontSizes.h1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.inputBackground,
    color: colors.inputText,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: typography.fontSizes.body,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.7,
  },
  buttonText: {
    color: colors.buttonTextPrimary,
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold,
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: colors.primary,
    fontSize: typography.fontSizes.medium,
  },
  linkTextDisabled: {
      opacity: 0.5,
  }
});

export default SignupScreen; 