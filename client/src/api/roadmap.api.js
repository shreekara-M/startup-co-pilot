import api from "./axios";

// ─── Roadmap API Calls ──────────────────────────────────

// Milestones
export const getMilestones = async (ideaId) => {
  const res = await api.get(`/ideas/${ideaId}/roadmap`);
  return res.data.data;
};

export const createMilestone = async (ideaId, data) => {
  const res = await api.post(`/ideas/${ideaId}/roadmap`, data);
  return res.data.data;
};

export const updateMilestone = async (ideaId, milestoneId, data) => {
  const res = await api.put(`/ideas/${ideaId}/roadmap/${milestoneId}`, data);
  return res.data.data;
};

export const deleteMilestone = async (ideaId, milestoneId) => {
  await api.delete(`/ideas/${ideaId}/roadmap/${milestoneId}`);
};

// Tasks
export const createTask = async (ideaId, milestoneId, data) => {
  const res = await api.post(`/ideas/${ideaId}/roadmap/${milestoneId}/tasks`, data);
  return res.data.data;
};

export const updateTask = async (ideaId, milestoneId, taskId, data) => {
  const res = await api.put(`/ideas/${ideaId}/roadmap/${milestoneId}/tasks/${taskId}`, data);
  return res.data.data;
};

export const deleteTask = async (ideaId, milestoneId, taskId) => {
  await api.delete(`/ideas/${ideaId}/roadmap/${milestoneId}/tasks/${taskId}`);
};

// AI Generation
export const generateRoadmap = async (ideaId) => {
  const res = await api.post(`/ideas/${ideaId}/roadmap/generate`);
  return res.data.data;
};
