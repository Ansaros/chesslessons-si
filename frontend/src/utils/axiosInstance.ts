import axios from "axios";
import { attachAuthInterceptors } from "./interceptors";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

attachAuthInterceptors(axiosInstance);

export default axiosInstance;
