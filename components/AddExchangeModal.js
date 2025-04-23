import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Toast from 'react-native-toast-message';
import { colors } from '../constants/Colors';
import { typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext';
import { addExchangeKey } from '../api/exchanges';

function AddExchangeModal({ isVisible, onClose, onSaveSuccess }) {
  const { authToken } = useAuth();
  const [nickname, setNickname] = useState('');
  const [exchangeId, setExchangeId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] =useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
      setNickname('');
      setExchangeId('');
      setApiKey('');
      setApiSecret('');
      setPassphrase('');
      setIsLoading(false);
  }

  const handleSave = async () => {
    if (!exchangeId.trim() || !apiKey.trim() || !apiSecret.trim()) {
      Alert.alert('Missing Fields', 'Please enter Exchange ID, API Key, and API Secret.');
      return;
    }

    setIsLoading(true);
    try {
      const credentials = {
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
        passphrase: passphrase.trim() || null, // Send null if empty
        nickname: nickname.trim() || null, // Send null if empty
      };
      
      await addExchangeKey(authToken, exchangeId.trim(), credentials);
      
      Toast.show({
          type: 'success',
          text1: 'Connection Added',
          text2: `"${nickname || exchangeId}" added successfully!`
      });

      resetForm();
      onSaveSuccess(); // Callback to refresh list in parent
      onClose(); // Close the modal

    } catch (error) {
      console.error("Failed to add exchange key:", error);
      const message = error.message || 'Could not save connection. Please check details and try again.';
      Toast.show({
          type: 'error',
          text1: 'Error Adding Exchange',
          text2: message
      });
      setIsLoading(false); // Ensure loading stops on error
    }
    // No finally block needed for setIsLoading(false) because it's done on error and resetForm clears it on success
  };

  const handleClose = () => {
      resetForm();
      onClose();
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose} // Handle back button on Android
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.modalTitle}>Add New Exchange</Text>

          {/* TODO: Potentially use a Picker for known exchange IDs */}
          <TextInput
            style={styles.input}
            placeholder="Exchange ID (e.g., binance, kucoin)"
            placeholderTextColor={colors.text}
            value={exchangeId}
            onChangeText={setExchangeId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Nickname (Optional)"
            placeholderTextColor={colors.text}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="API Key"
            placeholderTextColor={colors.text}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            // Consider secureTextEntry for sensitive fields if desired, though usually visible
          />
          <TextInput
            style={styles.input}
            placeholder="API Secret"
            placeholderTextColor={colors.text}
            value={apiSecret}
            onChangeText={setApiSecret}
            autoCapitalize="none"
            autoCorrect={false}
             secureTextEntry // Secret should generally be hidden
          />
          <TextInput
            style={styles.input}
            placeholder="Passphrase (Optional)"
            placeholderTextColor={colors.text}
            value={passphrase}
            onChangeText={setPassphrase}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry // Passphrase should generally be hidden
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose} 
                disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
                onPress={handleSave} 
                disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.buttonTextPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>Save Connection</Text>
              )}
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%', // Limit height
    backgroundColor: colors.card, // Use card color
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
   scrollContainer: {
      paddingBottom: 20, // Ensure space at the bottom within scrollview
  },
  modalTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.background, // Use main background for inputs inside card
    color: colors.inputText,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: typography.fontSizes.body,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1, // Make buttons share space
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5, // Add space between buttons
  },
   buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary, 
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.medium,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.buttonTextPrimary,
    fontSize: typography.fontSizes.medium,
    fontWeight: typography.fontWeights.bold,
  },
});

export default AddExchangeModal; 