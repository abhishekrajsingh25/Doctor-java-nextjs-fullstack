import { Stack } from "expo-router";
import React from "react";
import { AppContextProvider } from "../src/context/AppContext";
import "../global.css";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <AppContextProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </AppContextProvider>
  );
}
