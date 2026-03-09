import React, { useContext } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { assets } from "../../assets/assets";
import { AppContext } from "../context/AppContext";

export default function Banner() {
  const { token } = useContext(AppContext);

  const handlePress = () => {
    if (token) {
      router.push("/(tabs)/profile");
    } else {
      router.push("/login");
    }
  };

  return (
    <View className="bg-indigo-500 rounded-2xl mx-4 my-10 px-6 py-8 flex-row items-center">
      {/* Left Side */}

      <View className="flex-1">
        <Text className="text-white text-2xl font-semibold">
          Book Appointment
        </Text>

        <Text className="text-white text-2xl font-semibold mt-1">
          With 100+ Trusted Doctors
        </Text>

        <Pressable
          onPress={handlePress}
          className="bg-white px-6 py-3 rounded-full mt-6 self-start"
        >
          <Text className="text-gray-700 font-medium">Create Account</Text>
        </Pressable>
      </View>

      {/* Right Side */}

      <View className="w-36 items-end">
        <Image
          source={assets.appointment_img}
          className="w-32 h-32"
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
