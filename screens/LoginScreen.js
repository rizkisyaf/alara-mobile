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
  Platform
} from 'react-native';
import { Colors } from '../constants/Colors';
import { typography } from '../constants/typography';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import AlaraLogo from '../assets/images/alara-logo.svg';

// TODO: Add navigation prop type if using TypeScript
// TODO: Implement better global state management for auth status
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Calling loginUser API...');
      const response = await loginUser(email, password);

      if (response && response.token) {
        console.log('Login successful, calling context login...');
        await login(response.token);

      } else {
        console.error('Login response missing token:', response);
        Alert.alert('Login Error', 'Authentication failed. Please check your credentials.');
      }

    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Error', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <AlaraLogo width={120} height={120} />
          </View>

          <Text style={styles.title}>Welcome Back</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.dark.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.dark.textSecondary}
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
              <ActivityIndicator size="small" color={Colors.dark.background} />
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
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
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
  title: {
    fontSize: typography.fontSizes.h1,
    fontWeight: typography.fontWeights.bold,
    color: Colors.dark.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.dark.background,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.tint,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: typography.fontSizes.body,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: Colors.dark.text,
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.dark.background,
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold,
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: Colors.dark.tint,
    fontSize: typography.fontSizes.medium,
  },
  linkTextDisabled: {
    opacity: 0.5,
  }
});

export default LoginScreen; 