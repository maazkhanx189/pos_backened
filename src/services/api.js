// import axios from "axios";

// const resolveBaseUrl = () => {
//   const envUrl = import.meta.env.VITE_API_BASE_URL;

//   if (envUrl) {
//     return envUrl;
//   }

//   return "https://mern-pos-system-production.up.railway.app/api";
// };

// const API = axios.create({
//   baseURL: resolveBaseUrl(),
//   timeout: 10000,
// });

// // attach token automatically
// API.interceptors.request.use((req) => {
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (user?.token) {
//     req.headers.Authorization = `Bearer ${user.token}`;
//   }

//   return req;
// });

// export default API;














import axios from "axios";

const API = axios.create({
  baseURL:
    "https://mern-pos-system-production.up.railway.app/api",
});

API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  const token = user ? JSON.parse(user).token : null;

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;