import axios from 'axios';

// api地址调整
const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://admin-test-green.vercel.app/api"
  ;

// 创建 axios 实例
const request = axios.create({
  baseURL: baseURL, // 修改为你的 API 地址
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
    console.log('请求拦截器 - token:', token);

    if (token) {
      // axios 1.x 推荐使用这种方式设置 headers
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('已添加 Authorization 头');
    } else {
      console.warn('警告：localStorage 中没有找到 token');
    }

    console.log('最终请求头:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log('响应成功:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });

    // 处理 304 等特殊状态码
    if (response.status === 304 || !response.data) {
      return { data: [] }; // 返回空数据
    }
    return response.data;
  },
  (error) => {
    // 详细的错误日志
    console.error('请求失败详情:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      headers: error.config?.headers,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      message: error.message
    });

    // 统一错误处理
    if (error.response) {
      const errorMsg = error.response.data?.message || error.response.data?.error || '';
      switch (error.response.status) {
        case 401:
          console.error('未授权，请重新登录', errorMsg);
          break;
        case 403:
          console.error('拒绝访问', errorMsg);
          break;
        case 404:
          console.error('请求错误，未找到该资源', errorMsg);
          break;
        case 500:
          console.error('服务器错误', errorMsg);
          break;
        default:
          console.error('请求失败', errorMsg);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接或后端服务是否启动');
    } else {
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export default request;
