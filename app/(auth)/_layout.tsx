import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  // This layout component can be used to configure static aspects
  // of the auth stack, like navigation headers if needed.
  // For now, we'll just render the stack.
  return <Stack screenOptions={{ headerShown: false }} />;
} 