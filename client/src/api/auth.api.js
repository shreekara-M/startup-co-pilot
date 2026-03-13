import api from "./axios";

// ─── Auth API Calls ─────────────────────────────────────
//
// All responses follow { status, data } shape from our backend.
// We return response.data.data to unwrap the envelope.

export const signupApi = async ({ name, email, password }) => {
  const res = await api.post("/auth/signup", { name, email, password });
  return res.data.data; // { user, token }
};

export const loginApi = async ({ email, password }) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data.data; // { user, token }
};

export const getMeApi = async () => {
  const res = await api.get("/auth/me");
  return res.data.data; // user object
};
