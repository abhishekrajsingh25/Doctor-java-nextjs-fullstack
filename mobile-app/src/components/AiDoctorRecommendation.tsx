import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
// import { useRouter } from "expo-router";
import { router } from "expo-router";
import { AppContext } from "../context/AppContext";
import api from "../services/api";

export default function AiDoctorRecommendation() {
  const { backendUrl, token } = useContext(AppContext);
  //   const router = useRouter();

  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const getRecommendation = async () => {
    if (!token) {
      Toast.show({
        type: "error",
        text1: "Login to get AI recommendations",
      });
      return router.push("/login");
    }

    if (!symptoms.trim()) {
      return Toast.show({
        type: "error",
        text1: "Please enter symptoms",
      });
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/api/ai/recommend-doctor",
        {
          symptoms: symptoms.split(",").map((s) => s.trim()),
        },
        {
          headers: { token },
        },
      );

      if (res.data.success) {
        setRecommendations(res.data.data.recommendedDoctors);
      } else {
        Toast.show({
          type: "error",
          text1: "AI failed to recommend",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDoctor = ({ item }: any) => (
    <Pressable
      style={styles.card}
    >
      <Text style={styles.docName}>{item.name}</Text>
      <Text style={styles.speciality}>{item.speciality}</Text>
      <Text style={styles.reason}>{item.reason}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 AI Doctor Recommendation</Text>

      <Text style={styles.subtitle}>
        Describe your symptoms (comma separated)
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. chest pain, headache"
          value={symptoms}
          onChangeText={setSymptoms}
        />

        <Pressable style={styles.button} onPress={getRecommendation}>
          <Text style={styles.buttonText}>
            {loading ? "Analyzing..." : "Get Recommendation"}
          </Text>
        </Pressable>
      </View>

      {recommendations.length > 0 && (
        <FlatList
          data={recommendations}
          renderItem={renderDoctor}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.resultContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#eef2ff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },

  subtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    marginBottom: 10,
  },

  inputRow: {
    flexDirection: "column",
    gap: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "white",
  },

  button: {
    backgroundColor: "#5f6fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "500",
  },

  resultContainer: {
    marginTop: 15,
    gap: 12,
  },

  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  docName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  speciality: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  reason: {
    fontSize: 12,
    color: "#777",
    marginTop: 6,
  },
});
