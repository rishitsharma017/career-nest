import axios from "axios";

// Shared Axios client for the CareerNest Express API.
export const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000
});
