// interceptors.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

export function attachAuthInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      const status = error.response?.status;
      const detail = (error.response?.data as { detail: string })?.detail;
      const isTokenExpired403 =
        status === 403 && detail === "Token has expired";
      const isUnauthorized401 = status === 401;

      if ((isUnauthorized401 || isTokenExpired403) && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(new Error("No refresh token"));
        }

        try {
          const res = await axios.post<{ access_token: string }>(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/token/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const newAccessToken = res.data.access_token;
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(refreshErr);
        }
      }

      return Promise.reject(error);
    }
  );
}
