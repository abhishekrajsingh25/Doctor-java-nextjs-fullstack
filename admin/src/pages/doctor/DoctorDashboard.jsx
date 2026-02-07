import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorDashboard = () => {
  const {
    dToken,
    dashData,
    getDashData,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  const { currency, slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getDashData();
      getAppointments();
    }
  }, [dToken]);

  if (!dashData) return null;

  return (
    <div className="m-5">
      {/* ================= STATS ================= */}
      <div className="flex flex-wrap gap-3">
        <Stat
          icon={assets.earning_icon}
          label="Earnings"
          value={`${currency} ${dashData.earnings}`}
        />
        <Stat
          icon={assets.appointments_icon}
          label="Appointments"
          value={dashData.appointments}
        />
        <Stat
          icon={assets.patients_icon}
          label="Patients"
          value={dashData.patients}
        />
      </div>

      {/* ================= APPOINTMENTS ================= */}
      <div className="bg-white mt-10">
        <Header title="Latest Appointments" />

        <div className="border border-gray-300 border-t-0">
          {appointments.length === 0 && (
            <p className="p-4 text-sm text-gray-400">
              No appointments found
            </p>
          )}

          {appointments.map((item) => (
            <div
              key={item.id}
              className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                {item.userData?.name?.charAt(0)}
              </div>

              <div className="flex-1 text-sm">
                <p className="text-gray-800 font-medium">
                  {item.userData?.name}
                </p>
                <p className="text-gray-600">
                  {slotDateFormat(item.slotDate)} {item.slotTime}
                </p>
              </div>

              {/* 🔥 FIXED STATUS LOGIC */}
              {item.cancelled ? (
                <p className="text-red-500 text-xs font-medium">
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
                    className="w-10 cursor-pointer"
                    src={assets.cancel_icon}
                    alt="Cancel"
                  />
                  <img
                    onClick={() => completeAppointment(item.id)}
                    className="w-10 cursor-pointer"
                    src={assets.tick_icon}
                    alt="Complete"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================= UI HELPERS ================= */

const Stat = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border hover:scale-105 transition-all">
    <img className="w-14" src={icon} alt="" />
    <div>
      <p className="text-xl font-semibold text-gray-600">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  </div>
);

const Header = ({ title }) => (
  <div className="flex items-center gap-2.5 px-4 py-4 border border-gray-300 rounded-t">
    <img src={assets.list_icon} alt="" />
    <p className="font-semibold text-gray-600">{title}</p>
  </div>
);

export default DoctorDashboard;
