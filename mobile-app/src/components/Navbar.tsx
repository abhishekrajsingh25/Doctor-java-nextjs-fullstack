import React, { useContext, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { assets } from "../../assets/assets";

export default function Navbar() {
  const { token, userData, setToken } = useContext(AppContext);
  const [openMenu, setOpenMenu] = useState(false);

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setOpenMenu(false);

    Toast.show({
      type: "success",
      text1: "Logged out",
      text2: "You have been logged out successfully 👋",
      position: "top",
    });

    router.replace("/login");
  };

  return (
    <>
      {/* Overlay to detect outside click */}
      {openMenu && (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 9 }]}
          onPress={() => setOpenMenu(false)}
        />
      )}

      <View style={styles.navbar}>
        {/* Logo */}
        <Pressable onPress={() => router.push("/")}>
          <Image
            source={assets.logo}
            style={{ width: 120, height: 40 }}
            resizeMode="contain"
          />
        </Pressable>

        {/* Right Side */}
        {!token ? (
          <Pressable
            onPress={() => router.push("/login")}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setOpenMenu(!openMenu)}
            style={styles.profile}
          >
            {userData?.image ? (
              <Image source={{ uri: userData.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={18} color="white" />
              </View>
            )}

            <Ionicons name="chevron-down" size={18} style={{ marginLeft: 6 }} />
          </Pressable>
        )}

        {/* Dropdown */}
        {openMenu && (
          <View style={styles.dropdown}>
            <Pressable onPress={logout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    zIndex: 10,
  },

  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },

  loginText: {
    color: "#fff",
    fontWeight: "600",
  },

  profile: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },

  dropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    width: 140,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  logoutText: {
    marginLeft: 8,
    color: "#ef4444",
    fontWeight: "600",
  },
});
