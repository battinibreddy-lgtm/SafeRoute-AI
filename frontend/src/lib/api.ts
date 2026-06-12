import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const getBlackspots = async () => {
  const res = await API.get("/blackspots");
  return res.data;
};

export const predictRisk = async (data: any) => {
  const res = await API.post("/predict", data);
  return res.data;
};
