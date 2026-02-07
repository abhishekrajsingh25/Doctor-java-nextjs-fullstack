import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData } =
    useContext(DoctorContext);

  // ✅ FIX: backendUrl was undefined before
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  useEffect(() => {
    if (profileData) {
      setEditData({
        fees: profileData.fees,
        available: profileData.available,
        address: profileData.address || { line1: "", line2: "" },
      });
    }
  }, [profileData]);

  if (!profileData || !editData) return null;

  const updateProfile = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        {
          fees: Number(editData.fees),
          available: editData.available,
          address: editData.address,
        },
        {
          // ✅ correct header
          headers: { dtoken: dToken },
        }
      );

      if (data.success) {
        toast.success("Profile updated");
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="m-5 flex flex-col gap-4">
      <div>
        <img
          className="bg-[#5f6fff]/80 w-full sm:max-w-64 rounded-lg object-cover"
          src={profileData.image}
          alt="Doctor"
        />
      </div>

      <div className="bg-white border rounded-lg p-8">
        <p className="text-3xl font-medium text-gray-700">
          {profileData.name}
        </p>

        <div className="text-gray-600 mt-1">
          {profileData.degree} - {profileData.speciality}
        </div>

        <p className="mt-4 text-sm font-medium">About</p>
        <p className="text-sm text-gray-600">{profileData.about}</p>

        <p className="mt-4 text-gray-600">
          Appointment Fee: {currency}
          {isEdit ? (
            <input
              type="number"
              className="ml-2 border px-2 rounded"
              value={editData.fees}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  fees: e.target.value,
                }))
              }
            />
          ) : (
            <span className="ml-1">{profileData.fees}</span>
          )}
        </p>

        <div className="mt-4">
          <p className="font-medium">Address</p>

          {isEdit ? (
            <>
              <input
                className="border px-2 py-1 rounded w-full mb-2"
                value={editData.address.line1}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      line1: e.target.value,
                    },
                  }))
                }
              />
              <input
                className="border px-2 py-1 rounded w-full"
                value={editData.address.line2}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      line2: e.target.value,
                    },
                  }))
                }
              />
            </>
          ) : (
            <p className="text-sm text-gray-600">
              {profileData.address?.line1}
              <br />
              {profileData.address?.line2}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            disabled={!isEdit}
            checked={isEdit ? editData.available : profileData.available}
            onChange={() =>
              setEditData((prev) => ({
                ...prev,
                available: !prev.available,
              }))
            }
          />
          <label>Available</label>
        </div>

        {isEdit ? (
          <button
            onClick={updateProfile}
            className="mt-6 px-4 py-1 border border-[#5f6fff] rounded-full hover:bg-[#5f6fff] hover:text-white"
          >
            Save Information
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="mt-6 px-4 py-1 border border-[#5f6fff] rounded-full hover:bg-[#5f6fff] hover:text-white"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
