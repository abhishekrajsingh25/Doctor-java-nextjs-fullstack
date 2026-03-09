import AiDoctorRecommendation from "@/src/components/AiDoctorRecommendation";
import Banner from "@/src/components/Banner";
import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";
import TopDoctors from "@/src/components/TopDoctors";
import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function Home() {
  return (
    <ScrollView>
      <Header />
      <AiDoctorRecommendation />
      <TopDoctors />
      <Banner />
      <Footer />
    </ScrollView>
  );
}