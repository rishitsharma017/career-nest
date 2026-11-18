
import { useEffect, useState } from "react";

function getSavedJobs() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("savedJobs") || "[]"
    );

    return Array.isArray(saved)
      ? saved.map(Number).filter(Number.isFinite)
      : [];
  } catch {
    return [];
  }
}

function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState(getSavedJobs);

  // Automatically save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem(
      "savedJobs",
      JSON.stringify(savedJobs)
    );
  }, [savedJobs]);

  // Add or remove a bookmark
  const toggleSave = (id) => {
    const jobId = Number(id);

    if (!Number.isFinite(jobId)) return;

    setSavedJobs((previous) =>
      previous.includes(jobId)
        ? previous.filter((item) => item !== jobId)
        : [...previous, jobId]
    );
  };

  // Check whether a job is bookmarked
  const isSaved = (id) => {
    return savedJobs.includes(Number(id));
  };

  // Remove a bookmark
  const removeSavedJob = (id) => {
    const jobId = Number(id);

    setSavedJobs((previous) =>
      previous.filter((item) => item !== jobId)
    );
  };

  return {
    savedJobs,
    toggleSave,
    isSaved,
    removeSavedJob
  };
}

export default useSavedJobs;
