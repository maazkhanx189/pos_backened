import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import useToast from "../hooks/useToast";

function Login() {
  const navigate = useNavigate();
  const { toast, showToast, ToastContainer } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/login", formData);

      localStorage.setItem("user", JSON.stringify(data));

      showToast("Login Successful", "success");

      setTimeout(() => navigate("/dashboard"), 300);
    } catch (error) {
      showToast(error.response?.data?.message || "Login failed", "error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer toast={toast} />

      <form
        onSubmit={handleSubmit}
        className="bg-white text-gray-700 p-8 rounded shadow-md w-96"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          Wholesale POS
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-3 mb-4 rounded"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border p-3 mb-4 rounded"
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded"
        >
          Login
        </button>

        <p
          className="text-center mt-3 text-sm cursor-pointer"
          onClick={() => navigate("/register")}
        >
          Create new account
        </p>
      </form>
    </div>
  );
}

export default Login;