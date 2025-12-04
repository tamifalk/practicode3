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
    // מחזירים תמיד אותיות גדולות
    return result.data.map(task => ({
      Id: task.id,
      Name: task.name,
      IsComplete: task.isComplete ?? false
    }));
  },

  addTask: async (item) => {
    const result = await axios.post("/tasks", { 
      Name: item.Name,
      IsComplete: item.IsComplete ?? false
    });
    const data = result.data;
     console.log("Added task response:", data);
    return {
      Id: data.id,
      Name: data.name,
      IsComplete: data.isComplete ?? false
    };
  },

  setCompleted: async (id, isComplete, name) => {
    // שולחים רק את השדות שהשרת מצפה להם
    await axios.put(`/tasks/${id}`, { 
      Name: name, 
      IsComplete: isComplete
    });
  },

  deleteTask: async (id) => {
    await axios.delete(`/tasks/${id}`);
  },
};
