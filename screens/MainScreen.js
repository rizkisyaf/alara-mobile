import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Platform, View, ActivityIndicator, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { GiftedChat, InputToolbar, Send, Bubble } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context'; // Use edges prop
import { colors } from '../constants/Colors';
import { typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext';
import { sendMessage } from '../api/chat';
import uuid from 'react-native-uuid'; // For generating message IDs
import { useNavigation } from '@react-navigation/native'; // Added
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu'; // Added
import Toast from 'react-native-toast-message'; // Import Toast
import Voice from '@react-native-voice/voice';
import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons

// Define user and AI constants
const USER = {
  _id: 1, // Static ID for the current user
  name: 'User',
};

const AI = {
  _id: 2, // Static ID for the AI
  name: 'Alara',
  // avatar: 'path/to/ai/avatar.png', // Optional AI avatar
};

function MainScreen() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // To show AI typing indicator
  const [isRecording, setIsRecording] = useState(false); // State for voice recording
  const [inputText, setInputText] = useState(''); // State to control input text
  const [voiceError, setVoiceError] = useState(''); // State for voice errors
  const { authToken, logout } = useAuth(); // Get token for API calls
  const navigation = useNavigation(); // Added

  // Initial message from AI
  useEffect(() => {
    setMessages([
      {
        _id: uuid.v4(),
        text: 'Welcome to Alara! How can I assist you with your crypto analysis today?',
        createdAt: new Date(),
        user: AI,
      },
    ]);
  }, []);

  // --- Voice Recognition Setup ---
  useEffect(() => {
    // Define event handlers
    const onSpeechStart = (e) => {
      console.log('onSpeechStart: ', e);
      setIsRecording(true); // Ensure state is accurate
      setVoiceError('');
    };
    const onSpeechEnd = (e) => {
      console.log('onSpeechEnd: ', e);
      setIsRecording(false);
    };
    const onSpeechError = (e) => {
      console.log('onSpeechError: ', e);
      setVoiceError(JSON.stringify(e.error));
      setIsRecording(false); // Stop recording state on error
      const message = e.error?.message || 'An unknown voice error occurred.';
      Toast.show({
          type: 'error',
          text1: 'Voice Recognition Error',
          text2: message
      });
    };
    const onSpeechResults = (e) => {
      console.log('onSpeechResults: ', e);
      if (e.value && e.value.length > 0) {
          setInputText(e.value[0]); // Set final result to input text
      }
      setIsRecording(false); // Optionally stop recording after final result
    };
    const onSpeechPartialResults = (e) => {
      // console.log('onSpeechPartialResults: ', e); // Can be very noisy
      if (e.value && e.value.length > 0) {
          setInputText(e.value[0]); // Update input text with partial results
      }
    };

    // Register listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    // Cleanup function
    return () => {
      // Destroy the session and remove listeners
      Voice.destroy().then(Voice.removeAllListeners).catch(e => console.error("Error destroying voice instance", e));
    };
  }, []); // Run only once on mount

  const startRecording = async () => {
    setIsRecording(true);
    setInputText('');
    setVoiceError(''); // Clear previous errors
    try {
      await Voice.start('en-US'); // Specify language
      console.log('Voice recording started...');
    } catch (e) {
      console.error('startRecording error', e);
      setVoiceError(e.message);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
     // Let onSpeechEnd or onSpeechResults handle setIsRecording(false)
     try {
       await Voice.stop();
       console.log('Voice recording stopped manually...');
     } catch (e) {
       console.error('stopRecording error', e);
       setVoiceError(e.message);
       setIsRecording(false); // Ensure recording stops if Voice.stop fails
     }
  };

  const toggleRecording = async () => {
      // Check availability/permissions first (optional but recommended)
      // const isAvailable = await Voice.isAvailable();
      // if (!isAvailable) { ... handle error ... }
      if (isRecording) {
          await stopRecording();
      } else {
          await startRecording();
      }
  };
  // --- End Voice Recognition Setup ---

  const onSend = useCallback(async (newMessages = []) => {
    const userMessage = newMessages[0];
    if (!userMessage || !authToken) return; // Exit if no message or token

    // Add user message immediately to the chat
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, userMessage)
    );
    setIsTyping(true); // Show AI is "typing"
    setInputText(''); // Clear input after sending

    let aiReplyText = ''; // Hold the final reply text
    let last_function_name = null;
    let last_function_response_content = null;
    let user_id = 'unknown'; // Placeholder for user_id from context
    const { user } = useAuth(); 
    if (user) user_id = user.id; 

    try {
      // Send message to backend
      const response = await sendMessage(authToken, userMessage.text);
      
      // --- Simplified logic: Assume backend handles the loop and returns final reply --- 
      // --- The backend /api/chat needs to implement the summarization logic internally --- 
      aiReplyText = response.reply;
      // --- End Simplified Logic ---

      // Store the final reply
      const aiMessage = {
        _id: uuid.v4(),
        text: aiReplyText,
        createdAt: new Date(),
        user: AI,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, aiMessage)
      );

    } catch (error) {
      console.error('Error sending/receiving message:', error);
      // Show error message as an AI response with an error flag
      const errorMessageText = `Sorry, I encountered an error: ${error.message}`;
      const errorMessage = {
        _id: uuid.v4(),
        text: errorMessageText,
        createdAt: new Date(),
        user: AI,
        isError: true,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, errorMessage)
      );
      // Also show a Toast for more visibility
      Toast.show({
          type: 'error',
          text1: 'Message Error',
          text2: error.message || 'Failed to send or receive message.'
      });
       // TODO: Consider specific error handling, e.g., logout on 401
       if (error.message.includes('Unauthorized')) {
           // Optionally trigger logout or prompt re-login
           // await logout();
       }
    } finally {
      setIsTyping(false); // Hide AI typing indicator
    }
  }, [authToken, sendMessage]);

  // Handle text input changes
  const handleTextInput = (text) => {
      setInputText(text);
      // Optionally update GiftedChat's internal state if needed, though passing `text` prop is usually sufficient
  };

  // --- Custom Render Functions for Sleek UI --- //

  const renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={{ alignItems: 'center' }}
      // Add Microphone Button as Accessory on the right
      renderAccessory={() => (
         <TouchableOpacity onPress={toggleRecording} style={styles.micButton}>
            {/* Use Ionicons for Mic/Stop */} 
            <Ionicons 
                name={isRecording ? "stop-circle-outline" : "mic-outline"} 
                size={28} 
                color={isRecording ? colors.error : colors.primary} // Use colors.error / colors.primary (assuming tint was primary)
            /> 
         </TouchableOpacity>
      )}
    />
  );

  const renderSend = (props) => (
    // Only show Send button if there is text and not recording
    !isRecording && props.text.trim().length > 0 ? (
        <Send {...props} containerStyle={styles.sendContainer}>
            <View style={styles.sendButton}>
                 {/* Use Ionicons for Send */}
                <Ionicons name="paper-plane-outline" size={22} color={colors.buttonTextPrimary} />
            </View>
        </Send>
    ) : null // Hide Send button when recording or text is empty
  );

  const renderBubble = (props) => {
    const { currentMessage } = props;
    const isAIMessage = currentMessage.user._id === AI._id;
    const isErrorMessage = isAIMessage && currentMessage.isError; // Check for error flag

    let wrapperStyle = {};
    let textStyle = {};

    if (isErrorMessage) {
        wrapperStyle = styles.bubbleError; // Use specific error style
        textStyle = styles.bubbleTextError; // Use specific error text style
    } else if (isAIMessage) {
        wrapperStyle = styles.bubbleLeft; // AI bubble
        textStyle = styles.bubbleTextLeft; // AI text
    } else { // User message
        wrapperStyle = styles.bubbleRight; // User bubble
        textStyle = styles.bubbleTextRight; // User text
    }

    return (
        <Bubble
            {...props}
            wrapperStyle={{
              left: wrapperStyle, // Apply determined wrapper style (left aligned)
              right: styles.bubbleRight, // User bubbles remain unchanged for now
            }}
            textStyle={{
              left: textStyle, // Apply determined text style (left aligned)
              right: styles.bubbleTextRight, // User text remains unchanged
            }}
            // Assign left/right based on user ID, but apply custom style for AI/Error
            // The wrapperStyle/textStyle props apply styles based on position (left/right)
            // To achieve custom styling for AI based on error, we need to override `left` styles.
            // A slightly better approach might be to customize the renderMessageText prop for more control
        />
    );
  };

  // --- NEW: Footer for Typing Indicator --- //
  const renderFooter = () => {
    if (isTyping) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
          <Text style={styles.footerText}>Alara is thinking...</Text>
        </View>
      );
    }
    // Optionally display voice errors here?
    // if (voiceError) return <Text style={styles.errorText}>Voice Error: {voiceError}</Text>;
    return null;
  };
  // --- End Footer --- //

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View style={styles.headerContainer}>
          <View style={{ flex: 1 }} />
          <Text style={styles.headerTitle}>Alara</Text>
          <View style={styles.headerRightContainer}>
            <Menu>
              <MenuTrigger>
                <View style={styles.avatarPlaceholder}>
                   {/* Use Ionicons for Avatar Placeholder */} 
                   <Ionicons name="person-circle-outline" size={36} color={colors.buttonTextPrimary} />
                </View>
              </MenuTrigger>
              <MenuOptions customStyles={menuOptionsStyles}>
                <MenuOption onSelect={() => navigation.navigate('ExchangeManagement')} text='Manage Exchanges' />
                <MenuOption onSelect={() => navigation.navigate('Billing')} text='Billing' />
                <MenuOption onSelect={() => navigation.navigate('Settings')} text='Settings' />
              </MenuOptions>
            </Menu>
          </View>
        </View>

        <GiftedChat
          messages={messages}
          text={inputText}
          onInputTextChanged={handleTextInput}
          onSend={() => onSend([{ _id: uuid.v4(), text: inputText.trim(), createdAt: new Date(), user: USER }])}
          user={USER}
          placeholder={isRecording ? "Listening..." : "Ask Alara anything..."}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          renderBubble={renderBubble}
          messagesContainerStyle={styles.messagesContainer}
          renderFooter={renderFooter}
          isTyping={isTyping}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    textAlign: 'center',
    flex: 2,
  },
  headerRightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // Remove background color if using outline icon
    // backgroundColor: colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    backgroundColor: colors.background,
    paddingBottom: 10,
  },
  inputToolbar: {
    backgroundColor: colors.card,
    borderTopWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row', // Ensure items are in a row
    alignItems: 'center', // Align items vertically
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    marginLeft: 10,
  },
  sendButton: {
    // Remove background if using only icon?
    // backgroundColor: colors.primary,
    // borderRadius: 20,
    paddingHorizontal: 10, // Adjust padding for icon
    paddingVertical: 8,
  },
  micButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    width: 44,
    marginLeft: 5, // Reduced margin slightly
    // Remove background/border if using only icon
    // borderRadius: 22,
    // backgroundColor: colors.secondary, 
  },
  bubbleLeft: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginLeft: 0,
    marginBottom: 5,
  },
  bubbleRight: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginRight: 0,
    marginBottom: 5,
  },
  bubbleTextLeft: {
    color: colors.text,
    fontSize: typography.fontSizes.body,
  },
  bubbleTextRight: {
    color: colors.buttonTextPrimary,
    fontSize: typography.fontSizes.body,
  },
  // --- NEW Error Bubble Styles --- //
  bubbleError: {
    backgroundColor: colors.errorBackground || '#ffebee', // Use colors.*
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginLeft: 0,
    marginBottom: 5,
  },
  bubbleTextError: {
      color: colors.error || '#b71c1c', // Use colors.*
      fontSize: typography.fontSizes.body,
  },
  // --- End Error Bubble Styles --- //
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  footerText: {
    marginLeft: 10,
    fontSize: typography.fontSizes.small,
    color: colors.textSecondary,
  },
});

// Custom styles for MenuOptions
const menuOptionsStyles = {
  optionsContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 5,
    marginTop: 35,
  },
  optionWrapper: {
    padding: 10,
  },
  optionText: {
    color: colors.text,
    fontSize: typography.fontSizes.body,
  },
};

export default MainScreen; 