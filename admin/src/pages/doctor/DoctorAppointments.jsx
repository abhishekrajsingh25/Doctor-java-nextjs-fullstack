import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    backendUrl,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } =
    useContext(AppContext);

  // 🔥 cache userId -> image
  const [userImages, setUserImages] = useState({});

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  // 🔥 FETCH USER IMAGE USING userId
  useEffect(() => {
    const fetchImages = async () => {
      const missingUsers = appointments
        .map((a) => a.userData?.userId)
        .filter((id) => id && !userImages[id]);

      for (const userId of missingUsers) {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/user/get-profile`,
            {
              headers: { token: dToken },
            }
          );

          if (data.success) {
            setUserImages((prev) => ({
              ...prev,
              [userId]: data.user.image,
            }));
          }
        } catch {
          console.warn("Image fetch failed for", userId);
        }
      }
    };

    if (appointments.length) {
      fetchImages();
    }
  }, [appointments]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border border-gray-300 rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_1fr_3fr_1fr_1fr] py-3 px-6 border-b border-gray-300">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

        {[...appointments].reverse().map((item, index) => {
          const userId = item.userData?.userId;
          const image = userImages[userId];

          return (
            <div
              key={item.id}
              className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_3fr_1fr_1fr_3fr_1fr_1fr] items-center py-3 px-6 border-b hover:bg-gray-50"
            >
              <p className="max-sm:hidden">{index + 1}</p>

              {/* 🧑 USER */}
              <div className="flex items-center gap-2">
                {image ? (
                  <img
                    src={image}
                    className="w-8 h-8 rounded-full object-cover"
                    alt="User"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {item.userData?.name?.charAt(0)}
                  </div>
                )}
                <p>{item.userData?.name}</p>
              </div>

              {/* 💳 PAYMENT */}
              <p className="text-xs border border-[#5f6fff] px-2 rounded-full">
                {item.payment ? "Online" : "CASH"}
              </p>

              {/* 🎂 AGE */}
              <p className="max-sm:hidden">
                {calculateAge(item.userData?.dob)}
              </p>

              {/* 📅 DATE */}
              <p>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>

              {/* 💰 FEES */}
              <p>
                {currency}
                {item.amount}
              </p>

              {/* ⚙ ACTIONS */}
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">
                  Cancelled
                </p>
              ) : item.completed ? (
                <p className="text-green-500 text-xs font-medium">
                  Completed
                </p>
              ) : (
                <div className="flex">
                  <img
                    onClick={() => cancelAppointment(item.id)}
                    className="w-8 cursor-pointer"
                    src={assets.cancel_icon}
                    alt="Cancel"
                  />
                  <img
                    onClick={() => completeAppointment(item.id)}
                    className="w-8 cursor-pointer"
                    src={assets.tick_icon}
                    alt="Complete"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorAppointments;
