import api from "./axios";

export const getStats = async () => {
  const res = await api.get("/dashboard/stats");
  return res.data.data;
};
