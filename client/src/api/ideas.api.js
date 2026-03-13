import api from "./axios";

// ─── Ideas API Calls ────────────────────────────────────

export const listIdeas = async (params = {}) => {
  const res = await api.get("/ideas", { params });
  return res.data.data; // { ideas, pagination }
};

export const createIdea = async (data) => {
  const res = await api.post("/ideas", data);
  return res.data.data; // idea object
};

export const getIdea = async (id) => {
  const res = await api.get(`/ideas/${id}`);
  return res.data.data; // idea with details
};

export const updateIdea = async (id, data) => {
  const res = await api.put(`/ideas/${id}`, data);
  return res.data.data;
};

export const deleteIdea = async (id) => {
  await api.delete(`/ideas/${id}`);
};

export const getDetails = async (id) => {
  const res = await api.get(`/ideas/${id}/details`);
  return res.data.data;
};

export const upsertDetails = async (id, data) => {
  const res = await api.put(`/ideas/${id}/details`, data);
  return res.data.data;
};
