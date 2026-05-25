import axios from "axios";

const API = axios.create({
  baseURL: "https://mern-pos-system-production.up.railway.app/api",
  timeout: 10000,
});

// attach token automatically
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }

  return req;
});

export default API;
