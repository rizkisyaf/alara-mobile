import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View, ActivityIndicator, Text } from 'react-native';
import { GiftedChat, InputToolbar, Send, Bubble } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context'; // Use edges prop
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext';
import { sendMessage } from '../api/chat';
import uuid from 'react-native-uuid'; // For generating message IDs

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
  const { authToken, logout } = useAuth(); // Get token for API calls

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

  const onSend = useCallback(async (newMessages = []) => {
    const userMessage = newMessages[0];
    if (!userMessage || !authToken) return; // Exit if no message or token

    // Add user message immediately to the chat
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, userMessage)
    );
    setIsTyping(true); // Show AI is "typing"

    try {
      // Send message to backend
      const response = await sendMessage(authToken, userMessage.text);
      
      // Create AI response message object
      const aiMessage = {
        _id: uuid.v4(),
        text: response.reply, // Assuming backend returns { reply: "..." }
        createdAt: new Date(),
        user: AI,
      };

      // Add AI message to the chat
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, aiMessage)
      );

    } catch (error) {
      console.error('Error sending/receiving message:', error);
      // Show error message as an AI response
      const errorMessage = {
        _id: uuid.v4(),
        text: `Sorry, I encountered an error: ${error.message}`,
        createdAt: new Date(),
        user: AI,
        // Optional: Add styling for error messages
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, errorMessage)
      );
       // TODO: Consider specific error handling, e.g., logout on 401
       if (error.message.includes('Unauthorized')) {
           // Optionally trigger logout or prompt re-login
           // await logout();
       }
    } finally {
      setIsTyping(false); // Hide AI typing indicator
    }
  }, [authToken, sendMessage]);

  // --- Custom Render Functions for Sleek UI --- //

  const renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={{ alignItems: 'center' }}
    />
  );

  const renderSend = (props) => (
    <Send {...props} containerStyle={styles.sendContainer}>
      <View style={styles.sendButton}> 
         {/* Replace with an icon later */} 
         <Text style={styles.sendButtonText}>Send</Text>
      </View>
    </Send>
  );

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: styles.bubbleLeft, // AI bubble
        right: styles.bubbleRight, // User bubble
      }}
      textStyle={{
        left: styles.bubbleTextLeft, // AI text
        right: styles.bubbleTextRight, // User text
      }}
      // timeTextStyle={{ left: { color: colors.text }, right: { color: colors.text } }} // Optional time styling
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}> // Only apply bottom inset
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={USER}
        placeholder="Ask Alara anything..."
        alwaysShowSend
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderBubble={renderBubble}
        messagesContainerStyle={styles.messagesContainer}
        isTyping={isTyping} // Show typing indicator
        // renderLoading={() => <ActivityIndicator size="large" color={colors.primary} />} // Optional global loading
        // TODO: Add voice input button later
      />
      {/* KeyboardAvoidingView might be needed depending on exact behavior */}
      {/* {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    backgroundColor: colors.background,
    paddingBottom: 10, // Add some padding at the bottom
  },
  inputToolbar: {
    backgroundColor: colors.card, // Slightly different background for toolbar
    borderTopWidth: 0, // Remove top border
    paddingVertical: 8,
    paddingHorizontal: 10,
    // marginBottom: Platform.OS === 'ios' ? 0 : 5, // Adjust bottom margin if needed
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 44, // Standard touch target height
    marginLeft: 10,
  },
   sendButton: {
    backgroundColor: colors.primary, // Use theme color
    borderRadius: 20, // Make it round
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButtonText: {
      color: colors.buttonTextPrimary,
      fontWeight: 'bold',
  },
  bubbleLeft: { // AI bubble
    backgroundColor: colors.card, // Darker bubble for AI
    borderTopLeftRadius: 0, // Flat corner
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginLeft: 0, 
    marginBottom: 5,
  },
  bubbleRight: { // User bubble
    backgroundColor: colors.primary, // Use primary color (silver)
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0, // Flat corner
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginRight: 0,
    marginBottom: 5,
  },
  bubbleTextLeft: { // AI text
    color: colors.cardText, // Light text on dark bubble
    fontSize: typography.fontSizes.body,
  },
  bubbleTextRight: { // User text
    color: colors.buttonTextPrimary, // Dark text on light bubble
    fontSize: typography.fontSizes.body,
  },
});

export default MainScreen; 