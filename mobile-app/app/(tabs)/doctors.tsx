import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useState } from "react";
import { AppContext } from "../../src/context/AppContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const specialities = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];

export default function Doctors() {
  const { doctors } = useContext(AppContext);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");

  const filteredDoctors = doctors.filter((doc: any) => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase());

    const matchSpeciality = selected === "" || doc.speciality === selected;

    return matchSearch && matchSpeciality;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4">
        {/* Header */}

        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold">Find Doctors</Text>

            <Text className="text-gray-500">
              Book appointments with trusted specialists
            </Text>
          </View>

          {/* <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="person-outline" size={22} />
          </Pressable> */}
        </View>

        {/* Search */}

        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm">
          <Ionicons name="search" size={20} color="#9CA3AF" />

          <TextInput
            placeholder="Search doctors or specialists"
            value={search}
            onChangeText={setSearch}
            className="ml-2 flex-1 text-gray-700"
          />
        </View>

        {/* Filters */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
        >
          <Pressable
            onPress={() => setSelected("")}
            className={`px-5 h-10 mr-2 rounded-full justify-center ${
              selected === ""
                ? "bg-indigo-500"
                : "bg-white border border-gray-200"
            }`}
          >
            <Text className={selected === "" ? "text-white" : "text-gray-600"}>
              All
            </Text>
          </Pressable>

          {specialities.map((item) => (
            <Pressable
              key={item}
              onPress={() => setSelected(selected === item ? "" : item)}
              className={`px-5 h-10 mr-2 rounded-full justify-center ${
                selected === item
                  ? "bg-indigo-500"
                  : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={selected === item ? "text-white" : "text-gray-600"}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Doctor List */}

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 20,
        }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/appointment/${item._id}`)}
            className="flex-row bg-white p-4 mb-4 rounded-2xl shadow-sm"
          >
            {/* Doctor Image */}

            <Image
              source={{ uri: item.image }}
              className="w-20 h-20 rounded-xl"
            />

            {/* Doctor Info */}

            <View className="ml-4 flex-1 justify-between">
              <View>
                <Text className="text-lg font-semibold">{item.name}</Text>

                <Text className="text-indigo-500 font-medium">
                  {item.speciality}
                </Text>

                <Text className="text-gray-500 text-sm mt-1">
                  {item.experience} experience
                </Text>
              </View>

              {/* Availability */}

              <View className="flex-row items-center mt-2">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    item.available ? "bg-green-500" : "bg-gray-400"
                  }`}
                />

                <Text className="text-sm text-gray-500">
                  {item.available ? "Available" : "Not Available"}
                </Text>
              </View>
            </View>

            {/* Book Button */}

            <Pressable
              onPress={() => router.push(`/appointment/${item._id}`)}
              className="bg-indigo-500 px-4 py-2 rounded-lg self-center"
            >
              <Text className="text-white text-sm font-medium">Book</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
