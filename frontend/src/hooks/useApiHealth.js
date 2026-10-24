import { useState, useEffect, useCallback } from 'react';
import healthService from '../services/healthService.js';

/**
 * Custom hook to manage backend health checking with latency measurement
 */
export const useApiHealth = (autoCheck = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const response = await healthService.checkHealth();
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setData(response.data);
      setLastChecked(new Date());
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setError(err.message || 'Failed to connect to backend server');
      setData(null);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      check();
    }
  }, [autoCheck, check]);

  return {
    data,
    loading,
    error,
    latency,
    lastChecked,
    refetch: check,
  };
};

export default useApiHealth;
