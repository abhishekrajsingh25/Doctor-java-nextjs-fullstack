import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { AppContext } from "../context/AppContext";

export default function RelatedDoctors({ docId, speciality }: any) {

  const { doctors } = useContext(AppContext);

  const [relatedDoctors, setRelatedDoctors] = useState<any[]>([]);

  useEffect(() => {

    if (doctors.length > 0 && speciality) {

      const filtered = doctors.filter(
        (doc: any) =>
          doc.speciality === speciality &&
          doc._id !== docId
      );

      setRelatedDoctors(filtered);

    }

  }, [doctors, speciality, docId]);

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

    <View className="mt-8 px-4">

      <Text className="text-xl font-semibold text-center mb-2">
        Related Doctors
      </Text>

      <Text className="text-center text-gray-500 text-sm mb-6">
        Simply browse through our extensive list of trusted doctors.
      </Text>

      <FlatList
        data={relatedDoctors.slice(0, 5)}
        renderItem={renderDoctor}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
      />

    </View>

  );

}