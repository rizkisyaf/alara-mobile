import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { colors } from '../constants/Colors';
import { typography } from '../constants/typography';
import { useAuth } from '../context/AuthContext';
import { listExchangeKeys, deleteExchangeKey } from '../api/exchanges';
import Ionicons from '@expo/vector-icons/Ionicons';
import AddExchangeModal from '../components/AddExchangeModal';

// Remove unused navigation prop
function ExchangeManagementScreen() {
  const { authToken } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch exchanges function
  const fetchExchanges = useCallback(async () => {
    if (!authToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedExchanges = await listExchangeKeys(authToken);
      setExchanges(fetchedExchanges || []); // Handle null/undefined response
    } catch (err) {
      console.error("Failed to fetch exchanges:", err);
      const message = err.message || 'Could not load exchanges.';
      setError(message);
      Toast.show({
          type: 'error',
          text1: 'Error Loading Exchanges',
          text2: message
      });
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  // Fetch on initial load
  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  // Handler for deleting an exchange
  const handleDeleteExchange = useCallback(async (connectionId, nickname) => {
    if (!authToken) return;

    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to remove the connection for "${nickname || connectionId}"?`, 
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            // setIsLoading(true); // Optional: Indicate loading during delete
            try {
              await deleteExchangeKey(authToken, connectionId);
              Toast.show({
                type: 'success',
                text1: 'Connection Removed',
                text2: `"${nickname || connectionId}" was removed successfully.`
              });
              // Refresh the list after deletion
              fetchExchanges(); 
            } catch (err) {
              console.error("Failed to delete exchange:", err);
              const message = err.message || 'Could not remove connection.';
              Toast.show({
                type: 'error',
                text1: 'Error Deleting Exchange',
                text2: message
              });
              // setIsLoading(false); // Stop loading if started
            }
          },
        },
      ]
    );
  }, [authToken, fetchExchanges]);

  const handleAddExchange = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleSaveSuccess = () => {
    fetchExchanges();
  };

  // Render item for FlatList
  const renderExchangeItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
          <Text style={styles.itemNickname}>{item.nickname || `Unnamed (${item.exchange_id})`}</Text>
          <Text style={styles.itemExchangeId}>{item.exchange_id}</Text>
          {/* Optionally display key preview if available and safe */}
          {/* <Text style={styles.itemApiKey}>API Key: {item.api_key_preview || '***'}</Text> */}
      </View>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => handleDeleteExchange(item.connection_id, item.nickname)}
      >
         <Ionicons name="trash-outline" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  // --- Render Logic --- //
  let content;
  if (isLoading) {
    content = <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
  } else if (error) {
    content = <Text style={styles.errorText}>Error: {error}</Text>;
  } else if (exchanges.length === 0) {
    content = (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No exchanges connected yet.</Text>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={exchanges}
        renderItem={renderExchangeItem}
        keyExtractor={(item) => item.connection_id}
        style={styles.list}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
             <Text style={styles.title}>Manage Exchanges</Text>
             {/* Back Button Placeholder */} 
        </View>
        
        <View style={styles.contentArea}> {content} </View>

        {/* Position Add button based on content */}
        { !isLoading && !error && (
             <TouchableOpacity style={styles.addButton} onPress={handleAddExchange}>
               <Text style={styles.addButtonText}>+ Add Exchange</Text>
             </TouchableOpacity>
        )}

        <AddExchangeModal 
            isVisible={isModalVisible} 
            onClose={handleModalClose}
            onSaveSuccess={handleSaveSuccess}
        />
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
    // paddingHorizontal: 20, // Padding applied within list/content area
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10, // Added padding bottom
      borderBottomWidth: 1,
      borderBottomColor: colors.primary,
  },
  title: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  contentArea: {
      flex: 1, // Takes up remaining space
      paddingHorizontal: 5, // Minimal horizontal padding for list items touching edges
  },
  loader: {
      marginTop: 50,
      color: colors.primary,
  },
  errorText: {
      color: '#FF6B6B',
      textAlign: 'center',
      marginTop: 50,
      paddingHorizontal: 20,
  },
  emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
  },
  emptyStateText: {
      color: colors.text,
      fontSize: typography.fontSizes.body,
      opacity: 0.7,
      textAlign: 'center', // Center text
  },
  list: {
      flex: 1,
      marginTop: 10,
  },
  itemContainer: {
    backgroundColor: colors.background,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 15, // Add horizontal margin for card effect
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  itemDetails: {
      flex: 1, // Allow details to take available space
      marginRight: 10, // Space before delete button
  },
  itemNickname: {
    color: colors.text,
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.medium,
    marginBottom: 3,
  },
  itemExchangeId: {
      color: colors.text,
      fontSize: typography.fontSizes.small,
      opacity: 0.8,
  },
  // itemApiKey: { ... }, 
  deleteButton: {
      padding: 5, // Add padding for easier touch
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20, // Match container padding
    marginBottom: 30, // Space from bottom
    // Removed absolute positioning
  },
  addButtonText: {
    color: colors.background,
    fontSize: typography.fontSizes.large,
    fontWeight: typography.fontWeights.bold,
  },
});

export default ExchangeManagementScreen; 