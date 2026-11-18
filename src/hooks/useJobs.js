
import { useEffect, useState } from "react";
import { fetchJobs } from "../services/jobService";

function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchJobs();

        if (!cancelled) {
          setJobs(data);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load jobs. Make sure the Express backend is running on port 5000."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const retry = () => {
    setRetryCount((previous) => previous + 1);
  };

  return { jobs, loading, error, retry };
}

export default useJobs;
