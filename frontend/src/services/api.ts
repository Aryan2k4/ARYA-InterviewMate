import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("arya_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("arya_token");
      localStorage.removeItem("arya_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  signup: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post("/api/auth/signup", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
};

export const interviewApi = {
  start: (data: { role: string; difficulty: string; num_questions: number; resume_text?: string }) =>
    api.post("/api/interviews/start", data),
  getAll: (skip = 0, limit = 20) =>
    api.get(`/api/interviews/?skip=${skip}&limit=${limit}`),
  getOne: (id: number) => api.get(`/api/interviews/${id}`),
  submitAnswer: (interviewId: number, data: { question_id: number; answer_text: string }) =>
    api.post(`/api/interviews/${interviewId}/answer`, data),
  complete: (interviewId: number) =>
    api.post(`/api/interviews/${interviewId}/complete`),
  delete: (interviewId: number) =>
    api.delete(`/api/interviews/${interviewId}`),
  uploadResume: (formData: FormData) =>
    api.post("/api/resume/upload-and-start", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const analyticsApi = {
  summary: () => api.get("/api/analytics/summary"),
  performanceTrend: (days = 30) => api.get(`/api/analytics/performance-trend?days=${days}`),
  topicWeaknesses: () => api.get("/api/analytics/topic-weaknesses"),
  skillGrowth: () => api.get("/api/analytics/skill-growth"),
};

export const leaderboardApi = {
  get: (limit = 20) => api.get(`/api/leaderboard/?limit=${limit}`),
  myRank: () => api.get("/api/leaderboard/my-rank"),
};

export const coachApi = {
  getPlan: () => api.get("/api/coach/plan"),
  chat: (message: string, history: { role: string; content: string }[]) =>
    api.post("/api/coach/chat", { message, history }),
};

export const adminApi = {
  stats: () => api.get("/api/admin/stats"),
  users: (skip = 0, limit = 50) => api.get(`/api/admin/users?skip=${skip}&limit=${limit}`),
};

export default api;
