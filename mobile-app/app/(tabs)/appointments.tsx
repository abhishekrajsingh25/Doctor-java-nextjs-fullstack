import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Pressable } from "react-native";
import { AppContext } from "../../src/context/AppContext";
import api from "../../src/services/api";
import Toast from "react-native-toast-message";
import RazorpayCheckout from "react-native-razorpay";

export default function MyAppointments() {
  const { token, getDoctors } = useContext(AppContext);

  const [appointments, setAppointments] = useState<any[]>([]);

  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate: string) => {
    const dateArray = slotDate.split("_");

    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  /* ---------------- GET APPOINTMENTS ---------------- */

  const getUserAppointments = async () => {
    try {
      const res = await api.get("/api/user/appointments", {
        headers: { token },
      });

      if (res.data.success) {
        setAppointments(res.data.appointments.reverse());
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  /* ---------------- CANCEL APPOINTMENT ---------------- */

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const res = await api.post(
        "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } },
      );

      if (res.data.success) {
        Toast.show({
          type: "success",
          text1: res.data.message,
        });

        getUserAppointments();
        getDoctors();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  /* ---------------- VERIFY PAYMENT ---------------- */

  const verifyPayment = async (paymentData: any) => {
    try {
      const res = await api.post("/api/user/verify-razorpay", paymentData, {
        headers: { token },
      });

      if (res.data.success) {
        Toast.show({
          type: "success",
          text1: res.data.message,
        });

        getUserAppointments();
      } else {
        Toast.show({
          type: "error",
          text1: res.data.message,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  /* ---------------- INIT RAZORPAY ---------------- */

  const initPay = async (order: any) => {
    const options = {
      description: "Appointment Payment",
      currency: order.currency,
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY,
      amount: order.amount,
      name: "Appointment Payment",
      order_id: order.id,
      prefill: {
        email: "",
        contact: "",
        name: "",
      },
      theme: { color: "#5f6fff" },
    };

    try {
      const data = await RazorpayCheckout.open(options);

      verifyPayment({
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Payment Failed",
        text2: error?.description || "Payment Cancelled",
      });
    }
  };

  /* ---------------- PAY ONLINE ---------------- */

  const appointmentRazorpay = async (appointmentId: string) => {
    try {
      const res = await api.post(
        "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { token } },
      );

      if (res.data.success) {
        initPay(res.data.order);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  /* ---------------- UI ---------------- */

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4">
      <Text className="text-xl font-semibold mt-4 mb-3">My Appointments</Text>

      {appointments.map((item, index) => (
        <View
          key={index}
          className="bg-white rounded-xl p-4 mb-4 shadow-sm flex-row"
        >
          {/* Doctor Image */}

          <Image
            source={{ uri: item.docData.image }}
            className="w-20 h-20 rounded-lg bg-indigo-50"
          />

          {/* Doctor Info */}

          <View className="ml-4 flex-1">
            <Text className="text-base font-semibold">{item.docData.name}</Text>

            <Text className="text-indigo-500">{item.docData.speciality}</Text>

            <Text className="text-gray-500 text-sm mt-2">
              {item.docData.address.line1}
            </Text>

            <Text className="text-gray-500 text-sm">
              {item.docData.address.line2}
            </Text>

            <Text className="text-gray-700 mt-2 text-sm">
              Date & Time: {slotDateFormat(item.slotDate)} | {item.slotTime}
            </Text>

            {/* Buttons */}

            <View className="flex-row mt-3 flex-wrap">
              {!item.cancelled && item.payment && !item.isCompleted && (
                <View className="bg-indigo-50 px-4 py-2 rounded-full mr-2 mb-2">
                  <Text className="text-indigo-600 text-xs">Paid</Text>
                </View>
              )}

              {!item.cancelled && !item.payment && !item.isCompleted && (
                <Pressable
                  onPress={() => appointmentRazorpay(item._id)}
                  className="border border-gray-300 px-4 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-gray-600 text-xs">Pay Online</Text>
                </Pressable>
              )}

              {!item.cancelled && !item.isCompleted && (
                <Pressable
                  onPress={() => cancelAppointment(item._id)}
                  className="border border-red-400 px-4 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-red-500 text-xs">Cancel</Text>
                </Pressable>
              )}

              {item.cancelled && (
                <View className="border border-red-500 px-4 py-2 rounded-full">
                  <Text className="text-red-500 text-xs">Cancelled</Text>
                </View>
              )}

              {item.isCompleted && (
                <View className="border border-green-500 px-4 py-2 rounded-full">
                  <Text className="text-green-600 text-xs">Completed</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
