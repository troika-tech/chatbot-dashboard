import axios from "axios";

const api = axios.create({
  baseURL: "https://api.0804.in/api",
  withCredentials: true,
});

// Get client config
export const fetchClientConfig = (chatbotId) => {
  const token = localStorage.getItem("adminToken");
  return api.get(`/chatbot/${chatbotId}/config`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Update client config
export const updateClientConfig = (chatbotId, config) => {
  const token = localStorage.getItem("adminToken");
  return api.put(`/chatbot/${chatbotId}/config`, config, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default api;
