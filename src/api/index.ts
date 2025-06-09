import axios from "axios";

const API = axios.create({
  baseURL: 'http://adaptive-learning-alb-755424169.ap-southeast-2.elb.amazonaws.com/api',
  headers: {
    Accept: "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;