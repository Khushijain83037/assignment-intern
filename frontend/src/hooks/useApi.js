import { useState, useEffect, useCallback } from "react";
import api from "../lib/api.js";

export function useFetch(url, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    if (!url) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refetch: run };
}

export function useMutation(method, url) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (body, overrideUrl) => {
    setLoading(true); setError(null);
    try {
      const res = await api[method](overrideUrl || url, body);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [method, url]);

  return { mutate, loading, error };
}
