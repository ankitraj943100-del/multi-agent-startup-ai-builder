import axios from "axios";

const API_BASE = "http://localhost:5001/api";

export const generateStartupPlan = async (input: string) => {
  const response = await axios.post(`${API_BASE}/generate`, { input });
  return response.data;
};

export const getSessionStatus = async (sessionId: string) => {
  const response = await axios.get(`${API_BASE}/status/${sessionId}`);
  return response.data;
};

export const listSessions = async () => {
  const response = await axios.get(`${API_BASE}/sessions`);
  return response.data;
};
