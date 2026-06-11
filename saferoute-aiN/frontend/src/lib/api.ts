import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getBlackspots = async () => {
  const res = await API.get("/blackspots");
  return res.data;
};

export const predictRisk = async (data: any) => {
  const res = await API.post("/predict", data);
  return res.data;
};
