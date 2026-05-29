import axios from "axios";

const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (envUrl) {
    return envUrl;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:8000/api";
  }

  return "https://mern-pos-system-production.up.railway.app/api";
};

const API = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
});

API.interceptors.request.use((req) => {
  const userJson = localStorage.getItem("user");
  const token = userJson ? JSON.parse(userJson).token : null;

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// Global response handler: on 401 clear stored user and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear local auth and force login
      localStorage.removeItem("user");
      // Avoid hard crash in non-browser envs
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
