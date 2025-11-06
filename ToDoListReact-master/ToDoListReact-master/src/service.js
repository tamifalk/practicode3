import axios from 'axios';

axios.defaults.baseURL = "http://localhost:5044"; // ← כתובת השרת שלך
axios.defaults.headers.post["Content-Type"] = "application/json";

// 🔹 Interceptors לניהול token ו־שגיאות
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ שגיאת שרת:", error.response.status, error.response.data);
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else {
      console.error("⚠️ שגיאת תקשורת:", error.message);
    }
    return Promise.reject(error);
  }
);

// 🔹 פונקציות API
export default {
  getTasks: async () => {
    const result = await axios.get("/tasks");
    return result.data;
  },

  addTask: async (name) => {
    const result = await axios.post("/tasks", { name, isComplete: false });
    return result.data;
  },

  setCompleted: async (id, isComplete) => {
    const todos = await axios.get(`/tasks`);
    const task = todos.data.find(t => t.id === id);
    if (!task) {
      console.error("⚠️ משימה לא נמצאה!");
      return;
    }
    await axios.put(`/tasks/${id}`, { ...task, isComplete });
  },

  deleteTask: async (id) => {
    const result = await axios.delete(`/tasks/${id}`);
    return result.data;
  },
};
