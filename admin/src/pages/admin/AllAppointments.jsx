import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);

  const { calculateAge, slotDateFormat, currency } =
    useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken, getAllAppointments]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border border-gray-300 rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b border-gray-300">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

        {appointments?.slice().reverse().map((item, index) => {
          const patientName =
            item?.userData?.name || "Unknown Patient";
          const doctorName =
            item?.docData?.name || "Unknown Doctor";

          return (
            <div
              key={item.id || index}
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b border-gray-300 hover:bg-gray-50"
            >
              <p className="max-sm:hidden">{index + 1}</p>

              {/* Patient */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                  {patientName.charAt(0)}
                </div>
                <p>{patientName}</p>
              </div>

              {/* Age */}
              <p className="max-sm:hidden">
                {calculateAge(item?.userData?.dob)}
              </p>

              {/* Date & Time */}
              <p>
                {slotDateFormat(item?.slotDate)}, {item?.slotTime}
              </p>

              {/* Doctor */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                  {doctorName.charAt(0)}
                </div>
                <p>{doctorName}</p>
              </div>

              {/* Fees */}
              <p>
                {currency}
                {item?.amount}
              </p>

              {/* Actions */}
              {item?.cancelled ? (
                <p className="text-red-400 text-xs font-medium">
                  Cancelled
                </p>
              ) : item?.completed ? (
                <p className="text-green-500 text-xs font-medium">
                  Completed
                </p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item?.id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllAppointments;
