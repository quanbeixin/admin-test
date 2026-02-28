import axios from 'axios';

// 从环境变量读取 API 地址
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建 axios 实例
const request = axios.create({
  baseURL,
  withCredentials: true, // 支持发送 cookie
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 获取 token
    const token = localStorage.getItem('token');

    if (token) {
      // axios 1.x 推荐使用这种方式设置 headers
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 处理 304 等特殊状态码
    if (response.status === 304 || !response.data) {
      return { data: [] }; // 返回空数据
    }
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      const errorMsg = error.response.data?.message || error.response.data?.error || '';
      // 只在开发环境打印详细错误
      if (import.meta.env.DEV) {
        console.error('请求失败:', error.response.status, errorMsg);
      }
    }
    return Promise.reject(error);
  }
);

export default request;
