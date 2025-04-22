// Remove default Expo content 
// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

import React from 'react';
import AppNavigator from './navigation/AppNavigator'; // Import the navigator
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

export default function App() {
  return (
    <AuthProvider> // Wrap with AuthProvider
      <AppNavigator /> // Render the navigator
    </AuthProvider>
    // <View style={styles.container}>
    //   <Text>Open up App.js to start working on your app!</Text>
    //   <StatusBar style="auto" />
    // </View>
  );
}

// Remove default styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// }); 