import React, { createContext, useEffect, useState } from "react";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AppContext = createContext<any>(null);

export const AppContextProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  const currencySymbol = "$";

  // Load token from storage
  const loadToken = async () => {
    const storedToken = await AsyncStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
    }
  };

  // Fetch doctors
  const getDoctors = async () => {
    try {
      const res = await api.get("/api/doctor/list");

      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Load user profile
  const loadUserProfileData = async () => {
    try {
      const res = await api.get("/api/user/get-profile", {
        headers: { token },
      });

      if (res.data.success) {
        setUserData(res.data.userData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadToken();
    getDoctors();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(null);
    }
  }, [token]);

  const value = {
    token,
    setToken,
    doctors,
    userData,
    setUserData,
    currencySymbol,
    getDoctors,
    loadUserProfileData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
