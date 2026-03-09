import React, { useContext } from "react";
import { View, Text, Image, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { AppContext } from "../context/AppContext";

export default function TopDoctors() {

  const { doctors } = useContext(AppContext);

  const topDoctors = doctors.slice(0, 5);

  const renderDoctor = ({ item }: any) => (

    <Pressable
      onPress={() => router.push(`/appointment/${item._id}`)}
      className="bg-white rounded-xl p-3 shadow-sm mb-4 flex-row items-center"
    >

      {/* Doctor Image */}

      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-xl bg-blue-50"
      />

      {/* Doctor Info */}

      <View className="ml-4 flex-1">

        <View className="flex-row items-center mb-1">

          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              item.available ? "bg-green-500" : "bg-gray-400"
            }`}
          />

          <Text className="text-xs text-gray-500">
            {item.available ? "Available" : "Not Available"}
          </Text>

        </View>

        <Text className="text-lg font-semibold text-gray-900">
          {item.name}
        </Text>

        <Text className="text-gray-600 text-sm">
          {item.speciality}
        </Text>

      </View>

      {/* Book Button */}

      <Pressable
        onPress={() => router.push(`/appointment/${item._id}`)}
        className="bg-indigo-500 px-4 py-2 rounded-lg"
      >
        <Text className="text-white text-sm font-medium">
          Book
        </Text>
      </Pressable>

    </Pressable>

  );

  return (

    <View className="mt-10 px-4">

      <Text className="text-2xl font-semibold text-center">
        Top Doctors to Book
      </Text>

      <Text className="text-center text-gray-500 text-sm mt-2 mb-6">
        Simply browse through our extensive list of trusted doctors.
      </Text>

      <FlatList
        data={topDoctors}
        renderItem={renderDoctor}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
      />

      {/* More Button */}

      <Pressable
        onPress={() => router.push("/doctors")}
        className="bg-blue-50 py-3 rounded-full mt-4 items-center"
      >
        <Text className="text-gray-600 font-medium">
          More
        </Text>
      </Pressable>

    </View>

  );

}