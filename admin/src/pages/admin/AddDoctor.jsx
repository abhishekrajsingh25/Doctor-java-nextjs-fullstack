import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { backendUrl, aToken } = useContext(AdminContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!docImg) return toast.error("Doctor image is required");

    try {
      // 👇 THIS is what your backend expects
      const doctorData = {
        name,
        email,
        password,
        experience,
        fees: Number(fees),
        about,
        speciality,
        degree,
        address: JSON.stringify({
          line1: address1,
          line2: address2,
        }),
      };

      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("data", JSON.stringify(doctorData)); // ✅ REQUIRED

      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-doctor`,
        formData,
        {
          headers: {
            aToken,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data.success) {
        toast.success("Doctor added successfully");

        setDocImg(null);
        setName("");
        setEmail("");
        setPassword("");
        setExperience("1 Year");
        setFees("");
        setAbout("");
        setSpeciality("General physician");
        setDegree("");
        setAddress1("");
        setAddress2("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white px-8 py-8 border border-gray-300 rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        {/* Image upload */}
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Doctor"
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            accept="image/*"
            hidden
          />
          <p>
            Upload doctor <br /> picture
          </p>
        </div>

        {/* Form fields */}
        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <Input label="Doctor Name" value={name} setValue={setName} />
            <Input
              label="Doctor Email"
              value={email}
              setValue={setEmail}
              type="email"
            />
            <Input
              label="Doctor Password"
              value={password}
              setValue={setPassword}
              type="password"
            />

            <Select
              label="Experience"
              value={experience}
              setValue={setExperience}
              options={[
                "1 Year",
                "2 Year",
                "3 Year",
                "4 Year",
                "5 Year",
                "6 Year",
                "7 Year",
                "8 Year",
                "9 Year",
                "10 Year",
              ]}
            />

            <Input label="Fees" value={fees} setValue={setFees} type="number" />
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <Select
              label="Speciality"
              value={speciality}
              setValue={setSpeciality}
              options={[
                "General physician",
                "Gynecologist",
                "Dermatologist",
                "Pediatricians",
                "Neurologist",
                "Gastroenterologist",
              ]}
            />

            <Input label="Education" value={degree} setValue={setDegree} />

            <Input label="Address 1" value={address1} setValue={setAddress1} />
            <Input label="Address 2" value={address2} setValue={setAddress2} />
          </div>
        </div>

        {/* About */}
        <div>
          <p className="mt-4 mb-2 text-gray-500">About Doctor</p>
          <textarea
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            className="w-full px-4 pt-2 border border-gray-300 rounded"
            rows={5}
            placeholder="Write about Doctor"
          />
        </div>

        <button
          type="submit"
          className="bg-[#5f6fff] px-10 py-3 mt-4 text-white rounded-full cursor-pointer"
        >
          Add Doctor
        </button>
      </div>
    </form>
  );
};

/* ---------- Small reusable components ---------- */

const Input = ({ label, value, setValue, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <p>{label}</p>
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      type={type}
      required
      className="border border-gray-300 rounded px-3 py-2"
    />
  </div>
);

const Select = ({ label, value, setValue, options }) => (
  <div className="flex flex-col gap-1">
    <p>{label}</p>
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="border border-gray-300 rounded px-3 py-2"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default AddDoctor;
