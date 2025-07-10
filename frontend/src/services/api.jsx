// src/services/api.js

import axios from 'axios';


// 创建 Axios 实例
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
