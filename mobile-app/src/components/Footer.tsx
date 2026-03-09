import React from "react";
import { View, Text, Image } from "react-native";
import { assets } from "../../assets/assets";

export default function Footer() {

  return (

    <View className="px-6 py-10 bg-white">

      {/* Logo + Description */}

      <Image
        source={assets.logo}
        className="w-32 h-10 mb-4"
        resizeMode="contain"
      />

      <Text className="text-gray-600 leading-6 mb-8">

        Our platform allows patients to schedule, reschedule, or cancel
        appointments anytime, reducing wait times and administrative
        burdens. Doctors can manage their schedules efficiently.
        Experience seamless healthcare access with our user-friendly
        24/7 online booking system.

      </Text>

      {/* Company */}

      <View className="mb-8">

        <Text className="text-lg font-semibold mb-3">
          COMPANY
        </Text>

        <Text className="text-gray-600 mb-2">Home</Text>
        <Text className="text-gray-600 mb-2">About Us</Text>
        <Text className="text-gray-600 mb-2">Contact Us</Text>
        <Text className="text-gray-600">Privacy Policy</Text>

      </View>

      {/* Contact */}

      <View className="mb-8">

        <Text className="text-lg font-semibold mb-3">
          GET IN TOUCH
        </Text>

        <Text className="text-gray-600 mb-2">
          +91 9523300556
        </Text>

        <Text className="text-gray-600">
          abhishekrajsingh2509@gmail.com
        </Text>

      </View>

      {/* Divider */}

      <View className="h-[1px] bg-gray-200 mb-4"/>

      {/* Copyright */}

      <Text className="text-center text-gray-500 text-sm">

        Copyright © 2025 Abhishek Raj Singh
        {"\n"}
        All Rights Reserved.

      </Text>

    </View>

  );

}