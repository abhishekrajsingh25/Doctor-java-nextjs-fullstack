import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") || ""
  );

  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // ================== APPOINTMENTS ==================
  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/appointments`,
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/complete-appointment`,
        { appointmentId },
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        await getAppointments(); // 🔄 refresh list
        await getDashData();     // 🔥 refresh dashboard
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/cancel-appointment`,
        { appointmentId },
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        await getAppointments();
        await getDashData(); // 🔥 refresh dashboard
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ================== DASHBOARD ==================
  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/dashboard`,
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        setDashData(data.dashboard);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ================== PROFILE ==================
  const getProfileData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/profile`,
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        setProfileData(data.profile);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DoctorContext.Provider
      value={{
        dToken,
        setDToken,
        appointments,
        dashData,
        profileData,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        getDashData,
        getProfileData,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
