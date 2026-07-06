import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 12_000,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Request failed";
    if (!error.config?.silent) toast.error(message);
    return Promise.reject(error);
  }
);

export function unwrap(response) {
  return response.data.data;
}
