import axios from "axios";

// ─── Axios Instance ─────────────────────────────────────
//
// Every API call goes through this instance.
// Two interceptors handle JWT automatically:
//   Request  → attaches "Authorization: Bearer <token>"
//   Response → on 401, clears token and redirects to /login

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor: Attach JWT ────────────────────

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle 401 ───────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on login/signup page
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/signup") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
