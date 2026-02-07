"use client";

import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";

const MyProfile = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    context;

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  if (!userData) return null;

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();

      formData.append(
        "data",
        JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          gender: userData.gender,
          dob: userData.dob,
          address: userData.address,
        }),
      );

      if (image) {
        formData.append("image", image);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        formData,
        {
          headers: {
            token, // keep as-is
          },
        },
      );

      if (data.success) {
        toast.success("Profile updated successfully");
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error("Update failed");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      {/* PROFILE IMAGE */}
      {isEdit ? (
        <label htmlFor="image">
          <div className="inline-block relative cursor-pointer">
            <img
              className="w-36 rounded opacity-75"
              src={image ? URL.createObjectURL(image) : userData.image}
              alt=""
            />
            {!image && (
              <img
                className="w-10 absolute bottom-12 right-12"
                src={assets.upload_icon}
                alt="upload"
              />
            )}
          </div>
          <input
            id="image"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>
      ) : (
        <img className="w-36 rounded" src={userData.image} alt="" />
      )}

      {/* NAME */}
      {isEdit ? (
        <input
          className="bg-gray-100 text-3xl font-medium max-w-60 mt-4"
          value={userData.name}
          onChange={(e) =>
            setUserData({
              ...userData,
              name: e.target.value,
            })
          }
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">
          {userData.name}
        </p>
      )}

      <hr className="bg-zinc-400 h-[1px] border-none" />

      {/* CONTACT INFO */}
      <div>
        <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>

        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Email Id:</p>
          <p className="text-blue-500">{userData.email}</p>

          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              value={userData.phone}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  phone: e.target.value,
                })
              }
            />
          ) : (
            <p className="text-blue-400">{userData.phone}</p>
          )}

          <p className="font-medium">Address:</p>
          {isEdit ? (
            <p>
              <input
                className="bg-gray-100"
                value={userData.address.line}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    address: {
                      ...userData.address,
                      line: e.target.value,
                    },
                  })
                }
              />
              <br />
              <input
                className="bg-gray-100"
                value={userData.address.line2}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    address: {
                      ...userData.address,
                      line2: e.target.value,
                    },
                  })
                }
              />
            </p>
          ) : (
            <p className="text-gray-500">
              {userData.address.line}
              <br />
              {userData.address.line2}
            </p>
          )}
        </div>
      </div>

      {/* BASIC INFO */}
      <div>
        <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>

        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select
              className="max-w-20 bg-gray-100"
              value={userData.gender}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  gender: e.target.value,
                })
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="text-gray-400">{userData.gender}</p>
          )}

          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input
              className="max-w-28 bg-gray-100"
              type="date"
              value={userData.dob}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  dob: e.target.value,
                })
              }
            />
          ) : (
            <p className="text-gray-400">{userData.dob}</p>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-10">
        {isEdit ? (
          <button
            onClick={updateUserProfileData}
            className="border border-[#5f6fff] px-8 py-2 rounded-full hover:bg-[#5f6fff] hover:text-white transition-all duration-300"
          >
            Save Information
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="border border-[#5f6fff] px-8 py-2 rounded-full hover:bg-[#5f6fff] hover:text-white transition-all duration-300"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
