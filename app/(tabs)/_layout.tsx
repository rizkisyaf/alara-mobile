import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = 'dark';

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopColor: Colors[colorScheme].tint,
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          height: Platform.OS === 'ios' ? 80 : 65,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'index') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'exchanges') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'billing') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'alert-circle-outline' as any;
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
        }}
      />
      <Tabs.Screen
        name="exchanges"
        options={{
          title: 'Exchanges',
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
