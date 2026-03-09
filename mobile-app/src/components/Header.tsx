import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { assets } from "../../assets/assets";

export default function Header() {

  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* LEFT SECTION */}

      <View style={styles.leftSection}>

        <Text style={styles.title}>
          Book Appointment{"\n"}With Trusted Doctors
        </Text>

        <View style={styles.profileRow}>
          <Image source={assets.group_profiles} style={styles.profileImg} />

          <Text style={styles.subtitle}>
            Simply browse through our extensive list of trusted doctors,
            schedule your appointment hassle-free.
          </Text>
        </View>

        {/* BOOK APPOINTMENT BUTTON */}

        <Pressable
          style={styles.button}
          onPress={() => router.push("/doctors")}
        >
          <Text style={styles.buttonText}>Book Appointment</Text>

          {/* <Image source={assets.arrow_icon} style={styles.arrowIcon} /> */}
        </Pressable>

      </View>

      {/* RIGHT SECTION */}

      <View style={styles.rightSection}>
        <Image source={assets.header_img} style={styles.headerImage} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: "#5f6fff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  leftSection: {
    gap: 16,
  },

  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "700",
    lineHeight: 34,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  profileImg: {
    width: 90,
    height: 30,
    resizeMode: "contain",
  },

  subtitle: {
    flex: 1,
    color: "white",
    fontSize: 13,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 40,
    alignSelf: "flex-start",
    gap: 6,
  },

  buttonText: {
    color: "#555",
    fontSize: 14,
  },

  arrowIcon: {
    width: 14,
    height: 14,
  },

  rightSection: {
    marginTop: 25,
    alignItems: "center",
  },

  headerImage: {
    width: "100%",
    height: 240,
    resizeMode: "contain",
  }

});