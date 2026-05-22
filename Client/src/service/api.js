import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("hrms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hrms_token");
      localStorage.removeItem("hrms_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const loginAPI = (data) => API.post("/auth/login", data);
export const registerAPI = (data) => API.post("/auth/register", data);
export const getMeAPI = () => API.get("/auth/me");
export const logoutAPI = () => API.post("/auth/logout");

// Employee APIs
export const getAllEmployeesAPI = (params) =>
  API.get("/employees", { params });
export const getEmployeeByIdAPI = (id) => API.get(`/employees/${id}`);
export const addEmployeeAPI = (data) => API.post("/employees", data);
export const updateEmployeeAPI = (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployeeAPI = (id) => API.delete(`/employees/${id}`);
export const getEmployeeStatsAPI = () => API.get("/employees/stats/summary");

// Attendance APIs
export const markAttendanceAPI = (data) => API.post("/attendance/mark", data);
export const getMyAttendanceAPI = (params) =>
  API.get("/attendance/my-attendance", { params });
export const getAllAttendanceAPI = (params) =>
  API.get("/attendance/all", { params });
export const getTodaySummaryAPI = () => API.get("/attendance/today-summary");

// Leave APIs
export const applyLeaveAPI = (data) => API.post("/leave/apply", data);
export const getMyLeavesAPI = () => API.get("/leave/my-leaves");
export const getAllLeavesAPI = (params) => API.get("/leave/all", { params });
export const approveLeaveAPI = (id) => API.put(`/leave/${id}/approve`);
export const rejectLeaveAPI = (id, data) =>
  API.put(`/leave/${id}/reject`, data);