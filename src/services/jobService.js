import { API } from "./api";

// Retrieve all jobs stored in SQLite through the Express API.
export const fetchJobs = async () => {
  const response = await API.get("/jobs");
  return response.data;
};

// Retrieve one job by its numeric ID.
export const fetchJobById = async (id) => {
  const response = await API.get(`/jobs/${id}`);
  return response.data;
};
