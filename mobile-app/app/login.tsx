import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

import api from "../src/services/api";
import { AppContext } from "../src/context/AppContext";

export default function Login() {

  const { setToken } = useContext(AppContext);

  const [state, setState] = useState<"Login" | "Sign Up">("Login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill all required fields"
      });
      return;
    }

    try {

      setLoading(true);

      let res;

      if (state === "Sign Up") {

        res = await api.post("/api/user/register", {
          name,
          email,
          password
        });

      } else {

        res = await api.post("/api/user/login", {
          email,
          password
        });

      }

      if (res.data.success) {

        await AsyncStorage.setItem("token", res.data.token);

        setToken(res.data.token);

        Toast.show({
          type: "success",
          text1: state === "Sign Up" ? "Account Created 🎉" : "Login Successful",
          text2: "Welcome 👋"
        });

        setTimeout(() => {
          router.replace("/(tabs)");
        }, 800);

      }

    } catch (error: any) {

      Toast.show({
        type: "error",
        text1: "Authentication Failed",
        text2: error?.response?.data?.message || "Something went wrong"
      });

    } finally {

      setLoading(false);

    }

  };

  return (

    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 justify-center px-6 bg-white"
    >

      {/* Back Button */}
      <Pressable
        onPress={() => router.push("/")}
        className="absolute top-14 left-6"
      >
        <Ionicons name="arrow-back" size={26} color="#4f46e5" />
      </Pressable>

      {/* Title */}
      <Text className="text-3xl font-bold mb-2 text-center">
        {state === "Sign Up" ? "Create Account" : "Welcome Back"}
      </Text>

      <Text className="text-gray-500 text-center mb-8">
        {state === "Sign Up"
          ? "Sign up to book appointments easily"
          : "Login to continue"}
      </Text>

      {/* Name */}
      {state === "Sign Up" && (
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          className="border border-gray-300 p-4 rounded-xl mb-4"
        />
      )}

      {/* Email */}
      <TextInput
        placeholder="Email Address"
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        className="border border-gray-300 p-4 rounded-xl mb-4"
      />

      {/* Password with Eye Toggle */}
      <View className="border border-gray-300 rounded-xl mb-6 flex-row items-center px-4">

        <Ionicons name="lock-closed-outline" size={20} color="gray" />

        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          className="flex-1 py-4 ml-2"
        />

        <Pressable onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="gray"
          />
        </Pressable>

      </View>

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className="bg-indigo-600 p-4 rounded-xl items-center"
      >

        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">
            {state === "Sign Up" ? "Create Account" : "Login"}
          </Text>
        )}

      </Pressable>

      {/* Switch Auth Mode */}
      <Pressable
        onPress={() =>
          setState(state === "Sign Up" ? "Login" : "Sign Up")
        }
      >
        <Text className="text-center mt-6 text-indigo-600 font-medium">
          {state === "Sign Up"
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </Text>
      </Pressable>

    </KeyboardAvoidingView>
  );
}