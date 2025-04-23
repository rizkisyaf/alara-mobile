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
import Toast from 'react-native-toast-message';
import { colors } from '../constants/Colors';
import { typography } from '../constants/typography';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import alaraLogoSource from '../assets/images/alara-logo.png';

// TODO: Add navigation prop type if using TypeScript
// TODO: Implement better global state management for auth status
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Calling loginUser API...');
      const response = await loginUser(email, password);

      if (response?.access_token) {
        console.log('Login successful, calling context login...');
        await login(response.access_token);

      } else {
        console.error('Login Error: API response missing access_token', response);
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Could not process login response. Please try again.'
        });
      }

    } catch (error) {
      console.error('Login failed:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignup = () => {
    router.push('/(auth)/signup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
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

          <Text style={styles.title}>Welcome Back</Text>

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
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoToSignup}
            style={styles.linkContainer}
            disabled={isLoading}
          >
            <Text style={[styles.linkText, isLoading && styles.linkTextDisabled]}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

export default LoginScreen; 