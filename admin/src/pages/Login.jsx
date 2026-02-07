import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (state === "Admin") {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/login`,
          { email, password }
        );

        if (data.success && data.token) {
          // clear doctor session
          localStorage.removeItem("dToken");
          setDToken("");

          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
        } else {
          toast.error(data.message || "Admin login failed");
        }
      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/doctor/login`,
          { email, password }
        );

        if (data.success && data.token) {
          // clear admin session
          localStorage.removeItem("aToken");
          setAToken("");

          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
        } else {
          toast.error(data.message || "Doctor login failed");
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Server error. Try again."
      );
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border border-gray-100 rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-[#5f6fff]">{state}</span> Login
        </p>

        <div className="w-full">
          <p>Email</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
          />
        </div>

        <button
          type="submit"
          className="bg-[#5f6fff] text-white w-full py-2 rounded-md text-base cursor-pointer"
        >
          Login
        </button>

        {state === "Admin" ? (
          <p>
            Doctor Login?{" "}
            <span
              className="text-[#5f6fff] underline cursor-pointer"
              onClick={() => setState("Doctor")}
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{" "}
            <span
              className="text-[#5f6fff] underline cursor-pointer"
              onClick={() => setState("Admin")}
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
