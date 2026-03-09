import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "../../src/context/AppContext";
import Toast from "react-native-toast-message";
import api from "../../src/services/api";
import RelatedDoctors from "../../src/components/RelatedDoctors";

export default function Appointment() {
  const { docId } = useLocalSearchParams();

  const { doctors, currencySymbol, token, getDoctors } = useContext(AppContext);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState<any>(null);
  const [docSlots, setDocSlots] = useState<any[]>([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  /* ---------- SAME LOGIC ---------- */

  const fetchDocInfo = () => {
    const doc = doctors.find((doc: any) => doc._id === docId);
    setDocInfo(doc);
  };

  const getAvailableSlots = () => {
    setDocSlots([]);

    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10,
        );

        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots: any = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;

        const isAvailable = docInfo?.slots_booked?.[slotDate]?.includes(
          formattedTime,
        )
          ? false
          : true;

        if (isAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      Toast.show({
        type: "error",
        text1: "Login required",
      });

      return router.push("/login");
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const res = await api.post(
        "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } },
      );

      if (res.data.success) {
        Toast.show({
          type: "success",
          text1: "Appointment Booked",
        });

        getDoctors();

        router.push("/(tabs)/appointments");
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message,
      });
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);
  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  if (!docInfo) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 bg-gray-50 px-5">
        {/* Back Button */}

        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center mt-3 mb-4"
        >
          <Ionicons name="arrow-back" size={22} />
          <Text className="ml-2 text-base font-medium">Back</Text>
        </Pressable>

        {/* Doctor Card */}

        <View className="bg-white rounded-2xl p-4 shadow">
          <View className="flex-row">
            <Image
              source={{ uri: docInfo.image }}
              className="w-28 h-28 rounded-xl"
            />

            <View className="ml-4 flex-1">
              <Text className="text-xl font-semibold">{docInfo.name}</Text>

              <Text className="text-indigo-500 mt-1">
                {docInfo.degree} • {docInfo.speciality}
              </Text>

              <Text className="text-gray-500 mt-2 text-sm">
                {docInfo.experience}
              </Text>

              <Text className="text-gray-700 mt-2 font-semibold">
                Fee: {currencySymbol}
                {docInfo.fees}
              </Text>
            </View>
          </View>

          <Text className="text-gray-500 mt-3 text-sm">{docInfo.about}</Text>
        </View>

        {/* Date Selection */}

        <Text className="mt-6 font-semibold text-lg">Select Date</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
        >
          {docSlots.map((item, index) => {
            const day = item[0]?.datetime;

            return (
              <Pressable
                key={index}
                onPress={() => setSlotIndex(index)}
                className={`mr-3 px-4 py-3 rounded-xl items-center ${
                  slotIndex === index
                    ? "bg-indigo-500"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={
                    slotIndex === index ? "text-white" : "text-gray-500"
                  }
                >
                  {day && daysOfWeek[day.getDay()]}
                </Text>

                <Text
                  className={
                    slotIndex === index
                      ? "text-white font-semibold"
                      : "text-gray-700"
                  }
                >
                  {day && day.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Time Section */}

        <Text className="mt-6 font-semibold text-lg">Select Time</Text>

        <View className="flex-row flex-wrap mt-3">
          {docSlots[slotIndex]?.map((item: any, index: number) => (
            <Pressable
              key={index}
              onPress={() => setSlotTime(item.time)}
              className={`px-4 py-2 mr-3 mb-3 rounded-full ${
                slotTime === item.time
                  ? "bg-indigo-500"
                  : "border border-gray-300"
              }`}
            >
              <Text
                className={
                  slotTime === item.time ? "text-white" : "text-gray-600"
                }
              >
                {item.time.toLowerCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Book Button */}

        <Pressable
          onPress={bookAppointment}
          className="bg-indigo-500 py-4 rounded-full mt-4 mb-10"
        >
          <Text className="text-white text-center font-semibold text-base">
            Book Appointment
          </Text>
        </Pressable>

        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </ScrollView>
    </SafeAreaView>
  );
}
