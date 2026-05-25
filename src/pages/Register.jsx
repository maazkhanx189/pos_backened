import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import useToast from "../hooks/useToast";

function Register() {
  const navigate = useNavigate();
  const { toast, showToast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/register", form);

      localStorage.setItem("user", JSON.stringify(data));

      showToast("User Registered", "success");

      setTimeout(() => navigate("/dashboard"), 300);
    } catch (error) {
      showToast(error.response?.data?.message || "Registration failed", "error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer toast={toast} />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow w-96"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          Register User
        </h1>

        <input
          name="name"
          placeholder="Name"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <select
          name="role"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        >
          <option value="cashier">
            Cashier
          </option>

          <option value="admin">
            Admin
          </option>
        </select>

        <button
          className="bg-black text-white w-full p-2"
        >
          Register
        </button>

        <p
          className="text-center mt-3 text-sm"
          onClick={() => navigate("/")}
        >
          Already have account? Login
        </p>
      </form>
    </div>
  );
}

export default Register;