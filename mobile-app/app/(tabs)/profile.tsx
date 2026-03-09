import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView
} from "react-native";
import { router } from "expo-router";
import { AppContext } from "../../src/context/AppContext";
import api from "../../src/services/api";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";

export default function Profile() {

  const {
    token,
    userData,
    setUserData,
    loadUserProfileData
  } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState<any>(null);

  const pickImage = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }

  };

  const updateProfile = async () => {

    try {

      const formData = new FormData();

      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      formData.append("address", JSON.stringify(userData.address));

      if (image) {
        formData.append("image", {
          uri: image.uri,
          name: "profile.jpg",
          type: "image/jpeg"
        } as any);
      }

      const res = await api.post("/api/user/update-profile", formData, {
        headers: {
          token,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {

        Toast.show({
          type: "success",
          text1: "Profile Updated"
        });

        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);

      }

    } catch (error: any) {

      Toast.show({
        type: "error",
        text1: "Update Failed"
      });

    }

  };

  /* ---------------- NOT LOGGED IN ---------------- */

  if (!token || !userData) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">

        <Text className="text-xl font-semibold mb-4">
          Login Required
        </Text>

        <Text className="text-gray-500 mb-6 text-center">
          Please login to view your profile
        </Text>

        <Pressable
          onPress={() => router.push("/login")}
          className="bg-indigo-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">
            Go to Login
          </Text>
        </Pressable>

      </View>
    );
  }

  /* ---------------- PROFILE ---------------- */

  return (

    <ScrollView className="flex-1 bg-white px-5">

      <View className="items-center mt-6">

        <Pressable disabled={!isEdit} onPress={pickImage}>
          <Image
            source={{
              uri: image ? image.uri : userData.image
            }}
            className="w-32 h-32 rounded-full"
          />
        </Pressable>

      </View>

      {/* Name */}

      {isEdit ? (

        <TextInput
          value={userData.name}
          onChangeText={(text) =>
            setUserData((prev: any) => ({
              ...prev,
              name: text
            }))
          }
          className="border p-3 rounded-lg mt-6"
        />

      ) : (

        <Text className="text-2xl font-semibold text-center mt-6">
          {userData.name}
        </Text>

      )}

      <View className="mt-8">

        <Text className="text-gray-500 mb-2">
          Email
        </Text>

        <Text className="text-indigo-500">
          {userData.email}
        </Text>

      </View>

      <View className="mt-6">

        <Text className="text-gray-500 mb-2">
          Phone
        </Text>

        {isEdit ? (

          <TextInput
            value={userData.phone}
            onChangeText={(text) =>
              setUserData((prev: any) => ({
                ...prev,
                phone: text
              }))
            }
            className="border p-3 rounded-lg"
          />

        ) : (

          <Text>{userData.phone}</Text>

        )}

      </View>

      <View className="mt-6">

        <Text className="text-gray-500 mb-2">
          Address
        </Text>

        {isEdit ? (

          <>
            <TextInput
              value={userData.address.line1}
              onChangeText={(text) =>
                setUserData((prev: any) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    line1: text
                  }
                }))
              }
              className="border p-3 rounded-lg mb-2"
            />

            <TextInput
              value={userData.address.line2}
              onChangeText={(text) =>
                setUserData((prev: any) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    line2: text
                  }
                }))
              }
              className="border p-3 rounded-lg"
            />
          </>

        ) : (

          <Text className="text-gray-600">
            {userData.address.line1}
            {"\n"}
            {userData.address.line2}
          </Text>

        )}

      </View>

      {/* Buttons */}

      <View className="mt-10">

        {isEdit ? (

          <Pressable
            onPress={updateProfile}
            className="border border-indigo-500 py-3 rounded-full items-center"
          >
            <Text className="text-indigo-500 font-semibold">
              Save Information
            </Text>
          </Pressable>

        ) : (

          <Pressable
            onPress={() => setIsEdit(true)}
            className="border border-indigo-500 py-3 rounded-full items-center"
          >
            <Text className="text-indigo-500 font-semibold">
              Edit Profile
            </Text>
          </Pressable>

        )}

      </View>

    </ScrollView>
  );
}