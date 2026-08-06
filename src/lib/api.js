import axios from "axios";

const BACKEND_URL = "http://localhost:8000";
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// 1. Automatically attach the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Automatically refresh token when 401 Unauthorized occurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Oruvela request 401 anuppi, innum retry seyyamal irunthal
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token endpoint-ai call seithu puthu access_token-ai vanguvathu
        const { data } = await axios.post(
          `${API}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.access_token;
        if (newAccessToken) {
          localStorage.setItem("access_token", newAccessToken);

          // Puthu token-ai header-il potu, fail aana andha request-ai meendum anuppuvathu
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token-um invalid/expire aagivittal mattum localStorage-ai clear seithu login-ku anuppuvathu
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

// ==========================================
// API ENDPOINT HELPERS
// ==========================================

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getMe: () => api.get("/auth/me"),
  refresh: () => api.post("/auth/refresh"),
};

export const dashboardAPI = {
  stats: () => api.get("/dashboard/stats"),
  recentActivity: () => api.get("/dashboard/recent-activity"),
  charts: () => api.get("/dashboard/charts"),
  aiInsights: () => api.get("/ai/insights"),
};

export const leadsAPI = {
  list: (params) => api.get("/leads", { params }),
  get: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post("/leads", data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
};

export const projectsAPI = {
  list: () => api.get("/projects"),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const staffAPI = {
  list: () => api.get("/staff"),
  get: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post("/staff", data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const studentsAPI = {
  list: () => api.get("/students"),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post("/students", data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};