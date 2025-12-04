import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_URL; 
axios.defaults.headers.post["Content-Type"] = "application/json";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
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

export default {
  getTasks: async () => {
    const result = await axios.get("/tasks");
    return result.data;
  },

  addTask: async (item) => {
    const result = await axios.post("/tasks", { 
      Name: item.Name || item.name, 
      IsComplete: false
    });
    return result.data;
  },

  setCompleted: async (id, isComplete) => {
    const result = await axios.get(`/tasks`);
    const task = result.data.find(t => t.Id === id);
    if (!task) {
      console.error("⚠️ משימה לא נמצאה!");
      return;
    }
    await axios.put(`/tasks/${id}`, { ...task, IsComplete: isComplete });
  },

  deleteTask: async (id) => {
    await axios.delete(`/tasks/${id}`);
  },
};
