import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

export function useApiAuth() {
  const { getToken } = useAuth();

  useEffect(() => {
    const id = api.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch (_) {}
      return config;
    });
    return () => api.interceptors.request.eject(id);
  }, [getToken]);
}

export default api;
