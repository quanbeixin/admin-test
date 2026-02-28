import request from './request';

// 获取可用字段
export const getFields = () => {
  return request.get('/dashboards/fields');
};

// 获取仪表盘列表
export const getDashboards = () => {
  return request.get('/dashboards');
};

// 获取单个仪表盘
export const getDashboard = (id) => {
  return request.get(`/dashboards/${id}`);
};

// 创建仪表盘
export const createDashboard = (data) => {
  return request.post('/dashboards', data);
};

// 更新仪表盘
export const updateDashboard = (id, data) => {
  return request.put(`/dashboards/${id}`, data);
};

// 删除仪表盘
export const deleteDashboard = (id) => {
  return request.delete(`/dashboards/${id}`);
};
