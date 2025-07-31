import axios from "axios";
import { attachAuthInterceptors } from "./interceptors";

export const axiosInstanceForm = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

attachAuthInterceptors(axiosInstanceForm);
export default axiosInstanceForm;
