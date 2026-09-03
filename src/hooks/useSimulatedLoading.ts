import { useState, useEffect } from 'react';

export function useSimulatedLoading(delay: number = 800) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return loading;
}
