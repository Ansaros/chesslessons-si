import axios from "axios";
import { attachAuthInterceptors } from "./interceptors";

export const axiosMultipart = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

attachAuthInterceptors(axiosMultipart);
