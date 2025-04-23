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
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { colors } from '../constants/Colors';
import { typography } from '../constants/typography';
import { registerUser } from '../api/auth';
import alaraLogoSource from '../assets/images/alara-logo.png';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

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
      const response = await registerUser(name, email, password);

      // Show success Toast
      Toast.show({
        type: 'success',
        text1: 'Signup Successful',
        text2: response.message || 'Please check your email to verify your account.'
      });

      // Clear form and navigate after success
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      // Navigate to login after a short delay to allow Toast to be seen
      setTimeout(() => {
          router.replace('/(auth)/login');
      }, 1500); // 1.5 seconds delay

    } catch (error) {
      // Show error Toast
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={alaraLogoSource} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 8 characters)"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={colors.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.background} />
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: typography.fontSizes.h1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.background,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.primary,
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
    backgroundColor: colors.text,
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