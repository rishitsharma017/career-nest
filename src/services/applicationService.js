import { API } from "./api";

export const fetchApplications = async () => {
  const response = await API.get("/applications");
  return response.data;
};

export const createApplication = async (jobId) => {
  const response = await API.post("/applications", { jobId });
  return response.data;
};

export const updateApplicationStatus = async (id, status) => {
  const response = await API.patch(`/applications/${id}/status`, { status });
  return response.data;
};
