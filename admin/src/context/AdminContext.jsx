import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // 🔐 ADMIN AUTH HEADER (CUSTOM — NOT BEARER)
  const adminHeaders = {
    headers: {
      atoken: aToken,
    },
  };

  // ==================== DOCTORS ====================
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/all-doctors`,
        adminHeaders
      );

      if (data.success) {
        setDoctors(data.doctors || []);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const changeAvailability = async (doctorId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-availability`,
        null,
        {
          params: { doctorId },
          headers: { atoken: aToken },
        }
      );

      if (data.success) {
        toast.success("Availability updated");
        getAllDoctors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // ==================== APPOINTMENTS ====================
  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/appointments`,
        adminHeaders
      );

      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/cancel-appointment`,
        { appointmentId },
        adminHeaders
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // ==================== DASHBOARD ====================
  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/dashboard`,
        adminHeaders
      );

      if (data.success) {
        setDashData(data.dashboard);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        aToken,
        setAToken,
        backendUrl,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        cancelAppointment,
        dashData,
        getDashData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
